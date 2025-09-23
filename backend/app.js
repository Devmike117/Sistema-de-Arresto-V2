const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Importar rutas
const registerRoutes = require('./routes/register');
const filesRoutes = require('./routes/files');
const personsRoutes = require('./routes/persons');
const statsRoutes = require('./routes/stats');
const searchFaceRouter = require("./routes/search_face");
const registerArrestRouter = require("./routes/register_arrest");

app.use("/api/search_face", searchFaceRouter);

// Rutas
app.use('/api/register', registerRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/persons', personsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/register_arrest', registerArrestRouter);
app.use('/api/arrests', registerArrestRouter);
// Servir carpeta de fotos como pública
app.use('/uploads/photos', express.static(path.join(__dirname, 'uploads/photos')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

