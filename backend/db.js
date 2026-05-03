import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let dbInstance = null;

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await initDb(dbInstance);
  return dbInstance;
}

async function initDb(db) {
  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Create products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT,
      category TEXT,
      isNew BOOLEAN
    )
  `);

  // Create cart table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      UNIQUE(user_email, product_id, size)
    )
  `);

  // Seed products if empty
  const productCount = await db.get(`SELECT COUNT(*) as count FROM products`);
  if (productCount.count === 0) {
    const products = [
      {
        name: "Midnight Silk Slip Dress",
        price: 189.00,
        description: "An elegant midnight blue slip dress made from 100% pure silk. Perfect for evening events and formal gatherings. Features a delicate cowl neckline and adjustable straps.",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Evening",
        isNew: true
      },
      {
        name: "Blush Chiffon Maxi",
        price: 245.00,
        description: "Flowy blush chiffon maxi dress with a fitted bodice and pleated skirt. Romantic and ethereal, ideal for weddings and summer galas.",
        image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Wedding Guest",
        isNew: false
      },
      {
        name: "Emerald Velvet Wrap",
        price: 165.00,
        description: "Luxurious emerald green velvet wrap dress. Flattering V-neck and a tie waist to accentuate your silhouette.",
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Cocktail",
        isNew: false
      },
      {
        name: "Ivory Lace Midi",
        price: 140.00,
        description: "Classic ivory lace midi dress with scalloped edges and a subtle open back. A timeless piece for daytime elegance.",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Daytime",
        isNew: true
      },
      {
        name: "Crimson Satin Gown",
        price: 320.00,
        description: "Show-stopping crimson red satin gown with a high slit and structured shoulders. Command attention at your next black-tie event.",
        image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Formal",
        isNew: false
      },
      {
        name: "Floral Organza Mini",
        price: 115.00,
        description: "Playful floral printed organza mini dress with puff sleeves and a smocked back for comfort. Ready for spring parties.",
        image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Party",
        isNew: true
      },
      {
        name: "Sapphire Mermaid Gown",
        price: 450.00,
        description: "Breathtaking sapphire blue mermaid gown embellished with delicate sequins. Features an off-the-shoulder neckline.",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Formal",
        isNew: true
      },
      {
        name: "Terracotta Linen Sundress",
        price: 95.00,
        description: "Breezy terracotta linen sundress. Perfect for warm summer days, featuring a square neck and tiered skirt.",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Daytime",
        isNew: false
      },
      {
        name: "Amethyst Evening Shift",
        price: 180.00,
        description: "Elegant amethyst purple shift dress with subtle crystal detailing along the collar.",
        image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Evening",
        isNew: false
      },
      {
        name: "Cerulean Dream Gown",
        price: 210.00,
        description: "A flowing cerulean blue gown with a pleated skirt and delicate straps. Perfect for summer formals.",
        image: "https://images.unsplash.com/photo-1518917232260-0e613b47e0ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Evening",
        isNew: true
      },
      {
        name: "Pearl Embellished Mini",
        price: 155.00,
        description: "Elegant white mini dress adorned with delicate faux pearls. A chic choice for rehearsal dinners.",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Dresses",
        isNew: true
      },
      {
        name: "Vintage Floral Tea Dress",
        price: 120.00,
        description: "Charming vintage-inspired tea dress with a soft floral print and button-down front.",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Dresses",
        isNew: false
      },
      {
        name: "Black Tie Noir",
        price: 290.00,
        description: "Sophisticated floor-length black gown with a structured bodice and elegant side slit.",
        image: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Formal",
        isNew: false
      },
      {
        name: "Sun-Kissed Linen Maxi",
        price: 130.00,
        description: "Breathable yellow linen maxi dress. Your go-to for beachside dinners and tropical getaways.",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Dresses",
        isNew: true
      },
      {
        name: "Rosewood Silk Midi",
        price: 175.00,
        description: "Luxurious rosewood pink silk midi dress with a bias cut for a flattering silhouette.",
        image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Evening",
        isNew: false
      },
      {
        name: "Emerald Forest Gown",
        price: 230.00,
        description: "Deep emerald green gown with intricate leaf embroidery. Captures the essence of the forest.",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Evening",
        isNew: true
      },
      {
        name: "Champagne Toast Mini",
        price: 145.00,
        description: "Shimmering champagne mini dress with a playful hemline. Cheers to elegance!",
        image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Shop",
        isNew: true
      },
      {
        name: "Starlit Night Jumpsuit",
        price: 185.00,
        description: "A sleek black jumpsuit with subtle metallic threads that shimmer like stars. A modern alternative to the classic gown.",
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Formal",
        isNew: false
      }
    ];

    const stmt = await db.prepare(`INSERT INTO products (name, price, description, image, category, isNew) VALUES (?, ?, ?, ?, ?, ?)`);
    for (const p of products) {
      await stmt.run(p.name, p.price, p.description, p.image, p.category, p.isNew ? 1 : 0);
    }
    await stmt.finalize();
    console.log("Database seeded with products.");
  }
}
