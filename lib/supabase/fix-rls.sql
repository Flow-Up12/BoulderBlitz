-- Fix RLS policies for users table
-- Run this if you're getting "violates row-level security policy" errors

-- Make sure extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_insert_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;

-- Re-create policies with correct permissions
CREATE POLICY users_select_policy ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_insert_policy ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_update_policy ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Inform the user
DO $$
BEGIN
  RAISE NOTICE 'RLS policies for users table have been updated successfully.';
  RAISE NOTICE 'You should now be able to create user records in the public.users table.';
END $$; 