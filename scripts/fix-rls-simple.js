#!/usr/bin/env node

/**
 * Simple script that explains how to fix RLS policy issues
 * Run this with `node scripts/fix-rls-simple.js`
 */

console.log('🔧 Supabase RLS Policy Fix Helper');
console.log('=================================');
console.log('\nIf you\'re seeing the error:');
console.log('"new row violates row-level security policy for table "users""\n');

console.log('This is because the Row Level Security (RLS) policies in Supabase');
console.log('don\'t allow the user to create their own record in the users table.\n');

console.log('To fix this issue, follow these steps:');
console.log('1. Go to https://app.supabase.com and select your project');
console.log('2. Go to "SQL Editor" in the left sidebar');
console.log('3. Click "New Query"');
console.log('4. Copy and paste the following SQL:\n');

console.log(`-- Fix RLS policies for users table
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
  WITH CHECK (auth.uid() = id);`);

console.log('\n5. Click "Run" to execute all the statements');
console.log('6. Return to your app and try again\n');

console.log('After following these steps, the RLS policies should be fixed,');
console.log('and you should be able to create your user record successfully.\n');

console.log('If you continue to have issues, please check the Supabase dashboard');
console.log('under "Authentication" -> "Policies" to verify that the policies were created.');
console.log('You might need to contact Supabase support if the issue persists.\n');

console.log('Learn more about RLS policies at:');
console.log('https://supabase.com/docs/guides/auth/row-level-security');

process.exit(0); 