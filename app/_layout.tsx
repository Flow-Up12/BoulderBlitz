import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GameProvider } from '../context/GameContext';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Initialize the app
  useEffect(() => {
    async function prepare() {
      try {
        // Preload any data or assets
        await AsyncStorage.getItem('gameState');
      } catch (e) {
        console.warn(e);
      } finally {
        setIsAppReady(true);
      }
    }

    prepare();
  }, []);

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
                  title: 'Rock Clicker',
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="game" 
                options={{ 
                  title: 'Rock Clicker',
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