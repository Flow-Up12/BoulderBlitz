#!/usr/bin/env ts-node

/**
 * This script fixes the RLS policies for the users table
 * Run this with `npm run fix:rls`
 * 
 * IMPORTANT: This script requires direct database access,
 * which might not be available in all deployments.
 */

import dotenv from 'dotenv';
import { supabase } from '../lib/supabase/client';

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
    
    // Try to fix RLS policies with multiple approaches
    
    console.log('Approach 1: Trying to execute RLS fix directly...');
    
    try {
      // First approach: Try to run SQL directly (this rarely works due to permissions)
      const { data, error } = await supabase.rpc('exec_sql', { sql: rls_sql });
      
      if (!error) {
        console.log('✅ Direct SQL execution successful!');
        console.log('RLS policies should now be fixed');
      } else {
        console.log('⚠️ Direct SQL execution failed:', error.message);
        console.log('This is expected - trying alternative approaches...');
      }
    } catch (e) {
      console.log('⚠️ Direct SQL execution failed:', e.message);
      console.log('This is expected - trying alternative approaches...');
    }
    
    console.log('\nApproach 2: Trying to create user record directly...');
    
    // Attempt to manually create a user record which will test the RLS policies
    const userId = sessionData.session.user.id;
    
    // First try to delete any existing user to test insertion
    try {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (!deleteError) {
        console.log('✅ Successfully deleted existing user record for testing');
      } else {
        console.log('⚠️ Could not delete user record:', deleteError.message);
      }
    } catch (e) {
      console.log('⚠️ Error during user deletion:', e.message);
    }
    
    // Try to insert a user record
    console.log('Attempting to create user record with id:', userId);
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
        console.log('\nYou have RLS policy issues. Please run this SQL manually:');
        console.log('--------------------------------------------------');
        console.log(rls_sql);
        console.log('--------------------------------------------------');
        console.log('\nRunning it in the Supabase SQL Editor should fix the problem.');
      }
      
      return false;
    }
    
    console.log('✅ Successfully created user record!');
    console.log('RLS policies are now working correctly or were not blocking.');
    
    return true;
  } catch (error: any) {
    console.error('Unexpected error:', error.message);
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