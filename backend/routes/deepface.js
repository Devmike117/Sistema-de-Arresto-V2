const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

// Configurar multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint para validar que una imagen contenga un rostro
router.post('/validate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    // Crear FormData para enviar al servicio DeepFace
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Enviar al servicio DeepFace para generar embedding
    const response = await axios.post(
      'http://127.0.0.1:8001/generate_embedding/',
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 10000 // 10 segundos de timeout
      }
    );

    // Si el servicio DeepFace respondió exitosamente, significa que detectó un rostro
    if (response.status === 200 && response.data) {
      return res.status(200).json({ 
        success: true, 
        message: 'Rostro detectado correctamente',
        embedding: response.data.embedding
      });
    } else {
      return res.status(400).json({ 
        error: 'No se detectó ningún rostro en la imagen' 
      });
    }

  } catch (err) {
    console.error('[DeepFace Validate Error]:', err.message);
    
    // Si es un error de timeout o conexión
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'El servicio de reconocimiento facial no está disponible' 
      });
    }

    // Si el servicio DeepFace respondió con error (no detectó rostro)
    if (err.response && err.response.status === 400) {
      return res.status(400).json({ 
        error: 'No se detectó ningún rostro en la imagen' 
      });
    }

    return res.status(500).json({ 
      error: 'Error al procesar la imagen',
      details: err.message 
    });
  }
});

module.exports = router;
