-- ====================================================
-- DATABASE CLEANUP SCRIPT
-- Run this in Supabase SQL Editor to delete all dummy data
-- ====================================================

-- Delete all existing job categories
DELETE FROM job_categories;

-- Delete all existing jobs
DELETE FROM jobs;

-- Reset sequences if needed
-- (Optional: This ensures IDs start fresh)

-- Note: This will remove ALL categories and jobs from the database
-- Make sure to backup any data you want to keep before running this script
