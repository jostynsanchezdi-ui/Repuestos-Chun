const express = require('express');
const supabase = require('../services/supabase');
const { verificarAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — Listar productos disponibles (público, sin autenticación)
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;

    let query = supabase
      .from('productos')
      .select('*')
      .eq('disponible', true)
      .order('created_at', { ascending: false });

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error al obtener productos:', err.message);
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

// GET /api/products/admin — Listar todos los productos (admin, incluye no disponibles)
router.get('/admin', verificarAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error al obtener productos (admin):', err.message);
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

// POST /api/products — Crear un nuevo producto (solo admin)
router.post('/', verificarAuth, async (req, res) => {
  try {
    const { nombre, descripcion, precio, cantidad, categoria, subcategoria, modelo_moto, imagen_url, imagenes, disponible, sucursales } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del producto es requerido.' });
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        precio: precio ? parseFloat(precio) : null,
        cantidad: cantidad ? parseInt(cantidad) : null,
        categoria: categoria || null,
        subcategoria: subcategoria || null,
        modelo_moto: modelo_moto || null,
        imagen_url: imagen_url || null,
        imagenes: Array.isArray(imagenes) && imagenes.length ? imagenes : null,
        disponible: disponible !== undefined ? disponible : true,
        sucursales: Array.isArray(sucursales) && sucursales.length ? sucursales : null,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error al crear producto:', err.message);
    res.status(500).json({ error: 'Error al crear el producto.' });
  }
});

// PUT /api/products/:id — Actualizar un producto (solo admin)
router.put('/:id', verificarAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, cantidad, categoria, subcategoria, modelo_moto, imagen_url, imagenes, disponible, sucursales } = req.body;

    const camposActualizar = {
      updated_at: new Date().toISOString(),
    };

    if (nombre !== undefined)       camposActualizar.nombre       = nombre.trim();
    if (descripcion !== undefined)  camposActualizar.descripcion  = descripcion?.trim() || null;
    if (precio !== undefined)       camposActualizar.precio       = precio ? parseFloat(precio) : null;
    if (cantidad !== undefined)     camposActualizar.cantidad     = cantidad ? parseInt(cantidad) : null;
    if (categoria !== undefined)    camposActualizar.categoria    = categoria;
    if (subcategoria !== undefined) camposActualizar.subcategoria = subcategoria || null;
    if (modelo_moto !== undefined)  camposActualizar.modelo_moto  = modelo_moto || null;
    if (imagen_url !== undefined)   camposActualizar.imagen_url   = imagen_url;
    if (imagenes !== undefined)     camposActualizar.imagenes     = Array.isArray(imagenes) && imagenes.length ? imagenes : null;
    if (disponible !== undefined)   camposActualizar.disponible   = disponible;
    if (sucursales !== undefined)   camposActualizar.sucursales   = Array.isArray(sucursales) && sucursales.length ? sucursales : null;

    const { data, error } = await supabase
      .from('productos')
      .update(camposActualizar)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Producto no encontrado.' });

    res.json(data);
  } catch (err) {
    console.error('Error al actualizar producto:', err.message);
    res.status(500).json({ error: 'Error al actualizar el producto.' });
  }
});

// DELETE /api/products/:id — Eliminar un producto (solo admin)
router.delete('/:id', verificarAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ mensaje: 'Producto eliminado correctamente.' });
  } catch (err) {
    console.error('Error al eliminar producto:', err.message);
    res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
});

module.exports = router;
