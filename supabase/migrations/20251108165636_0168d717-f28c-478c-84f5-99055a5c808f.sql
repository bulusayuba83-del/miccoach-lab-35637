-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  balance DECIMAL(15, 2) DEFAULT 0 NOT NULL,
  total_invested DECIMAL(15, 2) DEFAULT 0 NOT NULL,
  total_profit DECIMAL(15, 2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_roles table (CRITICAL for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create trading_plans table
CREATE TABLE public.trading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
  daily_return_min DECIMAL(5, 2) NOT NULL,
  daily_return_max DECIMAL(5, 2) NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true NOT NULL,
  theme_colors JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.trading_plans(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  total_earned DECIMAL(15, 2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'profit', 'investment')),
  amount DECIMAL(15, 2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  payment_method TEXT,
  payment_details JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create daily_profits table
CREATE TABLE public.daily_profits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_profits ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking (CRITICAL)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for trading_plans table
CREATE POLICY "Anyone can view active trading plans"
  ON public.trading_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage trading plans"
  ON public.trading_plans FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deposit and withdrawal requests"
  ON public.transactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND type IN ('deposit', 'withdrawal')
  );

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all transactions"
  ON public.transactions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for daily_profits table
CREATE POLICY "Users can view their own profits"
  ON public.daily_profits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profits"
  ON public.daily_profits FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create profits"
  ON public.daily_profits FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  
  -- Assign client role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_plans_updated_at
  BEFORE UPDATE ON public.trading_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default trading plans with tier styling
INSERT INTO public.trading_plans (name, amount, tier, daily_return_min, daily_return_max, duration_days, features, theme_colors) VALUES
  ('Bronze Starter', 100, 'Bronze', 1.5, 2.5, 30, 
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "Basic Support", "Daily Reports"]'::jsonb,
   '{"primary": "#CD7F32", "secondary": "#8B4513", "glow": "#CD7F3260"}'::jsonb),
  
  ('Bronze Plus', 200, 'Bronze', 1.8, 2.8, 30,
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "Priority Support", "Daily Reports", "Weekly Analysis"]'::jsonb,
   '{"primary": "#CD7F32", "secondary": "#8B4513", "glow": "#CD7F3260"}'::jsonb),
  
  ('Bronze Pro', 300, 'Bronze', 2.0, 3.0, 30,
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "Priority Support", "Daily Reports", "Weekly Analysis", "Risk Management"]'::jsonb,
   '{"primary": "#CD7F32", "secondary": "#8B4513", "glow": "#CD7F3260"}'::jsonb),
  
  ('Silver Basic', 500, 'Silver', 2.2, 3.2, 30,
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "Premium Support", "Daily Reports", "Weekly Analysis", "Risk Management", "Market Insights"]'::jsonb,
   '{"primary": "#C0C0C0", "secondary": "#A8A8A8", "glow": "#C0C0C080"}'::jsonb),
  
  ('Silver Advanced', 1000, 'Silver', 2.5, 3.5, 30,
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "Premium Support", "Daily Reports", "Weekly Analysis", "Advanced Risk Management", "Market Insights", "Technical Analysis"]'::jsonb,
   '{"primary": "#C0C0C0", "secondary": "#A8A8A8", "glow": "#C0C0C080"}'::jsonb),
  
  ('Gold Standard', 1500, 'Gold', 2.8, 4.0, 30,
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "VIP Support", "Real-time Reports", "Daily Analysis", "Advanced Risk Management", "Market Insights", "Technical Analysis", "Portfolio Tracking"]'::jsonb,
   '{"primary": "#FFD700", "secondary": "#FFA500", "glow": "#FFD700A0"}'::jsonb),
  
  ('Gold Premium', 2000, 'Gold', 3.0, 4.2, 30,
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "VIP Support", "Real-time Reports", "Daily Analysis", "Advanced Risk Management", "Market Insights", "Advanced Technical Analysis", "Portfolio Tracking", "Custom Alerts"]'::jsonb,
   '{"primary": "#FFD700", "secondary": "#FFA500", "glow": "#FFD700A0"}'::jsonb),
  
  ('Platinum Elite', 3000, 'Platinum', 3.2, 4.5, 30,
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "Dedicated Support", "Real-time Reports", "Daily Analysis", "Premium Risk Management", "Advanced Market Insights", "Expert Technical Analysis", "Portfolio Tracking", "Custom Alerts", "API Access"]'::jsonb,
   '{"primary": "#E5E4E2", "secondary": "#B9F2FF", "glow": "#B9F2FFC0"}'::jsonb),
  
  ('Platinum Ultimate', 4000, 'Platinum', 3.5, 4.8, 30,
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "Dedicated Support", "Real-time Reports", "Daily Analysis", "Premium Risk Management", "Advanced Market Insights", "Expert Technical Analysis", "Portfolio Tracking", "Custom Alerts", "API Access", "Strategy Customization"]'::jsonb,
   '{"primary": "#E5E4E2", "secondary": "#B9F2FF", "glow": "#B9F2FFC0"}'::jsonb),
  
  ('Diamond Exclusive', 5000, 'Diamond', 4.0, 5.5, 30,
   '["Automated Bitcoin Trading", "24/7 Trading Bot", "Personal Account Manager", "Real-time Reports", "Daily Analysis", "Elite Risk Management", "Premium Market Insights", "Expert Technical Analysis", "Advanced Portfolio Tracking", "Custom Alerts", "Full API Access", "Strategy Customization", "Priority Withdrawals", "Exclusive Trading Signals"]'::jsonb,
   '{"primary": "#B9F2FF", "secondary": "#4169E1", "glow": "#B9F2FFE0"}'::jsonb);