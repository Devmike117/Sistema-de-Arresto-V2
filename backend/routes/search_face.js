// backend/routes/search_face.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Carpeta temporal
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Funciones auxiliares
function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((sum, x) => sum + x * x, 0));
  return vec.map((x) => x / norm);
}

// POST /api/search_face
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });

  const photoPath = req.file.path;

  try {
    // 1️⃣ Generar embedding desde microservicio
    const formData = new FormData();
    formData.append('file', fs.createReadStream(photoPath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    let embedding = null;
try {
  const response = await axios.post('http://localhost:8001/generate_embedding/', formData, {
    headers: formData.getHeaders(),
    timeout: 10000,
  });
  embedding = response.data.embedding;
} catch (err) {
  console.error('[DeepFaceService] Error:', err.message);
  fs.unlinkSync(photoPath);
  return res.json({ found: false, person: null, error: 'No se pudo generar el embedding' });
}

if (!embedding) {
  fs.unlinkSync(photoPath);
  return res.json({ found: false, person: null, error: 'Embedding vacío o inválido' });
}


    embedding = normalize(embedding);

    // 2️⃣ Obtener embeddings de la DB
    const { rows } = await pool.query(
      `SELECT fd.person_id, fd.embedding, p.first_name, p.last_name
       FROM FacialData fd
       JOIN Persons p ON p.id = fd.person_id`
    );

    // 3️⃣ Comparar embeddings
    let bestMatch = null;
    let minDistance = Infinity;
    const threshold = 0.95;

    rows.forEach((row) => {
      const dbEmbedding = row.embedding.map(Number);
      const dbNorm = normalize(dbEmbedding);
      const distance = euclideanDistance(embedding, dbNorm);

      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        bestMatch = row;
      }
    });

    // 4️⃣ Eliminar temporal
    fs.unlink(photoPath, (err) => {
      if (err) console.error('Error eliminando temporal:', err);
    });

    // 5️⃣ Devolver resultado
    if (bestMatch) {
      try {
        // Info de la persona
        const personQuery = await pool.query(
          `SELECT id, first_name, last_name, alias, dob, gender, nationality,
                  state, municipality, community, id_number, photo_path, observaciones, created_at
           FROM Persons
           WHERE id = $1`,
          [bestMatch.person_id]
        );

        const person = personQuery.rows[0];

        // Historial de arrestos
        const arrestQuery = await pool.query(
          `SELECT id, arrest_date, falta_administrativa, comunidad, arresting_officer,
                  folio, rnd, sentencia
           FROM Arrests
           WHERE person_id = $1
           ORDER BY arrest_date DESC`,
          [bestMatch.person_id]
        );

        const arrests = arrestQuery.rows;

        res.json({
          found: true,
          person: {
            ...person,
            arrests,
          },
        });
      } catch (dbErr) {
        console.error('Error obteniendo detalles de persona:', dbErr.message);
        res.status(500).json({ error: 'Error obteniendo información de la persona' });
      }
    } else {
      res.json({ found: false, person: null });
    }
  } catch (err) {
    console.error('Error en /api/search_face:', err.message);
    if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

// Búsqueda por nombre y apellido
router.get('/by_name', async (req, res) => {
  const { first_name, last_name, q } = req.query;
  if (!first_name && !last_name && !q) {
    return res.status(400).json({ error: 'Debe proporcionar al menos un nombre o apellido' });
  }

  try {
    let queryText = `SELECT id, first_name, last_name, alias, dob, gender, nationality,
                            state, municipality, community, id_number, photo_path, observaciones, created_at
                     FROM Persons WHERE 1=1 `;
    const queryParams = [];

    if (q) {
      // Búsqueda general con un solo término
      queryParams.push(`%${q}%`);
      queryText += ` AND (LOWER(first_name) LIKE LOWER($1) OR LOWER(last_name) LIKE LOWER($1) OR LOWER(alias) LIKE LOWER($1))`;
    } else {
      // Búsqueda específica por campos separados
      if (first_name) {
        queryParams.push(`%${first_name}%`);
        queryText += ` AND LOWER(first_name) LIKE LOWER($${queryParams.length})`;
      }
      if (last_name) {
        queryParams.push(`%${last_name}%`);
        queryText += ` AND LOWER(last_name) LIKE LOWER($${queryParams.length})`;
      }
    }

    const { rows } = await pool.query(
      queryText,
      queryParams
    );

    // Obtener arrestos para cada persona
    const results = [];
    for (const person of rows) {
      const arrestQuery = await pool.query(
        `SELECT id, arrest_date, falta_administrativa, comunidad, arresting_officer,
                folio, rnd, sentencia
         FROM Arrests
         WHERE person_id = $1
         ORDER BY arrest_date DESC`,
        [person.id]
      );
      results.push({
        ...person,
        arrests: arrestQuery.rows,
      });
    }

    res.json({ results });
  } catch (err) {
    console.error('Error en búsqueda por nombre:', err.message);
    res.status(500).json({ error: 'Error al buscar por nombre' });
  }
});

module.exports = router;
