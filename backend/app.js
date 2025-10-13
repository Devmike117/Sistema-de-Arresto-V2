const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Importar rutas
const registerRoutes = require('./routes/register');
const filesRoutes = require('./routes/files');
const personsRoutes = require('./routes/persons');
const statsRoutes = require('./routes/stats');
const searchFaceRouter = require('./routes/search_face');
const registerArrestRouter = require('./routes/register_arrest');
const dashboardRouter = require('./routes/dashboard');

// Rutas
app.use('/api/register', registerRoutes);
app.use('/api/search_face', searchFaceRouter);
app.use('/api/files', filesRoutes);
app.use('/api/persons', personsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/register_arrest', registerArrestRouter);
app.use('/api/arrests', registerArrestRouter);
app.use('/api/dashboard', dashboardRouter);

// Servir carpeta de fotos como pública
app.use('/uploads/photos', express.static(path.join(__dirname, 'uploads/photos')));

// Iniciar el microservicio de Python
const pythonServicePath = path.join(__dirname, 'python', 'deepface_service.py');

if (fs.existsSync(pythonServicePath)) {
  console.log('Iniciando el microservicio de DeepFace...');
  const pythonService = spawn('python', [pythonServicePath]);

  pythonService.stdout.on('data', (data) => {
    console.log(`[DeepFaceService]: ${data.toString().trim()}`);
  });

  pythonService.stderr.on('data', (data) => {
    console.error(`[DeepFaceService ERROR]: ${data.toString().trim()}`);
  });

  pythonService.on('close', (code) => {
    console.log(`El microservicio DeepFace terminó con el código ${code}`);
  });
} else {
  console.warn(`⚠️ Archivo no encontrado: ${pythonServicePath}. Verifica la ruta o crea el archivo.`);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
