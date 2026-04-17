/**
 * auth.js — Lógica de autenticación del panel de administración.
 * Utiliza Supabase Auth para login, logout y verificación de sesión.
 */

// Cliente de Supabase (se inicializa después de obtener la config del servidor)
let supabaseClient = null;

/**
 * Inicializa el cliente de Supabase con la config del servidor.
 * @returns {Promise<Object>} - Cliente de Supabase listo para usar
 */
async function inicializarSupabase() {
  if (supabaseClient) return supabaseClient;

  const respuesta = await fetch('/api/config');
  const config = await respuesta.json();

  supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  return supabaseClient;
}

/**
 * Retorna el token JWT de la sesión actual.
 * Útil para incluirlo en requests al backend.
 * @returns {Promise<string|null>}
 */
async function obtenerToken() {
  const cliente = await inicializarSupabase();
  const { data: { session } } = await cliente.auth.getSession();
  return session?.access_token || null;
}

// ===== PÁGINA DE LOGIN =====
const formularioLogin = document.getElementById('login-form');

if (formularioLogin) {
  // Si ya hay sesión activa, redirigir al dashboard
  (async () => {
    const cliente = await inicializarSupabase();
    const { data: { session } } = await cliente.auth.getSession();
    if (session) {
      window.location.href = '/admin/dashboard.html';
    }
  })();

  formularioLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btnLogin = document.getElementById('btn-login');
    const alertaError = document.getElementById('alerta-error');

    alertaError.classList.add('oculto');
    btnLogin.disabled = true;
    btnLogin.textContent = 'Ingresando...';

    try {
      const cliente = await inicializarSupabase();
      const { error } = await cliente.auth.signInWithPassword({ email, password });

      if (error) {
        let mensaje = 'Correo o contraseña incorrectos.';
        if (error.message.includes('Email not confirmed')) {
          mensaje = 'Debes confirmar tu correo antes de ingresar.';
        }
        alertaError.textContent = mensaje;
        alertaError.classList.remove('oculto');
        return;
      }

      // Login exitoso → redirigir al dashboard
      window.location.href = '/admin/dashboard.html';

    } catch (err) {
      console.error('Error al iniciar sesión:', err.message);
      alertaError.textContent = 'Error de conexión. Intenta de nuevo.';
      alertaError.classList.remove('oculto');
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = 'Ingresar';
    }
  });
}

// ===== DASHBOARD: VERIFICACIÓN DE SESIÓN Y LOGOUT =====
const btnLogout = document.getElementById('btn-logout');

if (btnLogout) {
  // Verificar que hay sesión activa al cargar el dashboard
  (async () => {
    const cliente = await inicializarSupabase();
    const { data: { session } } = await cliente.auth.getSession();

    if (!session) {
      window.location.href = '/admin/';
      return;
    }

    // Mostrar email del usuario en el navbar
    const navbarUsuario = document.getElementById('navbar-usuario');
    if (navbarUsuario) {
      navbarUsuario.textContent = session.user.email;
    }
  })();

  // Botón de cerrar sesión
  btnLogout.addEventListener('click', async () => {
    const cliente = await inicializarSupabase();
    await cliente.auth.signOut();
    window.location.href = '/admin/';
  });
}
