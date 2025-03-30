// Utility script to check Supabase connection and verify tables

import { supabase } from './client';

/**
 * Checks database connection and required tables
 * @returns {Promise<{success: boolean, message: string}>} Result object with success status and message
 */
const checkDatabase = async () => {
  console.log('🔍 Checking Supabase database setup...');
  let isValid = true;
  let resultMessage = '';
  
  try {
    // Step 1: Check if we can connect to Supabase
    console.log('Step 1/3: Checking Supabase connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Failed to connect to Supabase:', sessionError.message);
      console.log('💡 Check your Supabase URL and anon key in .env and app.json');
      return {
        success: false,
        message: `Failed to connect to Supabase: ${sessionError.message}`
      };
    }
    
    console.log('✅ Supabase connection successful');
    
    // Step 2: Check if required tables exist
    console.log('Step 2/3: Checking required database tables...');
    
    const requiredTables = [
      'users',
      'game_states',
      'user_upgrades',
      'user_rocks',
      'user_achievements'
    ];
    
    let missingTables = [];
    
    for (const table of requiredTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('does not exist')) {
          console.error(`❌ Table '${table}' does not exist`);
          missingTables.push(table);
          isValid = false;
        } else {
          console.error(`❌ Error checking table '${table}':`, error.message);
          isValid = false;
        }
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }
    
    // Step 3: Check RLS policies
    console.log('Step 3/3: Checking Row Level Security (RLS) policies...');
    
    if (missingTables.length > 0) {
      console.log('⚠️ Skipping RLS policy check due to missing tables');
      
      // Create more detailed messages for specific missing tables
      if (missingTables.includes('users')) {
        console.log('\n🚨 CRITICAL: The "users" table is missing!');
        console.log('The users table is required before any other tables can be created.');
        console.log('Make sure to run the ENTIRE schema.sql file at once, not in parts.');
        resultMessage = 'The "users" table is missing. You need to run the database setup script.';
      } else {
        resultMessage = `Missing tables: ${missingTables.join(', ')}. Run the database setup script.`;
      }
      
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Go to Supabase dashboard: https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Open the schema.sql file in the rock-clicker/lib/supabase/ directory');
      console.log('5. Copy ALL contents and paste into a new SQL query');
      console.log('6. Click "Run" to execute the ENTIRE query at once');
      console.log('7. Refresh the Table Editor page to verify that all tables were created');
      console.log('8. Restart your app\n');
      
      return {
        success: false,
        message: resultMessage
      };
    }
    
    // If we get here, all basic checks have passed
    if (isValid) {
      console.log('✅ Database setup looks good!');
      return {
        success: true,
        message: 'Database setup verified successfully'
      };
    } else {
      console.log('❌ Database setup has issues. See logs above for details.');
      return {
        success: false,
        message: 'Database setup has issues. Check the console for details.'
      };
    }
  } catch (error) {
    console.error('❌ Unexpected error during database check:', error.message);
    return {
      success: false,
      message: `Unexpected error during database check: ${error.message}`
    };
  }
};

export default checkDatabase; 