import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PickaxeIcon from './PickaxeIcon';
import { useGameContext } from '../../context/GameContext';
import { LinearGradient } from 'expo-linear-gradient';

export type MinerAnimationProps = {
  size: number;
  active: boolean;
  pickaxeType?: string;
  evolutionLevel?: number;
};


const getBestPickaxe = (upgrades: any[]) => {
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
  
  for (const type of pickaxeTypes) {
    const upgrade = upgrades.find(u => u.id === type.id && u.owned);
    if (upgrade) {
      return type.icon;
    }
  }
  
  return 'wooden-pickaxe.png';
};

function MinerAnimationComponent({ size, active, pickaxeType = 'wooden-pickaxe.png', evolutionLevel = 0 }: MinerAnimationProps) {
  const { state } = useGameContext();
  const pickaxeAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Determine animation duration based on evolution level - higher levels mine faster
  const getAnimationDuration = () => {
    return 500 - (evolutionLevel * 75); // Decrease duration by 75ms per level (faster)
  };
  
  // Get glow colors based on evolution level
  const getGlowColors = (): [string, string] => {
    switch (evolutionLevel) {
      case 1:
        return ['rgba(52, 152, 219, 0.7)', 'rgba(52, 152, 219, 0)'] as [string, string]; // Blue
      case 2:
        return ['rgba(155, 89, 182, 0.7)', 'rgba(155, 89, 182, 0)'] as [string, string]; // Purple
      case 3:
        return ['rgba(243, 156, 18, 0.8)', 'rgba(243, 156, 18, 0)'] as [string, string]; // Gold
      default:
        return ['transparent', 'transparent'] as [string, string];
    }
  };
  
  // Cache pickaxe animations to avoid recreating them on each render
  const pickaxeAnimations = useRef({
    loop: null as any,
    sequence: Animated.sequence([
      Animated.timing(pickaxeAnim, {
        toValue: 1,
        duration: getAnimationDuration(),
        useNativeDriver: true,
      }),
      Animated.timing(pickaxeAnim, {
        toValue: 0,
        duration: getAnimationDuration(),
        useNativeDriver: true,
      }),
    ])
  }).current;
  
  // Cache coin animations
  const coinAnimations = useRef({
    loop: null as any,
    sequence: Animated.sequence([
      Animated.delay(getAnimationDuration() * 0.8), // Wait for pickaxe to hit
      Animated.timing(coinAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(coinAnim, {
        toValue: 0,
        duration: 0, // Reset immediately
        useNativeDriver: true,
      }),
    ])
  }).current;
  
  // Evolution glow effect
  const glowAnimations = useRef({
    loop: null as any,
    sequence: Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0.5,
        duration: 1200,
        useNativeDriver: true,
      }),
    ])
  }).current;
  
  // Evolution scale pulse effect
  const scaleAnimations = useRef({
    loop: null as any,
    sequence: Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1 + (evolutionLevel * 0.05),
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ])
  }).current;
  
  // Set up animations
  useEffect(() => {
    if (active) {
      // Only create loop animations if they don't exist or need to be restarted
      if (!pickaxeAnimations.loop) {
        pickaxeAnimations.loop = Animated.loop(pickaxeAnimations.sequence);
        pickaxeAnimations.loop.start();
      }
      
      if (!coinAnimations.loop) {
        coinAnimations.loop = Animated.loop(coinAnimations.sequence);
        coinAnimations.loop.start();
      }
      
      // Evolution effects
      if (evolutionLevel > 0) {
        if (!glowAnimations.loop) {
          glowAnimations.loop = Animated.loop(glowAnimations.sequence);
          glowAnimations.loop.start();
        }
        
        if (!scaleAnimations.loop) {
          scaleAnimations.loop = Animated.loop(scaleAnimations.sequence);
          scaleAnimations.loop.start();
        }
      }
    } else {
      // Stop animations when not active
      if (pickaxeAnimations.loop) {
        pickaxeAnim.stopAnimation();
        pickaxeAnimations.loop = null;
      }
      
      if (coinAnimations.loop) {
        coinAnim.stopAnimation();
        coinAnimations.loop = null;
      }
      
      if (glowAnimations.loop) {
        glowAnim.stopAnimation();
        glowAnimations.loop = null;
      }
      
      if (scaleAnimations.loop) {
        scaleAnim.stopAnimation();
        scaleAnimations.loop = null;
      }
    }
    
    return () => {
      pickaxeAnim.stopAnimation();
      coinAnim.stopAnimation();
      glowAnim.stopAnimation();
      scaleAnim.stopAnimation();
      pickaxeAnimations.loop = null;
      coinAnimations.loop = null;
      glowAnimations.loop = null;
      scaleAnimations.loop = null;
    };
  }, [active, evolutionLevel]);
  
  // Don't render anything if not active
  if (!active) return null;
  
  // Determine which pickaxe to use (from props or get best available)
  // Use memoization to prevent recalculating on every render
  const actualPickaxeType = useMemo(() => 
    pickaxeType || getBestPickaxe(state.upgrades),
    [pickaxeType, state.upgrades]
  );
  
  // Pre-calculate rotation and translation values
  const rotateInterpolation = {
    inputRange: [0, 1],
    outputRange: ['-25deg', '35deg'],
  };
  
  const translateXInterpolation = {
    inputRange: [0, 0.5, 1],
    outputRange: [0, size * 0.1, 0],
  };
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Evolution Glow Background - only visible for evolved miners */}
      {evolutionLevel > 0 && (
        <Animated.View 
          style={[
            styles.evolutionGlow, 
            { 
              width: size * 1.8, 
              height: size * 1.8,
              opacity: glowAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={getGlowColors()}
            style={styles.gradientFill}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      )}
      
      {/* Pickaxe animation */}
      <Animated.View
        style={[
          styles.pickaxeContainer,
          {
            transform: [
              { translateX: size * .2 },
              { translateY: size * .05 },
              { rotate: pickaxeAnim.interpolate(rotateInterpolation) },
              { translateX: pickaxeAnim.interpolate(translateXInterpolation) },
            ],
          },
        ]}
      >
        <PickaxeIcon size={size * 0.65} pickaxeType={actualPickaxeType} />
      </Animated.View>
      
      {/* Coin animation */}
      <Animated.View
        style={[
          styles.coinContainer,
          {
            opacity: coinAnim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 1, 1, 0],
            }),
            transform: [
              { translateY: coinAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -size * 0.5],
              })},
            ],
          },
        ]}
      >
        <View 
          style={[
            styles.coin, 
            // Increase size and change color based on evolution level
            evolutionLevel > 0 && {
              width: 10 + (evolutionLevel * 2),
              height: 10 + (evolutionLevel * 2),
              borderRadius: 5 + (evolutionLevel * 1),
              backgroundColor: evolutionLevel === 3 ? '#FFD700' : // Gold
                               evolutionLevel === 2 ? '#C0C0C0' : // Silver
                               evolutionLevel === 1 ? '#CD7F32' : // Bronze
                               '#FFD700', // Default gold
            }
          ]} 
        />
      </Animated.View>
    </View>
  );
}

// Wrap component with React.memo to prevent unnecessary rerenders
const MinerAnimation = React.memo(MinerAnimationComponent);
export default MinerAnimation;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  pickaxeContainer: {
    position: 'absolute',
    zIndex: 30,
  },
  coinContainer: {
    position: 'absolute',
    zIndex: 25,
  },
  coin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#FFC000',
  },
  evolutionGlow: {
    position: 'absolute',
    borderRadius: 100,
    overflow: 'hidden',
    zIndex: 15,
  },
  gradientFill: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
}); 