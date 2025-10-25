import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://otoridvan.devkit.com.tr'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Remove potential XSS attempts
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  next();
};

app.use(sanitizeInput);

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'otoridvan_user',
  password: process.env.DB_PASSWORD || 'Deveci1453',
  database: process.env.DB_NAME || 'otoridvan_db',
  charset: process.env.DB_CHARSET || 'utf8mb4'
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

// Create tables if they don't exist
const createTables = async () => {
  try {
    // Categories table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        parent_id INT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        profit_margin DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Products table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        short_description TEXT,
        sku VARCHAR(100),
        barcode VARCHAR(100),
        brand VARCHAR(100),
        cost_price DECIMAL(10,2),
        price DECIMAL(10,2) NOT NULL,
        sale_price DECIMAL(10,2),
        stock_quantity INT DEFAULT 0,
        low_stock_threshold INT DEFAULT 5,
        image_url TEXT,
        images JSON,
        specifications JSON,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Orders table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        customer_address TEXT,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Technical services table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS technical_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        credit_limit DECIMAL(10,2) DEFAULT 0,
        current_balance DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Credit transactions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        technical_service_id INT NOT NULL,
        transaction_type ENUM('payment', 'credit_sale') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        reference_number VARCHAR(100),
        payment_method VARCHAR(50),
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (technical_service_id) REFERENCES technical_services(id) ON DELETE CASCADE
      )
    `);

    // Credit sales table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS credit_sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        technical_service_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (technical_service_id) REFERENCES technical_services(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Technical service history table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS technical_service_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        technical_service_id INT NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2),
        previous_balance DECIMAL(10,2),
        new_balance DECIMAL(10,2),
        reference_number VARCHAR(100),
        payment_method VARCHAR(50),
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (technical_service_id) REFERENCES technical_services(id) ON DELETE CASCADE
      )
    `);

    // System logs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT,
        description TEXT,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

// Initialize tables
createTables();

// Authentication endpoints
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).trim(),
  validateInput
], async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check user in database
    const [users] = await pool.execute(
      'SELECT * FROM admin_users WHERE email = ? AND is_active = 1',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    const user = users[0];
    
    // For demo purposes - in production, use proper password hashing
    // Currently using plain text comparison for admin123
    if (password === 'admin123' || password === user.password) {
      const userData = {
        id: user.id.toString(),
        email: user.email,
        name: user.full_name,
        role: user.role
      };
      
      // Update last login
      await pool.execute(
        'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );
      
      res.json(userData);
    } else {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
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
      category_id, name, slug, description, short_description, sku, barcode, brand, cost_price, price, sale_price,
      stock_quantity, low_stock_threshold, image_url, images, specifications, is_featured, is_active
    } = req.body;
    
    console.log('Received cost_price:', cost_price, 'Type:', typeof cost_price); // Debug için
    
    // Convert undefined values to null for MySQL
    const safeDescription = description === undefined ? null : description;
    const safeShortDescription = short_description === undefined ? null : short_description;
    const safeImageUrl = image_url === undefined ? null : image_url;
    const safeImages = images === undefined ? null : JSON.stringify(images);
    const safeSpecifications = specifications === undefined ? null : JSON.stringify(specifications);
    const safeCostPrice = cost_price === undefined || cost_price === '' ? null : parseFloat(cost_price);
    const safeSalePrice = sale_price === undefined ? null : sale_price;
    
    const [result] = await pool.execute(
      'INSERT INTO products (category_id, name, slug, description, short_description, sku, brand, cost_price, price, sale_price, stock_quantity, low_stock_threshold, image_url, images, specifications, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, name, slug, safeDescription, safeShortDescription, sku, brand, safeCostPrice, price, safeSalePrice, stock_quantity, low_stock_threshold, safeImageUrl, safeImages, safeSpecifications, is_featured, is_active]
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
    
    console.log('Update - Received cost_price:', cost_price, 'Type:', typeof cost_price); // Debug için
    
    // Convert undefined values to null for MySQL
    const safeDescription = description === undefined ? null : description;
    const safeShortDescription = short_description === undefined ? null : short_description;
    const safeImageUrl = image_url === undefined ? null : image_url;
    const safeImages = images === undefined ? null : JSON.stringify(images);
    const safeSpecifications = specifications === undefined ? null : JSON.stringify(specifications);
    const safeCostPrice = cost_price === undefined || cost_price === '' ? null : parseFloat(cost_price);
    const safeSalePrice = sale_price === undefined ? null : sale_price;
    
    await pool.execute(
      'UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, short_description = ?, sku = ?, brand = ?, cost_price = ?, price = ?, sale_price = ?, stock_quantity = ?, low_stock_threshold = ?, image_url = ?, images = ?, specifications = ?, is_featured = ?, is_active = ? WHERE id = ?',
      [category_id, name, slug, safeDescription, safeShortDescription, sku, brand, safeCostPrice, price, safeSalePrice, stock_quantity, low_stock_threshold, safeImageUrl, safeImages, safeSpecifications, is_featured, is_active, req.params.id]
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

// Technical Services endpoints
app.get('/api/admin/technical-services', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM technical_services ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching technical services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/technical-services', async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, tax_number, credit_limit, is_active } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO technical_services (name, contact_person, phone, email, address, tax_number, credit_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, contact_person, phone, email, address, tax_number, credit_limit, is_active]
    );
    
    // History kaydı ekle
    await pool.execute(
      'INSERT INTO technical_service_history (technical_service_id, action_type, description, amount, previous_balance, new_balance, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [result.insertId, 'created', `Teknik servis oluşturuldu: ${name}`, 0, 0, 0, 'admin']
    );
    
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating technical service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/technical-services/:id', async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, tax_number, credit_limit, is_active } = req.body;
    
    await pool.execute(
      'UPDATE technical_services SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, tax_number = ?, credit_limit = ?, is_active = ? WHERE id = ?',
      [name, contact_person, phone, email, address, tax_number, credit_limit, is_active, req.params.id]
    );
    
    // History kaydı ekle
    await pool.execute(
      'INSERT INTO technical_service_history (technical_service_id, action_type, description, amount, previous_balance, new_balance, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, 'updated', `Teknik servis güncellendi: ${name}`, 0, 0, 0, 'admin']
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating technical service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/technical-services/:id', async (req, res) => {
  try {
    // Önce teknik servis bilgilerini al
    const [service] = await pool.execute('SELECT name FROM technical_services WHERE id = ?', [req.params.id]);
    
    // History kaydı ekle
    if (service.length > 0) {
      await pool.execute(
        'INSERT INTO technical_service_history (technical_service_id, action_type, description, amount, previous_balance, new_balance, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.params.id, 'deleted', `Teknik servis silindi: ${service[0].name}`, 0, 0, 0, 'admin']
      );
    }
    
    await pool.execute('DELETE FROM technical_services WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting technical service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Credit transactions endpoints
app.get('/api/admin/technical-services/:id/transactions', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM credit_transactions WHERE technical_service_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/technical-services/:id/transactions', async (req, res) => {
  try {
    const { transaction_type, amount, description, reference_number, payment_method, created_by } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO credit_transactions (technical_service_id, transaction_type, amount, description, reference_number, payment_method, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, transaction_type, amount, description, reference_number, payment_method, created_by]
    );
    
    // Update current balance
    await pool.execute(
      'UPDATE technical_services SET current_balance = current_balance + ? WHERE id = ?',
      [amount, req.params.id]
    );
    
    // History kaydı ekle
    const [currentService] = await pool.execute('SELECT current_balance FROM technical_services WHERE id = ?', [req.params.id]);
    const previousBalance = (currentService[0]?.current_balance || 0) - amount;
    const newBalance = currentService[0]?.current_balance || 0;
    
    await pool.execute(
      'INSERT INTO technical_service_history (technical_service_id, action_type, description, amount, previous_balance, new_balance, reference_number, payment_method, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, 'payment', description, amount, previousBalance, newBalance, reference_number, payment_method, created_by]
    );
    
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating credit transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Credit sales endpoints
app.get('/api/admin/technical-services/:id/sales', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT cs.*, p.name as product_name 
      FROM credit_sales cs 
      JOIN products p ON cs.product_id = p.id 
      WHERE cs.technical_service_id = ? 
      ORDER BY cs.created_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching credit sales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/technical-services/:id/sales', async (req, res) => {
  try {
    const { product_id, quantity, unit_price, total_amount, sale_date, notes } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO credit_sales (technical_service_id, product_id, quantity, unit_price, total_amount, sale_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, product_id, quantity, unit_price, total_amount, sale_date, notes]
    );
    
    // Update current balance
    await pool.execute(
      'UPDATE technical_services SET current_balance = current_balance + ? WHERE id = ?',
      [total_amount, req.params.id]
    );
    
    // History kaydı ekle
    const [currentService] = await pool.execute('SELECT current_balance FROM technical_services WHERE id = ?', [req.params.id]);
    const previousBalance = (currentService[0]?.current_balance || 0) - total_amount;
    const newBalance = currentService[0]?.current_balance || 0;
    
    await pool.execute(
      'INSERT INTO technical_service_history (technical_service_id, action_type, description, amount, previous_balance, new_balance, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, 'credit_sale', `Veresiye satış: ${quantity} adet ürün - ${total_amount} TL`, total_amount, previousBalance, newBalance, 'admin']
    );
    
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating credit sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Authentication endpoint (duplicate - removed to avoid conflicts)

// Stock management endpoint
app.put('/api/admin/products/:id/stock', async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const productId = req.params.id;
    
    if (!quantity || !operation) {
      return res.status(400).json({ error: 'Quantity and operation are required' });
    }
    
    // Get current stock
    const [rows] = await pool.execute(
      'SELECT stock_quantity FROM products WHERE id = ?',
      [productId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const currentStock = rows[0].stock_quantity;
    let newStock;
    
    if (operation === 'decrease') {
      newStock = Math.max(0, currentStock - quantity);
    } else if (operation === 'increase') {
      newStock = currentStock + quantity;
    } else {
      return res.status(400).json({ error: 'Invalid operation. Use "increase" or "decrease"' });
    }
    
    // Update stock
    await pool.execute(
      'UPDATE products SET stock_quantity = ? WHERE id = ?',
      [newStock, productId]
    );
    
    res.json({ 
      success: true, 
      previous_stock: currentStock, 
      new_stock: newStock,
      change: operation === 'decrease' ? -quantity : quantity
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Technical service history endpoints
app.get('/api/admin/technical-services/:id/history', async (req, res) => {
  try {
    // Get history records
    const [historyRows] = await pool.execute(
      'SELECT * FROM technical_service_history WHERE technical_service_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    
    // Get credit sales with product details
    const [salesRows] = await pool.execute(`
      SELECT 
        cs.*,
        p.name as product_name,
        p.brand as product_brand,
        p.sku as product_sku
      FROM credit_sales cs
      JOIN products p ON cs.product_id = p.id
      WHERE cs.technical_service_id = ?
      ORDER BY cs.created_at DESC
    `, [req.params.id]);
    
    // Combine both results
    const combinedResults = [
      ...historyRows.map(row => ({ ...row, type: 'history' })),
      ...salesRows.map(row => ({ ...row, type: 'sale' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    res.json(combinedResults);
  } catch (error) {
    console.error('Error fetching technical service history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

    app.post('/api/admin/technical-services/:id/history', async (req, res) => {
      try {
        const { action_type, description, amount, previous_balance, new_balance, reference_number, payment_method, created_by } = req.body;
        
        const [result] = await pool.execute(
          'INSERT INTO technical_service_history (technical_service_id, action_type, description, amount, previous_balance, new_balance, reference_number, payment_method, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [req.params.id, action_type, description, amount, previous_balance, new_balance, reference_number, payment_method, created_by]
        );
        
        res.json({ id: result.insertId, ...req.body });
      } catch (error) {
        console.error('Error creating technical service history:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.delete('/api/admin/technical-services/:id/history', async (req, res) => {
      try {
        await pool.execute(
          'DELETE FROM technical_service_history WHERE technical_service_id = ?',
          [req.params.id]
        );
        
        res.json({ message: 'History cleared successfully' });
      } catch (error) {
        console.error('Error clearing technical service history:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

// System logs endpoints
app.get('/api/admin/system-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entity_type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM system_logs WHERE 1=1';
    const params = [];
    
    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }
    
    if (entity_type) {
      query += ' AND entity_type = ?';
      params.push(entity_type);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/system-logs', async (req, res) => {
  try {
    const { user_id, action, entity_type, entity_id, description, old_values, new_values, ip_address, user_agent } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO system_logs (user_id, action, entity_type, entity_id, description, old_values, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, action, entity_type, entity_id, description, JSON.stringify(old_values), JSON.stringify(new_values), ip_address, user_agent]
    );
    
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating system log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong'
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

// 404 handler - removed problematic wildcard route

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
