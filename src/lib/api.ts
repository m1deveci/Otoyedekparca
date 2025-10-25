const API_BASE_URL = window.location.origin + '/api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id?: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  brand: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string;
  images?: string[];
  specifications?: Record<string, any>;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: number;
  order_number: string;
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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  // Products
  async getProducts(params?: {
    category?: number;
    featured?: boolean;
    search?: string;
  }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category.toString());
    if (params?.featured) searchParams.append('featured', 'true');
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    const products = await this.request<Product[]>(endpoint);
    
    // Convert string prices to numbers
    return products.map(product => ({
      ...product,
      price: parseFloat(product.price.toString()),
      sale_price: product.sale_price ? parseFloat(product.sale_price.toString()) : null,
    }));
  }

  async getProduct(id: number): Promise<Product> {
    const product = await this.request<Product>(`/products/${id}`);
    
    // Convert string prices to numbers
    return {
      ...product,
      price: parseFloat(product.price.toString()),
      sale_price: product.sale_price ? parseFloat(product.sale_price.toString()) : null,
    };
  }

  // Orders
  async createOrder(orderData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping_cost: number;
    total: number;
  }): Promise<{ success: boolean; order_id: number; order_number: string }> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async getOrder(id: number): Promise<{ order: Order; items: any[] }> {
    return this.request<{ order: Order; items: any[] }>(`/orders/${id}`);
  }

  async updateOrderStatus(id: number, status: string): Promise<{ success: boolean }> {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Admin - Categories
  async createCategory(categoryData: {
    name: string;
    slug: string;
    description: string;
    image_url: string;
    parent_id?: number;
    display_order: number;
    is_active: boolean;
  }): Promise<Category> {
    return this.request<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Products
  async createProduct(productData: {
    category_id: number;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    sku: string;
    brand: string;
    price: number;
    sale_price?: number;
    stock_quantity: number;
    low_stock_threshold: number;
    image_url: string;
    images?: string[];
    specifications?: Record<string, any>;
    is_featured: boolean;
    is_active: boolean;
  }): Promise<Product> {
    return this.request<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Dashboard
  async getDashboardStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    totalRevenue: number;
    lowStockProducts: number;
    recentOrders: Order[];
  }> {
    return this.request('/admin/dashboard');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();
