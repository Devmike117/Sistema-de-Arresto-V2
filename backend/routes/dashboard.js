const express = require('express');
const router = express.Router();
const pool = require('../db'); // tu conexión a PostgreSQL

// =============================
// Endpoint: Estadísticas generales
// =============================
router.get('/stats', async (req, res) => {
  try {
    // Total de personas
    const personsRes = await pool.query('SELECT COUNT(*) FROM Persons');
    const totalPersons = parseInt(personsRes.rows[0].count, 10);

    // Total de arrestos
    const arrestsRes = await pool.query('SELECT COUNT(*) FROM Arrests');
    const totalArrests = parseInt(arrestsRes.rows[0].count, 10);

    // Top 5 delitos
    const offensesRes = await pool.query(`
      SELECT offense, COUNT(*) as count
      FROM Arrests
      GROUP BY offense
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json({
      totalPersons,
      totalArrests,
      topOffenses: offensesRes.rows
    });
  } catch (err) {
    console.error('Error en /dashboard/stats:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// =============================
// Endpoint: Arrestos recientes
// =============================
router.get('/recent-arrests', async (req, res) => {
  try {
    const recentRes = await pool.query(`
      SELECT a.*, p.first_name, p.middle_name, p.last_name
      FROM Arrests a
      JOIN Persons p ON p.id = a.person_id
      ORDER BY a.arrest_date DESC
      LIMIT 5
    `);

    res.json({ recentArrests: recentRes.rows });
  } catch (err) {
    console.error('Error en /dashboard/recent-arrests:', err);
    res.status(500).json({ error: 'Error al obtener arrestos recientes' });
  }
});

module.exports = router;
