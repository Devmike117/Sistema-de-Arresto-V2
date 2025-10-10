const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento de fotos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/photos';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `photo_${req.params.personId}${ext}`);
  }
});

// Configuración de almacenamiento de huellas
const fingerprintStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/fingerprints';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `finger_${req.params.personId}${ext}`);
  }
});

const uploadPhoto = multer({ storage: photoStorage });
const uploadFingerprint = multer({ storage: fingerprintStorage });

// Subir foto
router.post('/photo/:personId', uploadPhoto.single('photo'), async (req, res) => {
  try {
    const personId = req.params.personId;
    const relativePath = `uploads/photos/${req.file.filename}`;

    await pool.query(
      'INSERT INTO FacialData (person_id, image_path) VALUES ($1, $2)',
      [personId, relativePath]
    );

    res.status(201).json({ message: 'Foto subida correctamente', filePath });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al subir la foto');
  }
});

// Subir huella
router.post('/fingerprint/:personId', uploadFingerprint.single('fingerprint'), async (req, res) => {
  try {
    const personId = req.params.personId;
    const filePath = req.file.path;

    await pool.query(
      'INSERT INTO Fingerprints (person_id, template) VALUES ($1, pg_read_binary_file($2))',
      [personId, filePath]
    );

    res.status(201).json({ message: 'Huella subida correctamente', filePath });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al subir la huella');
  }
});

module.exports = router;
