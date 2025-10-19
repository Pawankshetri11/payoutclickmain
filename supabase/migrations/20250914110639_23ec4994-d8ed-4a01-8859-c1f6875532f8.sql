-- Fix function search path security warnings by dropping all dependent triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_kyc_details_updated_at ON public.kyc_details;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
DROP TRIGGER IF EXISTS update_payment_gateways_updated_at ON public.payment_gateways;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;

-- Now drop the functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate functions with proper search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate all triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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