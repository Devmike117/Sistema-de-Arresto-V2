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

    // Top 5 faltas administrativas (delitos)
    const offensesRes = await pool.query(`
      SELECT falta_administrativa AS offense, COUNT(*) AS count
      FROM Arrests
      WHERE falta_administrativa IS NOT NULL AND falta_administrativa <> ''
      GROUP BY falta_administrativa
      ORDER BY count DESC
      LIMIT 5
    `);

    // Top 5 personas con más arrestos
    const topPersonsRes = await pool.query(`
      SELECT 
        p.id,
        CONCAT(p.first_name, ' ', COALESCE(NULLIF(p.alias, ''), ''), ' ', p.last_name) AS name,
        COUNT(a.id) AS count
      FROM Persons p
      JOIN Arrests a ON a.person_id = p.id
      GROUP BY p.id, p.first_name, p.alias, p.last_name
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json({
      totalPersons,
      totalArrests,
      topOffenses: offensesRes.rows,
      topPersons: topPersonsRes.rows
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
      SELECT a.id, a.arrest_date,
             COALESCE(NULLIF(a.falta_administrativa, ''), 'Sin especificar') AS falta_administrativa,
             a.comunidad, a.arresting_officer,
             a.folio, a.rnd, a.sentencia,
             p.first_name, p.alias, p.last_name
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


// En tu archivo de rutas del dashboard en el backend (ej. backend/routes/dashboard.js)

// GET /api/dashboard/all-persons
router.get('/all-persons', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name FROM Persons ORDER BY first_name, last_name`
    );
    res.json({ persons: rows });
  } catch (err) {
    console.error('Error fetching all persons:', err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/dashboard/all-arrests
router.get('/all-arrests', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.arrest_date, a.falta_administrativa, p.first_name, p.last_name
       FROM Arrests a
       JOIN Persons p ON a.person_id = p.id
       ORDER BY a.arrest_date DESC`
    );
    res.json({ arrests: rows });
  } catch (err) {
    console.error('Error fetching all arrests:', err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});
