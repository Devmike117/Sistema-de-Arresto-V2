const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/persons → listar todas las personas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Persons ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener las personas' });
  }
});

// GET /api/persons/:id → obtener persona y sus arrestos
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Datos de la persona
    const personResult = await pool.query('SELECT * FROM Persons WHERE id = $1', [id]);
    if (personResult.rows.length === 0) return res.status(404).json({ error: 'Persona no encontrada' });

    const person = personResult.rows[0];

    // Arrestos de la persona
    const arrestsResult = await pool.query('SELECT * FROM Arrests WHERE person_id = $1 ORDER BY arrest_date DESC', [id]);

    // Facial data
    const facialResult = await pool.query('SELECT * FROM FacialData WHERE person_id = $1', [id]);

    // Huellas
    const fingerprintResult = await pool.query('SELECT * FROM Fingerprints WHERE person_id = $1', [id]);

    res.json({
      person,
      arrests: arrestsResult.rows,
      facialData: facialResult.rows,
      fingerprints: fingerprintResult.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener la persona' });
  }
});

module.exports = router;
