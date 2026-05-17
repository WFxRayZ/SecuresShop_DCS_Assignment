const express = require('express');
const router = express.Router();
const { getPool } = require('../db/db');
const auth = require('../middleware/auth');
const requireRole = auth.requireRole;

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().input('id', req.user.id).query('SELECT TOP 1 id, name, email, role, created_at FROM users WHERE id = @id');
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Admin: list users
router.get('/', auth, requireRole('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
