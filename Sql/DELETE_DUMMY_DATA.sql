-- ====================================================
-- DELETE ALL DUMMY DATA FROM DATABASE
-- Run this in Supabase SQL Editor
-- ====================================================

-- Delete all existing jobs (including the 3 dummy jobs)
DELETE FROM public.jobs;

-- Delete all existing job categories (including the 8 default ones)
DELETE FROM public.job_categories;

-- Note: This will permanently delete:
-- Jobs: "Google Play Store App Review", "Instagram Post Engagement", "Website Survey Completion"
-- Categories: All 8 categories (Reviews, App Install, Website Survey, Game Tasks, Social Media, Photography, Data Entry, General)

-- After running this, your database will be clean and ready for you to add real data through the admin panel
