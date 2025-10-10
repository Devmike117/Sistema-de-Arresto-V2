// backend/routes/register.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // conexión PostgreSQL
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

router.post(
  '/',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'fingerprint', maxCount: 1 }
  ]),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const {
        first_name,
        last_name,
        alias,
        dob,
        gender,
        nationality,
        state,
        municipality,
        community,           // comunidad de la persona
        id_number,
        observaciones,
        falta_administrativa,
        arrest_community,    // comunidad del arresto
        arresting_officer,
        folio,
        rnd,
        sentencia
      } = req.body;

      await client.query('BEGIN');

      // 1️⃣ Guardar persona
      const personResult = await client.query(
        `INSERT INTO Persons 
          (first_name, last_name, alias, dob, gender, nationality, state, municipality, community, id_number, observaciones, photo_path)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [
          first_name,
          last_name,
          alias || null,
          dob || null,
          gender || null,
          nationality || null,
          state || null,
          municipality || null,
          community || null,
          id_number || null,
          observaciones || null,
          req.files.photo ? `uploads/photos/${req.files.photo[0].filename}` : null
        ]
      );
      const personId = personResult.rows[0].id;

      // 2️⃣ Guardar arresto
      await client.query(
        `INSERT INTO Arrests 
          (person_id, falta_administrativa, comunidad, arresting_officer, folio, rnd, sentencia)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          personId,
          falta_administrativa || null,
          arrest_community || null, // ✅ comunidad del arresto
          arresting_officer || null,
          folio || null,
          rnd || null,
          sentencia || null
        ]
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
      }

      // 4️⃣ Generar embedding facial usando microservicio
      if (req.files.photo) {
        try {
          const photoFile = req.files.photo[0];
          const relativePhotoPath = `uploads/photos/${photoFile.filename}`;

          const formData = new FormData();
          formData.append('file', fs.createReadStream(photoFile.path));

          const response = await axios.post(
            'http://localhost:8001/generate_embedding/',
            formData,
            { headers: { ...formData.getHeaders() } }
          );

          const embedding = response.data.embedding;

          if (embedding) {
            await client.query(
              `INSERT INTO FacialData (person_id, embedding, image_path)
               VALUES ($1, $2, $3)`,
              [personId, embedding, relativePhotoPath]
            );
          }
        } catch (err) {
          console.error('Error al generar embedding:', err.message);
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
      console.error('Error al registrar persona:', err);
      res.status(500).json({ success: false, error: 'Error al registrar persona' });
    } finally {
      client.release();
    }
  }
);

module.exports = router;
