-- OtoRıdvan - Filtre Dünyası Database Schema
-- MySQL/MariaDB version

USE otoridvan_db;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  image_url VARCHAR(500) DEFAULT '',
  parent_id INT DEFAULT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  sku VARCHAR(100) UNIQUE NOT NULL,
  brand VARCHAR(100) DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) DEFAULT NULL,
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  image_url VARCHAR(500) DEFAULT '',
  images JSON DEFAULT NULL,
  specifications JSON DEFAULT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  address TEXT DEFAULT '',
  city VARCHAR(100) DEFAULT '',
  postal_code VARCHAR(20) DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT DEFAULT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20) DEFAULT '',
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method ENUM('cash', 'transfer', 'card') DEFAULT 'cash',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT DEFAULT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) DEFAULT '',
  role ENUM('super_admin', 'admin', 'staff') DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Insert sample data
INSERT INTO categories (name, slug, description, display_order) VALUES
('Filtreler', 'filtreler', 'Araç filtreleri', 1),
('Yağlar', 'yaglar', 'Motor yağları ve sıvılar', 2),
('Frenler', 'frenler', 'Fren sistemi parçaları', 3),
('Egzoz', 'egzoz', 'Egzoz sistemi parçaları', 4);

INSERT INTO products (category_id, name, slug, sku, brand, price, stock_quantity, is_featured) VALUES
(1, 'Hava Filtresi', 'hava-filtresi', 'HF001', 'Bosch', 45.00, 50, TRUE),
(1, 'Yağ Filtresi', 'yag-filtresi', 'YF001', 'Mann', 25.00, 100, TRUE),
(2, 'Motor Yağı 5W-30', 'motor-yagi-5w30', 'MY001', 'Castrol', 85.00, 30, TRUE),
(3, 'Fren Balata Seti', 'fren-balata-seti', 'FB001', 'Brembo', 120.00, 25, FALSE);

INSERT INTO admin_users (email, full_name, role) VALUES
('admin@otoridvan.com', 'Admin User', 'super_admin');
