import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions, Platform, Vibration, Image, Easing } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import SvgRock from './SvgRock';
import MinerIcon from './MinerIcon';
import MinerAnimation from './MinerAnimation';
import { formatScientific } from '../../utils/formatters';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const ROCK_SIZE = Math.min(width, height) * 0.65; // Make rock 50% of smallest screen dimension
const MINER_SIZE = ROCK_SIZE * 0.4; // Miners are 40% of rock size

// Precompute animation configurations
const SCALE_DOWN_CONFIG = {
  toValue: 0.95,
  duration: 20, // Reduced from 50ms to 20ms
  useNativeDriver: true,
};

const SCALE_UP_CONFIG = {
  toValue: 1,
  duration: 20, // Reduced from 50ms to 20ms
  useNativeDriver: true,
};

const OPACITY_IN_CONFIG = {
  toValue: 1,
  duration: 200,
  useNativeDriver: true,
};

const OPACITY_OUT_CONFIG = {
  toValue: 0,
  duration: 200,
  useNativeDriver: true,
};

// Create memoized component to avoid unnecessary rerenders
export const RockButton = React.memo(() => {
  const { state, dispatch } = useGameContext();
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [showCoinEarned, setShowCoinEarned] = useState(false);
  const [lastClickValue, setLastClickValue] = useState(0);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const growthAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const comboOpacity = useRef(new Animated.Value(0)).current;
  const coinOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  
  // Other refs
  const lastClickTime = useRef(0);
  const comboTimeout = useRef(null);
  const growthTimeout = useRef(null);
  
  // Animation arrays for slice effects
  const sliceAnimations = useRef([]);
  
  // Cache animations to avoid recreating them on each render
  const animations = useRef({
    coinAnim: null,
    comboAnim: null,
    pressAnim: null,
    glowAnim: Animated.sequence([
      Animated.timing(glowOpacity, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]),
    growResetAnim: Animated.sequence([
      Animated.spring(growthAnim, {
        toValue: 1.4, // Grow big
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(growthAnim, {
        toValue: 1, // Return to normal
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ])
  }).current;

  // Reset and handle progress toward 500 clicks special effect
  useEffect(() => {
    // When progress is at max (500), trigger special effect
    if (state.clickProgress === 0 && state.totalClicks > 0) {
      // Use cached animations
      animations.glowAnim.start();
      animations.growResetAnim.start();
    }
  }, [state.clickProgress]);
  
  // Create coin animation sequence only once
  useEffect(() => {
    animations.coinAnim = Animated.sequence([
      Animated.timing(coinOpacity, OPACITY_IN_CONFIG),
      Animated.delay(800),
      Animated.timing(coinOpacity, {
        ...OPACITY_OUT_CONFIG,
        duration: 300,
      }),
    ]);
    
    animations.comboAnim = Animated.sequence([
      Animated.timing(comboOpacity, OPACITY_IN_CONFIG),
      Animated.delay(800),
      Animated.timing(comboOpacity, OPACITY_OUT_CONFIG),
    ]);
    
    animations.pressAnim = Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, SCALE_DOWN_CONFIG),
        Animated.timing(rotateAnim, {
          toValue: 0.05, // We'll flip the sign randomly at runtime
          duration: 100,
          useNativeDriver: true,
        })
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, SCALE_UP_CONFIG),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        })
      ])
    ]);
    
    return () => {
      // Clean up animations
      coinOpacity.stopAnimation();
      comboOpacity.stopAnimation();
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();
      growthAnim.stopAnimation();
      glowOpacity.stopAnimation();
    };
  }, []);
  
  const handlePress = useCallback((event) => {
    // Immediately dispatch the click action before any animations for faster response
    dispatch({ 
      type: 'CLICK_ROCK_WITH_ANIMATION', 
      payload: { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY } 
    });
    
    // Lighter haptic feedback with more fallback options
    if (state.hapticsEnabled) {
      if (Platform.OS === 'ios') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
            // Fallback to vibration if haptics fail
            Vibration.vibrate(3);
          });
        } catch {
          Vibration.vibrate(3);
        }
      } else {
        Vibration.vibrate(3); // Reduced from 5ms to 3ms for Android
      }
    }
    
    // Get the touch position for animations
    const touchX = event.nativeEvent.locationX;
    const touchY = event.nativeEvent.locationY;
    
    // Set the last position for coin animations
    setLastPosition({ x: touchX, y: touchY });
    
    // Store the current click value for display
    setLastClickValue(state.cpc);
    
    // Skip showing coin earned animation for every click
    // Only show it occasionally for performance - reduce frequency
    if (Math.random() < 0.2) { // Reduced from 30% to 20% chance
      setShowCoinEarned(true);
      animations.coinAnim.start(() => {
        setShowCoinEarned(false);
      });
    }
    
    // Animate press with shorter animation
    animations.pressAnim.start();
    
    // Handle combo logic - only process if combo feature is enabled and less burden
    const now = Date.now();
    const timeDiff = now - lastClickTime.current;
    
    if (timeDiff < 1500) {
      // Clear existing timeout if any
      if (comboTimeout.current) {
        clearTimeout(comboTimeout.current);
      }
      
      // Only update combo if it's low or random chance for higher combos
      if (combo < 5 || Math.random() < 0.5) {
        setCombo(prev => prev + 1);
      }
      
      // Only show combo animation occasionally for performance
      if ((Math.random() < 0.2 && combo > 3) || combo > 10) { // Show more rarely
        setShowCombo(true);
        animations.comboAnim.start(() => {
          setShowCombo(false);
        });
      }
    } else {
      setCombo(1);
    }
    
    // Reset combo after timeout
    comboTimeout.current = setTimeout(() => {
      setCombo(0);
    }, 1500);
    
    lastClickTime.current = now;
    
    // Skip creating slice effects for every click - reduce frequency
    if (Math.random() < 0.15) { // Reduced from 30% to 15% chance
      createSliceAnimation(touchX, touchY);
    }
  }, [state.cpc, state.hapticsEnabled, combo]);
  
  // Function to create a slice animation - optimized version
  const createSliceAnimation = (x, y) => {
    // Skip animation completely if too many are already running
    if (sliceAnimations.current.length > 8) return;
    
    // Create a new animated value for the slice
    const sliceOpacity = new Animated.Value(1);
    const sliceScale = new Animated.Value(0.5);
    const sliceRotate = new Animated.Value(0);
    
    // Create random angle for the slice
    const angle = Math.random() * 360;
    
    // Choose different effects based on pickaxe evolution level
    let iconName = 'sword-cross';
    let iconColor = '#FFD700';
    let iconSize = 40;
    
    // Evolution level specific effects
    if (selectedPickaxeEvolution >= 1) {
      // Tier 1: Enhanced effects
      iconName = 'star-four-points';
      iconColor = '#3498db'; // Blue
      iconSize = 45;
    }
    
    if (selectedPickaxeEvolution >= 2) {
      // Tier 2: More powerful effects
      iconName = 'star-shooting';
      iconColor = '#9b59b6'; // Purple 
      iconSize = 50;
    }
    
    if (selectedPickaxeEvolution >= 3) {
      // Tier 3: Maximum evolution effects
      iconName = 'flare';
      iconColor = '#f39c12'; // Gold
      iconSize = 55;
    }
    
    // Add to array
    const sliceId = Date.now().toString() + Math.random().toString();
    sliceAnimations.current.push({
      id: sliceId,
      x,
      y,
      opacity: sliceOpacity,
      scale: sliceScale,
      rotate: sliceRotate,
      angle,
      iconName,
      iconColor,
      iconSize
    });
    
    // Run animation with shorter duration
    Animated.parallel([
      Animated.timing(sliceOpacity, {
        toValue: 0,
        duration: 400, // Reduced from 600ms to 400ms
        useNativeDriver: true,
      }),
      Animated.timing(sliceScale, {
        toValue: 1.5,
        duration: 400, // Reduced from 600ms to 400ms
        useNativeDriver: true,
      }),
      Animated.timing(sliceRotate, {
        toValue: 1, // 1 full rotation
        duration: 400, // Reduced from 600ms to 400ms
        useNativeDriver: true,
      })
    ]).start(() => {
      // Remove the animation when complete
      sliceAnimations.current = sliceAnimations.current.filter(
        slice => slice.id !== sliceId
      );
    });
  };
  
  // Render the slice effects
  const renderSliceEffects = () => {
    return sliceAnimations.current.map((slice, index) => {
      const rotateInterpolation = slice.rotate.interpolate({
        inputRange: [0, 1],
        outputRange: [`${slice.angle}deg`, `${slice.angle + 90}deg`]
      });
      
      return (
        <Animated.View
          key={`${slice.id}-${index}`}
          style={[
            styles.sliceEffect,
            {
              left: slice.x - 50, // Center on click point
              top: slice.y - 50,
              opacity: slice.opacity,
              transform: [
                { scale: slice.scale },
                { rotate: rotateInterpolation }
              ]
            }
          ]}
        >
          <MaterialCommunityIcons 
            name={slice.iconName || 'sword-cross'} 
            size={slice.iconSize || 40} 
            color={slice.iconColor || '#FFD700'} 
          />
        </Animated.View>
      );
    });
  };
  
  // Cache rock color calculation
  const rockColor = useMemo(() => {
    switch (state.selectedRock.id) {
      case 'granite': return '#A67D60';
      case 'obsidian': return '#392F41';
      case 'meteorite': return '#475969';
      case 'alien-core': return '#3A5E52';
      default: return '#777777';
    }
  }, [state.selectedRock.id]);

  // Optimize miner calculations
  const minerData = useMemo(() => {
    // Check if any miners are owned
    const hasMiners = state.autoMiners.some(miner => miner.owned && miner.quantity > 0);
    
    if (!hasMiners) {
      return { hasMiners, minerTypes: [], minerCount: 0 };
    }
    
    // Get unique miner types with their evolution levels
    const minerTypes = state.autoMiners
      .filter(miner => miner.owned && miner.quantity > 0)
      .sort((a, b) => b.cost - a.cost)
      .map(miner => ({
        id: miner.id,
        evolutionLevel: miner.evolutionLevel || 0
      }));
    
    // Count unique miner types
    const minerCount = new Set(
      state.autoMiners
        .filter(miner => miner.owned && miner.quantity > 0)
        .map(miner => miner.id)
    ).size;
    
    return { hasMiners, minerTypes, minerCount };
  }, [state.autoMiners]);

  // Calculate best pickaxe only when upgrades change
  const bestPickaxe = useMemo(() => {
    const pickaxeTypes = [
      { id: 'quantum-pickaxe', icon: 'quantum-disruptor.png' },
      { id: 'plasma-pickaxe', icon: 'plasma-cutter.png' },
      { id: 'laser-pickaxe', icon: 'laser-pickaxe.png' },
      { id: 'obsidian-pickaxe', icon: 'ultra-diamond-pickaxe.png' },
      { id: 'gold-pickaxe', icon: 'gold-pickaxe.png' },
      { id: 'diamond-pickaxe', icon: 'diamond-pickaxe.png' },
      { id: 'iron-pickaxe', icon: 'iron-pickaxe.png' },
      { id: 'copper-pickaxe', icon: 'copper-pickaxe.png' },
      { id: 'stone-pickaxe', icon: 'stone-pickaxe.png' },
      { id: 'wooden-pickaxe', icon: 'wooden-pickaxe.png' },
      { id: 'antimatter-crusher', icon: 'antimatter-crusher.png' },
      { id: 'graviton-hammer', icon: 'graviton-hammer.png' },
      { id: 'dark-energy-drill', icon: 'dark-energy-drill.png' },
      { id: 'cosmic-excavator', icon: 'cosmic-excavator.png' },
      { id: 'infinity-pickaxe', icon: 'infinity-pickaxe.png' },
    ];
    
    // If user has selected a pickaxe, use that instead
    if (state.selectedPickaxe) {
      const selectedType = pickaxeTypes.find(type => type.id === state.selectedPickaxe);
      if (selectedType) {
        return selectedType.icon;
      }
    }
    
    // Otherwise fall back to the most powerful owned pickaxe
    for (const type of pickaxeTypes) {
      const upgrade = state.upgrades.find(u => u.id === type.id && u.owned);
      if (upgrade) {
        return type.icon;
      }
    }
    
    return 'wooden-pickaxe.png';
  }, [state.upgrades, state.selectedPickaxe]);
  
  // Get the evolution level of the currently selected pickaxe
  const selectedPickaxeEvolution = useMemo(() => {
    const currentPickaxe = state.upgrades.find(u => u.id === state.selectedPickaxe);
    return currentPickaxe?.evolutionLevel || 0;
  }, [state.upgrades, state.selectedPickaxe]);

  // Get color of the evolution effect based on level
  const getEvolutionColor = useCallback((level) => {
    switch (level) {
      case 1: return 'rgba(52, 152, 219, 0.8)'; // Blue
      case 2: return 'rgba(155, 89, 182, 0.8)'; // Purple
      case 3: return 'rgba(243, 156, 18, 0.8)'; // Gold
      default: return 'transparent';
    }
  }, []);

  // Render evolution effects on miners
  const renderMinerEvolutionEffect = useCallback((miner) => {
    if (!miner.evolutionLevel) return null;
    
    const evolutionColor = getEvolutionColor(miner.evolutionLevel);
    return (
      <View 
        style={[
          styles.minerEvolutionEffect,
          { 
            backgroundColor: evolutionColor,
            opacity: 0.7 + (Math.sin(Date.now() / 1000) + 1) * 0.15 // Pulsating effect
          }
        ]} 
        pointerEvents="none"
      />
    );
  }, [getEvolutionColor]);
  
  // Calculate miner positions - cache the calculation since it's expensive
  const getMinerPosition = useCallback((index, totalMiners) => {
    // Calculate position around a circle
    const angle = (index / totalMiners) * 2 * Math.PI;
    const radius = ROCK_SIZE * 0.6; // Distance from center
    
    // Convert to x, y coordinates
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return { x, y };
  }, []);
  
  // Create reusable particle system for evolved items - optimized version
  const EvolutionParticleSystem = ({ count = 5, evolutionLevel = 0, radius = ROCK_SIZE / 2 }) => {
    // No particles if no evolution
    if (evolutionLevel === 0) return null;
    
    // Determine particle color based on evolution level
    const getParticleColor = () => {
      switch (evolutionLevel) {
        case 1: return 'rgba(52, 152, 219, 0.8)'; // Blue
        case 2: return 'rgba(155, 89, 182, 0.8)'; // Purple
        case 3: return 'rgba(243, 156, 18, 0.8)'; // Gold
        default: return 'transparent';
      }
    };
    
    // Determine particle size based on evolution level
    const getParticleSize = () => {
      return 3 + (evolutionLevel); // Size increases with evolution
    };
    
    // Create particles with different animation durations and delays
    const renderParticles = () => {
      const particles = [];
      // Reduce particle count for better performance
      const particleCount = Math.min(count * evolutionLevel, 12); // Cap at 12 particles max
      
      for (let i = 0; i < particleCount; i++) {
        // Random angle around the circle
        const angle = (i / particleCount) * 2 * Math.PI;
        // Random radius (distance from center)
        const distance = radius * (0.7 + Math.random() * 0.3);
        // Calculate particle position
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        // Animation duration for each particle
        const duration = 1500 + Math.random() * 1000;
        // Animation delay for each particle
        const delay = i * (2000 / particleCount);
        
        // Create animated particle
        const animRef = useRef(new Animated.Value(0)).current;
        
        // Set up animation
        useEffect(() => {
          // Create animation sequence
          const animation = Animated.loop(
            Animated.sequence([
              Animated.timing(animRef, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.sin),
              }),
              Animated.timing(animRef, {
                toValue: 0,
                duration,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.sin),
              }),
            ])
          );
          
          // Start the animation
          animation.start();
          
          // Clean up
          return () => {
            animation.stop();
          };
        }, [animRef, duration, delay]);
        
        // Output opacity based on animation
        const opacity = animRef.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.2, 0.8, 0.2],
        });
        
        // Output scale based on animation
        const scale = animRef.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1.2, 0.5],
        });
        
        // Add particle
        particles.push(
          <Animated.View
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: getParticleSize(),
              height: getParticleSize(),
              borderRadius: getParticleSize() / 2,
              backgroundColor: getParticleColor(),
              opacity,
              transform: [{ scale }],
            }}
          />
        );
      }
      
      return particles;
    };
    
    return (
      <View style={{ 
        position: 'absolute', 
        width: radius * 2, 
        height: radius * 2, 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 5,
        pointerEvents: "none", // Allow touches to pass through
      }}>
        {renderParticles()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Evolution particles for the currently selected pickaxe */}
      {selectedPickaxeEvolution > 0 && (
        <EvolutionParticleSystem 
          evolutionLevel={selectedPickaxeEvolution} 
          radius={ROCK_SIZE * 0.7} 
        />
      )}
      
      {/* Evolution particles for evolved miners */}
      {minerData.hasMiners && minerData.minerTypes.some(m => m.evolutionLevel > 0) && (
        <EvolutionParticleSystem 
          evolutionLevel={Math.max(...minerData.minerTypes.map(m => m.evolutionLevel || 0))}
          radius={ROCK_SIZE * 0.9}
          count={5}
        />
      )}
      
      {/* Rock with Miners */}
      <View style={styles.rockWithCavemenContainer}>
        {/* Only show miners if the player has purchased auto miners */}
        {minerData.hasMiners && (
          <>
            {/* Display all miner types in a circle around the rock */}
            {minerData.minerTypes.map((minerType, index) => {
              const position = getMinerPosition(index, minerData.minerTypes.length);
              const miner = state.autoMiners.find(m => m.id === minerType.id);
              const count = miner?.quantity || 0;
              
              if (count === 0) return null;
              
              return (
                <View
                  key={`${minerType.id}-${index}`}
                  style={[
                    styles.minerContainer,
                    {
                      transform: [
                        { translateX: position.x },
                        { translateY: position.y }
                      ]
                    }
                  ]}
                >
                  <MinerIcon 
                    size={MINER_SIZE}
                    position="none"
                    minerType={minerType.id}
                    key={`${minerType.id}-${index}`} 
                  />
                  <MinerAnimation 
                    size={MINER_SIZE}
                    active={true}
                    pickaxeType={bestPickaxe}
                    evolutionLevel={minerType.evolutionLevel}
                  />
                  <Text style={styles.minerCount}>{count}</Text>
                </View>
              );
            })}
          </>
        )}
        
        {/* Rock Button */}
        <TouchableOpacity
          style={styles.rockButton}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          {selectedPickaxeEvolution > 0 && (
            <Animated.View 
              style={[styles.pickaxeEvolutionEffect, {
                backgroundColor: getEvolutionColor(selectedPickaxeEvolution),
                opacity: 0.5 + (Math.sin(Date.now() / 500) + 1) * 0.15 // Faster pulsating effect
              }]} 
              pointerEvents="none" // Allow touches to pass through
            />
          )}
          <Animated.View
            style={[
              styles.rockContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotateAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-45deg', '45deg']
                    })
                  },
                  { scale: growthAnim }
                ]
              }
            ]}
          >
            {/* Glow effect on 500 click achievement */}
            <Animated.View style={[
              styles.glowOverlay,
              { opacity: glowOpacity }
            ]}>
              <View style={styles.glowInner} />
            </Animated.View>
            
            {/* The actual rock */}
            <SvgRock width={ROCK_SIZE} height={ROCK_SIZE} color={rockColor} />
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      {/* Combo display */}
      {showCombo && combo > 1 && (
        <Animated.View style={[styles.comboContainer, { opacity: comboOpacity }]}>
          <Text style={styles.comboText}>
            {combo}x COMBO!
          </Text>
        </Animated.View>
      )}
      
      {/* Coin earned display */}
      {showCoinEarned && (
        <Animated.View style={[styles.coinEarnedContainer, { opacity: coinOpacity }]}>
          <Text style={styles.coinEarnedText}>
            +{formatScientific(lastClickValue)}
          </Text>
        </Animated.View>
      )}
      
      {/* Render slice effects */}
      {renderSliceEffects()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  rockWithCavemenContainer: {
    position: 'relative',
    width: ROCK_SIZE,
    height: ROCK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rockContainer: {
    width: ROCK_SIZE,
    height: ROCK_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  comboContainer: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 100,
  },
  comboText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  rockInfo: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    width: '80%',
  },
  rockName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 5,
  },
  coinValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  rockValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
    marginRight: 5,
  },
  rockValueLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  coinEarnedContainer: {
    position: 'absolute',
    top: -100,
    right: -20,
    backgroundColor: 'rgba(255, 215, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 100,
  },
  coinEarnedText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
  glowEffect: {
    position: 'absolute',
    width: ROCK_SIZE * 1.5,
    height: ROCK_SIZE * 1.5,
    borderRadius: ROCK_SIZE * 0.75,
    zIndex: -1,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: ROCK_SIZE * 0.75,
  },
  glowOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: ROCK_SIZE * 0.75,
    zIndex: 1,
  },
  glowInner: {
    width: '100%',
    height: '100%',
    borderRadius: ROCK_SIZE * 0.75,
  },
  rockButton: {
    width: ROCK_SIZE,
    height: ROCK_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  minerCount: {
    position: 'absolute',
    top: -10,
    right: -10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sliceEffect: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minerEvolutionEffect: {
    position: 'absolute',
    width: MINER_SIZE,
    height: MINER_SIZE,
    borderRadius: MINER_SIZE * 0.5,
    zIndex: 10,
  },
  pickaxeEvolutionEffect: {
    position: 'absolute',
    width: ROCK_SIZE,
    height: ROCK_SIZE,
    borderRadius: ROCK_SIZE * 0.5,
    zIndex: 10,
  },
}); 