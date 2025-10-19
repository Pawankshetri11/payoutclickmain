-- =====================================================
-- DATABASE UPDATE FOR JOBS AND TICKETS SYSTEM
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ADD SUBMISSION LIMIT TO JOBS TABLE
-- =====================================================

ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS submission_limit_per_user INTEGER DEFAULT 1;

COMMENT ON COLUMN public.jobs.submission_limit_per_user IS 'Maximum number of times a single user can submit this job. 1 = single submission, >1 = multiple submissions allowed';

-- =====================================================
-- 2. CREATE TICKETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.tickets;

-- RLS Policies for tickets
CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
  ON public.tickets FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all tickets"
  ON public.tickets FOR ALL
  USING (public.is_admin(auth.uid()));

-- =====================================================
-- 3. CREATE TICKET REPLIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on ticket_replies
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view replies for their tickets" ON public.ticket_replies;
DROP POLICY IF EXISTS "Users can create replies to their tickets" ON public.ticket_replies;
DROP POLICY IF EXISTS "Admins can view all replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Admins can create replies" ON public.ticket_replies;

-- RLS Policies for ticket_replies
CREATE POLICY "Users can view replies for their tickets"
  ON public.ticket_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_replies.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create replies to their tickets"
  ON public.ticket_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_replies.ticket_id
      AND tickets.user_id = auth.uid()
    )
    AND user_id = auth.uid()
    AND is_admin = FALSE
  );

CREATE POLICY "Admins can view all replies"
  ON public.ticket_replies FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create replies"
  ON public.ticket_replies FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- =====================================================
-- 4. CREATE SITE CONTENT TABLE FOR SUPPORT PAGE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on site_content
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;

-- RLS Policies for site_content
CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL
  USING (public.is_admin(auth.uid()));

-- Insert default support page content
INSERT INTO public.site_content (page_key, content)
VALUES (
  'support_page',
  '{
    "email": "support@example.com",
    "phone": "+91 98765 43210",
    "telegram": "@YourSupportBot",
    "telegram_link": "https://t.me/YourSupportBot"
  }'::jsonb
)
ON CONFLICT (page_key) DO NOTHING;

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON public.ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_user_id ON public.ticket_replies(user_id);

-- =====================================================
-- 6. CREATE FUNCTION TO UPDATE TICKET UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_ticket_timestamp ON public.tickets;

-- Create trigger
CREATE TRIGGER update_ticket_timestamp
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ticket_timestamp();

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
