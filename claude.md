# CLAUDE.md — Catálogo de Repuestos para Motocicletas

## ⚠️ LEE ESTO ANTES DE HACER CUALQUIER CAMBIO

Este archivo es la fuente de verdad del proyecto. Consúltalo antes de escribir,
modificar o eliminar cualquier archivo. Si algo no está claro aquí, pregunta antes
de asumir.

---

## 📌 Descripción del proyecto

Sitio web de catálogo para una **tienda de repuestos para motocicletas**. El objetivo
es que el dueño del negocio pueda entrar a un panel de administración y gestionar
sus productos (subir fotos, precios, descripciones) sin necesidad de tocar el código.
El sitio es solo catálogo — no tiene carrito de compras ni pagos en línea.

---

## 🎯 Funcionalidades principales

1. **Página pública** — muestra los productos en un catálogo visual, colorido y llamativo.
2. **Panel de administración** (`/admin`) — acceso exclusivo para el dueño del negocio.
3. **Gestión de productos** — el dueño puede crear, editar y eliminar productos desde el panel.
4. **Procesamiento automático de imágenes** — al subir una foto, el sistema:
   - Borra el fondo automáticamente (Remove.bg API)
   - Redimensiona a 800x800px
   - Aplica fondo blanco
   - Convierte a formato WebP
   - Guarda la imagen procesada en Supabase Storage
5. **Autenticación** — solo el dueño puede acceder al panel (Supabase Auth).

---

## 🗂️ Estructura del proyecto

```
/
├── public/                  # Sitio público (lo que ven los visitantes)
│   ├── index.html           # Página principal con catálogo de productos
│   ├── css/
│   │   └── styles.css       # Estilos globales
│   └── js/
│       └── catalog.js       # Lógica para cargar productos desde Supabase
│
├── admin/                   # Panel de administración (solo el dueño)
│   ├── index.html           # Login del administrador
│   ├── dashboard.html       # Panel principal con lista de productos
│   ├── css/
│   │   └── admin.css        # Estilos del panel
│   └── js/
│       ├── auth.js          # Lógica de login/logout con Supabase Auth
│       ├── products.js      # CRUD de productos
│       └── upload.js        # Subida y procesamiento de imágenes
│
├── server/                  # Backend Node.js
│   ├── index.js             # Punto de entrada del servidor Express
│   ├── routes/
│   │   ├── products.js      # Rutas de la API para productos
│   │   └── images.js        # Ruta para procesamiento de imágenes
│   └── services/
│       ├── removebg.js      # Integración con Remove.bg API
│       ├── sharp.js         # Procesamiento de imágenes con Sharp
│       └── supabase.js      # Cliente de Supabase para el backend
│
├── .env                     # Variables de entorno (NUNCA subir a Git)
├── .env.example             # Ejemplo de variables sin valores reales
├── .gitignore
├── package.json
└── CLAUDE.md                # Este archivo
```

---

## 🛠️ Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript vanilla | — |
| Backend | Node.js + Express | LTS |
| Base de datos | Supabase (PostgreSQL) | — |
| Autenticación | Supabase Auth | — |
| Almacenamiento | Supabase Storage | — |
| Procesamiento de imágenes | Sharp | latest |
| Remoción de fondo | Remove.bg API | v1.0 |
| Hosting | Render o Railway | — |

---

## 🗃️ Esquema de base de datos (Supabase)

### Tabla: `productos`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | Identificador único, generado automáticamente |
| `nombre` | text (NOT NULL) | Nombre del repuesto |
| `descripcion` | text | Descripción detallada del producto |
| `precio` | numeric(10,2) | Precio en moneda local |
| `categoria` | text | Categoría del repuesto (ej: Motor, Frenos, Suspensión) |
| `imagen_url` | text | URL de la imagen procesada en Supabase Storage |
| `disponible` | boolean | Si el producto está visible en el catálogo público |
| `created_at` | timestamp | Fecha de creación (automático) |
| `updated_at` | timestamp | Fecha de última modificación (automático) |

### Bucket de Storage: `product-images`
- Acceso público: **sí** (para que se vean en el catálogo)
- Carpeta: `processed/` — imágenes ya procesadas (fondo removido, 800x800, WebP)
- Carpeta: `originals/` — imágenes originales sin procesar (respaldo)

---

## 🔑 Variables de entorno

Siempre usar variables de entorno para credenciales. Nunca escribir claves
directamente en el código. El archivo `.env` tiene esta estructura:

```env
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxx

# Remove.bg
REMOVEBG_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Servidor
PORT=3000
NODE_ENV=development
```

---

## 🖼️ Flujo de procesamiento de imágenes

Cuando el administrador sube una foto desde el panel:

```
1. Cliente (browser) → selecciona imagen
2. Frontend → envía imagen al backend (POST /api/images/process)
3. Backend (Sharp) → redimensiona a 800x800px y centra el objeto
4. Backend → envía imagen a Remove.bg API
5. Remove.bg → devuelve imagen sin fondo (PNG transparente)
6. Backend (Sharp) → aplica fondo blanco + convierte a WebP
7. Backend → sube imagen procesada a Supabase Storage (bucket: product-images/processed/)
8. Backend → devuelve la URL pública de la imagen al frontend
9. Frontend → guarda el producto en la tabla `productos` con esa URL
```

---

## 🎨 Guía de diseño

### Estilo general
- **Tono:** Colorido, llamativo, enérgico — transmite velocidad y potencia
- **Audiencia:** Mecánicos y aficionados a las motocicletas

### Paleta de colores
| Uso | Color | Hex |
|---|---|---|
| Primario (acento principal) | Naranja vibrante | `#FF6B00` |
| Secundario | Negro profundo | `#0D0D0D` |
| Fondo claro | Gris muy claro | `#F5F5F5` |
| Texto principal | Casi negro | `#1A1A1A` |
| Texto secundario | Gris medio | `#666666` |
| Éxito | Verde | `#22C55E` |
| Error | Rojo | `#EF4444` |

### Tipografía
- **Títulos:** `Bebas Neue` o `Oswald` (Google Fonts) — impacto y fuerza
- **Cuerpo:** `Inter` o `Roboto` — legibilidad en pantalla

### Componentes del catálogo público
- Grid de productos: 3 columnas en desktop, 2 en tablet, 1 en móvil
- Tarjeta de producto: imagen cuadrada (800x800), nombre, categoría, precio
- Filtro por categoría visible en la parte superior
- Fondo oscuro en el header con logo y nombre de la tienda

---

## 🔐 Reglas de seguridad

- El panel `/admin` redirige al login si el usuario no está autenticado
- Solo existe **un usuario administrador** — el dueño de la tienda
- El `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el backend, nunca en el frontend
- El frontend solo usa `SUPABASE_ANON_KEY` con Row Level Security (RLS) activado
- Las rutas de la API validan que el request venga de un usuario autenticado antes de procesar imágenes o modificar productos

### Políticas RLS en Supabase
- `productos` — lectura pública (SELECT sin autenticación), escritura solo autenticado
- `product-images` bucket — lectura pública, escritura solo autenticado

---

## 📋 Categorías de productos

El catálogo maneja estas categorías predefinidas:

- Motor
- Frenos
- Suspensión
- Transmisión
- Eléctrico
- Carrocería
- Llantas y Aros
- Accesorios
- Aceites y Lubricantes

---

## ✅ Reglas para Claude Code

1. **Consulta este archivo antes de cualquier cambio** — si hay contradicción entre este archivo y una instrucción nueva, pregunta antes de proceder.
2. **No cambies el stack** — si crees que hay una mejor tecnología, propónla pero no la implementes sin confirmación.
3. **No subas credenciales al código** — siempre usar `process.env.NOMBRE_VARIABLE`.
4. **Mantén la estructura de carpetas** definida arriba — no crees carpetas nuevas sin justificación.
5. **Cada función debe tener un solo propósito** — código limpio y legible.
6. **Comenta el código en español** — el desarrollador principal trabaja en español.
7. **Prueba los casos de error** — especialmente en la subida de imágenes (archivo muy grande, formato incorrecto, falla de Remove.bg).
8. **El sitio debe ser responsive** — funcionar bien en móvil, tablet y desktop.
9. **No instales dependencias nuevas** sin listarlas aquí primero.

---

## 📦 Dependencias del proyecto

### Backend (`package.json`)
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "multer": "^1.4.5",
    "sharp": "^0.33.0",
    "axios": "^1.6.0",
    "@supabase/supabase-js": "^2.0.0",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5"
  }
}
```

### Frontend
- Supabase JS SDK (CDN)
- Google Fonts: Bebas Neue + Inter

---

## 🚀 Comandos útiles

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Correr en producción
npm start
```

---

*Última actualización: inicio del proyecto*
*Desarrollado con Claude Code*