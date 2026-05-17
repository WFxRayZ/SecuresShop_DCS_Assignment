const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../db/db');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    await pool.request()
      .input('name', name)
      .input('email', email)
      .input('password', hash)
      .query('INSERT INTO users (name, email, password, role) VALUES (@name,@email,@password, "Customer")');
    res.status(201).json({ message: 'registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('email', email).query('SELECT id, name, email, password, role FROM users WHERE email = @email');
    const user = result.recordset[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'changeme', { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
