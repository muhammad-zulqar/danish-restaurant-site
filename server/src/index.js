const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');

dotenv.config();
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
}));
app.use(express.json());
app.use('/api', apiLimiter);

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const token = header.split(' ')[1];
    req.admin = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/menu', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, category, price, image_url, is_featured, is_active
       FROM menu_items
       WHERE is_active = TRUE
       ORDER BY category, id`,
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
});

app.post(
  '/api/reservations',
  [
    body('name').trim().isLength({ min: 2 }),
    body('email').isEmail(),
    body('phone').trim().isLength({ min: 6 }),
    body('reservationDate').isISO8601(),
    body('reservationTime').matches(/^\d{2}:\d{2}$/),
    body('guests').isInt({ min: 1, max: 20 }),
    body('notes').optional().isLength({ max: 500 }),
  ],
  handleValidation,
  async (req, res) => {
    const { name, email, phone, reservationDate, reservationTime, guests, notes } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO reservations (name, email, phone, reservation_date, reservation_time, guests, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, phone, reservation_date, reservation_time, guests, notes, status, created_at`,
        [name, email, phone, reservationDate, reservationTime, guests, notes || null],
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create reservation' });
    }
  },
);

app.post(
  '/api/orders',
  [
    body('customerName').trim().isLength({ min: 2 }),
    body('customerEmail').optional({ values: 'falsy' }).isEmail(),
    body('customerPhone').trim().isLength({ min: 6 }),
    body('orderType').isIn(['pickup', 'delivery']),
    body('notes').optional().isLength({ max: 500 }),
    body('items').isArray({ min: 1 }),
    body('items.*.menuItemId').isInt({ min: 1 }),
    body('items.*.quantity').isInt({ min: 1, max: 20 }),
  ],
  handleValidation,
  async (req, res) => {
    const { customerName, customerEmail, customerPhone, orderType, notes, items } = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const ids = items.map((item) => item.menuItemId);
      const menuResult = await client.query(
        `SELECT id, name, price FROM menu_items WHERE id = ANY($1::int[]) AND is_active = TRUE`,
        [ids],
      );

      if (menuResult.rows.length !== ids.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'One or more menu items are unavailable' });
      }

      const priceMap = new Map(menuResult.rows.map((item) => [item.id, Number(item.price)]));
      const total = items.reduce((sum, item) => sum + priceMap.get(item.menuItemId) * item.quantity, 0);

      const orderResult = await client.query(
        `INSERT INTO orders (customer_name, customer_email, customer_phone, order_type, total, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, customer_name, customer_email, customer_phone, order_type, total, notes, status, created_at`,
        [customerName, customerEmail || null, customerPhone, orderType, total, notes || null],
      );

      const order = orderResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.menuItemId, item.quantity, priceMap.get(item.menuItemId)],
        );
      }

      await client.query('COMMIT');
      return res.status(201).json({ ...order, items });
    } catch (error) {
      await client.query('ROLLBACK');
      return res.status(500).json({ message: 'Failed to submit order' });
    } finally {
      client.release();
    }
  },
);

app.post(
  '/api/admin/login',
  authLimiter,
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  handleValidation,
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const { rows } = await pool.query('SELECT id, email, password_hash FROM admins WHERE email = $1', [email]);
      const admin = rows[0];
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, admin.password_hash);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '8h' });
      return res.json({ token, admin: { id: admin.id, email: admin.email } });
    } catch (error) {
      return res.status(500).json({ message: 'Login failed' });
    }
  },
);

app.get('/api/admin/stats', auth, async (_req, res) => {
  try {
    const [{ rows: reservationCount }, { rows: orderCount }, { rows: menuCount }, { rows: recentReservations }, { rows: recentOrders }] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM reservations'),
      pool.query('SELECT COUNT(*)::int AS count FROM orders'),
      pool.query('SELECT COUNT(*)::int AS count FROM menu_items'),
      pool.query(`SELECT id, name, reservation_date, reservation_time, status, created_at FROM reservations ORDER BY created_at DESC LIMIT 5`),
      pool.query(`SELECT id, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`),
    ]);

    res.json({
      totals: {
        reservations: reservationCount[0].count,
        orders: orderCount[0].count,
        menuItems: menuCount[0].count,
      },
      recentReservations,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
});

app.get('/api/admin/menu', auth, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM menu_items ORDER BY category, id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
});

app.post(
  '/api/admin/menu',
  auth,
  [
    body('name').trim().isLength({ min: 2 }),
    body('description').optional().isLength({ max: 800 }),
    body('category').trim().isLength({ min: 2 }),
    body('price').isFloat({ min: 0 }),
    body('imageUrl').optional().isURL(),
    body('isFeatured').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    const { name, description, category, price, imageUrl, isFeatured, isActive } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO menu_items (name, description, category, price, image_url, is_featured, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [name, description || null, category, price, imageUrl || null, Boolean(isFeatured), isActive ?? true],
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create menu item' });
    }
  },
);

app.put(
  '/api/admin/menu/:id',
  auth,
  [
    param('id').isInt({ min: 1 }),
    body('name').trim().isLength({ min: 2 }),
    body('description').optional().isLength({ max: 800 }),
    body('category').trim().isLength({ min: 2 }),
    body('price').isFloat({ min: 0 }),
    body('imageUrl').optional({ values: 'falsy' }).isURL(),
    body('isFeatured').isBoolean(),
    body('isActive').isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    const { id } = req.params;
    const { name, description, category, price, imageUrl, isFeatured, isActive } = req.body;
    try {
      const { rows } = await pool.query(
        `UPDATE menu_items
         SET name = $1,
             description = $2,
             category = $3,
             price = $4,
             image_url = $5,
             is_featured = $6,
             is_active = $7,
             updated_at = NOW()
         WHERE id = $8
         RETURNING *`,
        [name, description || null, category, price, imageUrl || null, isFeatured, isActive, id],
      );

      if (!rows[0]) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      return res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update menu item' });
    }
  },
);

app.delete('/api/admin/menu/:id', auth, [param('id').isInt({ min: 1 })], handleValidation, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete menu item' });
  }
});

app.get('/api/admin/reservations', auth, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reservations ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reservations' });
  }
});

app.patch(
  '/api/admin/reservations/:id/status',
  auth,
  [param('id').isInt({ min: 1 }), body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled'])],
  handleValidation,
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        'UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [req.body.status, req.params.id],
      );
      if (!rows[0]) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      return res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update reservation status' });
    }
  },
);

app.get('/api/admin/orders', auth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, COALESCE(
          json_agg(
            json_build_object(
              'menuItemId', oi.menu_item_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'name', mi.name
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

app.patch(
  '/api/admin/orders/:id/status',
  auth,
  [param('id').isInt({ min: 1 }), body('status').isIn(['received', 'preparing', 'ready', 'completed', 'cancelled'])],
  handleValidation,
  async (req, res) => {
    try {
      const { rows } = await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [
        req.body.status,
        req.params.id,
      ]);
      if (!rows[0]) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update order status' });
    }
  },
);

app.use((error, _req, res, next) => {
  if (error?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ message: error.message });
  }
  return next(error);
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
