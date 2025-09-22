const express = require('express');
const cors = require('cors');
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

app.use("/api/search_face", searchFaceRouter);

// Rutas
app.use('/api/register', registerRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/persons', personsRoutes);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

