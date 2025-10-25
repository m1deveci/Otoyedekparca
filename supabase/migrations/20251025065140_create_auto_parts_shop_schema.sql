/*
  # OtoRıdvan - Filtre Dünyası Database Schema
  
  ## Overview
  Complete e-commerce database for automotive parts shop with products, categories, 
  orders, customers, and admin management.
  
  ## New Tables
  
  ### 1. categories
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name (e.g., "Filtreler", "Yağlar", "Frenler")
  - `slug` (text, unique) - URL-friendly category name
  - `description` (text) - Category description
  - `image_url` (text) - Category image
  - `parent_id` (uuid, nullable) - For subcategories
  - `display_order` (integer) - Sort order
  - `is_active` (boolean) - Show/hide category
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. products
  - `id` (uuid, primary key) - Unique product identifier
  - `category_id` (uuid) - Foreign key to categories
  - `name` (text) - Product name
  - `slug` (text, unique) - URL-friendly product name
  - `description` (text) - Full product description
  - `short_description` (text) - Brief description
  - `sku` (text, unique) - Stock keeping unit code
  - `brand` (text) - Product brand
  - `price` (decimal) - Regular price
  - `sale_price` (decimal, nullable) - Discounted price
  - `stock_quantity` (integer) - Available stock
  - `low_stock_threshold` (integer) - Alert threshold
  - `image_url` (text) - Main product image
  - `images` (jsonb) - Additional product images array
  - `specifications` (jsonb) - Technical specs (key-value pairs)
  - `is_featured` (boolean) - Featured product flag
  - `is_active` (boolean) - Product visibility
  - `view_count` (integer) - Number of views
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. customers
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text, unique) - Customer email
  - `full_name` (text) - Customer name
  - `phone` (text) - Phone number
  - `address` (text) - Street address
  - `city` (text) - City
  - `postal_code` (text) - Postal code
  - `notes` (text) - Customer notes
  - `created_at` (timestamptz) - Registration date
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. orders
  - `id` (uuid, primary key) - Unique order identifier
  - `order_number` (text, unique) - Human-readable order number
  - `customer_id` (uuid, nullable) - Foreign key to customers (null for guest orders)
  - `customer_name` (text) - Customer name
  - `customer_email` (text) - Customer email
  - `customer_phone` (text) - Customer phone
  - `shipping_address` (text) - Delivery address
  - `shipping_city` (text) - Delivery city
  - `shipping_postal_code` (text) - Postal code
  - `subtotal` (decimal) - Items total
  - `tax` (decimal) - Tax amount
  - `shipping_cost` (decimal) - Shipping fee
  - `total` (decimal) - Grand total
  - `status` (text) - Order status (pending, confirmed, processing, shipped, delivered, cancelled)
  - `payment_method` (text) - Payment method (cash, transfer, card)
  - `payment_status` (text) - Payment status (pending, paid, failed)
  - `notes` (text) - Order notes
  - `created_at` (timestamptz) - Order date
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 5. order_items
  - `id` (uuid, primary key) - Unique item identifier
  - `order_id` (uuid) - Foreign key to orders
  - `product_id` (uuid) - Foreign key to products
  - `product_name` (text) - Product name snapshot
  - `product_sku` (text) - Product SKU snapshot
  - `quantity` (integer) - Quantity ordered
  - `unit_price` (decimal) - Price per unit
  - `total_price` (decimal) - Line total
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 6. admin_users
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text, unique) - Admin email
  - `full_name` (text) - Admin name
  - `role` (text) - Admin role (super_admin, admin, staff)
  - `is_active` (boolean) - Account status
  - `last_login` (timestamptz) - Last login time
  - `created_at` (timestamptz) - Account creation date
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  - RLS enabled on all tables
  - Public read access for products and categories
  - Authenticated admin access for management
  - Customers can view their own orders
  - Secure admin-only operations
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  sku text UNIQUE NOT NULL,
  brand text DEFAULT '',
  price decimal(10,2) NOT NULL,
  sale_price decimal(10,2),
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  image_url text DEFAULT '',
  images jsonb DEFAULT '[]'::jsonb,
  specifications jsonb DEFAULT '{}'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  shipping_postal_code text DEFAULT '',
  subtotal decimal(10,2) NOT NULL,
  tax decimal(10,2) DEFAULT 0,
  shipping_cost decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'cash',
  payment_status text DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  role text DEFAULT 'staff',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- RLS Policies for customers
CREATE POLICY "Users can view own customer data"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own customer data"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own customer data"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view order items of their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.is_active = true
      ))
    )
  );

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
      AND admin_users.role = 'super_admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();