/**
 * catalog.js — Lógica del catálogo público de productos
 * Carga productos desde la API del servidor y los renderiza en el grid.
 */

// Estado de la aplicación
let categoriaActiva = '';
let todosLosProductos = [];

// Referencias al DOM
const estadoCarga = document.getElementById('estado-carga');
const estadoVacio  = document.getElementById('estado-vacio');
const estadoError  = document.getElementById('estado-error');
const productosGrid = document.getElementById('productos-grid');
const modalOverlay  = document.getElementById('modal-overlay');

/**
 * Obtiene los productos desde la API del servidor.
 * Si hay una categoría activa, la incluye como filtro.
 */
async function cargarProductos() {
  mostrarEstado('carga');

  try {
    const url = categoriaActiva
      ? `/api/products?categoria=${encodeURIComponent(categoriaActiva)}`
      : '/api/products';

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(`Error del servidor: ${respuesta.status}`);
    }

    todosLosProductos = await respuesta.json();
    renderizarProductos(todosLosProductos);

  } catch (err) {
    console.error('Error al cargar productos:', err.message);
    mostrarEstado('error');
  }
}

/**
 * Renderiza el array de productos en el grid.
 * @param {Array} productos - Array de objetos producto
 */
function renderizarProductos(productos) {
  if (!productos || productos.length === 0) {
    mostrarEstado('vacio');
    return;
  }

  mostrarEstado('grid');
  productosGrid.innerHTML = '';

  productos.forEach(producto => {
    const tarjeta = crearTarjeta(producto);
    productosGrid.appendChild(tarjeta);
  });
}

/**
 * Crea el elemento HTML de una tarjeta de producto.
 * @param {Object} producto - Objeto con los datos del producto
 * @returns {HTMLElement} - Elemento de tarjeta
 */
function crearTarjeta(producto) {
  const articulo = document.createElement('article');
  articulo.className = 'producto-card';
  articulo.setAttribute('role', 'button');
  articulo.setAttribute('tabindex', '0');
  articulo.setAttribute('aria-label', `Ver detalles de ${producto.nombre}`);

  // Imagen o placeholder
  const imagenHtml = producto.imagen_url
    ? `<img
         class="producto-card__imagen"
         src="${producto.imagen_url}"
         alt="${producto.nombre}"
         loading="lazy"
       />`
    : `<div class="producto-card__imagen-placeholder">⚙️</div>`;

  // Badge de categoría (solo si existe)
  const badgeHtml = producto.categoria
    ? `<span class="producto-card__badge">${producto.categoria}</span>`
    : '';

  // Precio formateado (solo si existe)
  const precioHtml = producto.precio !== null && producto.precio !== undefined
    ? `<p class="producto-card__precio">${formatearPrecio(producto.precio)}</p>`
    : '';

  articulo.innerHTML = `
    <div class="producto-card__imagen-wrapper">
      ${imagenHtml}
      ${badgeHtml}
    </div>
    <div class="producto-card__info">
      <h3 class="producto-card__nombre">${producto.nombre}</h3>
      ${precioHtml}
    </div>
  `;

  // Abrir modal al hacer click o presionar Enter
  articulo.addEventListener('click', () => abrirModal(producto));
  articulo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') abrirModal(producto);
  });

  return articulo;
}

/**
 * Formatea un precio como moneda local.
 * @param {number} precio - Precio numérico
 * @returns {string} - Precio formateado (ej: "Q 125.00")
 */
function formatearPrecio(precio) {
  return `Q ${parseFloat(precio).toFixed(2)}`;
}

/**
 * Abre el modal con el detalle de un producto.
 * @param {Object} producto - Objeto con los datos del producto
 */
function abrirModal(producto) {
  document.getElementById('modal-nombre').textContent    = producto.nombre;
  document.getElementById('modal-categoria').textContent = producto.categoria || '';
  document.getElementById('modal-descripcion').textContent = producto.descripcion || 'Sin descripción disponible.';
  document.getElementById('modal-precio').textContent = producto.precio !== null
    ? formatearPrecio(producto.precio)
    : '';

  const modalImagen = document.getElementById('modal-imagen');
  if (producto.imagen_url) {
    modalImagen.src = producto.imagen_url;
    modalImagen.alt = producto.nombre;
    modalImagen.style.display = 'block';
  } else {
    modalImagen.style.display = 'none';
  }

  modalOverlay.classList.remove('oculto');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de detalle.
 */
function cerrarModal() {
  modalOverlay.classList.add('oculto');
  document.body.style.overflow = '';
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarModal();
});

/**
 * Alterna la visibilidad de los estados del catálogo.
 * @param {'carga'|'grid'|'vacio'|'error'} estado
 */
function mostrarEstado(estado) {
  estadoCarga.classList.add('oculto');
  estadoVacio.classList.add('oculto');
  estadoError.classList.add('oculto');
  productosGrid.classList.add('oculto');

  if (estado === 'carga') estadoCarga.classList.remove('oculto');
  if (estado === 'grid')  productosGrid.classList.remove('oculto');
  if (estado === 'vacio') estadoVacio.classList.remove('oculto');
  if (estado === 'error') estadoError.classList.remove('oculto');
}

// ===== LÓGICA DE FILTROS =====
const botonesFilto = document.querySelectorAll('.filtro-btn');

botonesFilto.forEach(btn => {
  btn.addEventListener('click', () => {
    // Actualizar botón activo
    botonesFilto.forEach(b => b.classList.remove('filtro-btn--activo'));
    btn.classList.add('filtro-btn--activo');

    // Actualizar categoría y recargar
    categoriaActiva = btn.dataset.categoria;
    cargarProductos();
  });
});

// ===== INICIALIZACIÓN =====
cargarProductos();
