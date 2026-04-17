/**
 * upload.js — Subida de hasta 3 imágenes por producto.
 * Cada slot puede subirse individualmente; la primera imagen es la principal.
 */

// Estado global: 3 slots con sus URLs procesadas
const imagenesUrls = [null, null, null];

// Inicializar los 3 slots al cargar
for (let i = 0; i < 3; i++) {
  inicializarSlot(i);
}

/**
 * Registra todos los eventos de un slot (click, drag, input, quitar).
 * @param {number} idx - Índice del slot (0, 1 ó 2)
 */
function inicializarSlot(idx) {
  const slotEl    = document.getElementById(`upload-slot-${idx}`);
  const inputEl   = document.getElementById(`upload-input-${idx}`);
  const quitarBtn = slotEl?.querySelector('.upload-slot__quitar');

  if (!slotEl || !inputEl) return;

  // Click en el slot → abrir selector de archivo
  slotEl.addEventListener('click', (e) => {
    if (quitarBtn?.contains(e.target)) return;
    inputEl.click();
  });

  // Drag & drop
  slotEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    slotEl.classList.add('upload-slot--drag');
  });
  slotEl.addEventListener('dragleave', () => slotEl.classList.remove('upload-slot--drag'));
  slotEl.addEventListener('drop', (e) => {
    e.preventDefault();
    slotEl.classList.remove('upload-slot--drag');
    const archivo = e.dataTransfer.files[0];
    if (archivo) procesarSlot(idx, archivo);
  });

  // Selección desde input
  inputEl.addEventListener('change', () => {
    const archivo = inputEl.files[0];
    if (archivo) procesarSlot(idx, archivo);
  });

  // Quitar imagen
  quitarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    quitarSlot(idx);
  });
}

/**
 * Valida, previsualiza y sube un archivo al servidor para un slot dado.
 * @param {number} idx
 * @param {File} archivo
 */
async function procesarSlot(idx, archivo) {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!tiposPermitidos.includes(archivo.type)) {
    mostrarErrorForm('Formato no válido. Solo se permiten JPG, PNG o WebP.');
    return;
  }
  if (archivo.size > 10 * 1024 * 1024) {
    mostrarErrorForm('Imagen demasiado grande. El máximo es 10 MB.');
    return;
  }

  // Previsualización local inmediata
  const urlLocal = URL.createObjectURL(archivo);
  document.getElementById(`upload-img-${idx}`).src = urlLocal;
  document.getElementById(`upload-placeholder-${idx}`).classList.add('oculto');
  document.getElementById(`upload-preview-${idx}`).classList.remove('oculto');

  // Barra de progreso
  mostrarProgreso(20, `Procesando imagen ${idx + 1}...`);

  try {
    const token = await obtenerToken();
    if (!token) { window.location.href = '/admin/'; return; }

    mostrarProgreso(45, `Subiendo imagen ${idx + 1}...`);

    const formData = new FormData();
    formData.append('imagen', archivo);

    const respuesta = await fetch('/api/images/process', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    mostrarProgreso(85, 'Finalizando...');
    const resultado = await respuesta.json();

    if (!respuesta.ok) throw new Error(resultado.error || 'Error al procesar la imagen.');

    // Guardar URL procesada
    imagenesUrls[idx] = resultado.url;
    document.getElementById(`upload-img-${idx}`).src = resultado.url;

    // campo-imagen-url siempre refleja la primera imagen disponible
    sincronizarCampoUrl();

    mostrarProgreso(100, '✓ Imagen procesada');
    setTimeout(() => ocultarProgreso(), 1500);

  } catch (err) {
    console.error('Error al procesar imagen:', err.message);
    mostrarErrorForm(err.message || 'Error al procesar la imagen. Intenta de nuevo.');
    quitarSlot(idx);
  }
}

/**
 * Elimina la imagen de un slot y resetea su UI.
 * @param {number} idx
 */
function quitarSlot(idx) {
  imagenesUrls[idx] = null;
  const imgEl = document.getElementById(`upload-img-${idx}`);
  const inputEl = document.getElementById(`upload-input-${idx}`);
  if (imgEl) imgEl.src = '';
  if (inputEl) inputEl.value = '';
  document.getElementById(`upload-placeholder-${idx}`)?.classList.remove('oculto');
  document.getElementById(`upload-preview-${idx}`)?.classList.add('oculto');
  sincronizarCampoUrl();
}

/**
 * Mantiene campo-imagen-url sincronizado con la primera URL disponible.
 */
function sincronizarCampoUrl() {
  const campo = document.getElementById('campo-imagen-url');
  if (campo) campo.value = imagenesUrls.find(u => u !== null) || '';
}

/**
 * Reinicia los 3 slots al estado vacío.
 */
function reiniciarUpload() {
  for (let i = 0; i < 3; i++) quitarSlot(i);
  ocultarProgreso();
}

/**
 * Carga URLs existentes en los slots (al editar un producto).
 * @param {Array<string>} imagenes - Array de URLs (máx. 3)
 */
function cargarImagenesExistentes(imagenes) {
  reiniciarUpload();
  if (!imagenes) return;
  const arr = Array.isArray(imagenes) ? imagenes : [imagenes];
  arr.slice(0, 3).forEach((url, idx) => {
    if (!url) return;
    imagenesUrls[idx] = url;
    document.getElementById(`upload-img-${idx}`).src = url;
    document.getElementById(`upload-placeholder-${idx}`).classList.add('oculto');
    document.getElementById(`upload-preview-${idx}`).classList.remove('oculto');
  });
  sincronizarCampoUrl();
}

/**
 * Devuelve las URLs no nulas en orden.
 * @returns {Array<string>}
 */
function obtenerImagenesUrls() {
  return imagenesUrls.filter(u => u !== null);
}

// ── Helpers de barra de progreso ──────────────────────────────────────────
function mostrarProgreso(porcentaje, texto) {
  const wrap    = document.getElementById('progreso-upload');
  const relleno = document.getElementById('progreso-relleno');
  const textoEl = document.getElementById('progreso-texto');
  if (!wrap) return;
  wrap.classList.remove('oculto');
  if (relleno) relleno.style.width = `${porcentaje}%`;
  if (textoEl) textoEl.textContent = texto;
}

function ocultarProgreso() {
  document.getElementById('progreso-upload')?.classList.add('oculto');
  const relleno = document.getElementById('progreso-relleno');
  if (relleno) relleno.style.width = '0%';
}

// ── Helper de error (accesible desde este módulo) ─────────────────────────
function mostrarErrorForm(mensaje) {
  const errorEl = document.getElementById('form-error');
  if (errorEl) {
    errorEl.textContent = mensaje;
    errorEl.classList.remove('oculto');
    setTimeout(() => errorEl.classList.add('oculto'), 5000);
  }
}
