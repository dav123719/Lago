-- ===================================
-- LAGO E-commerce Database Schema
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- Categories Table
-- ===================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name JSONB NOT NULL,
  description JSONB,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_in_navigation BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ===================================
-- Products Table
-- ===================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_ru TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  image TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT NOT NULL UNIQUE,
  category TEXT,
  weight_kg DECIMAL(8, 2),
  dimensions JSONB,
  is_available BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);

-- ===================================
-- Carts Table
-- ===================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_session_id TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_guest_session ON carts(guest_session_id);
CREATE INDEX idx_carts_status ON carts(status);

-- ===================================
-- Cart Items Table
-- ===================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Create indexes
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- ===================================
-- Orders Table
-- ===================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_session_id TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled')),
  shipping_address JSONB NOT NULL,
  shipping_method TEXT NOT NULL,
  shipping_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  notes TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_orders_guest_session ON orders(guest_session_id);

-- ===================================
-- Order Items Table
-- ===================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  product_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ===================================
-- Checkout Sessions Table
-- ===================================
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  stripe_session_id TEXT NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  shipping_address JSONB NOT NULL,
  shipping_method JSONB NOT NULL,
  shipping_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_checkout_sessions_cart_id ON checkout_sessions(cart_id);
CREATE INDEX idx_checkout_sessions_stripe_session ON checkout_sessions(stripe_session_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);

-- ===================================
-- Functions
-- ===================================

-- Decrement product stock
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - quantity,
      updated_at = NOW()
  WHERE id = product_id AND stock_quantity >= quantity;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkout_sessions_updated_at BEFORE UPDATE ON checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- Row Level Security (RLS) Policies
-- ===================================

-- Enable RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Carts policies
CREATE POLICY "Users can view their own carts" ON carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own carts" ON carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carts" ON carts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own carts" ON carts
  FOR DELETE USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can view their cart items" ON cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their cart items" ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    )
  );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- ===================================
-- Realtime Subscriptions
-- ===================================

-- Enable realtime for cart items
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;

-- ===================================
-- Example Categories
-- ===================================

INSERT INTO categories (id, slug, name, description, sort_order, is_active, show_in_navigation)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'furniture', 
   '{"lv": "Mēbeles", "en": "Furniture", "ru": "Мебель"}',
   '{"lv": "Kvalitatīvas virtuves un vannasistabas mēbeles", "en": "High-quality kitchen and bathroom furniture", "ru": "Качественная мебель для кухни и ванной"}',
   1, true, true),
  ('22222222-2222-2222-2222-222222222222', 'materials', 
   '{"lv": "Materiāli", "en": "Materials", "ru": "Материалы"}',
   '{"lv": "Silestone, Dekton un citi virsmas materiāli", "en": "Silestone, Dekton and other surface materials", "ru": "Сайлстоун, Дектон и другие материалы для поверхностей"}',
   2, true, true),
  ('33333333-3333-3333-3333-333333333333', 'kitchens', 
   '{"lv": "Virtuves", "en": "Kitchens", "ru": "Кухни"}',
   '{"lv": "Modernas virtuves iekārtas", "en": "Modern kitchen furniture", "ru": "Современная кухонная мебель"}',
   3, true, true),
  ('44444444-4444-4444-4444-444444444444', 'bathrooms', 
   '{"lv": "Vannasistabas", "en": "Bathrooms", "ru": "Ванные комнаты"}',
   '{"lv": "Elegantas vannasistabas mēbeles", "en": "Elegant bathroom furniture", "ru": "Элегантная мебель для ванной"}',
   4, true, true)
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- Example Products
-- ===================================

INSERT INTO products (id, name, name_en, name_ru, slug, description, price, compare_at_price, image, stock_quantity, sku, category, is_available, weight_kg, dimensions, metadata)
VALUES 
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Modernā virtuves virsma Silestone',
    'Modern Kitchen Countertop Silestone',
    'Современная кухонная столешница Silestone',
    'moderna-virtuves-virsma-silestone',
    'Eleganta virtuves virsma no Silestone materiāla. Izturīga pret skrāpējumiem un karstumu.',
    899.00,
    1099.00,
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    15,
    'LAGO-SILL-001',
    'materials',
    true,
    45.5,
    '{"length": 240, "width": 60, "height": 3}',
    '{"material": "silestone", "finish": "polished", "origin": "spain"}'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Virtuves sala ar uzglabāšanu',
    'Kitchen Island with Storage',
    'Кухонный остров с хранением',
    'virtuves-sala-ar-uzglabasana',
    'Funkcionāla virtuves sala ar integrētu uzglabāšanu un modernu dizainu.',
    2499.00,
    2899.00,
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    8,
    'LAGO-ISL-001',
    'furniture',
    true,
    120.0,
    '{"length": 180, "width": 90, "height": 90}',
    '{"material": "oak", "finish": "matte", "color": "white"}'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Dekton āra virtuves virsma',
    'Dekton Outdoor Kitchen Countertop',
    'Кухонная столешница Dekton для улицы',
    'dekton-ara-virtuves-virsma',
    'UV un laika apstākļu izturīga virsma, ideāli piemērota āra virtuvei.',
    1299.00,
    1499.00,
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    10,
    'LAGO-DEKT-001',
    'materials',
    true,
    52.0,
    '{"length": 260, "width": 65, "height": 2}',
    '{"material": "dekton", "finish": "matte", "uv_resistant": true}'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Minimalistiskā vannasistabas izlietne',
    'Minimalist Bathroom Sink',
    'Минималистичная раковина для ванной',
    'minimalistiska-vannasistabas-izlietne',
    'Tīras līnijas un moderns dizains. Izgatavots no kvalitatīva akmens masas materiāla.',
    599.00,
    749.00,
    'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=800',
    20,
    'LAGO-SINK-001',
    'furniture',
    true,
    25.0,
    '{"length": 80, "width": 45, "height": 15}',
    '{"material": "stone_resin", "finish": "matte", "color": "white"}'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Pilnībā iebūvēta virtuves iekārta',
    'Fully Fitted Kitchen Unit',
    'Полностью встроенная кухонная мебель',
    'pilniba-iebuvejama-virtuves-iekarta',
    'Pilnīgs virtuves risinājums ar iebūvētu tehniku, skapīšiem un darba virsmām.',
    5499.00,
    6299.00,
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    3,
    'LAGO-KIT-001',
    'kitchens',
    true,
    350.0,
    '{"length": 360, "width": 240, "height": 210}',
    '{"style": "modern", "appliances_included": true, "warranty_years": 5}'
  )
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- Enable RLS for products table (allow public read)
-- ===================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT USING (true);
