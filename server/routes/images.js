const express = require('express');
const multer = require('multer');
const { procesarImagen } = require('../services/sharp');
const supabase = require('../services/supabase');
const { verificarAuth } = require('../middleware/auth');

const router = express.Router();

// Multer: almacena el archivo en memoria (Buffer), nunca en disco
const subida = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido. Use JPG, PNG o WebP.'));
    }
  },
});

/**
 * POST /api/images/process
 * Flujo:
 *   1. Redimensiona a 800x800 con fondo blanco y convierte a WebP (Sharp)
 *   2. Sube la imagen procesada a Supabase Storage
 *   3. Devuelve la URL pública
 *
 * Requiere autenticación (Authorization: Bearer <token>)
 */
router.post('/process', verificarAuth, subida.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
  }

  const marcaTiempo = Date.now();

  try {
    // Paso 1: Procesar imagen (800x800, fondo blanco, WebP)
    const imagenProcesada = await procesarImagen(req.file.buffer);

    // Paso 2: Subir a Supabase Storage
    const rutaProcesada = `processed/${marcaTiempo}_producto.webp`;
    const { error: errorSubida } = await supabase.storage
      .from('product-images')
      .upload(rutaProcesada, imagenProcesada, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (errorSubida) throw errorSubida;

    // Paso 3: Devolver URL pública
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(rutaProcesada);

    res.json({ url: urlData.publicUrl });

  } catch (err) {
    console.error('Error procesando imagen:', err.message);

    if (err.message && err.message.includes('formato')) {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Error al procesar la imagen. Intenta de nuevo.' });
  }
});

// Manejo de errores de Multer
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'La imagen es demasiado grande. Máximo permitido: 10 MB.' });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
