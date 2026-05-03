import { getDb } from './db.js';

async function updateProducts() {
  const db = await getDb();
  
  const newProducts = [
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

  console.log("Adding new dresses to the database...");

  const stmt = await db.prepare(`INSERT INTO products (name, price, description, image, category, isNew) VALUES (?, ?, ?, ?, ?, ?)`);
  
  for (const p of newProducts) {
    // Check if product already exists to avoid duplicates
    const existing = await db.get('SELECT id FROM products WHERE name = ?', p.name);
    if (!existing) {
      await stmt.run(p.name, p.price, p.description, p.image, p.category, p.isNew ? 1 : 0);
      console.log(`Added: ${p.name}`);
    } else {
      console.log(`Skipped (already exists): ${p.name}`);
    }
  }
  
  await stmt.finalize();
  console.log("Update complete!");
  process.exit(0);
}

updateProducts().catch(err => {
  console.error("Failed to update products:", err);
  process.exit(1);
});
