-- ====================================================
-- FIX TASKS RLS FOR ADMIN VISIBILITY
-- Run this in your SQL editor
-- Requires: public.user_roles table and public.is_admin(uuid) function
-- ====================================================

-- Ensure RLS is enabled
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing admin policy if present
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.tasks;

-- Users keep their own access
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;

CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view and manage ALL tasks
CREATE POLICY "Admins can manage all tasks"
  ON public.tasks FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Helpful indexes (safe if they already exist)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_job_id ON public.tasks(job_id);
