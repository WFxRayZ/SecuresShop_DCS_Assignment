const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db/db');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const pool = await getPool();
    const existing = await pool.request()
      .input('email', normalizedEmail)
      .query('SELECT TOP 1 id FROM users WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: 'email already exists' });
    }

    const result = await pool.request()
      .input('name', name)
      .input('email', normalizedEmail)
      .input('password', hash)
      .query("INSERT INTO users (name, email, password, role) OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role VALUES (@name, @email, @password, 'Customer')");

    res.status(201).json({ user: result.recordset[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', normalizedEmail)
      .query('SELECT TOP 1 id, name, email, password, role FROM users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'changeme', { expiresIn: '8h' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
