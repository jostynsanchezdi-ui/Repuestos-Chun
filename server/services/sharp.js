const sharp = require('sharp');

/**
 * Procesa una imagen subida por el administrador:
 * redimensiona a 800x800, aplica fondo blanco y convierte a WebP.
 * @param {Buffer} imagenBuffer - Buffer de la imagen original
 * @returns {Promise<Buffer>} - Buffer WebP listo para subir a Supabase Storage
 */
async function procesarImagen(imagenBuffer) {
  return sharp(imagenBuffer)
    .resize(800, 800, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .webp({ quality: 85 })
    .toBuffer();
}

module.exports = { procesarImagen };
