require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const productosRouter = require('./routes/products');
const imagenesRouter = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del sitio público
app.use(express.static(path.join(__dirname, '../public')));

// Servir archivos del panel de administración en /admin
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Endpoint de configuración pública (URL y clave anon de Supabase para el frontend)
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  });
});

// Rutas de la API
app.use('/api/products', productosRouter);
app.use('/api/images', imagenesRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err.message);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Panel de administración: http://localhost:${PORT}/admin`);
});
