import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const { loadGame, isInitializing } = useGameContext();
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const titleOpacity = React.useRef(new Animated.Value(0)).current;
  const buttonScale = React.useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    if (!isInitializing) {
      setIsLoading(false);
    }
  }, [isInitializing]);
  
  // Start animations
  useEffect(() => {
    if (!isLoading) {
      // Fade in title
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      
      // Pulsing button animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 0.95,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isLoading]);
  
  const navigateToGame = () => {
    router.replace('/game');
  };
  
  if (isLoading || isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Image 
          source={require('../assets/images/rocks/rock.webp')} 
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#FCE2A9" />
        <Text style={styles.loadingText}>
          <Text>Loading BoulderBlitz...</Text>
        </Text>
      </View>
    );
  }
  
  return (
    <ImageBackground 
      source={require('../assets/images/rock-background.webp')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Image 
            source={require('../assets/images/rocks/rock.webp')} 
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
            <Text>BoulderBlitz</Text>
          </Animated.Text>
          
          <Text style={styles.subtitle}>
            <Text>A prehistoric clicking adventure</Text>
          </Text>
          
          <Animated.View 
            style={[
              styles.buttonContainer, 
              { transform: [{ scale: buttonScale }] }
            ]}
          >
            <TouchableOpacity
              style={styles.playButton}
              onPress={navigateToGame}
            >
              <Text style={styles.playButtonText}>
                <Text>Start Game</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A1D14',
  },
  loadingLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 20,
    color: '#FCE2A9',
    fontSize: 16,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FCE2A9',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#D9C0A9',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  playButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#8B5A2B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#D9C0A9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  playButtonText: {
    color: '#FCE2A9',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
}); 