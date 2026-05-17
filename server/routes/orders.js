const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db/db');
const auth = require('../middleware/auth');

// Place order (simple example)
router.post('/', auth, async (req, res) => {
  const { items } = req.body; // [{productId, qty}]
  const userId = req.user.id;
  // NOTE: implement transactional logic in production
  try {
    const pool = await poolPromise;
    const insertOrder = await pool.request().input('userId', userId).query('INSERT INTO orders (user_id, created_at) OUTPUT INSERTED.id VALUES (@userId, GETDATE())');
    const orderId = insertOrder.recordset[0].id;
    for (const it of items || []) {
      await pool.request()
        .input('orderId', orderId)
        .input('productId', it.productId)
        .input('qty', it.qty)
        .query('INSERT INTO order_items (order_id, product_id, quantity) VALUES (@orderId, @productId, @qty)');
    }
    res.status(201).json({ orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
