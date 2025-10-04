-- Create enum types
CREATE TYPE public.user_status AS ENUM ('active', 'pending', 'suspended');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.job_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE public.job_type AS ENUM ('code', 'image');
CREATE TYPE public.task_status AS ENUM ('pending', 'completed', 'approved', 'rejected');
CREATE TYPE public.transaction_type AS ENUM ('earning', 'withdrawal');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE public.payment_gateway_type AS ENUM ('upi', 'bank', 'wallet');
CREATE TYPE public.gateway_status AS ENUM ('active', 'inactive');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  balance DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  status user_status DEFAULT 'active',
  kyc_status kyc_status DEFAULT 'pending',
  completed_tasks INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Bronze',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create KYC details table
CREATE TABLE public.kyc_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  aadhar_number TEXT,
  pan_number TEXT,
  bank_account TEXT,
  ifsc_code TEXT,
  account_holder TEXT,
  documents TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type job_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  vacancy INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  status job_status DEFAULT 'active',
  requirements TEXT[],
  codes TEXT[],
  image_url TEXT,
  approval_required BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status task_status DEFAULT 'pending',
  submitted_code TEXT,
  submitted_image TEXT,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment gateways table
CREATE TABLE public.payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type payment_gateway_type NOT NULL,
  status gateway_status DEFAULT 'active',
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  method TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for KYC details
CREATE POLICY "Users can view their own KYC details" ON public.kyc_details
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own KYC details" ON public.kyc_details
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own KYC details" ON public.kyc_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for jobs
CREATE POLICY "Everyone can view active jobs" ON public.jobs
  FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage jobs" ON public.jobs
  FOR ALL USING (true); -- Will be updated when admin roles are implemented

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for payment gateways
CREATE POLICY "Everyone can view active payment gateways" ON public.payment_gateways
  FOR SELECT USING (status = 'active');

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_details_updated_at
  BEFORE UPDATE ON public.kyc_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample jobs
INSERT INTO public.jobs (title, description, category, type, amount, vacancy, requirements, codes, approval_required)
VALUES 
  (
    'Google Play Store App Review',
    'Download the app and give a 5-star review on Google Play Store',
    'App Review',
    'code',
    25.00,
    100,
    ARRAY['Android device', 'Google account'],
    ARRAY['GREV123', 'GREV124', 'GREV125', 'GREV126', 'GREV127'],
    false
  ),
  (
    'Instagram Post Engagement',
    'Like and comment on specific Instagram posts',
    'Social Media',
    'image',
    15.00,
    200,
    ARRAY['Instagram account with 100+ followers'],
    NULL,
    true
  ),
  (
    'Website Survey Completion',
    'Complete a detailed survey about shopping preferences',
    'Survey',
    'code',
    35.00,
    50,
    ARRAY['Valid email address'],
    ARRAY['SURV001', 'SURV002', 'SURV003', 'SURV004', 'SURV005'],
    false
  );

-- Insert sample payment gateways
INSERT INTO public.payment_gateways (name, type, config)
VALUES 
  ('Paytm', 'upi', '{"upi_id": "merchant@paytm"}'),
  ('PhonePe', 'upi', '{"upi_id": "merchant@phonepe"}'),
  ('HDFC Bank', 'bank', '{"account_number": "1234567890", "ifsc": "HDFC0001234"}'),
  ('Paytm Wallet', 'wallet', '{"wallet_id": "paytm_wallet_123"}');