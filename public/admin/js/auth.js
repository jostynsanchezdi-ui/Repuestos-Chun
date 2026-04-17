/**
 * auth.js — Autenticación del panel de administración via Supabase Auth.
 * Conexión directa al SDK de Supabase (sin backend intermedio).
 */

const SUPABASE_URL      = 'https://cbredsjpfrcqmjwizhif.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Skb4lgbOKw2IIkgOPw_vGQ_5bTwC6TM';

let supabaseClient = null;

/**
 * Inicializa y retorna el cliente de Supabase (singleton).
 */
async function inicializarSupabase() {
  if (supabaseClient) return supabaseClient;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

/**
 * Retorna el token JWT de la sesión activa.
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

    const email       = document.getElementById('email').value.trim();
    const password    = document.getElementById('password').value;
    const btnLogin    = document.getElementById('btn-login');
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

      window.location.href = '/admin/dashboard.html';

    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      alertaError.textContent = `Error: ${err.message}`;
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
  (async () => {
    const cliente = await inicializarSupabase();
    const { data: { session } } = await cliente.auth.getSession();

    if (!session) {
      window.location.href = '/admin/';
      return;
    }

    const navbarUsuario = document.getElementById('navbar-usuario');
    if (navbarUsuario) {
      navbarUsuario.textContent = session.user.email;
    }
  })();

  btnLogout.addEventListener('click', async () => {
    const cliente = await inicializarSupabase();
    await cliente.auth.signOut();
    window.location.href = '/admin/';
  });
}
