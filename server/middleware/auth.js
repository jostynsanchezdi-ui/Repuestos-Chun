const supabase = require('../services/supabase');

/**
 * Middleware que verifica que el request viene de un usuario autenticado.
 * Espera el token JWT de Supabase en el header: Authorization: Bearer <token>
 */
async function verificarAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Error al verificar autenticación:', err.message);
    res.status(500).json({ error: 'Error al verificar autenticación.' });
  }
}

module.exports = { verificarAuth };
