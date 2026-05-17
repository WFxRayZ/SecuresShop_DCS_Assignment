const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db/db');

// List products
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, name, description, price, stock FROM products');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
