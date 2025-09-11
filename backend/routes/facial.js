// routes/facial.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const pool = require('../db'); // tu conexión a Postgres/MySQL

const upload = multer({ storage: multer.memoryStorage() }); // almacenar en memoria

// POST /api/facial
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió la foto' });

    // 1️⃣ Enviar a CompreFace para vectorización
    const formData = new FormData();
    formData.append('image', req.file.buffer, { filename: req.file.originalname });

    const comprefaceApiKey = process.env.COMPREFACE_API_KEY;
    const comprefaceUrl = 'http://localhost:8000/face-recognition/v1/recognize'; // ajusta endpoint según tu CompreFace

    const response = await axios.post(comprefaceUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': comprefaceApiKey,
      },
    });

    // 2️⃣ Obtener el embedding/vector de la respuesta
    const embedding = response.data.result[0]?.embedding || null;
    if (!embedding) return res.status(500).json({ error: 'No se pudo extraer embedding' });

    // 3️⃣ Guardar en la tabla facial_data
    const { person_id } = req.body; // el id de la persona que registraste
    await pool.query(
      'INSERT INTO facial_data (person_id, embedding) VALUES ($1, $2)',
      [person_id, JSON.stringify(embedding)]
    );

    res.json({ message: 'Vector facial guardado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar la foto' });
  }
});

module.exports = router;
