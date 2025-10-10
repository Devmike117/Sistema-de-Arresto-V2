const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

/**
 * Paso 1: Crear persona (sin foto ni huellas)
 */
router.post('/create-person', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      first_name, middle_name, last_name, dob, gender, nationality,
      estado, municipio, comunidad,
      id_number, observaciones
    } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO Persons (
        first_name, middle_name, last_name, dob, gender, nationality,
        estado, municipio, comunidad, id_number, observaciones
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id`,
      [
        first_name, middle_name, last_name, dob, gender, nationality,
        estado, municipio, comunidad, id_number, observaciones
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      message: 'Persona creada',
      personId: result.rows[0].id
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en /create-person:', err.message);
    res.status(500).json({ success: false, error: 'Error al crear persona' });
  } finally {
    client.release();
  }
});

/**
 * Paso 2: Subir foto y huellas ligadas a una persona
 */
router.post(
  '/upload-biometric/:personId',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'fingerprint', maxCount: 1 }
  ]),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { personId } = req.params;

      await client.query('BEGIN');

      // Actualizar foto
      if (req.files.photo) {
        const relativePhotoPath = `uploads/photos/${req.files.photo[0].filename}`;
        await client.query(
          `UPDATE Persons SET photo_path = $1 WHERE id = $2`,
          [relativePhotoPath, personId]
        );
      }

      // Guardar huella si existe
      if (req.files.fingerprint) {
        const fingerprintFile = req.files.fingerprint[0];
        const fingerprintData = fs.readFileSync(fingerprintFile.path);

        await client.query(
          `INSERT INTO Fingerprints (person_id, template, finger)
           VALUES ($1,$2,$3)`,
          [personId, fingerprintData, fingerprintFile.originalname]
        );
      }

      await client.query('COMMIT');
      res.status(200).json({
        success: true,
        message: 'Biometría subida con éxito'
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error en /upload-biometric:', err.message);
      res.status(500).json({ success: false, error: 'Error al subir biometría' });
    } finally {
      client.release();
    }
  }
);

module.exports = router;
