export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          image_url: string
          parent_id: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          image_url?: string
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          image_url?: string
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string
          short_description: string
          sku: string
          brand: string
          price: number
          sale_price: number | null
          stock_quantity: number
          low_stock_threshold: number
          image_url: string
          images: Json
          specifications: Json
          is_featured: boolean
          is_active: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string
          short_description?: string
          sku: string
          brand?: string
          price: number
          sale_price?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          image_url?: string
          images?: Json
          specifications?: Json
          is_featured?: boolean
          is_active?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string
          short_description?: string
          sku?: string
          brand?: string
          price?: number
          sale_price?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          image_url?: string
          images?: Json
          specifications?: Json
          is_featured?: boolean
          is_active?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string
          address: string
          city: string
          postal_code: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          phone?: string
          address?: string
          city?: string
          postal_code?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string
          address?: string
          city?: string
          postal_code?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address: string
          shipping_city: string
          shipping_postal_code: string
          subtotal: number
          tax: number
          shipping_cost: number
          total: number
          status: string
          payment_method: string
          payment_status: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address: string
          shipping_city: string
          shipping_postal_code?: string
          subtotal: number
          tax?: number
          shipping_cost?: number
          total: number
          status?: string
          payment_method?: string
          payment_status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          shipping_address?: string
          shipping_city?: string
          shipping_postal_code?: string
          subtotal?: number
          tax?: number
          shipping_cost?: number
          total?: number
          status?: string
          payment_method?: string
          payment_status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          role?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
