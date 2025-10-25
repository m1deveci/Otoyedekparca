/*
  # Store Settings and Payment Methods Enhancement
  
  ## Overview
  Adds comprehensive store management features including payment methods, 
  shipping options, store settings, and inventory alerts.
  
  ## New Tables
  
  ### 1. payment_methods
  - `id` (uuid, primary key) - Unique payment method identifier
  - `name` (text) - Payment method name (e.g., "Nakit", "Havale/EFT", "Kredi Kartı")
  - `code` (text, unique) - System code (e.g., "cash", "bank_transfer", "credit_card")
  - `description` (text) - Payment method description
  - `icon` (text) - Icon name for UI
  - `is_active` (boolean) - Enable/disable payment method
  - `display_order` (integer) - Sort order
  - `config` (jsonb) - Additional configuration (bank details, API keys, etc.)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. shipping_methods
  - `id` (uuid, primary key) - Unique shipping method identifier
  - `name` (text) - Shipping method name (e.g., "Standart Kargo", "Hızlı Kargo")
  - `description` (text) - Shipping method description
  - `price` (decimal) - Shipping cost
  - `estimated_days` (integer) - Delivery time estimate
  - `is_active` (boolean) - Enable/disable shipping method
  - `display_order` (integer) - Sort order
  - `free_shipping_threshold` (decimal) - Minimum order for free shipping
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. store_settings
  - `id` (uuid, primary key) - Unique settings identifier
  - `key` (text, unique) - Setting key
  - `value` (text) - Setting value
  - `type` (text) - Data type (string, number, boolean, json)
  - `category` (text) - Settings category (general, payment, shipping, tax, etc.)
  - `description` (text) - Setting description
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. inventory_alerts
  - `id` (uuid, primary key) - Unique alert identifier
  - `product_id` (uuid) - Foreign key to products
  - `alert_type` (text) - Alert type (low_stock, out_of_stock, restock_needed)
  - `message` (text) - Alert message
  - `is_resolved` (boolean) - Alert status
  - `resolved_at` (timestamptz) - Resolution timestamp
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  - RLS enabled on all tables
  - Admin-only access for management operations
  - Public read access for active payment and shipping methods
  
  ## Important Notes
  - Payment methods can be customized per store requirements
  - Store settings provide flexible configuration management
  - Inventory alerts help track stock issues automatically
*/

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'CreditCard',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shipping_methods table
CREATE TABLE IF NOT EXISTS shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) DEFAULT 0,
  estimated_days integer DEFAULT 3,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  free_shipping_threshold decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  type text DEFAULT 'string',
  category text DEFAULT 'general',
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Create inventory_alerts table
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_store_settings_category ON store_settings(category);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON inventory_alerts(is_resolved);

-- Enable Row Level Security
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
CREATE POLICY "Anyone can view active payment methods"
  ON payment_methods FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- RLS Policies for shipping_methods
CREATE POLICY "Anyone can view active shipping methods"
  ON shipping_methods FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage shipping methods"
  ON shipping_methods FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- RLS Policies for store_settings
CREATE POLICY "Admins can view store settings"
  ON store_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can manage store settings"
  ON store_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- RLS Policies for inventory_alerts
CREATE POLICY "Admins can view inventory alerts"
  ON inventory_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can manage inventory alerts"
  ON inventory_alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_methods_updated_at
  BEFORE UPDATE ON shipping_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default payment methods
INSERT INTO payment_methods (name, code, description, icon, display_order) VALUES
  ('Nakit', 'cash', 'Kapıda nakit ödeme', 'Banknote', 1),
  ('Havale/EFT', 'bank_transfer', 'Banka hesabına havale veya EFT', 'Building2', 2),
  ('Kredi Kartı', 'credit_card', 'Kredi kartı ile online ödeme', 'CreditCard', 3)
ON CONFLICT (code) DO NOTHING;

-- Insert default shipping methods
INSERT INTO shipping_methods (name, description, price, estimated_days, display_order) VALUES
  ('Standart Kargo', 'Standart kargo ile teslimat', 29.90, 3, 1),
  ('Hızlı Kargo', 'Aynı gün veya 1 gün içinde teslimat', 49.90, 1, 2)
ON CONFLICT DO NOTHING;

-- Insert default store settings
INSERT INTO store_settings (key, value, type, category, description) VALUES
  ('store_name', 'OtoRıdvan - Filtre Dünyası', 'string', 'general', 'Mağaza adı'),
  ('store_email', 'info@otoridvan.com', 'string', 'general', 'İletişim e-posta adresi'),
  ('store_phone', '0555 123 4567', 'string', 'general', 'İletişim telefon numarası'),
  ('store_address', 'Örnek Mahallesi, Örnek Sokak No:1', 'string', 'general', 'Mağaza adresi'),
  ('tax_rate', '20', 'number', 'tax', 'KDV oranı (%)'),
  ('currency', 'TRY', 'string', 'general', 'Para birimi'),
  ('currency_symbol', '₺', 'string', 'general', 'Para birimi sembolü'),
  ('low_stock_threshold', '5', 'number', 'inventory', 'Düşük stok uyarı eşiği'),
  ('order_prefix', 'OR', 'string', 'orders', 'Sipariş numarası öneki'),
  ('enable_guest_checkout', 'true', 'boolean', 'checkout', 'Misafir alışverişe izin ver'),
  ('min_order_amount', '0', 'number', 'orders', 'Minimum sipariş tutarı'),
  ('max_order_amount', '50000', 'number', 'orders', 'Maximum sipariş tutarı')
ON CONFLICT (key) DO NOTHING;

-- Create function to auto-generate inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for low stock
  IF NEW.stock_quantity <= NEW.low_stock_threshold AND NEW.stock_quantity > 0 THEN
    INSERT INTO inventory_alerts (product_id, alert_type, message)
    VALUES (
      NEW.id,
      'low_stock',
      'Ürün stok miktarı düşük seviyede: ' || NEW.name || ' (Stok: ' || NEW.stock_quantity || ')'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Check for out of stock
  IF NEW.stock_quantity <= 0 THEN
    INSERT INTO inventory_alerts (product_id, alert_type, message)
    VALUES (
      NEW.id,
      'out_of_stock',
      'Ürün stokta yok: ' || NEW.name
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory alerts
DROP TRIGGER IF EXISTS trigger_check_inventory_alerts ON products;
CREATE TRIGGER trigger_check_inventory_alerts
  AFTER INSERT OR UPDATE OF stock_quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_inventory_alerts();