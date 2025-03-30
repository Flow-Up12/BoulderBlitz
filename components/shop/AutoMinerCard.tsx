import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, Badge } from 'react-native-paper';
import { useGameContext } from '../../context/GameContext';
import { formatCoins } from '../../utils/formatters';
import type { AutoMiner } from '../../context/GameContext';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';

// SVG icons for each miner type
const minerSvgIcons = {
  // Caveman Apprentice - simple miner with pickaxe
  'caveman-apprentice.png': (size: number, color: string = '#8B4513') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Circle cx="50" cy="35" r="20" fill="#8B5A2B" />
        <Circle cx="42" cy="30" r="3" fill="#000" />
        <Circle cx="58" cy="30" r="3" fill="#000" />
        <Path d="M45 40 Q50 45 55 40" stroke="#000" strokeWidth="2" fill="none" />
        <Path d="M40 55 L40 85 L60 85 L60 55 Z" fill="#8B5A2B" />
        <Path d="M40 60 L30 70" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
        <Path d="M60 60 L75 50" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
        <Path d="M75 40 L85 50 L75 60" fill={color} />
      </G>
    </Svg>
  ),
  
  // Caveman Miner - more experienced miner
  'caveman-miner.png': (size: number, color: string = '#A0522D') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Circle cx="50" cy="35" r="20" fill="#A0522D" />
        <Circle cx="42" cy="30" r="3" fill="#000" />
        <Circle cx="58" cy="30" r="3" fill="#000" />
        <Path d="M45 43 Q50 48 55 43" stroke="#000" strokeWidth="2" fill="none" />
        <Path d="M40 55 L40 85 L60 85 L60 55 Z" fill="#A0522D" />
        <Path d="M40 60 L25 75" stroke="#A0522D" strokeWidth="5" strokeLinecap="round" />
        <Path d="M60 60 L75 50" stroke="#A0522D" strokeWidth="5" strokeLinecap="round" />
        <Path d="M25 65 L10 75" stroke="#8B4513" strokeWidth="3" />
        <Path d="M10 75 L15 85 L20 80" fill="#8B4513" stroke="#8B4513" strokeWidth="2" />
      </G>
    </Svg>
  ),
  
  // Skilled Miner - with helmet
  'skilled-miner.png': (size: number, color: string = '#CD853F') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Path d="M30 35 L70 35 L65 15 L35 15 Z" fill="#FFD700" />
        <Circle cx="50" cy="35" r="20" fill="#CD853F" />
        <Circle cx="42" cy="35" r="3" fill="#000" />
        <Circle cx="58" cy="35" r="3" fill="#000" />
        <Path d="M45 45 Q50 50 55 45" stroke="#000" strokeWidth="2" fill="none" />
        <Path d="M40 55 L40 85 L60 85 L60 55 Z" fill="#CD853F" />
        <Path d="M40 60 L25 70" stroke="#CD853F" strokeWidth="5" strokeLinecap="round" />
        <Path d="M60 60 L75 50" stroke="#CD853F" strokeWidth="5" strokeLinecap="round" />
        <Path d="M75 40 L85 45 L80 55 L70 50 Z" fill="#C0C0C0" />
      </G>
    </Svg>
  ),
  
  // Mining Expert - professional with tools
  'mining-expert.png': (size: number, color: string = '#D2691E') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Path d="M30 35 L70 35 L65 15 L35 15 Z" fill="#DAA520" />
        <Circle cx="50" cy="35" r="20" fill="#D2691E" />
        <Circle cx="42" cy="35" r="3" fill="#000" />
        <Circle cx="58" cy="35" r="3" fill="#000" />
        <Path d="M45 45 Q50 50 55 45" stroke="#000" strokeWidth="2" fill="none" />
        <Path d="M40 55 L40 85 L60 85 L60 55 Z" fill="#D2691E" />
        <Path d="M36 58 L20 70" stroke="#D2691E" strokeWidth="5" strokeLinecap="round" />
        <Path d="M64 58 L80 70" stroke="#D2691E" strokeWidth="5" strokeLinecap="round" />
        <Path d="M20 60 L15 75 L25 80" stroke="#C0C0C0" strokeWidth="3" fill="none" />
        <Path d="M80 60 L85 70 L78 80" stroke="#C0C0C0" strokeWidth="3" fill="none" />
      </G>
    </Svg>
  ),
  
  // Drill Operator - with mechanical drill
  'drill-operator.png': (size: number, color: string = '#B8860B') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Path d="M30 30 L70 30 L65 10 L35 10 Z" fill="#FF8C00" />
        <Circle cx="50" cy="35" r="15" fill="#B8860B" />
        <Circle cx="44" cy="32" r="2" fill="#000" />
        <Circle cx="56" cy="32" r="2" fill="#000" />
        <Path d="M45 40 Q50 43 55 40" stroke="#000" strokeWidth="1" fill="none" />
        <Path d="M42 50 L42 80 L58 80 L58 50 Z" fill="#B8860B" />
        <Path d="M65 60 L80 70" stroke="#696969" strokeWidth="4" />
        <Path d="M80 70 L90 60 L95 70 L90 80 L80 70 Z" fill="#A9A9A9" />
        <Path d="M92 65 L100 65" stroke="#696969" strokeWidth="2" />
        <Path d="M92 70 L100 70" stroke="#696969" strokeWidth="2" />
        <Path d="M92 75 L100 75" stroke="#696969" strokeWidth="2" />
      </G>
    </Svg>
  ),
  
  // Mining Robot - mechanical miner
  'mining-robot.png': (size: number, color: string = '#808080') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Path d="M35 20 L65 20 L60 40 L40 40 Z" fill="#708090" />
        <Circle cx="50" cy="30" r="15" fill="#A9A9A9" />
        <Circle cx="42" cy="28" r="4" fill="#FF0000" />
        <Circle cx="58" cy="28" r="4" fill="#FF0000" />
        <Path d="M40 40 L40 70 L60 70 L60 40 Z" fill="#A9A9A9" />
        <Path d="M35 50 L25 60" stroke="#696969" strokeWidth="4" />
        <Path d="M65 50 L75 60" stroke="#696969" strokeWidth="4" />
        <Path d="M40 70 L35 85" stroke="#696969" strokeWidth="4" />
        <Path d="M60 70 L65 85" stroke="#696969" strokeWidth="4" />
        <Path d="M45 30 Q50 40 55 30" stroke="#4682B4" strokeWidth="2" />
      </G>
    </Svg>
  ),
  
  // Quantum Miner - high-tech miner
  'quantum-miner.png': (size: number, color: string = '#4682B4') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Circle cx="50" cy="30" r="20" fill="#4682B4" />
        <Circle cx="50" cy="30" r="15" fill="#87CEEB" />
        <Circle cx="45" cy="25" r="3" fill="#00008B" />
        <Circle cx="55" cy="25" r="3" fill="#00008B" />
        <Path d="M45 35 Q50 38 55 35" stroke="#00008B" strokeWidth="1" />
        <Path d="M35 50 L35 75 L65 75 L65 50 Z" fill="#4682B4" />
        <Path d="M50 30 L50 10" stroke="#7FFFD4" strokeWidth="2" />
        <Circle cx="50" cy="10" r="5" fill="#00FFFF" />
        <Path d="M40 55 L30 65" stroke="#4682B4" strokeWidth="4" />
        <Path d="M60 55 L70 65" stroke="#4682B4" strokeWidth="4" />
        <Path d="M30 65 C 20 60, 25 45, 40 50" stroke="#7FFFD4" strokeWidth="1" fill="none" />
        <Path d="M70 65 C 80 60, 75 45, 60 50" stroke="#7FFFD4" strokeWidth="1" fill="none" />
      </G>
    </Svg>
  ),
  
  // Nano Miner - microscopic mining technology
  'nano-miner.png': (size: number, color: string = '#20B2AA') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Circle cx="50" cy="50" r="30" fill="#20B2AA" opacity="0.7" />
        <Circle cx="50" cy="50" r="20" fill="#48D1CC" opacity="0.8" />
        <Circle cx="50" cy="50" r="10" fill="#00FFFF" opacity="0.9" />
        <Path d="M50 20 L50 30" stroke="#7FFFD4" strokeWidth="2" />
        <Path d="M50 70 L50 80" stroke="#7FFFD4" strokeWidth="2" />
        <Path d="M20 50 L30 50" stroke="#7FFFD4" strokeWidth="2" />
        <Path d="M70 50 L80 50" stroke="#7FFFD4" strokeWidth="2" />
        <Path d="M32 32 L38 38" stroke="#7FFFD4" strokeWidth="2" />
        <Path d="M62 32 L68 38" stroke="#7FFFD4" strokeWidth="2" />
        <Path d="M32 68 L38 62" stroke="#7FFFD4" strokeWidth="2" />
        <Path d="M62 68 L68 62" stroke="#7FFFD4" strokeWidth="2" />
      </G>
    </Svg>
  ),
  
  // Gravity Miner - uses gravity manipulation
  'gravity-miner-colorful.png': (size: number, color: string = '#8A2BE2') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Circle cx="50" cy="50" r="30" fill="#8A2BE2" opacity="0.7" />
        <Path d="M50 20 C 70 30, 70 70, 50 80" stroke="#DA70D6" strokeWidth="3" fill="none" />
        <Path d="M50 20 C 30 30, 30 70, 50 80" stroke="#DA70D6" strokeWidth="3" fill="none" />
        <Circle cx="50" cy="20" r="5" fill="#EE82EE" />
        <Circle cx="50" cy="80" r="5" fill="#EE82EE" />
        <Circle cx="50" cy="50" r="12" fill="#9370DB" />
        <Circle cx="50" cy="50" r="6" fill="#BA55D3" />
        <Path d="M30 40 C 40 30, 60 30, 70 40" stroke="#DDA0DD" strokeWidth="2" fill="none" />
        <Path d="M30 60 C 40 70, 60 70, 70 60" stroke="#DDA0DD" strokeWidth="2" fill="none" />
      </G>
    </Svg>
  ),
  
  // Time Miner - manipulates time
  'time-miner.png': (size: number, color: string = '#4169E1') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Circle cx="50" cy="50" r="35" fill="#4169E1" opacity="0.5" />
        <Circle cx="50" cy="50" r="30" fill="#6495ED" opacity="0.2" stroke="#6495ED" strokeWidth="1" />
        <Path d="M50 25 L50 50 L65 65" stroke="#F0F8FF" strokeWidth="3" fill="none" />
        <Circle cx="50" cy="50" r="3" fill="#F0F8FF" />
        <Path d="M50 20 L50 25" stroke="#F0F8FF" strokeWidth="2" />
        <Path d="M50 75 L50 80" stroke="#F0F8FF" strokeWidth="2" />
        <Path d="M20 50 L25 50" stroke="#F0F8FF" strokeWidth="2" />
        <Path d="M75 50 L80 50" stroke="#F0F8FF" strokeWidth="2" />
        <Path d="M28 28 L32 32" stroke="#F0F8FF" strokeWidth="2" />
        <Path d="M68 28 L72 32" stroke="#F0F8FF" strokeWidth="2" />
        <Path d="M28 72 L32 68" stroke="#F0F8FF" strokeWidth="2" />
        <Path d="M68 72 L72 68" stroke="#F0F8FF" strokeWidth="2" />
      </G>
    </Svg>
  ),
  
  // Black Hole Miner - harnesses black hole power
  'black-hole-miner.png': (size: number, color: string = '#000000') => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Circle cx="50" cy="50" r="35" fill="#000000" />
        <Circle cx="50" cy="50" r="25" fill="#0F0F0F" stroke="#191970" strokeWidth="1" />
        <Circle cx="50" cy="50" r="15" fill="#191970" />
        <Circle cx="50" cy="50" r="8" fill="#483D8B" />
        <Circle cx="50" cy="50" r="3" fill="#FFFFFF" />
        <Path d="M20 20 Q 50 10, 80 20" stroke="#6A5ACD" strokeWidth="1" fill="none" />
        <Path d="M20 80 Q 50 90, 80 80" stroke="#6A5ACD" strokeWidth="1" fill="none" />
        <Path d="M20 20 Q 10 50, 20 80" stroke="#6A5ACD" strokeWidth="1" fill="none" />
        <Path d="M80 20 Q 90 50, 80 80" stroke="#6A5ACD" strokeWidth="1" fill="none" />
        <Path d="M25 25 L40 40" stroke="#9370DB" strokeWidth="1" opacity="0.6" />
        <Path d="M60 40 L75 25" stroke="#9370DB" strokeWidth="1" opacity="0.6" />
        <Path d="M25 75 L40 60" stroke="#9370DB" strokeWidth="1" opacity="0.6" />
        <Path d="M60 60 L75 75" stroke="#9370DB" strokeWidth="1" opacity="0.6" />
      </G>
    </Svg>
  ),
};

// MinerIconSmall component for the shop cards
const MinerIconSmall = ({ minerType, size = 40 }: { minerType: string, size?: number }) => {
  const renderIcon = minerSvgIcons[minerType];
  
  if (renderIcon) {
    return renderIcon(size);
  }
  
  // Default icon if type not found
  return minerSvgIcons['caveman-apprentice.png'](size);
};

interface AutoMinerCardProps {
  autoMiner: AutoMiner;
}

export const AutoMinerCard = ({ autoMiner }: AutoMinerCardProps) => {
  const { state, dispatch } = useGameContext();
  
  const handlePurchase = () => {
    dispatch({ type: 'BUY_AUTO_MINER', payload: autoMiner.id });
    
    // Check for achievement - buying first auto miner
    if (autoMiner.quantity === 0 && !state.achievements.find(a => a.id === 'auto-mining')?.unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'auto-mining' });
    }
    
    // Check for achievement - owning 10 miners total
    const totalMiners = state.autoMiners.reduce((sum, m) => sum + m.quantity, 0);
    if (totalMiners === 9 && !state.achievements.find(a => a.id === 'mining-company')?.unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'mining-company' });
    }
    
    // Check for achievement - owning 50 miners total
    if (totalMiners === 49 && !state.achievements.find(a => a.id === 'mining-corporation')?.unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'mining-corporation' });
    }
  };
  
  const canAfford = state.coins >= autoMiner.cost;
  
  return (
    <TouchableRipple
      onPress={handlePurchase}
      disabled={!canAfford}
      style={[styles.card, !canAfford && styles.cardDisabled]}
    >
      <View style={styles.cardContent}>
        {/* Icon and Badge section */}
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <MinerIconSmall minerType={autoMiner.icon} size={36} />
          </View>
          
          {autoMiner.quantity > 0 && (
            <Badge style={styles.quantityBadge} size={24}>
              {autoMiner.quantity}
            </Badge>
          )}
        </View>
        
        {/* Info section */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{autoMiner.name}</Text>
          <Text style={styles.description}>{autoMiner.description}</Text>
          <View style={styles.statsRow}>
            <Text style={[styles.costText, !canAfford && styles.costTextDisabled]}>
              Cost: {formatCoins(autoMiner.cost)}
            </Text>
            <Text style={styles.cpsText}>
              +{autoMiner.cps}/sec
            </Text>
          </View>
        </View>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBadge: {
    backgroundColor: '#7B68EE',
    marginBottom: 4,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  costTextDisabled: {
    color: '#CF6679',
  },
  cpsText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
}); 