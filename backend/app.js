const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { spawn } = require('child_process');
const os = require('os');
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
const deepfaceRouter = require('./routes/deepface');

// Rutas
app.use('/api/register', registerRoutes);
app.use('/api/search_face', searchFaceRouter);
app.use('/api/files', filesRoutes);
app.use('/api/persons', personsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/register_arrest', registerArrestRouter);
app.use('/api/arrests', registerArrestRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/deepface', deepfaceRouter);

// Servir carpeta de fotos como pública
app.use('/uploads/photos', express.static(path.join(__dirname, 'uploads/photos')));

// Health check endpoint para Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
  console.warn(` Archivo no encontrado: ${pythonServicePath}. Verifica la ruta o crea el archivo.`);
}

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces de red

app.listen(PORT, HOST, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
  console.log('   Puedes acceder desde las siguientes URLs:');
  console.log(`   - Local:   http://localhost:${PORT}`);

  // Obtener y mostrar la IP de la red local
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        console.log(`   - Network: http://${net.address}:${PORT}`);
      }
    }
  }
  console.log('Presiona CTRL+C para detener el servidor.');
});
