export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  brand: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string;
  images: string[];
  specifications: Record<string, string>;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active: boolean;
  display_order: number;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: number;
  is_active: boolean;
  display_order: number;
  free_shipping_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface StoreSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string;
  updated_at: string;
}

export interface InventoryAlert {
  id: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'restock_needed';
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  product?: Product;
}
