-- REVIEWED PROPOSAL: fresh-project auth/catalog baseline ONLY.
-- Execute through SQL Editor or a direct privileged PostgreSQL connection.
-- Supabase publishable/secret REST keys CANNOT apply SQL migrations.
-- Intentionally refuses to overwrite existing tables. Do not run old competing
-- scripts or `supabase db push` (older commerce migration remains historical).
-- Does not enable checkout, guest carts, orders, payments, or admin provisioning.
BEGIN;
SET LOCAL search_path = public, pg_catalog;


CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name TEXT,
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

CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  show_in_navigation BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
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
  
  -- Compatibility aliases for the current cart/products API. Sanity sync writes
  -- canonical localized fields; aliases cannot be written independently.
  name TEXT GENERATED ALWAYS AS (name_lv) STORED,
  description TEXT GENERATED ALWAYS AS (description_lv) STORED,
  price NUMERIC(10,2) GENERATED ALWAYS AS (coalesce(sale_price, base_price)) STORED,
  compare_at_price NUMERIC(10,2) GENERATED ALWAYS AS (case when sale_price is not null then base_price else null end) STORED,
  image TEXT GENERATED ALWAYS AS (featured_image) STORED,
  dimensions JSONB GENERATED ALWAYS AS (dimensions_cm) STORED,
  is_available BOOLEAN GENERATED ALWAYS AS (status = 'active') STORED,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  category TEXT,
  CONSTRAINT lago_product_price_valid CHECK (base_price >= 0 and (sale_price is null or sale_price >= 0)),
  CONSTRAINT lago_product_stock_valid CHECK (stock_quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.profiles, public.addresses, public.categories, public.products FROM anon, authenticated;
GRANT SELECT ON public.categories, public.products TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
-- Prevent clients from changing id/email or introducing authority fields.
GRANT UPDATE (full_name, first_name, last_name, phone, preferred_language,
  avatar_url, email_notifications, sms_notifications, updated_at) ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.profiles, public.addresses, public.categories, public.products TO service_role;

CREATE POLICY lago_profiles_own_read ON public.profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY lago_profiles_own_update ON public.profiles FOR UPDATE TO authenticated
 USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY lago_addresses_own ON public.addresses FOR ALL TO authenticated
 USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY lago_categories_public ON public.categories FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY lago_products_public ON public.products FOR SELECT TO anon, authenticated USING (status = 'active');

CREATE FUNCTION public.lago_profile_on_signup() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 INSERT INTO public.profiles (id, email, full_name)
 VALUES (new.id, coalesce(new.email, ''), new.raw_user_meta_data ->> 'full_name');
 RETURN new;
END;
$$;
REVOKE ALL ON FUNCTION public.lago_profile_on_signup() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER lago_profile_after_signup AFTER INSERT ON auth.users
 FOR EACH ROW EXECUTE FUNCTION public.lago_profile_on_signup();

CREATE FUNCTION public.lago_touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
REVOKE ALL ON FUNCTION public.lago_touch_updated_at() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER lago_profile_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.lago_touch_updated_at();
CREATE TRIGGER lago_address_touch BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.lago_touch_updated_at();
CREATE TRIGGER lago_category_touch BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.lago_touch_updated_at();
CREATE TRIGGER lago_product_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.lago_touch_updated_at();
CREATE UNIQUE INDEX lago_default_address ON public.addresses(user_id, type) WHERE is_default;
CREATE INDEX lago_products_category ON public.products(category_id);
NOTIFY pgrst, 'reload schema';
COMMIT;
