const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
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

// =============================
// Endpoint: Generar PDF de Aviso de Privacidad
// =============================
router.get('/privacy-notice/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const personRes = await pool.query('SELECT * FROM Persons WHERE id = $1', [id]);
    if (personRes.rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }
    const person = personRes.rows[0];

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=aviso_privacidad_${person.first_name}_${person.last_name}.pdf`);

    doc.pipe(res);

    // Título
    doc.fontSize(16).font('Helvetica-Bold').text('ACUERDO DE CONFIDENCIALIDAD DE DATOS PERSONALES', { align: 'center' });
    doc.moveDown(2);

    // Contenido del aviso (texto genérico)
    const privacyText = `
Con fundamento en los artículos 6, Base A y 16, segundo párrafo, de la Constitución Política de los Estados Unidos Mexicanos; 3°, fracción XXXIII, 4°, 16, 17 y 18 de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados; 1, 8 y 25 de la Ley de Transparencia y Acceso a la Información Pública del Estado de México y Municipios; así como los artículos 1, 2 fracción IV, 3, 4, 11, 12, 13, 14 y 15 de la Ley de Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de México y Municipios, se hace de su conocimiento que los datos personales recabados serán utilizados para las siguientes finalidades: registrar y dar seguimiento a los arrestos administrativos, generar estadísticas y cumplir con las obligaciones legales correspondientes.

Los datos personales recabados no serán transferidos a terceros, salvo en los casos previstos por la ley. Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.
`;
    doc.fontSize(10).font('Helvetica').text(privacyText, { align: 'justify' });
    doc.moveDown(3);

    // Información de la persona y aceptación
    doc.fontSize(12).font('Helvetica-Bold').text('Datos de la Persona:', { underline: true });
    doc.fontSize(10).font('Helvetica').text(`Nombre: ${person.first_name} ${person.last_name}`);
    doc.text(`Fecha de Aceptación: ${person.created_at ? new Date(person.created_at).toLocaleDateString('es-MX') : 'No especificada'}`);
    doc.moveDown();

    doc.fontSize(10).font('Helvetica').text('He leído y acepto los términos del presente acuerdo de confidencialidad.');
    doc.moveDown(2);

    // Firma
    if (person.privacy_notice_path && fs.existsSync(person.privacy_notice_path)) {
      doc.image(person.privacy_notice_path, {
        fit: [200, 100],
        x: 200,
        y: doc.y
      });
    } else {
      doc.text('(Sin firma digital registrada)', { align: 'center' });
    }
    doc.fontSize(8).font('Helvetica').text('___________________________', { align: 'center' });
    doc.text('Firma', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(`Error en /dashboard/privacy-notice/${id}:`, err);
    res.status(500).json({ error: 'Error al generar el PDF del aviso de privacidad' });
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
