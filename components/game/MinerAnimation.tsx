import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PickaxeIcon from './PickaxeIcon';
import { useGameContext } from '../../context/GameContext';

export type MinerAnimationProps = {
  size: number;
  active: boolean;
  pickaxeType?: string;
};

// Function to get the best pickaxe based on owned upgrades
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
    { id: 'wooden-pickaxe', icon: 'wooden-pickaxe.png' }
  ];
  
  for (const type of pickaxeTypes) {
    const upgrade = upgrades.find(u => u.id === type.id && u.owned);
    if (upgrade) {
      return type.icon;
    }
  }
  
  return 'wooden-pickaxe.png';
};

function MinerAnimationComponent({ size, active, pickaxeType = 'wooden-pickaxe.png' }: MinerAnimationProps) {
  const { state } = useGameContext();
  const pickaxeAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;
  
  // Cache pickaxe animations to avoid recreating them on each render
  const pickaxeAnimations = useRef({
    loop: null as any,
    sequence: Animated.sequence([
      Animated.timing(pickaxeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(pickaxeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ])
  }).current;
  
  // Cache coin animations
  const coinAnimations = useRef({
    loop: null as any,
    sequence: Animated.sequence([
      Animated.delay(400), // Wait for pickaxe to hit
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
    }
    
    return () => {
      pickaxeAnim.stopAnimation();
      coinAnim.stopAnimation();
      pickaxeAnimations.loop = null;
      coinAnimations.loop = null;
    };
  }, [active]);
  
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
        <View style={styles.coin} />
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
}); 