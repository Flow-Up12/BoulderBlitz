import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GameProvider } from '../context/GameContext';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SoundManager } from '../utils/SoundManager';
import { Alert, Platform } from 'react-native';

// Create a dark theme
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#7B68EE', // Medium slate blue
    accent: '#FF8C00', // Dark orange
    background: '#1F1F1F', // Very dark gray
    surface: '#2A2A2A', // Dark gray
    error: '#CF6679', // Light pink
    text: '#FFFFFF', // White
    onSurface: '#FFFFFF', // White
    notification: '#FF8C00', // Dark orange
  },
};

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [loadRetryCount, setLoadRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Initialize the app
  useEffect(() => {
    async function prepare() {
      try {
        // Preload any data or assets
        const gameStateString = await AsyncStorage.getItem('gameState');
        
        // Parse game state to check if sound is enabled
        let soundEnabled = true;
        try {
          if (gameStateString) {
            const gameState = JSON.parse(gameStateString);
            soundEnabled = gameState.soundEnabled !== false; // Default to true if not specified
          }
        } catch (e) {
          console.warn('Error parsing game state:', e);
        }
        
        // Enable debug mode in dev environments
        if (__DEV__) {
          SoundManager.setDebugMode(true);
        }
        
        // Preload sounds based on user preference
        const soundsLoaded = await SoundManager.preloadSounds(soundEnabled);
        
        // If sounds failed to load but should be enabled, try again (limited retries)
        if (!soundsLoaded && soundEnabled && loadRetryCount < MAX_RETRIES) {
          console.warn(`Sound preload failed, retrying (${loadRetryCount + 1}/${MAX_RETRIES})...`);
          setLoadRetryCount(prev => prev + 1);
          
          // Reset sound system
          await SoundManager.reset();
          
          // Wait a brief moment before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try again
          await SoundManager.preloadSounds(soundEnabled);
        }
        
        // If we've tried too many times and failed, disable sound
        if (!soundsLoaded && soundEnabled && loadRetryCount >= MAX_RETRIES) {
          console.warn('Sound system failed to initialize after multiple attempts');
          
          // On development builds, show an alert
          if (__DEV__) {
            Alert.alert(
              'Sound System Warning',
              'The sound system failed to initialize. Sounds will be temporarily disabled.',
              [{ text: 'OK' }]
            );
          }
          
          // We'll continue without sound rather than blocking app startup
        }
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        setIsAppReady(true);
      }
    }

    prepare();
    
    // Clean up on unmount
    return () => {
      SoundManager.unloadAll().catch(e => 
        console.warn('Error unloading sounds on app unmount:', e)
      );
    };
  }, [loadRetryCount]);

  if (!isAppReady) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <GameProvider>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                contentStyle: {
                  backgroundColor: theme.colors.background,
                },
                headerShown: false, // Hide header by default
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen 
                name="index" 
                options={{ 
                  title: 'BoulderBlitz',
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="game" 
                options={{ 
                  title: 'BoulderBlitz',
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="shop" 
                options={{ 
                  title: 'Shop',
                  headerShown: true
                }} 
              />
              <Stack.Screen 
                name="achievements" 
                options={{ 
                  title: 'Achievements',
                  headerShown: false, // We're using a custom back button
                }} 
              />
              <Stack.Screen 
                name="auth" 
                options={{ 
                  title: 'Sign In',
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="settings" 
                options={{ 
                  title: 'Settings',
                  headerShown: false, // We'll add our own back button
                }} 
              />
            </Stack>
          </GameProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 