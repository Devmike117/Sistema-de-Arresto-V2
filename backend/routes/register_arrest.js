// routes/register_arrest.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Tu conexión PostgreSQL

// POST /api/register_arrest
router.post('/', async (req, res) => {
  const {
    person_id,
    offense,
    location,
    arresting_officer,
    case_number,
    bail_status,
    notes,
  } = req.body;

  // Validar campos obligatorios
  if (!person_id || !offense || !location) {
    return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
  }

  try {
    // Insertar arresto en la base de datos
    const query = `
      INSERT INTO Arrests(
        person_id, offense, location, arresting_officer, case_number, bail_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      person_id,
      offense,
      location,
      arresting_officer || null,
      case_number || null,
      bail_status || false,
      notes || null
    ];

    const { rows } = await pool.query(query, values);

    res.json({ success: true, arrest: rows[0] });
  } catch (err) {
    console.error("Error al registrar arresto:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});

module.exports = router;
