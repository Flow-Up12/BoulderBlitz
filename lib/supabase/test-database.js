import { supabase, ensureUserExists } from './client';

/**
 * Test script to check the database connection, schema, and data synchronization
 * Run this script to ensure everything is working properly
 */
const testDatabase = async () => {
  console.log('🔍 Running database tests...');
  
  try {
    // Check 1: Supabase connection
    console.log('\n✨ Test 1: Testing Supabase connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Connection test failed:', sessionError.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Check 2: Test tables exist
    console.log('\n✨ Test 2: Checking required tables...');
    const requiredTables = [
      'users',
      'game_states',
      'user_upgrades',
      'user_rocks',
      'user_achievements'
    ];
    
    for (const table of requiredTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error(`❌ Error checking table '${table}':`, error.message);
          return false;
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (error) {
        console.error(`❌ Unexpected error checking table '${table}':`, error.message);
        return false;
      }
    }
    
    // Check 3: User creation and linking
    console.log('\n✨ Test 3: Testing user account creation...');
    
    // Only run this if user is logged in
    if (sessionData?.session?.user) {
      const userId = sessionData.session.user.id;
      const userEmail = sessionData.session.user.email;
      
      console.log(`Using authenticated user: ${userId} (${userEmail})`);
      
      // Test user record creation
      const { success, error: userError } = await ensureUserExists(userId, userEmail);
      
      if (!success) {
        console.error('❌ Failed to ensure user exists in database:', userError);
        return false;
      }
      
      console.log('✅ User record created/verified successfully');
      
      // Test game state saving
      console.log('\n✨ Test 4: Testing game state saving...');
      
      // Try to get existing game state
      const { data: existingState, error: fetchError } = await supabase
        .from('game_states')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking existing game state:', fetchError);
        return false;
      }
      
      let saveSuccess = false;
      
      if (existingState) {
        // Update existing record
        console.log('Updating existing game state');
        const { error: updateError } = await supabase
          .from('game_states')
          .update({ 
            coins: 100,
            total_coins_earned: 150,
            cpc: 1,
            base_cpc: 1,
            total_clicks: 10,
            rebirths: 0,
            rebirth_tokens: 0,
            gold_coins: 0,
            last_saved: new Date().toISOString()
          })
          .eq('id', existingState.id);
        
        if (updateError) {
          console.error('❌ Error updating game state:', updateError);
          return false;
        } else {
          saveSuccess = true;
        }
      } else {
        // Insert new record
        console.log('Creating new game state record');
        const { error: insertError } = await supabase
          .from('game_states')
          .insert([{ 
            user_id: userId,
            coins: 100,
            total_coins_earned: 150,
            cpc: 1,
            base_cpc: 1,
            total_clicks: 10,
            rebirths: 0,
            rebirth_tokens: 0,
            gold_coins: 0,
            last_saved: new Date().toISOString()
          }]);
        
        if (insertError) {
          console.error('❌ Error inserting game state:', insertError);
          return false;
        } else {
          saveSuccess = true;
        }
      }
      
      if (saveSuccess) {
        console.log('✅ Game state saved successfully');
      }
      
      // Test game state loading
      console.log('\n✨ Test 5: Testing game state loading...');
      
      const { data: gameState, error: loadError } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (loadError) {
        console.error('❌ Error loading game state:', loadError);
        return false;
      }
      
      if (!gameState) {
        console.error('❌ Game state not found after saving');
        return false;
      }
      
      try {
        // Check that data was properly saved
        if (gameState.coins === 100 && gameState.total_clicks === 10) {
          console.log('✅ Game state loaded successfully with correct data');
        } else {
          console.error('❌ Loaded game state does not match saved game state');
          console.log('Expected coins: 100, total_clicks: 10');
          console.log('Got coins:', gameState.coins, 'total_clicks:', gameState.total_clicks);
          return false;
        }
      } catch (e) {
        console.error('❌ Error checking game state data:', e);
        return false;
      }
    } else {
      console.log('⚠️ Skipping user tests - no authenticated user found');
      console.log('Please sign in to test all features');
    }
    
    console.log('\n✅ All database tests passed successfully!');
    console.log('Your database is properly set up and working.');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during database tests:', error);
    return false;
  }
};

export default testDatabase; 