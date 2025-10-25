import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'otoridvan_user',
  password: 'Deveci1453',
  database: 'otoridvan_db',
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// Routes

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category_id = ?';
      params.push(category);
    }

    if (featured === 'true') {
      query += ' AND is_featured = 1';
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ? AND is_active = 1',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_postal_code,
      items,
      subtotal,
      tax,
      shipping_cost,
      total
    } = req.body;

    // Generate order number
    const order_number = 'ORD-' + Date.now();

    // Insert order
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, 
       shipping_address, shipping_city, shipping_postal_code, subtotal, tax, shipping_cost, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_number, customer_name, customer_email, customer_phone, shipping_address,
       shipping_city, shipping_postal_code, subtotal, tax, shipping_cost, total]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, product_sku, 
         quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.sku, item.quantity, item.price, item.total]
      );
    }

    res.json({ 
      success: true, 
      order_id: orderId, 
      order_number: order_number 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get orders (admin)
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order details
app.get('/api/orders/:id', async (req, res) => {
  try {
    const [orderRows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [itemRows] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ?',
      [req.params.id]
    );

    res.json({
      order: orderRows[0],
      items: itemRows
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
