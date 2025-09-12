// backend/routes/register.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // tu conexión PostgreSQL
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Crear carpetas si no existen
const photoDir = path.join(__dirname, '../uploads/photos');
const fingerprintDir = path.join(__dirname, '../uploads/fingerprints');

if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });
if (!fs.existsSync(fingerprintDir)) fs.mkdirSync(fingerprintDir, { recursive: true });

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'photo') cb(null, photoDir);
    else if (file.fieldname === 'fingerprint') cb(null, fingerprintDir);
    else cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Endpoint de registro
router.post('/', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'fingerprint', maxCount: 1 }
]), async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      first_name, middle_name, last_name, dob, gender, nationality,
      address, phone_number, id_number, notes, offense, location,
      arresting_officer, case_number, bail_status
    } = req.body;

    await client.query('BEGIN');

    // 1️⃣ Guardar persona
    const personResult = await client.query(
      `INSERT INTO Persons (first_name, middle_name, last_name, dob, gender, nationality, address, phone_number, id_number, notes, photo_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [
        first_name,
        middle_name,
        last_name,
        dob || null,
        gender,
        nationality,
        address,
        phone_number,
        id_number,
        notes,
        req.files.photo ? req.files.photo[0].path : null
      ]
    );
    const personId = personResult.rows[0].id;

    // 2️⃣ Guardar arresto
    await client.query(
      `INSERT INTO Arrests (person_id, offense, location, arresting_officer, case_number, bail_status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [personId, offense, location, arresting_officer, case_number, bail_status === 'true', notes]
    );

    // 3️⃣ Guardar huella si existe
    if (req.files.fingerprint) {
      const fingerprintFile = req.files.fingerprint[0];
      const fingerprintData = fs.readFileSync(fingerprintFile.path);
      await client.query(
        `INSERT INTO Fingerprints (person_id, template, finger)
         VALUES ($1,$2,$3)`,
        [personId, fingerprintData, fingerprintFile.originalname]
      );
      console.log('✅ Huella guardada correctamente');
    }

    // 4️⃣ Generar embedding facial usando microservicio
    if (req.files.photo) {
      try {
        const photoPath = req.files.photo[0].path;

        const formData = new FormData();
        formData.append('file', fs.createReadStream(photoPath));

        const response = await axios.post(
          'http://localhost:8001/generate_embedding/', // tu microservicio DeepFace
          formData,
          {
            headers: {
              ...formData.getHeaders()
            }
          }
        );

        const embedding = response.data.embedding;

        if (!embedding) {
          console.error('❌ No se recibió embedding del microservicio');
        } else {
          const bufferEmbedding = Buffer.from(JSON.stringify(embedding));

          await client.query(
            `INSERT INTO FacialData (person_id, embedding, image_path)
             VALUES ($1, $2, $3)`,
            [personId, bufferEmbedding, photoPath]
          );
          console.log('✅ Embedding facial guardado correctamente');
        }
      } catch (err) {
        console.error('❌ Error al generar embedding:', err.message);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Registro completo: persona, arresto, huella y embedding facial',
      personId
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error al registrar persona:', err);
    res.status(500).json({ success: false, error: 'Error al registrar persona' });
  } finally {
    client.release();
  }
});

module.exports = router;
