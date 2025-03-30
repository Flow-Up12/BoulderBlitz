#!/usr/bin/env node

/**
 * This script fixes the RLS policies for the users table
 * Run this with `node scripts/fix-supabase-rls.js`
 * 
 * IMPORTANT: This script requires direct database access,
 * which might not be available in all deployments.
 */

import dotenv from 'dotenv';
import { supabase } from '../lib/supabase/client.ts';

// Initialize dotenv to load environment variables
dotenv.config();

console.log('🔧 Fixing Supabase RLS policies...');

async function fixRlsPolicies() {
  try {
    // Check if user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError.message);
      return false;
    }
    
    if (!sessionData.session) {
      console.log('No user is currently authenticated. Please login first.');
      return false;
    }
    
    console.log('Authenticated as user:', sessionData.session.user.id);
    console.log('Attempting to update RLS policies...');
    
    // SQL to fix RLS policies
    const rls_sql = `
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
    `;
    
    // Execute SQL using Supabase's rpc function
    const { error } = await supabase.rpc('exec_sql', { sql: rls_sql });
    
    if (error) {
      // If we can't run exec_sql, try to do it using multiple statements
      console.error('Error executing RLS fix script:', error.message);
      console.log('The RPC method is not available. Please run the SQL manually in the Supabase SQL Editor.');
      
      console.log('\nCopy and paste this SQL into the Supabase SQL Editor:');
      console.log('--------------------------------------------------');
      console.log(rls_sql);
      console.log('--------------------------------------------------');
      
      return false;
    }
    
    console.log('✅ RLS policies updated successfully!');
    
    // Now test if we can create a user
    console.log('\nTesting user record creation...');
    
    const userId = sessionData.session.user.id;
    
    // First delete any existing user to test insertion
    try {
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      console.log('Deleted existing user record for testing...');
    } catch (deleteError) {
      console.log('No existing user to delete or delete failed:', deleteError.message);
    }
    
    // Try to insert a user record
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ 
        id: userId, 
        username: 'test_user',
        email: sessionData.session.user.email,
        created_at: new Date().toISOString()
      }]);
    
    if (insertError) {
      console.error('❌ Failed to create user record:', insertError.message);
      
      if (insertError.code === '42501') {
        console.log('\nYou still have RLS issues. Please try the following:');
        console.log('1. Go to Supabase dashboard');
        console.log('2. Go to "Authentication" -> "Policies"');
        console.log('3. Make sure the "users" table has an INSERT policy that allows auth.uid() = id');
      }
      
      return false;
    }
    
    console.log('✅ Successfully created user record!');
    console.log('RLS policies are now working correctly.');
    
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

fixRlsPolicies()
  .then(success => {
    if (success) {
      console.log('\n✅ RLS fix completed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ RLS fix failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Unexpected error in fix script:', error);
    process.exit(1);
  }); 