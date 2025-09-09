const express = require('express');
const router = express.Router();
const pool = require('../db');

// Registrar persona y arresto
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, dob, gender, nationality, address, phone_number, id_number, offense, location, arresting_officer, case_number, bail_status, notes } = req.body;

    // Insertar persona
    const personResult = await pool.query(
      `INSERT INTO Persons (first_name, last_name, dob, gender, nationality, address, phone_number, id_number, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [first_name, last_name, dob, gender, nationality, address, phone_number, id_number, notes]
    );

    const personId = personResult.rows[0].id;

    // Insertar arresto
    await pool.query(
      `INSERT INTO Arrests (person_id, offense, location, arresting_officer, case_number, bail_status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [personId, offense, location, arresting_officer, case_number, bail_status, notes]
    );

    res.status(201).json({ message: 'Persona y arresto registrados', personId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al registrar');
  }
});

module.exports = router;
