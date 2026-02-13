-- ============================================
-- LAGO E-Commerce Supabase Schema
-- ============================================
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Admin roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'super_admin', 'support', 'service')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  preferred_language VARCHAR(10) DEFAULT 'lv' CHECK (preferred_language IN ('lv', 'en', 'ru')),
  avatar_url TEXT,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business profiles (for B2B customers)
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(50),
  vat_number VARCHAR(50),
  billing_address_id UUID,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADDRESSES
-- ============================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('shipping', 'billing', 'both')),
  is_default BOOLEAN DEFAULT false,
  
  -- Contact info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  
  -- Address
  street_address TEXT NOT NULL,
  apartment_suite VARCHAR(50),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'Latvia',
  country_code VARCHAR(2) DEFAULT 'LV',
  
  -- For Baltic shipping integrations
  parcel_locker_id VARCHAR(100),
  parcel_locker_provider VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one default address per type per user
CREATE UNIQUE INDEX idx_default_address_per_type 
ON addresses(user_id, type) 
WHERE is_default = true;

-- ============================================
-- PRODUCT CATALOG (Synced from Sanity)
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sanity_id VARCHAR(100) UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name_lv VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255) NOT NULL,
  description_lv TEXT,
  description_en TEXT,
  description_ru TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sanity_id VARCHAR(100) UNIQUE,
  sku VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  
  -- Localized content
  name_lv VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255) NOT NULL,
  description_lv TEXT,
  description_en TEXT,
  description_ru TEXT,
  short_description_lv TEXT,
  short_description_en TEXT,
  short_description_ru TEXT,
  
  -- Pricing (EUR)
  base_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2), -- For margin calculations
  
  -- Inventory
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  stock_status VARCHAR(20) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'pre_order')),
  low_stock_threshold INTEGER DEFAULT 5,
  
  -- Product details
  weight_kg DECIMAL(8, 3),
  dimensions_cm JSONB, -- {"length": 100, "width": 50, "height": 30}
  material VARCHAR(100),
  finish VARCHAR(100),
  
  -- Organization
  category_id UUID REFERENCES categories(id),
  tags TEXT[],
  
  -- Media
  images JSONB DEFAULT '[]', -- [{"url": "...", "alt": "...", "position": 1}]
  featured_image TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title_lv VARCHAR(255),
  meta_title_en VARCHAR(255),
  meta_title_ru VARCHAR(255),
  meta_description_lv TEXT,
  meta_description_en TEXT,
  meta_description_ru TEXT,
  
  -- Sync tracking
  last_synced_at TIMESTAMPTZ,
  sanity_updated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status) WHERE status = 'active';
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_sanity_id ON products(sanity_id);

-- Product variants (for different sizes, colors, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL UNIQUE,
  name_lv VARCHAR(255),
  name_en VARCHAR(255),
  name_ru VARCHAR(255),
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  attributes JSONB, -- {"size": "60x60", "thickness": "20mm"}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory tracking
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('initial', 'purchase', 'sale', 'adjustment', 'return', 'reservation', 'release')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_type VARCHAR(50), -- 'order', 'adjustment', etc.
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CART SYSTEM
-- ============================================

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- For guest carts
  
  -- Session expiry for guest carts (30 days)
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  
  -- Cart state
  subtotal DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  
  -- Shipping estimate
  shipping_country VARCHAR(2),
  shipping_postal_code VARCHAR(20),
  
  -- Metadata
  currency VARCHAR(3) DEFAULT 'EUR',
  item_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure either user_id or session_id is set
  CONSTRAINT chk_cart_owner CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_carts_expires ON carts(expires_at);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  
  -- Snapshot of product data (to handle price changes)
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  original_unit_price DECIMAL(10, 2) NOT NULL, -- For showing discounts
  
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  -- Calculated
  line_total DECIMAL(10, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  
  -- Custom options
  custom_options JSONB, -- {"cutting": true, "measurements": {...}}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Order number: LGO-YYMMDD-XXXX (human-friendly)
  order_number VARCHAR(20) NOT NULL UNIQUE,
  
  -- Customer info
  user_id UUID REFERENCES profiles(id),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  
  -- Order status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Awaiting payment
    'payment_processing', -- Payment in progress
    'paid',              -- Payment confirmed
    'processing',        -- Preparing order
    'ready_for_pickup',  -- Ready at store
    'shipped',           -- With carrier
    'delivered',         -- Customer received
    'cancelled',         -- Order cancelled
    'refunded',          -- Fully refunded
    'partially_refunded' -- Partial refund
  )),
  
  -- Payment
  payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'
  )),
  payment_method VARCHAR(50),
  payment_provider VARCHAR(50) DEFAULT 'stripe',
  payment_intent_id VARCHAR(255),
  payment_ref VARCHAR(255),
  paid_at TIMESTAMPTZ,
  
  -- Financial (EUR)
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_code VARCHAR(50),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  shipping_method VARCHAR(100),
  tax_rate DECIMAL(5, 4) DEFAULT 0.21, -- 21% Latvian VAT
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Currency (for future multi-currency)
  currency VARCHAR(3) DEFAULT 'EUR',
  currency_rate DECIMAL(10, 6) DEFAULT 1,
  
  -- Shipping
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  
  -- Carrier info
  carrier VARCHAR(50),
  carrier_service VARCHAR(100),
  tracking_number VARCHAR(100),
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  estimated_delivery DATE,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- IPN/Webhook tracking
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_payment_intent ON orders(payment_intent_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Product snapshot (critical for history)
  product_id UUID REFERENCES products(id), -- Nullable in case product deleted
  variant_id UUID REFERENCES product_variants(id),
  
  sku VARCHAR(100) NOT NULL,
  name_lv VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_ru VARCHAR(255),
  
  -- Pricing at time of order (never trust client)
  unit_price DECIMAL(10, 2) NOT NULL,
  original_unit_price DECIMAL(10, 2),
  quantity INTEGER NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  
  -- Product details
  weight_kg DECIMAL(8, 3),
  dimensions_cm JSONB,
  material VARCHAR(100),
  
  -- Custom work
  custom_options JSONB,
  custom_price DECIMAL(10, 2) DEFAULT 0,
  
  -- For returns
  returned_quantity INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Order status history (audit trail)
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_by_name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHIPPING & CARRIERS
-- ============================================

CREATE TABLE shipping_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  carrier VARCHAR(50) NOT NULL, -- 'omniva', 'dpd', 'latvijas_pasts', 'local_pickup'
  service_code VARCHAR(50) NOT NULL,
  
  -- Zone configuration
  country_codes VARCHAR(2)[], -- ['LV', 'LT', 'EE']
  from_postal_code VARCHAR(20),
  to_postal_code VARCHAR(20),
  
  -- Pricing
  base_cost DECIMAL(10, 2) NOT NULL,
  free_shipping_threshold DECIMAL(10, 2),
  
  -- Weight-based pricing
  weight_from_kg DECIMAL(8, 3),
  weight_to_kg DECIMAL(8, 3),
  
  -- Dimensions
  max_length_cm INTEGER,
  max_width_cm INTEGER,
  max_height_cm INTEGER,
  
  -- Delivery estimate
  delivery_days_min INTEGER,
  delivery_days_max INTEGER,
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parcel lockers cache (for Omniva/DPD pickup points)
CREATE TABLE parcel_lockers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL,
  locker_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  hours TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, locker_id)
);

CREATE INDEX idx_parcel_lockers_provider ON parcel_lockers(provider, country_code);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'support')
  ));

-- Addresses: Own only
CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  USING (auth.uid() = user_id);

-- Carts: Own user or session
CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id = current_setting('app.session_id', true))
  );

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id = current_setting('app.session_id', true))
  );

CREATE POLICY "Users can insert cart"
  ON carts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can delete own cart"
  ON carts FOR DELETE
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id = current_setting('app.session_id', true))
  );

-- Cart items
CREATE POLICY "Users can manage own cart items"
  ON cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts 
      WHERE carts.id = cart_items.cart_id
      AND (carts.user_id = auth.uid() OR 
           (carts.user_id IS NULL AND carts.session_id = current_setting('app.session_id', true)))
    )
  );

-- Orders: Own or admin
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'support')
    )
  );

CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'service')
    )
  );

-- Order items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM user_roles 
             WHERE user_id = auth.uid() 
             AND role IN ('admin', 'super_admin', 'support')
           ))
    )
  );

-- Products: Public read
CREATE POLICY "Products are publicly viewable"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'service')
    )
  );

-- Categories: Public read
CREATE POLICY "Categories are publicly viewable"
  ON categories FOR SELECT
  USING (is_active = true);

-- User roles: Admin only
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  sequence_part TEXT;
  random_part TEXT;
BEGIN
  date_part := TO_CHAR(NEW.created_at, 'YYMMDD');
  random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  NEW.order_number := 'LGO-' || date_part || '-' || random_part;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Update cart totals when items change
CREATE OR REPLACE FUNCTION update_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE carts
  SET 
    subtotal = (
      SELECT COALESCE(SUM(line_total), 0) 
      FROM cart_items 
      WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    ),
    item_count = (
      SELECT COALESCE(SUM(quantity), 0) 
      FROM cart_items 
      WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    ),
    total = (
      SELECT COALESCE(SUM(line_total), 0) 
      FROM cart_items 
      WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    ) + shipping_cost - discount_amount,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cart_items_update
  AFTER INSERT OR UPDATE OR DELETE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_totals();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_addresses_updated
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_carts_updated
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_cart_items_updated
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Inventory tracking on order
CREATE OR REPLACE FUNCTION track_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Create inventory transactions for each order item
    INSERT INTO inventory_transactions (
      product_id, variant_id, type, quantity, 
      previous_quantity, new_quantity, reference_type, reference_id
    )
    SELECT 
      oi.product_id,
      oi.variant_id,
      'sale',
      -oi.quantity,
      p.stock_quantity,
      p.stock_quantity - oi.quantity,
      'order',
      NEW.id
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = NEW.id;
    
    -- Update product stock
    UPDATE products p
    SET stock_quantity = p.stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_inventory
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_inventory_on_order();

-- Merge guest cart on user signup
CREATE OR REPLACE FUNCTION merge_guest_cart()
RETURNS TRIGGER AS $$
DECLARE
  guest_cart_id UUID;
  user_cart_id UUID;
BEGIN
  -- Find guest cart by session
  SELECT id INTO guest_cart_id
  FROM carts
  WHERE session_id = current_setting('app.session_id', true)
  AND user_id IS NULL;
  
  IF guest_cart_id IS NOT NULL THEN
    -- Find or create user cart
    SELECT id INTO user_cart_id
    FROM carts
    WHERE user_id = NEW.id;
    
    IF user_cart_id IS NULL THEN
      -- Convert guest cart to user cart
      UPDATE carts
      SET user_id = NEW.id, session_id = NULL
      WHERE id = guest_cart_id;
    ELSE
      -- Merge items into existing user cart
      INSERT INTO cart_items (
        cart_id, product_id, variant_id, product_name, sku,
        unit_price, original_unit_price, quantity, custom_options
      )
      SELECT 
        user_cart_id, ci.product_id, ci.variant_id, ci.product_name, ci.sku,
        ci.unit_price, ci.original_unit_price, ci.quantity, ci.custom_options
      FROM cart_items ci
      WHERE ci.cart_id = guest_cart_id
      ON CONFLICT (cart_id, product_id, variant_id) DO UPDATE
      SET quantity = cart_items.quantity + EXCLUDED.quantity;
      
      -- Delete guest cart
      DELETE FROM carts WHERE id = guest_cart_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_merge_guest_cart
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION merge_guest_cart();

-- ============================================
-- SEED DATA
-- ============================================

-- Sample shipping rates for Baltics
INSERT INTO shipping_rates (
  name, carrier, service_code, country_codes, base_cost, 
  free_shipping_threshold, delivery_days_min, delivery_days_max
) VALUES
  ('Omniva Parcel Locker (Latvia)', 'omniva', 'parcel_locker', ARRAY['LV'], 3.50, 150.00, 1, 3),
  ('Omniva Courier (Latvia)', 'omniva', 'courier', ARRAY['LV'], 5.00, 150.00, 1, 2),
  ('Omniva Parcel Locker (Lithuania)', 'omniva', 'parcel_locker', ARRAY['LT'], 5.00, 200.00, 2, 4),
  ('Omniva Parcel Locker (Estonia)', 'omniva', 'parcel_locker', ARRAY['EE'], 5.00, 200.00, 2, 4),
  ('DPD Pickup (Baltics)', 'dpd', 'pickup', ARRAY['LV', 'LT', 'EE'], 4.50, 150.00, 1, 3),
  ('DPD Courier (Baltics)', 'dpd', 'courier', ARRAY['LV', 'LT', 'EE'], 6.00, 150.00, 1, 2),
  ('Latvijas Pasts (Latvia)', 'latvijas_pasts', 'standard', ARRAY['LV'], 3.00, 100.00, 2, 5),
  ('Local Pickup (Riga)', 'local_pickup', 'pickup', ARRAY['LV'], 0.00, NULL, 0, 0);

-- Create initial admin (replace with your email)
-- Run this after creating your account:
-- INSERT INTO user_roles (user_id, role) 
-- SELECT id, 'super_admin' FROM auth.users WHERE email = 'your-email@example.com';
