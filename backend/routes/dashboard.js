const express = require('express');
const router = express.Router();
const pool = require('../db'); // tu conexión a PostgreSQL

// =============================
// Endpoint: Estadísticas generales
// =============================
router.get('/stats', async (req, res) => {
  try {
    const { year, month, day } = req.query;

    let dateFilter = 'WHERE 1=1';
    const params = [];

    if (year && year !== 'all') {
      params.push(year);
      dateFilter += ` AND EXTRACT(YEAR FROM a.arrest_date) = $${params.length}`;
    }
    if (month && month !== 'all') {
      params.push(month);
      dateFilter += ` AND EXTRACT(MONTH FROM a.arrest_date) = $${params.length}`;
    }
    if (day && day !== 'all') {
      params.push(day);
      dateFilter += ` AND EXTRACT(DAY FROM a.arrest_date) = $${params.length}`;
    }

    // Total de personas (no se filtra por fecha)
    const personsRes = await pool.query('SELECT COUNT(*) FROM Persons');
    const totalPersons = parseInt(personsRes.rows[0].count, 10);

    // Total de arrestos (filtrado)
    const arrestsRes = await pool.query(`SELECT COUNT(*) FROM Arrests a ${dateFilter}`, params);
    const totalArrests = parseInt(arrestsRes.rows[0].count, 10);

    // Top 5 faltas administrativas (delitos) (filtrado)
    const offensesRes = await pool.query(`
      SELECT a.falta_administrativa AS offense, COUNT(*) AS count
      FROM Arrests a
      ${dateFilter} AND a.falta_administrativa IS NOT NULL AND a.falta_administrativa <> ''
      GROUP BY a.falta_administrativa
      ORDER BY count DESC
      LIMIT 5
    `, params);

    // Top 5 personas con más arrestos (filtrado)
    const topPersonsRes = await pool.query(`
      SELECT 
        p.id,
        CONCAT(p.first_name, ' ', COALESCE(NULLIF(p.alias, ''), ''), ' ', p.last_name) AS name,
        COUNT(a.id) AS count
      FROM Persons p
      JOIN Arrests a ON a.person_id = p.id
      ${dateFilter}
      GROUP BY p.id, p.first_name, p.alias, p.last_name
      ORDER BY count DESC
      LIMIT 5
    `, params);

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
    const { year, month, day } = req.query;

    let dateFilter = 'WHERE 1=1';
    const params = [];

    if (year && year !== 'all') {
      params.push(year);
      dateFilter += ` AND EXTRACT(YEAR FROM a.arrest_date) = $${params.length}`;
    }
    if (month && month !== 'all') {
      params.push(month);
      dateFilter += ` AND EXTRACT(MONTH FROM a.arrest_date) = $${params.length}`;
    }
    if (day && day !== 'all') {
      params.push(day);
      dateFilter += ` AND EXTRACT(DAY FROM a.arrest_date) = $${params.length}`;
    }

    const recentRes = await pool.query(`
      SELECT a.id, a.arrest_date,
             COALESCE(NULLIF(a.falta_administrativa, ''), 'Sin especificar') AS falta_administrativa,
             a.comunidad, a.arresting_officer,
             a.folio, a.rnd, a.sentencia,
             p.first_name, p.alias, p.last_name
      FROM Arrests a
      JOIN Persons p ON p.id = a.person_id
      ${dateFilter}
      ORDER BY a.arrest_date DESC
      LIMIT 5
    `, params);

    res.json({ recentArrests: recentRes.rows });
  } catch (err) {
    console.error('Error en /dashboard/recent-arrests:', err);
    res.status(500).json({ error: 'Error al obtener arrestos recientes' });
  }
});

// =============================
// Endpoint: Get full report for a single person
// =============================
router.get('/person-report/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Get person details
    const personRes = await pool.query('SELECT * FROM Persons WHERE id = $1', [id]);
    if (personRes.rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }
    const person = personRes.rows[0];

    // Get all arrests for that person
    const arrestsRes = await pool.query(
      'SELECT * FROM Arrests WHERE person_id = $1 ORDER BY arrest_date DESC',
      [id]
    );
    
    res.json({ person, arrests: arrestsRes.rows });
  } catch (err) {
    console.error(`Error en /dashboard/person-report/${id}:`, err);
    res.status(500).json({ error: 'Error al generar el informe de la persona' });
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
