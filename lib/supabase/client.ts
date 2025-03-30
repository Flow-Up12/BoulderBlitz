import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Supabase URL and anonymous key from environment variables or app.json
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey =  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing. Please check your environment variables or app.json');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Subscribe to auth state changes
 * @param callback Function to call when auth state changes
 * @returns Function to unsubscribe
 */
export const subscribeToAuthChanges = (callback: (event: string, session: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Ensures that a user exists in the public.users table
 * @param userId The user's UUID from auth.users
 * @param email Optional email address
 * @returns Object with success flag and any error
 */
export const ensureUserExists = async (userId: string, email?: string) => {
  try {
    // First check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors if no user found
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if user exists:', checkError);
      return { success: false, error: checkError };
    }
    
    // If user doesn't exist, create one
    if (!existingUser) {
      console.log('User not found, creating new user record...');
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ 
          id: userId, 
          email: email || null,
          created_at: new Date().toISOString()
        }]);
      
      if (insertError) {
        console.error('Error creating user:', insertError);
        return { success: false, error: insertError };
      }
      
      console.log('Successfully created user in database');
    } else {
      console.log('User already exists in database');
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Exception in ensureUserExists:', error.message);
    return { success: false, error };
  }
};

// Helper functions for game data
export const saveGameState = async (userId: string, gameState: any) => {
  try {
    if (!userId) {
      console.error('Cannot save game state: No user ID provided');
      return { success: false, error: 'No user ID provided' };
    }

    // First check if the game state exists
    const { data: existingState, error: checkError } = await supabase
      .from('game_states')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing game state:', checkError);
      return { success: false, error: checkError };
    }

    // Prepare data to save
    const dataToSave = {
      user_id: userId,
      coins: gameState.coins || 0,
      total_coins_earned: gameState.totalCoinsEarned || 0, 
      cpc: gameState.cpc || 1,
      base_cpc: gameState.baseCpc || 1,
      total_clicks: gameState.totalClicks || 0,
      rebirths: gameState.rebirths || 0,
      rebirth_tokens: gameState.rebirthTokens || 0,
      gold_coins: gameState.goldCoins || 0,
      last_saved: new Date().toISOString()
    };

    let result;
    if (existingState) {
      // Update existing game state
      console.log('Updating existing game state');
      result = await supabase
        .from('game_states')
        .update(dataToSave)
        .eq('id', existingState.id);
    } else {
      // Insert new game state
      console.log('Creating new game state record');
      result = await supabase
        .from('game_states')
        .insert([dataToSave]);
    }

    if (result.error) {
      console.error('Error saving game state:', result.error);
      return { success: false, error: result.error };
    }

    console.log('Game state saved successfully');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Exception saving game state:', error.message);
    return { success: false, error };
  }
};

export const loadGameState = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('game_states')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error loading game state:', error.message);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Exception loading game state:', error.message);
    return { data: null, error };
  }
};

export const saveUserUpgrades = async (userId: string, upgrades: any[]) => {
  // Delete existing upgrades first
  await supabase
    .from('user_upgrades')
    .delete()
    .eq('user_id', userId);

  // Only save owned upgrades
  const ownedUpgrades = upgrades
    .filter(upgrade => upgrade.owned)
    .map(upgrade => ({
      user_id: userId,
      upgrade_id: upgrade.id,
      quantity: upgrade.quantity || 1
    }));

  if (ownedUpgrades.length === 0) return { error: null };

  const { error } = await supabase
    .from('user_upgrades')
    .insert(ownedUpgrades);

  return { error };
};

export const saveUserRocks = async (userId: string, rocks: any[]) => {
  // Delete existing rocks first
  await supabase
    .from('user_rocks')
    .delete()
    .eq('user_id', userId);

  // Convert rocks to DB format
  const rockEntries = rocks.map(rock => ({
    user_id: userId,
    rock_id: rock.id,
    unlocked: rock.unlocked
  }));

  const { error } = await supabase
    .from('user_rocks')
    .insert(rockEntries);

  return { error };
};

export const saveUserAchievements = async (userId: string, achievements: any[]) => {
  // Delete existing achievements first
  await supabase
    .from('user_achievements')
    .delete()
    .eq('user_id', userId);

  // Only save unlocked achievements
  const unlockedAchievements = achievements
    .filter(achievement => achievement.unlocked)
    .map(achievement => ({
      user_id: userId,
      achievement_id: achievement.id,
      unlocked_at: new Date()
    }));

  if (unlockedAchievements.length === 0) return { error: null };

  const { error } = await supabase
    .from('user_achievements')
    .insert(unlockedAchievements);

  return { error };
};

export const saveUserAutoMiners = async (userId: string, autoMiners: any[]) => {
  // Delete existing auto miners first
  await supabase
    .from('user_auto_miners')
    .delete()
    .eq('user_id', userId);

  // Only save owned autoMiners
  const ownedAutoMiners = autoMiners
    .filter(miner => miner.quantity > 0)
    .map(miner => ({
      user_id: userId,
      miner_id: miner.id,
      quantity: miner.quantity || 0
    }));

  if (ownedAutoMiners.length === 0) return { error: null };

  const { error } = await supabase
    .from('user_auto_miners')
    .insert(ownedAutoMiners);

  return { error };
};

export const saveAllGameData = async (userId: string, gameState: any) => {
  await saveGameState(userId, gameState);
  await saveUserUpgrades(userId, gameState.upgrades);
  await saveUserRocks(userId, gameState.rocks);
  await saveUserAchievements(userId, gameState.achievements);
  await saveUserAutoMiners(userId, gameState.autoMiners);
};

export const loadAllGameData = async (userId: string) => {
  const { data: gameStateData, error: gameStateError } = await loadGameState(userId);
  
  if (gameStateError) return { data: null, error: gameStateError };

  const { data: upgradesData } = await supabase
    .from('user_upgrades')
    .select('*')
    .eq('user_id', userId);

  const { data: rocksData } = await supabase
    .from('user_rocks')
    .select('*')
    .eq('user_id', userId);

  const { data: achievementsData } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId);
    
  const { data: autoMinersData } = await supabase
    .from('user_auto_miners')
    .select('*')
    .eq('user_id', userId);

  // Transform data to match game state format
  const transformedGameState = gameStateData ? {
    coins: gameStateData.coins || 0,
    totalCoinsEarned: gameStateData.total_coins_earned || 0,
    cpc: gameStateData.cpc || 1,
    baseCpc: gameStateData.base_cpc || 1,
    totalClicks: gameStateData.total_clicks || 0,
    rebirths: gameStateData.rebirths || 0,
    rebirthTokens: gameStateData.rebirth_tokens || 0,
    goldCoins: gameStateData.gold_coins || 0,
    lastSaved: gameStateData.last_saved ? new Date(gameStateData.last_saved).getTime() : Date.now()
  } : null;

  return {
    data: {
      gameState: transformedGameState,
      upgrades: upgradesData || [],
      rocks: rocksData || [],
      achievements: achievementsData || [],
      autoMiners: autoMinersData || []
    },
    error: null
  };
}; 