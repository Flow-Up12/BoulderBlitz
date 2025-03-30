import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  ImageBackground,
  Image,
  Modal,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';
import { initialState } from '../context/GameContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, authState } = useAuth();
  const { loadGame, dispatch } = useGameContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDataOptions, setShowDataOptions] = useState(false);

  // Watch for successful auth
  useEffect(() => {
    if (authState.isAuthenticated) {
      // Show data options when user is authenticated 
      setShowDataOptions(true);
    }
  }, [authState.isAuthenticated]);

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      await signIn(email, password);
      // Data options will be shown in useEffect when authState changes
    } catch (error) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignUp = async () => {
    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await signUp(email, password);
      // Data options will be shown in useEffect when authState changes
    } catch (error) {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Skip login
  const handleContinueWithoutAccount = () => {
    router.replace('/game');
  };

  // Handle loading saved data
  const handleLoadData = async () => {
    try {
      setIsLoading(true);
      // Navigate to game first, as data will continue loading
      router.replace('/game');
      
      // Let the game screen handle the data loading process
      // This prevents showing errors when data actually loads, but takes time
      const result = await loadGame(true);
      console.log('Loading saved data result:', result);
      
      // If loading still fails after navigation, the game screen will handle
      // falling back to initial state as needed
    } catch (error) {
      console.error('Error loading saved data:', error);
      // Even on error, just proceed to the game - initial state will be used if needed
      router.replace('/game');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle starting a new game
  const handleStartFresh = async () => {
    try {
      setIsLoading(true);
      // Reset to initial state
      dispatch({ type: 'LOAD_GAME', payload: initialState });
      
      // Clear any existing saved data
      await AsyncStorage.removeItem('gameState');
      
      // Navigate to game
      router.replace('/game');
    } catch (error) {
      console.error('Error starting fresh game:', error);
      Alert.alert('Error', 'Failed to start a new game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/rock-background.webp')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/rocks/rock.webp')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Rock Clicker</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to save your progress' : 'Create an account to save your progress'}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#A89386"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A89386"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A89386"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TouchableOpacity
            style={styles.button}
            onPress={isLogin ? handleLogin : handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            <Text style={styles.switchButtonText}>
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleContinueWithoutAccount}
          >
            <Text style={styles.skipButtonText}>
              Continue without account
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Load Options Modal */}
      <Modal
        visible={showDataOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDataOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Welcome Back!</Text>
            <Text style={styles.modalText}>
              We found saved game data associated with your account. 
              What would you like to do?
            </Text>

            <TouchableOpacity 
              style={[styles.button, styles.loadButton]}
              onPress={handleLoadData}
            >
              <Text style={styles.buttonText}>Load Saved Data</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.startFreshButton]}
              onPress={() => {
                Alert.alert(
                  'Start From Scratch',
                  'Are you sure you want to start a new game? Your existing saved data will be overwritten.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes, start fresh', onPress: handleStartFresh }
                  ]
                );
              }}
            >
              <Text style={styles.buttonText}>Start From Scratch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FCE2A9',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#D9C0A9',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'rgba(54, 34, 24, 0.85)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#8B5A2B',
  },
  input: {
    height: 50,
    backgroundColor: '#2A1D14',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B5A2B',
    marginBottom: 15,
    paddingHorizontal: 15,
    color: '#FCE2A9',
    fontSize: 16,
  },
  button: {
    height: 55,
    backgroundColor: '#8B5A2B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FCE2A9',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#D9C0A9',
    fontSize: 16,
  },
  skipButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#A89386',
    fontSize: 14,
  },
  errorText: {
    color: '#E57373',
    marginBottom: 10,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(54, 34, 24, 0.95)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#8B5A2B',
    padding: 25,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCE2A9',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#D9C0A9',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadButton: {
    backgroundColor: '#538D4E', // Green
    width: '100%',
  },
  startFreshButton: {
    backgroundColor: '#994636', // Reddish
    marginTop: 15,
    width: '100%',
  }
}); 