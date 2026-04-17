/**
 * products.js — CRUD de productos desde el panel de administración.
 * Llama a la API del servidor (/api/products) con el token de Supabase Auth.
 */

// ===== MODELOS DE MOTOCICLETA =====
const MODELOS_MOTO = [
  { marca: 'Super Gato',   modelos: ['CG-150','CG 200 Standard','CG 200 Racing','CG 250','Bengala 250','Frontier 250','LGR 250','GY250','Super Cub 110','RS 150','Pasola 125 Sport','Pasola FS150','Feline Spirit'] },
  { marca: 'Tauro Turbo',  modelos: ['CG 200','CG200 Racing','Super Cub C110','CRX 250','Nitro 125','Elite 110','Lead 125','BZ 150'] },
  { marca: 'X1000',        modelos: ['CG 125','CG 150 R6','CG 200 R6','CG 250 R6','Diamond 110','T-105','Super Delivery','Steel 150','New Jog 150','Super Jog','Cruise 150','Lead 150','PG 125','Dio','Address 150','BWS 175','XROAD 200','200ZH 5DL','Nova'] },
  { marca: 'Haojue',       modelos: ['DM-150','KA-150','HJ-125 Sport','Xpress 125','HJ-125','VR-150','VS-125','VN-100'] },
  { marca: 'Loncin',       modelos: ['CR6 (Loncin 300)','525RR','DS525X'] },
  { marca: 'Nipponia',     modelos: ['Patrón 125','Magneto XP','VPS125','VRS 150'] },
  { marca: 'Bajaj',        modelos: ['Boxer MB 150','Platina 100','Platina 125 Pro'] },
  { marca: 'TVS',          modelos: ['HLX 125','Apache RTR 180','Apache RR 310'] },
  { marca: 'Hero',         modelos: ['Eco Deluxe','Eco-125','Eco Express'] },
  { marca: 'Lifan',        modelos: ['Glean 100','K29'] },
  { marca: 'Yamaha',       modelos: ['Crux','Jog Artística','BWS','RX115','XTZ'] },
  { marca: 'Suzuki',       modelos: ['Address 125','AX100','GN 125','GD 115 (GD15)'] },
  { marca: 'Honda',        modelos: ['Super Cub','Navi','CRF 250','Africa Twin','CBR','XR'] },
  { marca: 'Super Soco',   modelos: ['TC MAX'] },
  { marca: 'KTM',          modelos: ['Duke 200','Duke 250','Duke 390','RC 390','Adventure 250','690 Enduro R'] },
  { marca: 'CFMoto',       modelos: ['NK 300','450 SR','675SR-R','800MT-X','MT (Gama General)','Z-Force 1000','Z-Force 950'] },
  { marca: 'Benelli',      modelos: ['BN 125','302R','Leoncino 500','TRK 502 X'] },
  { marca: 'Ronco',        modelos: ['GR200'] },
];

// ===== CATEGORÍAS CON SUBCATEGORÍAS =====
const CATEGORIAS_ADMIN = [
  {
    nombre: 'Motor y Sistema de Combustión',
    subs: ['Cilindros y Pistones', 'Bujías', 'Carburador o Sistema de Inyección', 'Tanque de combustible', 'Filtro de aire', 'Sistema de escape (Mofle)'],
  },
  {
    nombre: 'Transmisión',
    subs: ['Embrague (Clutch)', 'Caja de cambios', 'Transmisión secundaria'],
  },
  {
    nombre: 'Chasis y Estructura',
    subs: ['Cuadro / Chasis', 'Subchasis', 'Basculante (Tijera)', 'Pata de cabra y Caballete central'],
  },
  {
    nombre: 'Suspensión',
    subs: ['Horquilla delantera', 'Amortiguador trasero'],
  },
  {
    nombre: 'Ruedas y Frenos',
    subs: ['Gomas (Neumáticos)', 'Aros (Llantas)', 'Discos o Tambores de freno', 'Pinzas (Cálipers) y Pastillas'],
  },
  {
    nombre: 'Sistema Eléctrico y Luces',
    subs: ['Batería', 'Estator / Alternador', 'Faro principal (Luz delantera)', 'Direccionales (Intermitentes)', 'Luz trasera y de freno', 'Tablero de instrumentos'],
  },
  {
    nombre: 'Controles y Ergonomía',
    subs: ['Manubrio (Timón)', 'Acelerador', 'Manetas', 'Pedales', 'Asiento (Sillín)', 'Espejos retrovisores'],
  },
  {
    nombre: 'Protección Personal',
    subs: ['Cascos', 'Guantes', 'Chaquetas y Chalecos', 'Botas', 'Rodilleras y Coderas', 'Trajes completos'],
  },
  {
    nombre: 'Accesorios',
    subs: ['Bolsos y Maletas', 'Fundas y Cobertores', 'Soportes para Celular', 'Seguridad (Candados y Alarmas)', 'Decoración y Personalización'],
  },
  {
    nombre: 'Aceites y Lubricantes',
    subs: ['Aceite de Motor', 'Líquido de Frenos', 'Refrigerante (Coolant)', 'Lubricante de Cadena', 'Grasa y Selladores'],
  },
  {
    nombre: 'Otros',
    subs: ['Repuestos Varios', 'Sin Categoría'],
  },
];

// Poblar el select de categorías al cargar
(function poblarCategorias() {
  const selectCat = document.getElementById('campo-categoria');
  if (!selectCat) return;
  CATEGORIAS_ADMIN.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.nombre;
    opt.textContent = cat.nombre;
    selectCat.appendChild(opt);
  });
})();

// Cascade: al cambiar categoría, poblar subcategorías
document.getElementById('campo-categoria')?.addEventListener('change', function () {
  const grupSub   = document.getElementById('grupo-subcategoria');
  const selectSub = document.getElementById('campo-subcategoria');
  const cat       = CATEGORIAS_ADMIN.find(c => c.nombre === this.value);

  selectSub.innerHTML = '<option value="">— Seleccionar subcategoría —</option>';

  if (cat && cat.subs.length) {
    cat.subs.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      selectSub.appendChild(opt);
    });
    grupSub.classList.remove('oculto');
  } else {
    grupSub.classList.add('oculto');
  }
});

// ===== ESTADO =====
let productoAEliminar = null;
let modoEdicion = false;
let modelosSeleccionados = []; // array de modelos moto seleccionados

// Referencias al DOM
const tablaCuerpo       = document.getElementById('tabla-cuerpo');
const tablaWrapper      = document.getElementById('tabla-wrapper');
const estadoCarga       = document.getElementById('estado-carga');
const estadoVacio       = document.getElementById('estado-vacio');
const conteoProductos   = document.getElementById('conteo-productos');
const modalOverlay      = document.getElementById('modal-overlay');
const modalConfirmar    = document.getElementById('modal-confirmar');
const modalTitulo       = document.getElementById('modal-titulo');
const productoForm      = document.getElementById('producto-form');
const formError         = document.getElementById('form-error');
const formExito         = document.getElementById('form-exito');

// ===== CARGAR PRODUCTOS =====

/**
 * Obtiene todos los productos (incluye no disponibles) y los muestra en la tabla.
 */
async function cargarProductos() {
  mostrarEstado('carga');

  try {
    const cliente = await inicializarSupabase();
    const { data: productos, error } = await cliente
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    renderizarTabla(productos);

    const total = productos.length;
    conteoProductos.textContent = `${total} producto${total !== 1 ? 's' : ''} en total`;

  } catch (err) {
    console.error('Error al cargar productos:', err.message);
    mostrarEstado('vacio');
    conteoProductos.textContent = 'Error al cargar';
  }
}

/**
 * Renderiza los productos en la tabla.
 * @param {Array} productos
 */
function renderizarTabla(productos) {
  if (!productos || productos.length === 0) {
    mostrarEstado('vacio');
    return;
  }

  mostrarEstado('tabla');
  tablaCuerpo.innerHTML = '';

  productos.forEach(producto => {
    const fila = document.createElement('tr');

    // Imagen
    const imagenHtml = producto.imagen_url
      ? `<img class="tabla-imagen" src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy" />`
      : `<div class="tabla-imagen-placeholder">⚙️</div>`;

    // Precio
    const precioHtml = producto.precio !== null && producto.precio !== undefined
      ? `<span class="tabla-precio">${parseFloat(producto.precio).toFixed(2)} DOP</span>`
      : '<span style="color:#ccc">—</span>';

    // Toggle inline de disponibilidad
    const visibleHtml = `
      <label class="toggle toggle--sm" title="${producto.disponible ? 'Visible' : 'Oculto'}">
        <input type="checkbox" class="toggle-disponible" ${producto.disponible ? 'checked' : ''} />
        <span class="toggle__slider"></span>
      </label>`;

    fila.innerHTML = `
      <td>${imagenHtml}</td>
      <td><button class="tabla-nombre-btn" title="Ver detalle de ${producto.nombre}">${producto.nombre}</button></td>
      <td>${producto.categoria || '<span style="color:#ccc">—</span>'}</td>
      <td>${precioHtml}</td>
      <td>${visibleHtml}</td>
      <td>
        <div class="acciones-tabla">
          <button class="btn-accion btn-accion--editar" data-id="${producto.id}">Editar</button>
          <button class="btn-accion btn-accion--eliminar" data-id="${producto.id}" data-nombre="${producto.nombre}">Eliminar</button>
        </div>
      </td>
    `;

    // Eventos de los botones de acción
    fila.querySelector('.tabla-nombre-btn').addEventListener('click', () => abrirModalDetalle(producto));
    fila.querySelector('.btn-accion--editar').addEventListener('click', () => abrirModalEditar(producto));
    fila.querySelector('.btn-accion--eliminar').addEventListener('click', () => pedirConfirmacionEliminar(producto));
    fila.querySelector('.toggle-disponible').addEventListener('change', function () {
      toggleDisponible(producto.id, this.checked, this);
    });

    tablaCuerpo.appendChild(fila);
  });
}

/**
 * Alterna la visibilidad de los estados del dashboard.
 */
function mostrarEstado(estado) {
  estadoCarga.classList.add('oculto');
  estadoVacio.classList.add('oculto');
  tablaWrapper.classList.add('oculto');

  if (estado === 'carga') estadoCarga.classList.remove('oculto');
  if (estado === 'vacio') estadoVacio.classList.remove('oculto');
  if (estado === 'tabla') tablaWrapper.classList.remove('oculto');
}

// ===== MODAL: AGREGAR PRODUCTO =====

document.getElementById('btn-nuevo-producto')?.addEventListener('click', () => {
  abrirModalNuevo();
});

/**
 * Abre el modal en modo "nuevo producto".
 */
function abrirModalNuevo() {
  modoEdicion = false;
  modalTitulo.textContent = 'Agregar producto';
  limpiarFormulario();
  modalOverlay.classList.remove('oculto');
}

/**
 * Abre el modal en modo "editar producto" con los datos precargados.
 * @param {Object} producto
 */
function abrirModalEditar(producto) {
  modoEdicion = true;
  modalTitulo.textContent = 'Editar producto';
  limpiarFormulario();

  document.getElementById('campo-id').value          = producto.id;
  document.getElementById('campo-nombre').value       = producto.nombre;
  document.getElementById('campo-descripcion').value  = producto.descripcion || '';
  document.getElementById('campo-precio').value       = producto.precio || '';
  document.getElementById('campo-cantidad').value     = producto.cantidad || '';
  cargarModelosMoto(producto.modelo_moto || '');
  setSucursalesSeleccionadas(producto.sucursales || []);
  document.getElementById('campo-disponible').checked = producto.disponible;

  // Cargar categoría y disparar cascade para subcategorías
  const selectCat = document.getElementById('campo-categoria');
  selectCat.value = producto.categoria || '';
  selectCat.dispatchEvent(new Event('change'));

  // Seleccionar subcategoría guardada
  if (producto.subcategoria) {
    document.getElementById('campo-subcategoria').value = producto.subcategoria;
  }

  if (typeof cargarImagenesExistentes === 'function') {
    cargarImagenesExistentes(producto.imagenes || (producto.imagen_url ? [producto.imagen_url] : []));
  }

  modalOverlay.classList.remove('oculto');
}

/**
 * Cierra el modal de producto.
 */
function cerrarModal() {
  modalOverlay.classList.add('oculto');
  limpiarFormulario();
}

/**
 * Limpia todos los campos del formulario.
 */
function limpiarFormulario() {
  productoForm.reset();
  document.getElementById('campo-id').value = '';
  document.getElementById('campo-imagen-url').value = '';
  document.getElementById('campo-cantidad').value = '';
  reiniciarSelectorMoto();
  reiniciarSucursales();
  document.getElementById('campo-disponible').checked = true;
  document.getElementById('grupo-subcategoria').classList.add('oculto');
  document.getElementById('campo-subcategoria').innerHTML = '<option value="">— Seleccionar subcategoría —</option>';
  formError.classList.add('oculto');
  formExito.classList.add('oculto');
  if (typeof reiniciarUpload === 'function') reiniciarUpload();
}

// Botones de cierre del modal
document.getElementById('btn-cerrar-modal')?.addEventListener('click', cerrarModal);
document.getElementById('btn-cancelar')?.addEventListener('click', cerrarModal);

// ===== GUARDAR PRODUCTO =====

productoForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre       = document.getElementById('campo-nombre').value.trim();
  const descripcion  = document.getElementById('campo-descripcion').value.trim();
  const precio       = document.getElementById('campo-precio').value;
  const cantidad     = document.getElementById('campo-cantidad').value;
  const categoria    = document.getElementById('campo-categoria').value;
  const subcategoria = document.getElementById('campo-subcategoria').value;
  const disponible   = document.getElementById('campo-disponible').checked;
  const id           = document.getElementById('campo-id').value;
  const imagenes     = typeof obtenerImagenesUrls === 'function' ? obtenerImagenesUrls() : [];

  if (!nombre) {
    formError.textContent = 'El nombre del producto es requerido.';
    formError.classList.remove('oculto');
    return;
  }
  if (!imagenes.length) {
    formError.textContent = 'La imagen del producto es requerida.';
    formError.classList.remove('oculto');
    return;
  }
  if (!precio || parseFloat(precio) <= 0) {
    formError.textContent = 'El precio del producto es requerido.';
    formError.classList.remove('oculto');
    return;
  }
  if (!categoria) {
    formError.textContent = 'La categoría del producto es requerida.';
    formError.classList.remove('oculto');
    return;
  }

  formError.classList.add('oculto');
  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const cliente    = await inicializarSupabase();
    const modeloMoto = modelosSeleccionados.join(', ') || null;
    const sucursales = obtenerSucursalesSeleccionadas();
    const cuerpo = {
      nombre, descripcion, precio, cantidad, categoria, subcategoria,
      modelo_moto: modeloMoto,
      imagen_url: imagenes[0] || null,
      imagenes,
      disponible,
      sucursales: sucursales.length ? sucursales : null,
    };

    let error;
    if (modoEdicion) {
      ({ error } = await cliente.from('productos').update(cuerpo).eq('id', id));
    } else {
      ({ error } = await cliente.from('productos').insert(cuerpo));
    }

    if (error) throw new Error(error.message);

    formExito.textContent = modoEdicion ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.';
    formExito.classList.remove('oculto');

    // Recargar tabla y cerrar modal después de un momento
    await cargarProductos();
    setTimeout(cerrarModal, 1200);

  } catch (err) {
    console.error('Error al guardar producto:', err.message);
    formError.textContent = err.message;
    formError.classList.remove('oculto');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar producto';
  }
});

// ===== ELIMINAR PRODUCTO =====

/**
 * Muestra el modal de confirmación para eliminar un producto.
 * @param {Object} producto
 */
function pedirConfirmacionEliminar(producto) {
  productoAEliminar = producto;
  modalConfirmar.classList.remove('oculto');
}

document.getElementById('btn-cancelar-eliminar')?.addEventListener('click', () => {
  productoAEliminar = null;
  modalConfirmar.classList.add('oculto');
});

document.getElementById('btn-confirmar-eliminar')?.addEventListener('click', async () => {
  if (!productoAEliminar) return;

  const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
  btnConfirmar.disabled = true;
  btnConfirmar.textContent = 'Eliminando...';

  try {
    const cliente = await inicializarSupabase();
    const { error } = await cliente
      .from('productos')
      .delete()
      .eq('id', productoAEliminar.id);

    if (error) throw new Error(error.message);

    modalConfirmar.classList.add('oculto');
    productoAEliminar = null;
    await cargarProductos();

  } catch (err) {
    console.error('Error al eliminar producto:', err.message);
    alert(`Error: ${err.message}`);
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = 'Sí, eliminar';
  }
});

// ===== MODAL DE DETALLE DE PRODUCTO =====

/**
 * Abre el modal de detalle (vista del cliente) para un producto.
 * @param {Object} p - Objeto producto
 */
function abrirModalDetalle(p) {
  const imagenes = p.imagenes?.length ? p.imagenes : (p.imagen_url ? [p.imagen_url] : []);
  let imgActiva  = 0;

  const precioTexto = p.precio !== null && p.precio !== undefined
    ? `${parseFloat(p.precio).toFixed(2)} DOP` : '—';
  const cantidadHtml = p.cantidad !== null && p.cantidad !== undefined
    ? `<span class="modal-producto__cantidad"><span class="modal-producto__cantidad-q">Cantidad disponible</span> ${p.cantidad}</span>` : '';
  const modelosArr = p.modelo_moto ? p.modelo_moto.split(', ').filter(Boolean) : [];
  const modeloHtml = modelosArr.length
    ? `<div class="modal-producto__modelos-row">
         <span class="modal-producto__modelos-label">Compatible con</span>
         <div class="modal-producto__modelos-pills">
           ${modelosArr.map(m => `<span class="modal-producto__modelo">${m}</span>`).join('')}
         </div>
       </div>` : '';
  const sucursalesArr = Array.isArray(p.sucursales) ? p.sucursales : [];
  const sucursalesHtml = sucursalesArr.length
    ? `<div class="modal-producto__modelos-row">
         <span class="modal-producto__modelos-label">Disponible en</span>
         <div class="modal-producto__modelos-pills">
           ${sucursalesArr.map(s => `<span class="modal-producto__sucursal">${s}</span>`).join('')}
         </div>
       </div>` : '';
  const thumbsHtml = imagenes.length > 1
    ? `<div class="modal-producto__thumbnails">
        ${imagenes.map((img, i) => `
          <button class="modal-producto__thumb ${i === 0 ? 'modal-producto__thumb--activo' : ''}" data-idx="${i}">
            <img src="${img}" alt="Vista ${i + 1}" />
          </button>`).join('')}
       </div>` : '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-producto-overlay';
  overlay.innerHTML = `
    <div class="modal-producto">
      <button class="modal-producto__cerrar" id="mp-cerrar-admin">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="modal-producto__main">
        <div class="modal-producto__galeria">
          <div class="modal-producto__img-principal-wrapper">
            <img class="modal-producto__img-principal" id="mp-img-admin"
                 src="${imagenes[0] || ''}" alt="${p.nombre}" />
          </div>
          ${thumbsHtml}
        </div>
        <div class="modal-producto__info">
          <p class="modal-producto__categoria">${p.subcategoria || p.categoria || ''}</p>
          <h2 class="modal-producto__nombre">${p.nombre}</h2>
          <div class="modal-producto__precio-row">
            <span class="modal-producto__precio">${precioTexto}</span>
            ${cantidadHtml}
          </div>
          ${modeloHtml}
          ${sucursalesHtml}
          <div class="modal-producto__tabs">
            <button class="modal-producto__tab modal-producto__tab--activo" data-tab="descripcion">Descripción</button>
          </div>
          <div class="modal-producto__tab-contenido">
            <p class="modal-producto__descripcion">${p.descripcion || 'Sin descripción disponible.'}</p>
          </div>
          <a href="https://wa.me/18295195473?text=Hola%2C%20me%20interesa%20un%20repuesto.%20%C2%BFMe%20pueden%20ayudar%3F" target="_blank" rel="noopener noreferrer" class="modal-producto__btn-contacto">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.18 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            Consultar disponibilidad
          </a>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const imgEl = overlay.querySelector('#mp-img-admin');

  // Thumbnails
  overlay.querySelectorAll('.modal-producto__thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      imgActiva = parseInt(btn.dataset.idx);
      imgEl.src = imagenes[imgActiva];
      overlay.querySelectorAll('.modal-producto__thumb').forEach(b => b.classList.remove('modal-producto__thumb--activo'));
      btn.classList.add('modal-producto__thumb--activo');
    });
  });

  // Zoom
  imgEl.addEventListener('click', () => {
    const src = imgEl.src;
    if (!src) return;
    const zoom = document.createElement('div');
    zoom.className = 'modal-zoom';
    zoom.innerHTML = `<img class="modal-zoom__img" src="${src}" alt="${p.nombre}" />`;
    document.body.appendChild(zoom);
    requestAnimationFrame(() => zoom.classList.add('modal-zoom--visible'));
    const cerrarZoom = () => { zoom.classList.remove('modal-zoom--visible'); setTimeout(() => zoom.remove(), 250); };
    zoom.addEventListener('click', cerrarZoom);
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { cerrarZoom(); document.removeEventListener('keydown', esc); } });
  });

  // Cerrar
  const cerrar = () => {
    overlay.classList.add('modal-producto-overlay--salir');
    setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 300);
  };
  overlay.querySelector('#mp-cerrar-admin').addEventListener('click', cerrar);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', esc); } });
}

// ===== TOGGLE RÁPIDO DE DISPONIBILIDAD =====

/**
 * Cambia el campo disponible de un producto directamente desde la tabla.
 * @param {string} id - UUID del producto
 * @param {boolean} nuevoValor
 * @param {HTMLInputElement} inputEl - El checkbox del toggle
 */
async function toggleDisponible(id, nuevoValor, inputEl) {
  inputEl.disabled = true;
  try {
    const cliente = await inicializarSupabase();
    const { error } = await cliente
      .from('productos')
      .update({ disponible: nuevoValor })
      .eq('id', id);
    if (error) {
      inputEl.checked = !nuevoValor;
      console.error('Error al cambiar visibilidad:', error.message);
    }
  } catch (err) {
    inputEl.checked = !nuevoValor;
    console.error('Error al cambiar visibilidad:', err.message);
  } finally {
    inputEl.disabled = false;
  }
}

// ===== SELECTOR DE MODELO DE MOTOCICLETA (multi-select) =====

const ESPECIALES_MOTO = ['Todas las motocicletas', 'Mayoría de motocicletas'];

/**
 * Renderiza la lista del dropdown según el texto de búsqueda.
 * @param {string} filtro - Texto para filtrar
 */
function renderizarListaMoto(filtro = '') {
  const lista   = document.getElementById('moto-selector-lista');
  const termino = filtro.toLowerCase().trim();
  lista.innerHTML = '';

  // Opciones especiales al inicio
  const especialesVis = ESPECIALES_MOTO.filter(e => !termino || e.toLowerCase().includes(termino));
  if (especialesVis.length) {
    const encabezado = document.createElement('div');
    encabezado.className = 'moto-selector__grupo';
    encabezado.textContent = 'General';
    lista.appendChild(encabezado);

    especialesVis.forEach(e => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'moto-selector__item moto-selector__item--especial';
      item.dataset.valor = e;
      item.innerHTML = `<span class="moto-item-check">✓</span> ${e}`;
      item.addEventListener('click', () => toggleModeloMoto(e));
      lista.appendChild(item);
    });
  }

  // Marcas y modelos
  MODELOS_MOTO.forEach(({ marca, modelos }) => {
    const modelosFiltrados = termino
      ? modelos.filter(m => m.toLowerCase().includes(termino) || marca.toLowerCase().includes(termino))
      : modelos;

    if (!modelosFiltrados.length) return;

    const encabezado = document.createElement('div');
    encabezado.className = 'moto-selector__grupo';
    encabezado.textContent = marca;
    lista.appendChild(encabezado);

    modelosFiltrados.forEach(modelo => {
      const valor = `${marca} ${modelo}`;
      const item  = document.createElement('button');
      item.type   = 'button';
      item.className = 'moto-selector__item';
      item.dataset.valor = valor;
      item.innerHTML = `<span class="moto-item-check">✓</span> ${modelo}`;
      item.addEventListener('click', () => toggleModeloMoto(valor));
      lista.appendChild(item);
    });
  });

  if (!lista.children.length) {
    lista.innerHTML = '<p class="moto-selector__vacio">Sin resultados</p>';
  }

  marcarItemActivoMoto();
}

/**
 * Alterna la selección de un modelo (multi-select).
 * El panel permanece abierto para seleccionar varios.
 * @param {string} valor
 */
function toggleModeloMoto(valor) {
  const idx = modelosSeleccionados.indexOf(valor);
  if (idx >= 0) {
    modelosSeleccionados.splice(idx, 1);
  } else {
    modelosSeleccionados.push(valor);
  }
  actualizarTriggerMoto();
  document.getElementById('campo-modelo-moto').value = modelosSeleccionados.join(', ');
  marcarItemActivoMoto();
}

/**
 * Actualiza el texto del trigger según la cantidad de modelos seleccionados.
 */
function actualizarTriggerMoto() {
  const texto   = document.getElementById('moto-selector-texto');
  const trigger = document.getElementById('moto-selector-trigger');
  if (!modelosSeleccionados.length) {
    texto.textContent = '— Seleccionar modelos —';
    trigger.classList.remove('moto-selector__trigger--activo');
  } else if (modelosSeleccionados.length === 1) {
    texto.textContent = modelosSeleccionados[0];
    trigger.classList.add('moto-selector__trigger--activo');
  } else {
    texto.textContent = `${modelosSeleccionados.length} modelos seleccionados`;
    trigger.classList.add('moto-selector__trigger--activo');
  }
}

/**
 * Marca visualmente todos los items seleccionados en la lista.
 */
function marcarItemActivoMoto() {
  document.querySelectorAll('.moto-selector__item').forEach(btn => {
    const valor  = btn.dataset.valor || btn.textContent.trim();
    const activo = modelosSeleccionados.includes(valor);
    btn.classList.toggle('moto-selector__item--activo', activo);
  });
}

/**
 * Carga modelos desde una cadena guardada en DB (separa por coma).
 * @param {string} valor - Ej: "Honda CBR, Yamaha BWS"
 */
function cargarModelosMoto(valor) {
  modelosSeleccionados = valor ? valor.split(', ').filter(Boolean) : [];
  actualizarTriggerMoto();
  document.getElementById('campo-modelo-moto').value = modelosSeleccionados.join(', ');
}

/**
 * Limpia el selector de motocicleta.
 */
function reiniciarSelectorMoto() {
  modelosSeleccionados = [];
  document.getElementById('campo-modelo-moto').value = '';
  document.getElementById('moto-selector-texto').textContent = '— Seleccionar modelos —';
  document.getElementById('moto-selector-trigger').classList.remove('moto-selector__trigger--activo');
  document.getElementById('moto-selector-panel').classList.add('oculto');
  document.getElementById('moto-selector-busqueda').value = '';
}

// Inicializar eventos del selector
(function inicializarSelectorMoto() {
  const trigger  = document.getElementById('moto-selector-trigger');
  const panel    = document.getElementById('moto-selector-panel');
  const busqueda = document.getElementById('moto-selector-busqueda');

  if (!trigger) return;

  // Abrir / cerrar al hacer click en el trigger
  trigger.addEventListener('click', () => {
    const abierto = !panel.classList.contains('oculto');
    if (abierto) {
      panel.classList.add('oculto');
    } else {
      renderizarListaMoto('');
      busqueda.value = '';
      panel.classList.remove('oculto');
      busqueda.focus();
    }
  });

  // Filtrar al escribir
  busqueda.addEventListener('input', () => {
    renderizarListaMoto(busqueda.value);
  });

  // Cerrar al hacer click fuera del selector
  document.addEventListener('click', (e) => {
    if (!document.getElementById('moto-selector').contains(e.target)) {
      panel.classList.add('oculto');
    }
  });
})();

// ===== SUCURSALES DISPONIBLES =====

/**
 * Retorna un array con las sucursales marcadas.
 */
function obtenerSucursalesSeleccionadas() {
  return Array.from(
    document.querySelectorAll('#sucursal-checks input:checked')
  ).map(cb => cb.value);
}

/**
 * Marca las sucursales que vienen del producto guardado.
 * @param {string[]} valores
 */
function setSucursalesSeleccionadas(valores) {
  document.querySelectorAll('#sucursal-checks input').forEach(cb => {
    cb.checked = Array.isArray(valores) && valores.includes(cb.value);
  });
}

/**
 * Desmarca todas las sucursales.
 */
function reiniciarSucursales() {
  document.querySelectorAll('#sucursal-checks input').forEach(cb => {
    cb.checked = false;
  });
}

// ===== INICIALIZACIÓN =====
cargarProductos();
