// backend/routes/register_arrest.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Conexión PostgreSQL

// POST /api/arrests (registrar un arresto)
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

  if (!person_id || !falta_administrativa || !comunidad) {
    return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
  }

  try {
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


// ✅ PUT /api/arrests/:id/sentencia (actualizar sentencia)
router.put('/:id/sentencia', async (req, res) => {
  const { id } = req.params;
  const { sentencia } = req.body;

  if (!sentencia) {
    return res.status(400).json({ success: false, error: "La sentencia es obligatoria" });
  }

  try {
    const query = `
      UPDATE Arrests
      SET sentencia = $1
      WHERE id = $2
      RETURNING *
    `;

    const values = [sentencia, id];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Arresto no encontrado" });
    }

    res.json({ success: true, arrest: rows[0] });
  } catch (err) {
    console.error("Error al actualizar sentencia:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});

module.exports = router;
