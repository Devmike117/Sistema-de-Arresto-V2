const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpetas si no existen
const photoDir = path.join(__dirname, '../uploads/photos');
const fingerprintDir = path.join(__dirname, '../uploads/fingerprints');
if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });
if (!fs.existsSync(fingerprintDir)) fs.mkdirSync(fingerprintDir, { recursive: true });

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'photo') cb(null, photoDir);
    else if (file.fieldname === 'fingerprint') cb(null, fingerprintDir);
    else cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/**
 * Paso 1: Crear persona (sin foto ni huellas)
 */
router.post('/create-person', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      first_name, middle_name, last_name, dob, gender, nationality,
      estado, municipio, comunidad,
      id_number, observaciones
    } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO Persons (
        first_name, middle_name, last_name, dob, gender, nationality,
        estado, municipio, comunidad, id_number, observaciones
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id`,
      [
        first_name, middle_name, last_name, dob, gender, nationality,
        estado, municipio, comunidad, id_number, observaciones
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      message: 'Persona creada',
      personId: result.rows[0].id
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en /create-person:', err.message);
    res.status(500).json({ success: false, error: 'Error al crear persona' });
  } finally {
    client.release();
  }
});

/**
 * Paso 2: Subir foto y huellas ligadas a una persona
 */
router.post(
  '/upload-biometric/:personId',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'fingerprint', maxCount: 1 }
  ]),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { personId } = req.params;

      await client.query('BEGIN');

      // Actualizar foto
      if (req.files.photo) {
        const relativePhotoPath = `uploads/photos/${req.files.photo[0].filename}`;
        await client.query(
          `UPDATE Persons SET photo_path = $1 WHERE id = $2`,
          [relativePhotoPath, personId]
        );
      }

      // Guardar huella si existe
      if (req.files.fingerprint) {
        const fingerprintFile = req.files.fingerprint[0];
        const fingerprintData = fs.readFileSync(fingerprintFile.path);

        await client.query(
          `INSERT INTO Fingerprints (person_id, template, finger)
           VALUES ($1,$2,$3)`,
          [personId, fingerprintData, fingerprintFile.originalname]
        );
      }

      await client.query('COMMIT');
      res.status(200).json({
        success: true,
        message: 'Biometría subida con éxito'
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error en /upload-biometric:', err.message);
      res.status(500).json({ success: false, error: 'Error al subir biometría' });
    } finally {
      client.release();
    }
  }
);

// =============================
// Endpoint: Borrar una persona y todos sus datos asociados
// =============================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtener todas las rutas de archivos asociados a la persona
    const personQuery = await client.query('SELECT photo_path, privacy_notice_path FROM Persons WHERE id = $1', [id]);
    if (personQuery.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Persona no encontrada.' });
    }

    const facialDataQuery = await client.query('SELECT image_path FROM FacialData WHERE person_id = $1', [id]);

    // Construir una lista única de todos los archivos a eliminar
    const filesToDelete = new Set();
    const { photo_path, privacy_notice_path } = personQuery.rows[0];
    if (photo_path) filesToDelete.add(photo_path);
    if (privacy_notice_path) filesToDelete.add(privacy_notice_path);
    // Añadir fotos de datos faciales a la lista de borrado
    facialDataQuery.rows.forEach(row => {
      if (row.image_path) filesToDelete.add(row.image_path);
    });

    // 2. Borrar registros dependientes explícitamente
    // Esto es más seguro que depender de ON DELETE CASCADE si no se ha configurado.
    await client.query('DELETE FROM Arrests WHERE person_id = $1', [id]);
    await client.query('DELETE FROM FacialData WHERE person_id = $1', [id]);
    await client.query('DELETE FROM Fingerprints WHERE person_id = $1', [id]);

    // 3. Ahora sí, borrar a la persona
    await client.query('DELETE FROM Persons WHERE id = $1', [id]);


    // 4. Borrar los archivos físicos asociados
    for (const relativePath of filesToDelete) {
      const fullPath = path.join(__dirname, '..', relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: `Persona con ID ${id} y todos sus registros asociados han sido eliminados.`,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error al eliminar persona con ID ${id}:`, err);
    res.status(500).json({ success: false, error: 'Error interno del servidor al eliminar la persona.' });
  } finally {
    client.release();
  }
});

module.exports = router;
