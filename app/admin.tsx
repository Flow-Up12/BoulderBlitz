import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { Text, Button, Card, Title, Paragraph, ActivityIndicator, Divider, Chip, List, TextInput } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase/client';
import checkDatabase from '../lib/supabase/checkDatabase';
import testDatabase from '../lib/supabase/test-database';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { useGameContext } from '../context/GameContext';
import { StatusBar } from 'expo-status-bar';
import { FAB } from 'react-native-paper';

// URL to the fix_database.sql file in the GitHub repo
const FIX_DATABASE_URL = 'https://raw.githubusercontent.com/yourusername/rock-clicker/main/lib/supabase/fix_database.sql';

export default function AdminScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const { state, dispatch, saveGame } = useGameContext();
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'unknown' | 'ok' | 'error'>('unknown');
  const [dbMessage, setDbMessage] = useState('');
  const [supabaseInfo, setSupabaseInfo] = useState(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState('');
  const [coinAmount, setCoinAmount] = useState('10000');
  const [goldAmount, setGoldAmount] = useState('10');
  
  // Check if current user is admin (for security)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!authState.user) {
      // Redirect to auth if not signed in
      router.replace('/auth');
      return;
    }
    
    // Initial checks
    fetchSupabaseInfo();
    checkDbConnection();
    checkAdminStatus();
  }, []);
  
  const fetchSupabaseInfo = () => {
    // Get Supabase configuration from app.json or env
    const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    setSupabaseInfo({
      url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not configured',
      hasAnonKey: !!supabaseAnonKey,
      user: authState.user?.id || 'Not signed in',
    });
  };
  
  const checkDbConnection = async () => {
    setLoading(true);
    setLogMessages([]);
    addLog('Starting database check...');
    
    try {
      // Override console.log to capture output
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      console.log = (...args) => {
        originalConsoleLog(...args);
        addLog(args.join(' '));
      };
      
      console.error = (...args) => {
        originalConsoleError(...args);
        addLog(`ERROR: ${args.join(' ')}`);
      };
      
      const dbOk = await checkDatabase();
      
      // Restore console
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      
      setDbStatus(dbOk ? 'ok' : 'error');
      setDbMessage(dbOk ? 'Database is properly configured' : 'Database setup incomplete');
    } catch (error) {
      setDbStatus('error');
      setDbMessage(`Error: ${error.message}`);
      addLog(`Unhandled error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const runDatabaseTest = async () => {
    setLoading(true);
    setLogMessages([]);
    addLog('Starting comprehensive database test...');
    
    try {
      // Override console.log to capture output
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      console.log = (...args) => {
        originalConsoleLog(...args);
        addLog(args.join(' '));
      };
      
      console.error = (...args) => {
        originalConsoleError(...args);
        addLog(`ERROR: ${args.join(' ')}`);
      };
      
      const testResult = await testDatabase();
      
      // Restore console
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      
      setDbStatus(testResult ? 'ok' : 'error');
      setDbMessage(testResult ? 'Database test passed successfully' : 'Database test failed - see logs');
    } catch (error) {
      console.error('Error running database test:', error);
      addLog(`Unexpected error during test: ${error.message}`);
      setDbStatus('error');
      setDbMessage(`Test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, message]);
  };
  
  const resetDatabase = async () => {
    setLoading(true);
    addLog('Attempting to reset local storage and cloud data sync status...');
    
    try {
      // Clear the local auth state forcing a fresh login
      addLog('Signing out to reset state...');
      await supabase.auth.signOut();
      addLog('Sign out successful');
      
      // Navigate back to welcome screen
      router.replace('/');
    } catch (error) {
      addLog(`Error during reset: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const copyFixScript = async () => {
    // This is a simplified version of the fix script that can be copied directly
    const fixScript = `-- Emergency fix for "relation public.users does not exist" error
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  username TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the games_states table that references users
CREATE TABLE IF NOT EXISTS public.game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(fixScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    } else {
      await Clipboard.setStringAsync(fixScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };
  
  const copyFixRlsScript = async () => {
    // SQL script to fix RLS policies for the users table
    const fixRlsScript = `-- Fix RLS policies for users table
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
  WITH CHECK (auth.uid() = id);`;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(fixRlsScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    } else {
      await Clipboard.setStringAsync(fixRlsScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };
  
  const openFixDatabaseUrl = () => {
    Linking.openURL(FIX_DATABASE_URL);
  };
  
  const checkAdminStatus = async () => {
    setIsLoading(true);
    if (authState.user?.id) {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', authState.user.id)
        .single();
        
      if (!error && data) {
        setIsAdmin(data.is_admin || false);
      } else {
        router.replace('/settings');
      }
    } else {
      router.replace('/settings');
    }
    setIsLoading(false);
  };
  
  // Admin functions
  const addCoinsToUser = async () => {
    if (!userId || !coinAmount) {
      Alert.alert('Error', 'Please enter a user ID and coin amount');
      return;
    }
    
    try {
      // Get user's current game state
      const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        Alert.alert('Error', `User not found or no game state: ${error.message}`);
        return;
      }
      
      // Update with new coins
      const newCoins = (data.coins || 0) + parseInt(coinAmount, 10);
      const newTotalCoins = (data.total_coins_earned || 0) + parseInt(coinAmount, 10);
      
      const { error: updateError } = await supabase
        .from('game_states')
        .update({ 
          coins: newCoins,
          total_coins_earned: newTotalCoins,
          last_saved: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        Alert.alert('Error', `Failed to update coins: ${updateError.message}`);
        return;
      }
      
      Alert.alert('Success', `Added ${coinAmount} coins to user!`);
    } catch (error) {
      Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
    }
  };
  
  const addGoldCoinsToUser = async () => {
    if (!userId || !goldAmount) {
      Alert.alert('Error', 'Please enter a user ID and gold amount');
      return;
    }
    
    try {
      // Get user's current game state
      const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        Alert.alert('Error', `User not found or no game state: ${error.message}`);
        return;
      }
      
      // Update with new gold coins
      const newGoldCoins = (data.gold_coins || 0) + parseInt(goldAmount, 10);
      
      const { error: updateError } = await supabase
        .from('game_states')
        .update({ 
          gold_coins: newGoldCoins,
          last_saved: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        Alert.alert('Error', `Failed to update gold coins: ${updateError.message}`);
        return;
      }
      
      Alert.alert('Success', `Added ${goldAmount} gold coins to user!`);
    } catch (error) {
      Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
    }
  };
  
  const makeUserAdmin = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please enter a user ID');
      return;
    }
    
    try {
      // Check if user exists
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', userId)
        .single();
        
      if (error) {
        Alert.alert('Error', `User not found: ${error.message}`);
        return;
      }
      
      // Update user to make them admin
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', userId);
        
      if (updateError) {
        Alert.alert('Error', `Failed to update user: ${updateError.message}`);
        return;
      }
      
      Alert.alert('Success', `User ${data.username || data.id} is now an admin!`);
    } catch (error) {
      Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
    }
  };
  
  // Add coins to current user
  const addCoinsToSelf = () => {
    const amount = parseInt(coinAmount, 10);
    
    dispatch({ type: 'ADD_COINS', payload: amount });
    Alert.alert('Success', `Added ${amount} coins to your account!`);
    saveGame();
  };
  
  // Add gold coins to current user
  const addGoldCoinsToSelf = () => {
    const amount = parseInt(goldAmount, 10);
    
    dispatch({ 
      type: 'ADD_GOLD_COINS', 
      payload: amount 
    });
    
    Alert.alert('Success', `Added ${amount} gold coins to your account!`);
    saveGame();
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Unauthorized. You must be an admin to access this page.</Text>
        <Button mode="contained" onPress={() => router.replace('/settings')}>
          Back to Settings
        </Button>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Stack.Screen 
        options={{ 
          title: 'Admin Dashboard',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Database Status</Title>
            <View style={styles.statusContainer}>
              <Chip 
                icon={dbStatus === 'ok' ? 'check-circle' : dbStatus === 'error' ? 'alert-circle' : 'help-circle'}
                mode="outlined"
                style={[
                  styles.statusChip,
                  dbStatus === 'ok' ? styles.statusOk : 
                  dbStatus === 'error' ? styles.statusError : styles.statusUnknown
                ]}
              >
                {dbStatus === 'ok' ? 'Connected' : 
                 dbStatus === 'error' ? 'Error' : 'Unknown'}
              </Chip>
              <Text style={styles.statusMessage}>{dbMessage}</Text>
            </View>
            
            <View style={styles.buttonGroup}>
              <Button 
                mode="contained" 
                onPress={checkDbConnection}
                loading={loading}
                disabled={loading}
                style={[styles.button, styles.primaryButton]}
              >
                Check Database
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={runDatabaseTest}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Run Full Database Test
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Title>Configuration</Title>
            <List.Item
              title="Supabase URL"
              description={supabaseInfo?.url || 'Loading...'}
              left={props => <List.Icon {...props} icon="link" />}
            />
            <List.Item
              title="API Key"
              description={supabaseInfo?.hasAnonKey ? 'Configured' : 'Missing'}
              left={props => <List.Icon {...props} icon="key" />}
            />
            <List.Item
              title="User ID"
              description={supabaseInfo?.user || 'Not signed in'}
              left={props => <List.Icon {...props} icon="account" />}
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Title>Logs</Title>
            <ScrollView style={styles.logsContainer}>
              {logMessages.length > 0 ? (
                logMessages.map((log, index) => (
                  <Text key={index} style={[
                    styles.logMessage,
                    log.includes('✅') ? styles.logSuccess : 
                    log.includes('❌') || log.includes('ERROR') ? styles.logError :
                    log.includes('⚠️') ? styles.logWarning : {}
                  ]}>
                    {log}
                  </Text>
                ))
              ) : (
                <Text style={styles.emptyLog}>No logs yet. Run a database check to see results.</Text>
              )}
            </ScrollView>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Title>Database Fix Tools</Title>
            <Paragraph>
              If you're seeing the "relation public.users does not exist" error, you can use these tools to fix it:
            </Paragraph>
            
            <View style={styles.fixButtons}>
              <Button 
                mode="contained" 
                onPress={copyFixScript}
                style={[styles.button, styles.fixButton]}
                icon={copied ? "check" : "content-copy"}
              >
                {copied ? "Copied!" : "Copy Quick Fix Script"}
              </Button>
              
              <Text style={styles.instructionText}>
                1. Copy the quick fix script above
              </Text>
              <Text style={styles.instructionText}>
                2. Go to Supabase SQL Editor
              </Text>
              <Text style={styles.instructionText}>
                3. Create a new query, paste the script, and run it
              </Text>
              <Text style={styles.instructionText}>
                4. Return to the app and try again
              </Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.orText}>OR</Text>
              
              <Button 
                mode="outlined" 
                onPress={openFixDatabaseUrl}
                style={styles.button}
                icon="download"
              >
                Download Full Fix Script
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.dangerCard}>
          <Card.Content>
            <Title style={styles.dangerTitle}>Reset</Title>
            <Paragraph>
              Reset your game state and force a fresh login. Use this if you're experiencing persistent issues with database connectivity.
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={resetDatabase}
              loading={loading}
              style={styles.dangerButton}
            >
              Reset & Log Out
            </Button>
          </Card.Content>
        </Card>
        
        <List.Accordion
          title="Troubleshooting Tools"
          left={props => <List.Icon {...props} icon="tools" />}
        >
          <View style={styles.troubleshootingContainer}>
            <Text style={styles.troubleshootingText}>
              If you're seeing errors about tables not existing or RLS policy issues, use one of these scripts
              to fix your database setup:
            </Text>
            
            <Button 
              mode="outlined" 
              icon="content-copy" 
              onPress={copyFixScript}
              style={styles.troubleshootingButton}
            >
              {copied ? 'Copied!' : 'Copy Fix Database Script'}
            </Button>
            
            <Button 
              mode="outlined" 
              icon="content-copy" 
              onPress={copyFixRlsScript}
              style={styles.troubleshootingButton}
            >
              {copied ? 'Copied!' : 'Copy Fix RLS Policies Script'}
            </Button>
            
            <Text style={styles.instructionText}>
              1. Go to the Supabase SQL Editor
            </Text>
            <Text style={styles.instructionText}>
              2. Paste the script and run it
            </Text>
            <Text style={styles.instructionText}>
              3. Come back and run the database test again
            </Text>
          </View>
        </List.Accordion>
        
        <Card style={styles.card}>
          <Card.Title title="User Management" />
          <Card.Content>
            <TextInput
              label="User ID"
              value={userId}
              onChangeText={setUserId}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Coin Amount"
              value={coinAmount}
              onChangeText={setCoinAmount}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Gold Coin Amount"
              value={goldAmount}
              onChangeText={setGoldAmount}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            
            <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={addCoinsToUser} style={styles.button}>
                Add Coins to User
              </Button>
              
              <Button mode="contained" onPress={addGoldCoinsToUser} style={styles.button}>
                Add Gold to User
              </Button>
              
              <Button mode="contained" onPress={makeUserAdmin} style={styles.button}>
                Make User Admin
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Title title="Self Actions" />
          <Card.Content>
            <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={addCoinsToSelf} style={styles.button}>
                Add Coins to Self
              </Button>
              
              <Button mode="contained" onPress={addGoldCoinsToSelf} style={styles.button}>
                Add Gold to Self
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="arrow-left"
        onPress={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollView: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#2D2D2D',
  },
  dangerCard: {
    marginBottom: 16,
    backgroundColor: '#3A2A2A',
  },
  dangerTitle: {
    color: '#FF6B6B',
  },
  statusContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusOk: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  statusError: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  statusUnknown: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
  },
  statusMessage: {
    color: '#CCC',
  },
  buttonGroup: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#7B68EE',
  },
  dangerButton: {
    marginTop: 16,
    backgroundColor: '#e74c3c',
  },
  logsContainer: {
    maxHeight: 200,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#222',
    borderRadius: 4,
  },
  logMessage: {
    fontSize: 12,
    color: '#CCC',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  logSuccess: {
    color: '#2ecc71',
  },
  logError: {
    color: '#e74c3c',
  },
  logWarning: {
    color: '#f1c40f',
  },
  emptyLog: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  fixButtons: {
    marginTop: 16,
  },
  fixButton: {
    marginBottom: 16,
    backgroundColor: '#2ecc71',
  },
  instructionText: {
    color: '#CCC',
    marginBottom: 8,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 16,
  },
  orText: {
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  troubleshootingContainer: {
    padding: 16,
  },
  troubleshootingText: {
    color: '#CCC',
    marginBottom: 16,
  },
  troubleshootingButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#333333',
  },
  buttonContainer: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    left: 0,
    bottom: 0,
    backgroundColor: '#7B68EE',
  },
}); 