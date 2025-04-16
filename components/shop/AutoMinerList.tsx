import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatters';
import CoinDisplay from '../common/CoinDisplay';
import { AutoMiner } from '../../context/GameContext';
import MinerIcon from '../game/MinerIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type AutoMinerItemProps = {
  autoMiner: AutoMiner;
  onPress: () => void;
  onEvolve: (id: string) => void;
  disabled: boolean;
  canEvolve: boolean;
  index: number;
};

const AutoMinerItem = ({ autoMiner, onPress, onEvolve, disabled, canEvolve, index }: AutoMinerItemProps) => {
  // Determine evolution border and glow colors based on evolution level
  const getEvolutionColors = (level = 0) => {
    switch (level) {
      case 1:
        return {
          borderColor: '#3498db', // Blue
          glowColors: ['rgba(52, 152, 219, 0.7)', 'rgba(52, 152, 219, 0)'] as [string, string],
          starColor: '#3498db',
          label: 'Enhanced'
        };
      case 2:
        return {
          borderColor: '#9b59b6', // Purple
          glowColors: ['rgba(155, 89, 182, 0.7)', 'rgba(155, 89, 182, 0)'] as [string, string],
          starColor: '#9b59b6',
          label: 'Superior'
        };
      case 3:
        return {
          borderColor: '#f39c12', // Orange/Gold
          glowColors: ['rgba(243, 156, 18, 0.8)', 'rgba(243, 156, 18, 0)'] as [string, string],
          starColor: '#f39c12',
          label: 'Legendary'
        };
      default:
        return {
          borderColor: '#1E3A4A',
          glowColors: ['transparent', 'transparent'] as [string, string],
          starColor: 'transparent',
          label: ''
        };
    }
  };

  const evolutionColors = getEvolutionColors(autoMiner.evolutionLevel);
  
  // Render stars based on evolution level
  const renderEvolutionStars = () => {
    if (!autoMiner.owned || !autoMiner.evolutionLevel) return null;
    
    return (
      <View style={styles.evolutionStars}>
        {[...Array(autoMiner.evolutionLevel)].map((_, i) => (
          <MaterialCommunityIcons 
            key={`star-${i}`} 
            name="star" 
            size={14} 
            color={evolutionColors.starColor} 
            style={styles.evolutionStar}
          />
        ))}
      </View>
    );
  };
  
  // Calculate the effective CPS with evolution multiplier
  const getEffectiveCPS = () => {
    const baseOutput = autoMiner.cps * autoMiner.quantity;
    const evolutionMultiplier = autoMiner.evolutionLevel ? 1 + (autoMiner.evolutionLevel * 0.5) : 1;
    return baseOutput * evolutionMultiplier;
  };

  return (
    <View style={[
      styles.minerItemWrapper,
      autoMiner.evolutionLevel > 0 && styles.evolvedWrapper
    ]}>
      {autoMiner.evolutionLevel > 0 && (
        <LinearGradient
          colors={evolutionColors.glowColors}
          style={styles.evolutionGlow}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      <TouchableOpacity 
        style={[
          styles.minerItem, 
          disabled ? styles.disabledMiner : null,
          autoMiner.owned ? styles.ownedMiner : null,
          autoMiner.evolutionLevel > 0 && { 
            borderColor: evolutionColors.borderColor,
            borderWidth: 1,
            backgroundColor: autoMiner.evolutionLevel === 3 ? 
              'rgba(30, 30, 30, 0.9)' : // Darker for max evolution
              'rgba(30, 58, 74, 0.9)'   // Slightly transparent for others
          }
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={[
          styles.minerIcon,
          autoMiner.evolutionLevel > 0 && {
            borderColor: evolutionColors.borderColor,
            borderWidth: 1,
          }
        ]}>
          <MinerIcon 
            minerType={autoMiner.icon} 
            size={40}
            position="none"
          />
          
          {/* Evolution level indicator */}
          {renderEvolutionStars()}
        </View>
        
        <View style={styles.minerContent}>
          <Text style={styles.minerName}>
            {autoMiner.name}{autoMiner.quantity > 0 ? <Text> ({autoMiner.quantity})</Text> : null}
            {autoMiner.evolutionLevel > 0 && 
              <Text style={[styles.evolutionText, {color: evolutionColors.starColor}]}>
                {" "}[Tier {autoMiner.evolutionLevel}]
              </Text>
            }
          </Text>
          
          <Text style={styles.minerDescription}>
            {autoMiner.evolutionLevel > 0 
              ? `${autoMiner.description} (${(1 + autoMiner.evolutionLevel * 0.5).toFixed(1)}x bonus)`
              : autoMiner.description
            }
          </Text>
          
          <View style={styles.detailsContainer}>
            <CoinDisplay 
              value={autoMiner.cost} 
              size="small" 
            />
            
            {autoMiner.owned && (
              <View style={styles.buttonContainer}>
                <View style={styles.cpsContainer}>
                  <Text style={styles.cpsText}>
                    <Text>+{formatNumber(getEffectiveCPS())} CPS</Text>
                  </Text>
                </View>
                
                {canEvolve && autoMiner.evolutionLevel < 3 && (
                  <TouchableOpacity 
                    style={[styles.evolveButton, !canEvolve && styles.evolveButtonDisabled]}
                    onPress={() => onEvolve(autoMiner.id)}
                    disabled={!canEvolve}
                  >
                    <Text style={styles.evolveText}>
                      <Text>Evolve ({autoMiner.evolutionCost})</Text> <Text>🌟</Text>
                    </Text>
                  </TouchableOpacity>
                )}
                
                {autoMiner.evolutionLevel === 3 && (
                  <View style={styles.maxEvolvedBadge}>
                    <Text style={styles.maxEvolvedText}>
                      <Text>MAX</Text>
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      {autoMiner.evolutionLevel > 0 && (
        <View style={styles.evolutionLabelContainer}>
          <LinearGradient
            colors={evolutionColors.glowColors}
            style={styles.evolutionLabelGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.evolutionLabelText, { color: evolutionColors.borderColor }]}>
              {evolutionColors.label}
            </Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

export default function AutoMinerList() {
  const { state, dispatch } = useGameContext();
  
  const handleBuyAutoMiner = (miner: AutoMiner) => {
    dispatch({ 
      type: 'BUY_AUTO_MINER', 
      payload: miner.id 
    });
  };
  
  const handleEvolveMiner = (id: string) => {
    dispatch({
      type: 'EVOLVE_MINER',
      payload: id
    });
  };
  
  const renderMinerItem = ({ item, index }: { item: AutoMiner, index: number }) => {
    const canAfford = state.coins >= item.cost;
    const canEvolve = item.owned && 
                     item.quantity > 0 &&
                     item.evolutionLevel < 3 && 
                     state.goldCoins >= (item.evolutionCost || 0);
    
    return (
      <AutoMinerItem
        autoMiner={item}
        onPress={() => handleBuyAutoMiner(item)}
        onEvolve={handleEvolveMiner}
        disabled={!canAfford}
        canEvolve={canEvolve}
        index={index}
      />
    );
  };
  
  // Create ListHeaderComponent for the FlatList
  const ListHeader = () => (
    <Text style={styles.title}>
      <Text>Auto Miners</Text>
    </Text>
  );
  
  return (
    <View style={styles.container}>
      <FlatList
        data={state.autoMiners}
        renderItem={renderMinerItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={ListHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 150, // Increased bottom padding to ensure last item is easily accessible
  },
  minerItemWrapper: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 10,
  },
  evolvedWrapper: {
    marginBottom: 16,
  },
  evolutionGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 12,
    zIndex: 1,
  },
  minerItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    zIndex: 2,
  },
  disabledMiner: {
    opacity: 0.7,
    backgroundColor: '#181818',
  },
  ownedMiner: {
    backgroundColor: '#1E3A4A',
  },
  minerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E2E2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  minerContent: {
    flex: 1,
  },
  minerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  minerDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cpsContainer: {
    backgroundColor: '#2E4A5A',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cpsText: {
    color: '#8EDBFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  evolveButton: {
    backgroundColor: '#8E44AD',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  evolveButtonDisabled: {
    backgroundColor: '#4A235A',
    opacity: 0.7,
  },
  evolveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  maxEvolvedBadge: {
    backgroundColor: '#F39C12',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  maxEvolvedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  evolutionStars: {
    position: 'absolute',
    top: -6,
    right: -6,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  evolutionStar: {
    marginHorizontal: 1,
  },
  evolutionText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  evolutionLabelContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  evolutionLabelGradient: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  evolutionLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 