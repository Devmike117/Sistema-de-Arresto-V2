// backend/routes/register_arrest.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Conexión PostgreSQL

// POST /api/register_arrest
router.post('/', async (req, res) => {
  const {
    person_id,
    falta_administrativa,
    comunidad,
    arresting_officer,
    folio,
    rnd,
    sentencia
  } = req.body;

  // Validar campos obligatorios
  if (!person_id || !falta_administrativa || !comunidad) {
    return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
  }

  try {
    // Insertar arresto en la base de datos
    const query = `
      INSERT INTO Arrests(
        person_id, falta_administrativa, comunidad, arresting_officer, folio, rnd, sentencia
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      person_id,
      falta_administrativa,
      comunidad,
      arresting_officer || null,
      folio || null,
      rnd || null,
      sentencia || null
    ];

    const { rows } = await pool.query(query, values);

    res.json({ success: true, arrest: rows[0] });
  } catch (err) {
    console.error("Error al registrar arresto:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});

module.exports = router;
