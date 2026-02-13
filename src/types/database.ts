// ===================================
// Supabase Database Types
// ===================================

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
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          status: string
          subtotal: number
          tax: number
          shipping: number
          discount: number
          total: number
          currency: string
          shipping_address: Json
          billing_address: Json
          notes: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
          paid_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
          refunded_at: string | null
          tracking: Json | null
        }
        Insert: {
          id?: string
          order_number: string
          user_id: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          status?: string
          subtotal: number
          tax: number
          shipping: number
          discount?: number
          total: number
          currency?: string
          shipping_address: Json
          billing_address: Json
          notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          refunded_at?: string | null
          tracking?: Json | null
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          status?: string
          subtotal?: number
          tax?: number
          shipping?: number
          discount?: number
          total?: number
          currency?: string
          shipping_address?: Json
          billing_address?: Json
          notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          refunded_at?: string | null
          tracking?: Json | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          unit_price: number
          total_price: number
          image_url: string | null
          options: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          unit_price: number
          total_price: number
          image_url?: string | null
          options?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          image_url?: string | null
          options?: Json | null
          created_at?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: string
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
