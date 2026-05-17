const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db/db');
const auth = require('../middleware/auth');
const requireRole = auth.requireRole;

// Create order
router.post('/', auth, async (req, res) => {
  const { items = [] } = req.body; // [{productId, quantity}]
  const userId = req.user.id;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items required' });
  }

  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

    try {
      const orderRequest = new sql.Request(transaction);
      const orderInsert = await orderRequest
        .input('userId', userId)
        .query("INSERT INTO orders (user_id) OUTPUT INSERTED.id, INSERTED.user_id, INSERTED.created_at VALUES (@userId)");

      const order = orderInsert.recordset[0];

      for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity || item.qty || 1);

        if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
          throw new Error('invalid order item');
        }

        const productLookup = new sql.Request(transaction);
        const productResult = await productLookup
          .input('productId', productId)
          .query('SELECT TOP 1 id, price, stock FROM products WHERE id = @productId');

        const product = productResult.recordset[0];
        if (!product) {
          throw new Error(`product ${productId} not found`);
        }

        if (product.stock < quantity) {
          throw new Error(`insufficient stock for product ${productId}`);
        }

        const itemRequest = new sql.Request(transaction);
        await itemRequest
          .input('orderId', order.id)
          .input('productId', productId)
          .input('quantity', quantity)
          .query('INSERT INTO order_items (order_id, product_id, quantity) VALUES (@orderId, @productId, @quantity)');

        const stockRequest = new sql.Request(transaction);
        await stockRequest
          .input('productId', productId)
          .input('quantity', quantity)
          .query('UPDATE products SET stock = stock - @quantity WHERE id = @productId');
      }

      await transaction.commit();
      res.status(201).json({ orderId: order.id });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'server error' });
  }
});

// Orders for current user
router.get('/me', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', req.user.id)
      .query(`
        SELECT o.id, o.user_id, o.created_at,
               oi.id AS order_item_id, oi.product_id, oi.quantity,
               p.name AS product_name, p.price
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.user_id = @userId
        ORDER BY o.created_at DESC, oi.id ASC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Admin: all orders
router.get('/', auth, requireRole('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT o.id, o.user_id, u.name AS customer_name, u.email, o.created_at,
             oi.id AS order_item_id, oi.product_id, oi.quantity,
             p.name AS product_name, p.price
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      ORDER BY o.created_at DESC, oi.id ASC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Admin: order details
router.get('/:id', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('orderId', req.params.id)
      .query(`
        SELECT o.id, o.user_id, o.created_at,
               oi.id AS order_item_id, oi.product_id, oi.quantity,
               p.name AS product_name, p.price
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.id = @orderId
        ORDER BY oi.id ASC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'order not found' });
    }

    const isOwner = result.recordset[0].user_id === req.user.id;
    if (!isOwner && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'forbidden' });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
