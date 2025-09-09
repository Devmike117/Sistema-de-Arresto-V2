const express = require('express');
const router = express.Router();
const pool = require('../db');

// Endpoint para estadísticas
router.get('/', async (req, res) => {
  try {
    // Total de personas arrestadas
    const totalPersons = await pool.query('SELECT COUNT(*) FROM Persons');

    // Delitos más comunes
    const commonOffenses = await pool.query(`
      SELECT offense, COUNT(*) as count
      FROM Arrests
      GROUP BY offense
      ORDER BY count DESC
      LIMIT 5
    `);

    // Arrestos por ubicación
    const arrestsByLocation = await pool.query(`
      SELECT location, COUNT(*) as count
      FROM Arrests
      GROUP BY location
      ORDER BY count DESC
    `);

    res.json({
      totalPersons: parseInt(totalPersons.rows[0].count),
      commonOffenses: commonOffenses.rows,
      arrestsByLocation: arrestsByLocation.rows
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
