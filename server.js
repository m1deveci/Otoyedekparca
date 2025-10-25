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

// Admin - Categories
app.get('/api/admin/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY display_order');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/categories', async (req, res) => {
  try {
    const { name, slug, description, image_url, parent_id, display_order, is_active, profit_margin } = req.body;
    
    // Convert undefined values to null for MySQL
    const safeParentId = parent_id === undefined ? null : parent_id;
    const safeImageUrl = image_url === undefined ? null : image_url;
    const safeDescription = description === undefined ? null : description;
    
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, description, image_url, parent_id, display_order, is_active, profit_margin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, slug, safeDescription, safeImageUrl, safeParentId, display_order, is_active, profit_margin || 0]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    const { name, slug, description, image_url, parent_id, display_order, is_active, profit_margin } = req.body;
    
    // Convert undefined values to null for MySQL
    const safeParentId = parent_id === undefined ? null : parent_id;
    const safeImageUrl = image_url === undefined ? null : image_url;
    const safeDescription = description === undefined ? null : description;
    
    await pool.execute(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, parent_id = ?, display_order = ?, is_active = ?, profit_margin = ? WHERE id = ?',
      [name, slug, safeDescription, safeImageUrl, safeParentId, display_order, is_active, profit_margin || 0, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Products
app.get('/api/admin/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/products', async (req, res) => {
  try {
    const {
      category_id, name, slug, description, short_description, sku, brand, cost_price, price, sale_price,
      stock_quantity, low_stock_threshold, image_url, images, specifications, is_featured, is_active
    } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO products (category_id, name, slug, description, short_description, sku, brand, cost_price, price, sale_price, stock_quantity, low_stock_threshold, image_url, images, specifications, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, name, slug, description, short_description, sku, brand, cost_price, price, sale_price, stock_quantity, low_stock_threshold, image_url, JSON.stringify(images), JSON.stringify(specifications), is_featured, is_active]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const {
      category_id, name, slug, description, short_description, sku, brand, cost_price, price, sale_price,
      stock_quantity, low_stock_threshold, image_url, images, specifications, is_featured, is_active
    } = req.body;
    
    await pool.execute(
      'UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, short_description = ?, sku = ?, brand = ?, cost_price = ?, price = ?, sale_price = ?, stock_quantity = ?, low_stock_threshold = ?, image_url = ?, images = ?, specifications = ?, is_featured = ?, is_active = ? WHERE id = ?',
      [category_id, name, slug, description, short_description, sku, brand, cost_price, price, sale_price, stock_quantity, low_stock_threshold, image_url, JSON.stringify(images), JSON.stringify(specifications), is_featured, is_active, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Dashboard
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const [productsResult] = await pool.execute('SELECT COUNT(*) as total FROM products');
    const [activeProductsResult] = await pool.execute('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
    const [ordersResult] = await pool.execute('SELECT COUNT(*) as total FROM orders');
    const [revenueResult] = await pool.execute('SELECT SUM(total) as total FROM orders WHERE status != "cancelled"');
    const [lowStockResult] = await pool.execute('SELECT COUNT(*) as total FROM products WHERE stock_quantity <= low_stock_threshold');
    const [recentOrdersResult] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
    
    res.json({
      totalProducts: productsResult[0].total,
      activeProducts: activeProductsResult[0].total,
      totalOrders: ordersResult[0].total,
      totalRevenue: revenueResult[0].total || 0,
      lowStockProducts: lowStockResult[0].total,
      recentOrders: recentOrdersResult
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
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
