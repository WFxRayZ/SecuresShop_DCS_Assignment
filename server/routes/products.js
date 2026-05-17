const express = require('express');
const router = express.Router();
const { getPool } = require('../db/db');
const auth = require('../middleware/auth');
const requireRole = auth.requireRole;

// List products
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT id, name, description, price, stock FROM products ORDER BY id DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', req.params.id)
      .query('SELECT TOP 1 id, name, description, price, stock FROM products WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'product not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Create product
router.post('/', auth, requireRole('Admin'), async (req, res) => {
  const { name, description = '', price, stock = 0 } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price required' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('name', name)
      .input('description', description)
      .input('price', price)
      .input('stock', stock)
      .query("INSERT INTO products (name, description, price, stock) OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.price, INSERTED.stock VALUES (@name, @description, @price, @stock)");

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Update product
router.put('/:id', auth, requireRole('Admin'), async (req, res) => {
  const { name, description, price, stock } = req.body;
  const normalizedDescription = description === undefined ? null : description;
  const normalizedPrice = price === undefined ? null : price;
  const normalizedStock = stock === undefined ? null : stock;

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', req.params.id)
      .input('name', name)
      .input('description', normalizedDescription)
      .input('price', normalizedPrice)
      .input('stock', normalizedStock)
      .query(`
        UPDATE products
        SET
          name = COALESCE(@name, name),
          description = COALESCE(@description, description),
          price = COALESCE(@price, price),
          stock = COALESCE(@stock, stock)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.price, INSERTED.stock
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'product not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Delete product
router.delete('/:id', auth, requireRole('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', req.params.id)
      .query('DELETE FROM products OUTPUT DELETED.id WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'product not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
