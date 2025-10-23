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
const signatureDir = path.join(__dirname, '../uploads/signatures');

if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });
if (!fs.existsSync(fingerprintDir)) fs.mkdirSync(fingerprintDir, { recursive: true });
if (!fs.existsSync(signatureDir)) fs.mkdirSync(signatureDir, { recursive: true });

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'photo') cb(null, photoDir);
    else if (file.fieldname === 'fingerprint') cb(null, fingerprintDir);
    else if (file.fieldname === 'signature') cb(null, signatureDir);
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
    { name: 'fingerprint', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
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
        community,
        id_number,
        observaciones,
        falta_administrativa,
        arrest_community,
        arresting_officer,
        folio,
        rnd,
        sentencia,
        privacy_notice,
        firma // <-- Recibimos la firma como dataURL
      } = req.body;

      await client.query('BEGIN');

      // --- Lógica para guardar la firma como imagen ---
      let signaturePath = null;
      if (firma) {
        // 1. Extraer los datos base64 de la dataURL
        const base64Data = firma.replace(/^data:image\/png;base64,/, "");
        // 2. Crear un nombre de archivo único
        const signatureFilename = `signature_${Date.now()}.png`;
        // 3. Definir la ruta completa donde se guardará
        const fullSignaturePath = path.join(signatureDir, signatureFilename);
        // 4. Guardar el archivo en el servidor
        fs.writeFileSync(fullSignaturePath, base64Data, 'base64');
        // 5. Guardar la ruta relativa para la base de datos
        signaturePath = `uploads/signatures/${signatureFilename}`;
      }

      // 1️⃣ Guardar persona
      const personResult = await client.query(
        `INSERT INTO Persons
          (first_name, last_name, alias, dob, gender, nationality, state, municipality, community, id_number, observaciones, photo_path, privacy_notice_path, privacy_notice)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
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
          req.files.photo ? `uploads/photos/${req.files.photo[0].filename}` : null, // Ruta de la foto
          signaturePath, // <-- Guardamos la RUTA de la firma
          privacy_notice === 'true' // <-- booleano de aceptación
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
          arrest_community || null,
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
            'http://127.0.0.1:8001/generate_embedding/',
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
        message: 'Registro completo: persona, arresto, huella, embedding facial y firma',
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
