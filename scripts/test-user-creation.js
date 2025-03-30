#!/usr/bin/env node

/**
 * This script tests the user creation process directly
 * Run this with `node scripts/test-user-creation.js`
 */

import dotenv from 'dotenv';
import { supabase, ensureUserExists } from '../lib/supabase/client.js';

// Initialize dotenv to load environment variables
dotenv.config();

console.log('Testing user creation directly...');

async function testUserCreation() {
  try {
    // First, check if user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError.message);
      return false;
    }
    
    if (!sessionData.session) {
      console.log('No user is currently authenticated. Please login first.');
      return false;
    }
    
    const userId = sessionData.session.user.id;
    const userEmail = sessionData.session.user.email;
    
    console.log(`Using authenticated user: ${userId} (${userEmail})`);
    
    // First check if user exists
    console.log('Checking if user exists in database...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking if user exists:', checkError);
    } else if (existingUser) {
      console.log('User already exists in the database. Deleting for test...');
      
      // Delete existing user for testing
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        return false;
      }
      
      console.log('User successfully deleted.');
    } else {
      console.log('User does not exist in database.');
    }
    
    // Now try to create user
    console.log('\nTesting user creation with ensureUserExists function...');
    const { success, error } = await ensureUserExists(userId, userEmail);
    
    if (!success) {
      console.error('Failed to create user:', error);
      return false;
    }
    
    console.log('User creation test passed!');
    
    // Verify user exists
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (verifyError) {
      console.error('Error verifying user creation:', verifyError);
      return false;
    }
    
    console.log('User verification successful!');
    console.log('User record:', verifyUser);
    
    return true;
  } catch (error) {
    console.error('Unexpected error in test:', error);
    return false;
  }
}

testUserCreation()
  .then(success => {
    if (success) {
      console.log('\n✅ User creation test passed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ User creation test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Unexpected error in test script:', error);
    process.exit(1);
  }); 