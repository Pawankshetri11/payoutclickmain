-- Remove ticket system and add FAQ system

-- Drop ticket tables if they exist
DROP TABLE IF EXISTS public.ticket_replies CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;

-- Create FAQ categories and items table
CREATE TABLE IF NOT EXISTS public.faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.faq_categories(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQ categories (public read, admin write)
CREATE POLICY "Anyone can view FAQ categories"
  ON public.faq_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage FAQ categories"
  ON public.faq_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for FAQs (public read published, admin write)
CREATE POLICY "Anyone can view published FAQs"
  ON public.faqs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage FAQs"
  ON public.faqs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Update site_content to include support page links
INSERT INTO public.site_content (page_key, content, updated_by)
VALUES (
  'support_links',
  jsonb_build_object(
    'telegram_community', 'https://t.me/YourCommunity',
    'privacy_policy', '/privacy-policy',
    'terms_of_service', '/terms-of-service',
    'refund_policy', '/refund-policy'
  ),
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)
)
ON CONFLICT (page_key) DO UPDATE
SET content = EXCLUDED.content;

-- Insert default FAQ categories
INSERT INTO public.faq_categories (name, slug, display_order) VALUES
  ('Getting Started', 'getting-started', 1),
  ('Tasks & Earnings', 'tasks-earnings', 2),
  ('Payments & Withdrawals', 'payments-withdrawals', 3),
  ('Account & KYC', 'account-kyc', 4),
  ('Technical Support', 'technical-support', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert some default FAQs
INSERT INTO public.faqs (category_id, question, answer, display_order, is_published)
SELECT 
  (SELECT id FROM public.faq_categories WHERE slug = 'getting-started'),
  'How do I get started?',
  'Sign up for an account, complete your KYC verification, and start browsing available tasks.',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.faqs LIMIT 1);

INSERT INTO public.faqs (category_id, question, answer, display_order, is_published)
SELECT 
  (SELECT id FROM public.faq_categories WHERE slug = 'tasks-earnings'),
  'How do I earn money?',
  'Complete available tasks and submit proof of completion. Once approved by admin, earnings will be added to your account.',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE question = 'How do I earn money?');

INSERT INTO public.faqs (category_id, question, answer, display_order, is_published)
SELECT 
  (SELECT id FROM public.faq_categories WHERE slug = 'payments-withdrawals'),
  'How do I withdraw my earnings?',
  'Once you meet the minimum withdrawal amount, go to Withdrawal Request page, add your payment method, and submit a withdrawal request.',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE question = 'How do I withdraw my earnings?');
