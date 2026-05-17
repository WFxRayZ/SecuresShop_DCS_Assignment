const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db/db');
const auth = require('../middleware/auth');

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', req.user.id).query('SELECT id, name, email, role FROM users WHERE id = @id');
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
