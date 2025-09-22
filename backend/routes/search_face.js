const express = require('express');
const router = express.Router();
const pool = require('../db'); // tu conexión PostgreSQL
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Carpeta temporal para subir fotos
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Función para distancia euclidiana
function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// Normalización de embeddings
function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((sum, x) => sum + x*x, 0));
  return vec.map(x => x / norm);
}

// POST /api/search_face
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });

  const photoPath = req.file.path;

  try {
    // 1️⃣ Generar embedding con microservicio
    const formData = new FormData();
    formData.append('file', fs.createReadStream(photoPath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      'http://localhost:8001/generate_embedding/',
      formData,
      { headers: formData.getHeaders() }
    );

    let embedding = response.data.embedding;
    if (!embedding) {
      fs.unlinkSync(photoPath);
      return res.status(500).json({ error: 'No se pudo generar el embedding' });
    }

    embedding = normalize(embedding);

    // 2️⃣ Obtener embeddings de la base de datos
    const { rows } = await pool.query(
      `SELECT fd.person_id, fd.embedding, p.first_name, p.middle_name, p.last_name, p.photo_path
       FROM FacialData fd
       JOIN Persons p ON p.id = fd.person_id`
    );

    // 3️⃣ Comparar embeddings
    let bestMatch = null;
    let minDistance = Infinity;
    const threshold = 3.0; // Ajusta según tu modelo

    rows.forEach(row => {
      // Convertir a número si PostgreSQL lo devuelve como string
      const dbEmbedding = row.embedding.map(Number);
      const dbNorm = normalize(dbEmbedding);
      const distance = euclideanDistance(embedding, dbNorm);

      console.log(`Distancia a ${row.first_name} ${row.last_name}: ${distance.toFixed(3)}`);

      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        bestMatch = row;
      }
    });

    // 4️⃣ Eliminar archivo temporal
    fs.unlink(photoPath, err => {
      if (err) console.error('Error al eliminar temporal:', err);
    });

    // 5️⃣ Devolver resultado
    if (bestMatch) {
      res.json({
        found: true,
        person: {
          id: bestMatch.person_id,
          first_name: bestMatch.first_name,
          middle_name: bestMatch.middle_name,
          last_name: bestMatch.last_name,
          photo_path: bestMatch.photo_path,
        },
      });
    } else {
      res.json({ found: false, person: null });
    }

  } catch (err) {
    console.error('Error en /api/search_face:', err.message);
    if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

module.exports = router;
