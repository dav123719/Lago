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
      carts: {
        Row: {
          id: string
          user_id: string | null
          guest_session_id: string | null
          status: 'active' | 'converted' | 'abandoned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          guest_session_id?: string | null
          status?: 'active' | 'converted' | 'abandoned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          guest_session_id?: string | null
          status?: 'active' | 'converted' | 'abandoned'
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          quantity: number
          price_at_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          quantity: number
          price_at_time: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          quantity?: number
          price_at_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          name_en: string | null
          name_ru: string | null
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          image: string | null
          stock_quantity: number
          sku: string
          category: string | null
          weight_kg: number | null
          dimensions: Json | null
          is_available: boolean
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          name_ru?: string | null
          slug: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          image?: string | null
          stock_quantity?: number
          sku: string
          category?: string | null
          weight_kg?: number | null
          dimensions?: Json | null
          is_available?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          name_ru?: string | null
          slug?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          image?: string | null
          stock_quantity?: number
          sku?: string
          category?: string | null
          weight_kg?: number | null
          dimensions?: Json | null
          is_available?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          guest_email: string | null
          guest_session_id: string | null
          status: string
          payment_status: string
          shipping_address: Json
          shipping_method: string
          shipping_price: number
          subtotal: number
          tax_amount: number
          discount_amount: number
          total: number
          currency: string
          notes: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          guest_email?: string | null
          guest_session_id?: string | null
          status?: string
          payment_status?: string
          shipping_address: Json
          shipping_method: string
          shipping_price: number
          subtotal: number
          tax_amount?: number
          discount_amount?: number
          total: number
          currency?: string
          notes?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          guest_email?: string | null
          guest_session_id?: string | null
          status?: string
          payment_status?: string
          shipping_address?: Json
          shipping_method?: string
          shipping_price?: number
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total?: number
          currency?: string
          notes?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
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
          product_image: string | null
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
          product_image?: string | null
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
          product_image?: string | null
          created_at?: string
        }
      }
      checkout_sessions: {
        Row: {
          id: string
          cart_id: string
          stripe_session_id: string
          status: string
          shipping_address: Json
          shipping_method: Json
          shipping_price: number
          subtotal: number
          total: number
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          stripe_session_id: string
          status?: string
          shipping_address: Json
          shipping_method: Json
          shipping_price: number
          subtotal: number
          total: number
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          stripe_session_id?: string
          status?: string
          shipping_address?: Json
          shipping_method?: Json
          shipping_price?: number
          subtotal?: number
          total?: number
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          type: 'shipping' | 'billing' | 'both'
          is_default: boolean
          first_name: string
          last_name: string
          phone: string | null
          street_address: string
          apartment_suite: string | null
          city: string
          postal_code: string
          country: string
          country_code: string
          parcel_locker_id: string | null
          parcel_locker_provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: 'shipping' | 'billing' | 'both'
          is_default?: boolean
          first_name: string
          last_name: string
          phone?: string | null
          street_address: string
          apartment_suite?: string | null
          city: string
          postal_code: string
          country?: string
          country_code?: string
          parcel_locker_id?: string | null
          parcel_locker_provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'shipping' | 'billing' | 'both'
          is_default?: boolean
          first_name?: string
          last_name?: string
          phone?: string | null
          street_address?: string
          apartment_suite?: string | null
          city?: string
          postal_code?: string
          country?: string
          country_code?: string
          parcel_locker_id?: string | null
          parcel_locker_provider?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          preferred_language: string
          avatar_url: string | null
          email_notifications: boolean
          sms_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          preferred_language?: string
          avatar_url?: string | null
          email_notifications?: boolean
          sms_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          preferred_language?: string
          avatar_url?: string | null
          email_notifications?: boolean
          sms_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      decrement_stock: {
        Args: {
          p_product_id: string
          p_quantity: number
        }
        Returns: undefined
      }
    }
  }
}
