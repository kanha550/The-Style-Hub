import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, initDb } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-please-set-in-production';

// CORS — restrict to your Cloud Run URL via CORS_ORIGIN env var
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Initialize DB on startup
let pool;
initDb()
  .then(() => {
    pool = getPool();
    console.log('Database initialized successfully.');
  })
  .catch(err => {
    console.error('FATAL: Failed to initialize database:', err.message);
    process.exit(1);
  });

// ── Auth Middleware ──────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// ── Static Files ─────────────────────────────────────────────────────────────
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'The Style Hub Backend is running!' });
});

// ── Products API ─────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, price, description, image, category, isnew as "isNew" FROM products'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, price, description, image, category, isnew as "isNew" FROM products WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Auth API ─────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );

    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: { email, name }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Cart API (JWT Protected) ──────────────────────────────────────────────────
app.get('/api/cart/:email', authenticateToken, async (req, res) => {
  // Ensure users can only access their own cart
  if (req.user.email !== req.params.email) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT c.id as "cartItemId", c.size, c.quantity,
             p.id, p.name, p.price, p.description, p.image, p.category, p.isnew as "isNew"
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_email = $1
    `, [req.params.email]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart/:email', authenticateToken, async (req, res) => {
  if (req.user.email !== req.params.email) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const email = req.params.email;
  const { cartItems } = req.body;

  // Use a dedicated client for transaction safety
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM cart WHERE user_email = $1', [email]);

    if (cartItems && cartItems.length > 0) {
      for (const item of cartItems) {
        await client.query(
          'INSERT INTO cart (user_email, product_id, size, quantity) VALUES ($1, $2, $3, $4)',
          [email, item.id, item.size, item.quantity]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ── SPA Catch-All ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
