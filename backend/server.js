import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB on startup
let db;
getDb().then(database => {
  db = database;
  console.log("Database initialized");
}).catch(err => {
  console.error("Failed to initialize database", err);
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Aura Backend is running!' });
});

// --- Products API ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Auth API ---
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', name, email, hashedPassword);
    
    res.status(201).json({ user: { email, name } });
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
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user: { email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Cart API ---
// Fetch cart for a user email
app.get('/api/cart/:email', async (req, res) => {
  try {
    const items = await db.all(`
      SELECT c.id as cartItemId, c.size, c.quantity, p.* 
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_email = ?
    `, req.params.email);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync entire cart for a user email (overwrite)
app.post('/api/cart/:email', async (req, res) => {
  const email = req.params.email;
  const { cartItems } = req.body; // Array of items with { id (product id), size, quantity }

  try {
    await db.run('BEGIN TRANSACTION');
    // Clear old cart for user
    await db.run('DELETE FROM cart WHERE user_email = ?', email);
    
    // Insert new items
    if (cartItems && cartItems.length > 0) {
      const stmt = await db.prepare('INSERT INTO cart (user_email, product_id, size, quantity) VALUES (?, ?, ?, ?)');
      for (const item of cartItems) {
        await stmt.run(email, item.id, item.size, item.quantity);
      }
      await stmt.finalize();
    }
    await db.run('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
