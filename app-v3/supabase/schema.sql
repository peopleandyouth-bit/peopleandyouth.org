-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Sequence for Founding Member IDs
CREATE SEQUENCE IF NOT EXISTS member_id_seq START WITH 1;

-- Profiles & Memberships Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'think_tank_scholar')),
  
  -- Membership Metadata
  is_founding_member BOOLEAN DEFAULT FALSE,
  membership_id TEXT UNIQUE,
  dissent_card_verified BOOLEAN DEFAULT FALSE,
  
  -- Razorpay Payment Tracking
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  amount_paid NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger Function: Auto-generate custom Membership ID (PY-2026-FOUNDER-001)
CREATE OR REPLACE FUNCTION generate_member_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_founding_member = TRUE AND NEW.membership_id IS NULL THEN
    NEW.membership_id := 'PY-2026-FOUNDER-' || LPAD(nextval('member_id_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_generate_member_id
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_member_id();

-- Trigger Function: Auto-create profile row when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Public read access for verified Dissent Cards" 
  ON public.profiles FOR SELECT 
  USING (dissent_card_verified = TRUE);