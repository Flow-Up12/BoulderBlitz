import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  BackHandler,
  PanResponder,
  ImageBackground,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, Portal, Snackbar, IconButton, Surface, Title, Button } from 'react-native-paper';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialState } from '../context/GameContext';

// Components
import { RockButton } from '../components/game/RockButton';
import CoinCounter from '../components/game/CoinCounter';
import UpgradeList from '../components/shop/UpgradeList';
import SpecialUpgradeShop from '../components/shop/SpecialUpgradeShop';
import AutoMinerList from '../components/shop/AutoMinerList';
import { UnlockModal } from '../components/achievements/UnlockModal';
import RebirthModal from '../components/rebirth/RebirthModal';
import AbilitiesPanel from '../components/abilities/AbilitiesPanel';
import AbilityBar from '../components/abilities/AbilityBar';

export default function GameScreen() {
  const router = useRouter();
  const { state, dispatch, saveGame, loadGame, databaseError } = useGameContext();
  const { authState, setAuthState } = useAuth();
  const screenHeight = Dimensions.get('window').height;
  
  // Shop panel animation
  const [isShopExpanded, setIsShopExpanded] = useState(false);
  const [activeShopTab, setActiveShopTab] = useState('upgrades');
  
  // UI state
  const [showRebirthModal, setShowRebirthModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showDbError, setShowDbError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // For shop panel animation
  const panelPosition = useRef(new Animated.Value(0)).current;
  const maxShopHeight = screenHeight * 0.85;
  const minShopHeight = 70;
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const tutorialOpacity = useRef(new Animated.Value(0)).current;
  const [highlightedElement, setHighlightedElement] = useState(null);

  // Tutorial steps with element positions
  const tutorialSteps = [
    {
      title: "Welcome to Rock Clicker!",
      message: "Let's learn how to become a master rock miner!",
      target: null,
      position: 'center'
    },
    {
      title: "Click the Rock",
      message: "Tap the rock in the center to earn coins. The more you click, the more you earn!",
      target: "rock",
      position: 'center'
    },
    {
      title: "Buy Upgrades",
      message: "Tap the SHOP panel to open the shop and buy upgrades!",
      target: "shop",
      position: 'bottom',
      action: () => {
        if (!isShopExpanded) {
          toggleShopPanel();
        }
      }
    },
    {
      title: "Auto Miners",
      message: "Buy auto miners to earn coins while you're away!",
      target: "miners",
      position: 'bottom',
      action: () => {
        if (!isShopExpanded) {
          toggleShopPanel();
        }
        setActiveShopTab('miners');
      }
    },
    {
      title: "Special Abilities",
      message: "Use special abilities for amazing boosts!",
      target: "abilities",
      position: 'bottom',
      action: () => {
        if (!isShopExpanded) {
          toggleShopPanel();
        }
        setActiveShopTab('abilities');
      }
    },
    {
      title: "Settings",
      message: "Visit settings to customize your game experience and manage your account.",
      target: "settings",
      position: 'right',
      action: () => {
        router.push('/settings');
      }
    }
  ];
  
  // Manual shop toggle button handler - simplified without dragging
  const toggleShopPanel = () => {
    if (isShopExpanded) {
      // Collapse with improved animation
      Animated.spring(panelPosition, {
        toValue: 0,
        tension: 65,
        friction: 12,
        useNativeDriver: true,
      }).start();
      setIsShopExpanded(false);
    } else {
      // Expand with improved animation - expand panel from bottom up
      Animated.spring(panelPosition, {
        toValue: -(maxShopHeight - minShopHeight),
        tension: 65, 
        friction: 12,
        useNativeDriver: true,
      }).start();
      setIsShopExpanded(true);
    }
  };
  
  // Calculate positions based on shop panel state - ensure buttons are visible
  const actionButtonsBottom = 80; // Fixed position regardless of shop state
  
  // Loading timeout effect
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, forcing game to start');
        setIsLoading(false);
        
        // Show feedback to the user
        setSnackbarMessage('Game data is still loading in the background');
        setShowSnackbar(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

  // Initialize game data
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // If we have state loaded, we can start
        if (state.dataLoaded) {
          setIsLoading(false);
          return;
        }

        // If coming from login, check if we can load saved data
        if (authState.isAuthenticated && authState.justLoggedIn) {
          try {
            // Only try to load from cloud when explicitly logging in
            await loadGame(true); // Pass true to force reload from cloud
            console.log('Game data loaded after login');
            
            // Reset the justLoggedIn flag after loading
            if (authState.justLoggedIn) {
              setAuthState(prev => ({
                ...prev,
                justLoggedIn: false
              }));
            }
          } catch (loadError) {
            console.error('Error loading game after login:', loadError);
            // If loading fails, we'll fall back to initial state
          }
        } else {
          // For all other cases, including after rebirth, load local data without forcing cloud fetch
          await loadGame(false); // Don't force reload from cloud
        }
        
        // In all cases, stop showing loading screen
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing game:', error);
        setIsLoading(false);
      }
    };

    initializeGame();
  }, [state.dataLoaded, authState.isAuthenticated, authState.justLoggedIn]);

  // Use this to handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Save game when back button is pressed
      saveGame();
      return false; // Don't prevent default behavior
    });
    
    return () => backHandler.remove();
  }, [saveGame]);
  
  // Auto-save less frequently to prevent constant updates
  useEffect(() => {
    // Use a much longer interval to prevent constant updates
    const saveInterval = setInterval(() => {
      // Only save if authenticated and data has changed significantly
      if (authState.isAuthenticated && state._needsSave) {
        console.log('Auto-save triggered due to significant game state changes');
        saveGame();
        
        // Only show feedback occasionally
        if (Math.random() < 0.1) { // Only show notification 10% of the time
          setSnackbarMessage('Game saved');
          setShowSnackbar(true);
        }
      }
    }, 900000); // 15 minutes instead of 5
    
    return () => clearInterval(saveInterval);
  }, [authState.isAuthenticated, state._needsSave]);

  // Check for new achievements - improved to avoid repeated notifications
  useEffect(() => {
    // Only check if not currently showing an achievement
    if (!newAchievement) {
      const unlockedAchievement = state.achievements.find(
        a => a.unlocked && !a._hasShownNotification
      );
      
      if (unlockedAchievement) {
        // Clone the achievement to avoid reference issues
        setNewAchievement({...unlockedAchievement});
        
        // Mark as shown in the state
        dispatch({
          type: 'MARK_ACHIEVEMENT_SHOWN',
          payload: unlockedAchievement.id
        });
      }
    }
  }, [state.achievements, newAchievement]);
  
  // Show database error if it exists
  useEffect(() => {
    if (databaseError) {
      setShowDbError(true);
    }
  }, [databaseError]);
  
  // Navigation functions
  const navigateToAchievements = () => {
    router.push('/achievements');
  };
  
  const navigateToSettings = () => {
    router.push('/settings');
  };
  
  // Update the rebirth function to show the rebirth modal
  const handleRebirth = () => {
    setShowRebirthModal(true);
  };
  
  // Update the achievement handling
  const handleAchievementClose = () => {
    if (newAchievement) {
      // Save game after closing achievement modal to ensure it's persisted
      setTimeout(() => {
        saveGame();
      }, 500);
    }
    setNewAchievement(null);
  };
  
  // Render the shop tab content
  const renderShopContent = () => {
    if (!isShopExpanded) return null;

    // Instead of wrapping in ScrollView, return the component directly
    // The component should handle its own scrolling
    switch (activeShopTab) {
      case 'upgrades':
        return <UpgradeList />;
      case 'miners':
        return <AutoMinerList />;
      case 'special':
        return <SpecialUpgradeShop />;
      case 'abilities':
        return <AbilitiesPanel />;
      default:
        return <UpgradeList />;
    }
  };
  
  // Handle tutorial animations
  useEffect(() => {
    if (showTutorial) {
      Animated.timing(tutorialOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    }
  }, [tutorialStep]);

  // Handle tutorial progression with actions
  const advanceTutorial = () => {
    const currentStep = tutorialSteps[tutorialStep];
    
    // Execute the action for the current step if it exists
    if (currentStep.action) {
      currentStep.action();
    }

    if (tutorialStep < tutorialSteps.length - 1) {
      Animated.timing(tutorialOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setTutorialStep(prev => prev + 1);
      });
    } else {
      setShowTutorial(false);
      // Save that tutorial has been completed
      AsyncStorage.setItem('tutorialCompleted', 'true');
    }
  };

  // Check if tutorial should be shown
  useEffect(() => {
    const checkTutorial = async () => {
      const tutorialCompleted = await AsyncStorage.getItem('tutorialCompleted');
      setShowTutorial(!tutorialCompleted);
    };
    checkTutorial();
  }, []);
  
  // Get tutorial position based on current step
  const getTutorialPosition = () => {
    const step = tutorialSteps[tutorialStep];
    switch (step.target) {
      case 'rock':
        return styles.tutorialCenter;
      case 'shop':
        return styles.tutorialBottom;
      case 'miners':
      case 'abilities':
        return isShopExpanded ? styles.tutorialShopContent : styles.tutorialBottom;
      case 'settings':
        return styles.tutorialRight;
      default:
        return styles.tutorialCenter;
    }
  };

  // Get highlighted element based on current step
  const getHighlightedElement = () => {
    const step = tutorialSteps[tutorialStep];
    switch (step.target) {
      case 'rock':
        return <View style={[styles.highlightCircle, { top: '40%' }]} />;
      case 'shop':
        return <View style={[styles.highlightBar, { bottom: 70 }]} />;
      case 'miners':
      case 'abilities':
        return isShopExpanded ? (
          <View style={[styles.highlightContent, { bottom: 150 }]} />
        ) : (
          <View style={[styles.highlightBar, { bottom: 70 }]} />
        );
      case 'settings':
        return <View style={[styles.highlightCircle, { right: 16, bottom: 80 }]} />;
      default:
        return null;
    }
  };
  
  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Image 
          source={require('../assets/images/rocks/rock.webp')} 
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#8B5A2B" />
        <Text style={styles.loadingText}>
          {authState.isAuthenticated 
            ? 'Loading your saved game data...' 
            : 'Loading game data...'}
        </Text>
        <Text style={styles.loadingSubText}>
          {authState.isAuthenticated 
            ? 'Retrieving your mining empire...' 
            : 'First time? Your adventure is about to begin!'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground 
      source={require('../assets/images/rock-background.webp')}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <StatusBar style="light" />
        
        <View style={styles.gameContainer}>
          <ImageBackground 
            source={require('../assets/images/rock-background.webp')} 
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            {/* Top bar with coin counter and action buttons */}
            <View style={styles.topBar}>
              <View style={styles.coinCounterContainer}>
                <CoinCounter />
              </View>
              <View style={styles.topRightButtons}>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={handleRebirth}
                >
                  <FAB 
                    icon="autorenew" 
                    style={styles.smallFab} 
                    color="#FFD700"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={navigateToAchievements}
                >
                  <FAB 
                    icon="trophy" 
                    style={styles.smallFab} 
                    color="#FFD700"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={navigateToSettings}
                >
                  <FAB 
                    icon="cog" 
                    style={styles.smallFab} 
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Rock button in the center */}
            <View style={styles.rockContainer}>
              <RockButton />
            </View>
            
            {/* AbilityBar positioned above shop panel */}
            <AbilityBar />
            
            {/* Shop Panel */}
            <Animated.View 
              style={[
                styles.shopPanel, 
                { 
                  transform: [{ translateY: panelPosition }],
                  height: maxShopHeight,
                  bottom: -maxShopHeight + minShopHeight,
                  paddingBottom: 35,
                  elevation: isShopExpanded ? 15 : 8, // Higher elevation when expanded
                }
              ]}
            >
              <TouchableOpacity 
                style={[
                  styles.panelHandle, 
                  { borderBottomWidth: isShopExpanded ? 1 : 0 }
                ]} 
                onPress={toggleShopPanel}
              >
                <View style={styles.handleContainer}>
                  <View style={styles.handle} />
                  <View style={styles.expandIndicator}>
                    <Animated.View style={[
                      styles.arrow,
                      { transform: [{ rotate: isShopExpanded ? '180deg' : '0deg' }] }
                    ]}>
                      <Text style={styles.arrowText}>▲</Text>
                    </Animated.View>
                  </View>
                </View>
                <Text style={styles.panelTitle}>SHOP</Text>
                <Text style={styles.expandCollapseText}>
                  {isShopExpanded ? 'Tap to collapse' : 'Tap to expand'}
                </Text>
              </TouchableOpacity>
              
              {/* Only show shop content when expanded */}
              {isShopExpanded && (
                <>
                  {/* Shop Tabs */}
                  <View style={styles.tabBar}>
                    <TouchableOpacity
                      style={[styles.tab, activeShopTab === 'upgrades' ? styles.activeTab : null]}
                      onPress={() => setActiveShopTab('upgrades')}
                    >
                      <Text style={styles.tabText}>Pickaxes</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.tab, activeShopTab === 'miners' ? styles.activeTab : null]}
                      onPress={() => setActiveShopTab('miners')}
                    >
                      <Text style={styles.tabText}>Miners</Text>
                    </TouchableOpacity>
                    
                    {state.goldCoins > 0 && (
                      <TouchableOpacity
                        style={[styles.tab, activeShopTab === 'special' ? styles.activeTab : null]}
                        onPress={() => setActiveShopTab('special')}
                      >
                        <Text style={styles.tabText}>Special</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={[styles.tab, activeShopTab === 'abilities' ? styles.activeTab : null]}
                      onPress={() => setActiveShopTab('abilities')}
                    >
                      <Text style={styles.tabText}>Abilities</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.shopContent}>
                    {renderShopContent()}
                  </View>
                </>
              )}
            </Animated.View>
          </ImageBackground>
        </View>
        
        {/* Modals */}
        <UnlockModal
          achievement={newAchievement} 
          onClose={handleAchievementClose} 
        />
        
        <RebirthModal
          visible={showRebirthModal}
          onClose={() => setShowRebirthModal(false)}
        />
        
        {/* Snackbar */}
        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          duration={2000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
        
        <Snackbar
          visible={showDbError}
          onDismiss={() => setShowDbError(false)}
          action={{
            label: 'Fix',
            onPress: () => router.push('/admin'),
          }}
          duration={6000}
        >
          {databaseError}
        </Snackbar>

        {showTutorial && (
          <TouchableOpacity
            style={styles.tutorialContainer}
            activeOpacity={1}
            onPress={advanceTutorial}
          >
            <View style={styles.tutorialOverlay}>
              {getHighlightedElement()}
              <Animated.View 
                style={[
                  styles.tutorialBox,
                  getTutorialPosition(),
                  { opacity: tutorialOpacity }
                ]}
              >
                <Text style={styles.tutorialTitle}>
                  {tutorialSteps[tutorialStep].title}
                </Text>
                <Text style={styles.tutorialText}>
                  {tutorialSteps[tutorialStep].message}
                </Text>
                <Text style={styles.tutorialHint}>
                  Tap to continue
                </Text>
              </Animated.View>
            </View>
          </TouchableOpacity>
        )}

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A1D14', // Rock-themed brown
  },
  loadingLogo: {
    width: 100,
    height: 100,
  },
  loadingText: {
    marginTop: 16,
    color: '#FCE2A9', // Rock-themed tan
    fontSize: 16,
  },
  loadingSubText: {
    color: '#A89386',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  gameContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 10,
  },
  coinCounterContainer: {
    flex: 1,
    width: '100%',
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 45,
    right: 10,
    zIndex: 200,
    elevation: 10,
  },
  smallFab: {
    height: 40,
    width: 40,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 8,
    justifyContent: 'center',
    elevation: 10,
  },
  rockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#8B5A2B',
  },
  panelHandle: {
    height: 100, // Match the minShopHeight constant
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingHorizontal: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomColor: '#8B5A2B',
    backgroundColor: 'rgba(42, 29, 20, 0.98)',
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 5,
  },
  handle: {
    width: 90, // Wider handle
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9C0A9', // Rock-themed light brown/tan
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  expandIndicator: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#D9C0A9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  panelTitle: {
    color: '#FCE2A9', // Rock-themed light tan
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  expandCollapseText: {
    color: '#A89386', // Rock-themed muted tan
    fontSize: 12,
    fontStyle: 'italic',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#8B5A2B', // Rock-themed brown
    backgroundColor: '#2A1D14', // Rock-themed dark brown
    paddingTop: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 15, // More padding for better touch targets
    alignItems: 'center',
    marginHorizontal: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#D9C0A9', // Rock-themed light brown/tan
    backgroundColor: 'rgba(139, 90, 43, 0.5)', // More visible highlight
  },
  tabText: {
    color: '#D9C0A9', // Rock-themed light brown/tan
    fontWeight: 'bold',
    fontSize: 16, // Larger text for better visibility
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  shopContent: {
    flex: 1,
    backgroundColor: 'rgba(26, 18, 11, 0.95)', // Very dark brown with transparency
    paddingTop: 10,
    paddingBottom: 50, // Increase padding at bottom to ensure content doesn't get cut off
    minHeight: '100%',
  },
  snackbar: {
    backgroundColor: 'rgba(42, 29, 20, 0.9)', // Dark rock brown
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  shopContentContainer: {
    minHeight: '100%',
  },
  tutorialContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tutorialBox: {
    backgroundColor: '#2A1D14',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    borderWidth: 2,
    borderColor: '#8B5A2B',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  tutorialCenter: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tutorialBottom: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tutorialRight: {
    position: 'absolute',
    top: '40%',
    right: 20,
    width: '70%',
    alignItems: 'flex-end',
  },
  highlightCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FCE2A9',
    backgroundColor: 'rgba(252, 226, 169, 0.1)',
  },
  highlightBar: {
    position: 'absolute',
    height: 70,
    left: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FCE2A9',
    backgroundColor: 'rgba(252, 226, 169, 0.1)',
  },
  highlightContent: {
    position: 'absolute',
    height: 200,
    left: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FCE2A9',
    backgroundColor: 'rgba(252, 226, 169, 0.1)',
  },
  tutorialTitle: {
    color: '#FCE2A9',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tutorialText: {
    color: '#D9C0A9',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  tutorialHint: {
    color: '#A89386',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tutorialShopContent: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
}); 