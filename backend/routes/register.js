const express = require('express');
const router = express.Router();
const pool = require('../db');

// Registrar persona + arresto
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      first_name,
      middle_name,
      last_name,
      dob,
      gender,
      nationality,
      address,
      phone_number,
      id_number,
      notes,
      offense,
      location,
      arresting_officer,
      case_number,
      bail_status
    } = req.body;

    await client.query('BEGIN');

    // Insertar persona
    const personResult = await client.query(
      `INSERT INTO Persons (first_name, middle_name, last_name, dob, gender, nationality, address, phone_number, id_number, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [first_name, middle_name, last_name, dob, gender, nationality, address, phone_number, id_number, notes]
    );

    const personId = personResult.rows[0].id;

    // Insertar arresto
    await client.query(
      `INSERT INTO Arrests (person_id, offense, location, arresting_officer, case_number, bail_status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [personId, offense, location, arresting_officer, case_number, bail_status, notes]
    );

    await client.query('COMMIT');

    res.status(201).json({ success: true, message: 'Persona y arresto registrados', personId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Error al registrar' });
  } finally {
    client.release();
  }
});

module.exports = router;
