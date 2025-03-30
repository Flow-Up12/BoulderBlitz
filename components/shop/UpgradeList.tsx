import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatters';
import CoinDisplay from '../common/CoinDisplay';
import { Upgrade } from '../../context/GameContext';
import PickaxeIcon from '../game/PickaxeIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type UpgradeItemProps = {
  upgrade: Upgrade;
  onPress: () => void;
  onEquip: (id: string) => void;
  onEvolve: (id: string) => void;
  disabled: boolean;
  isEquipped: boolean;
  canEvolve: boolean;
};

const UpgradeItem = ({ upgrade, onPress, onEquip, onEvolve, disabled, isEquipped, canEvolve }: UpgradeItemProps) => {
  // Map upgrade id to the corresponding pickaxe image file name
  const getPickaxeFileName = (id: string) => {
    const mapping = {
      'wooden-pickaxe': 'wooden-pickaxe.png',
      'stone-pickaxe': 'stone-pickaxe.png',
      'copper-pickaxe': 'copper-pickaxe.png',
      'iron-pickaxe': 'iron-pickaxe.png',
      'gold-pickaxe': 'gold-pickaxe.png',
      'diamond-pickaxe': 'diamond-pickaxe.png',
      'obsidian-pickaxe': 'ultra-diamond-pickaxe.png',
      'plasma-pickaxe': 'plasma-cutter.png',
      'quantum-pickaxe': 'quantum-disruptor.png',
      'ultra-diamond-pickaxe': 'ultra-diamond-pickaxe.png',
      'laser-pickaxe': 'laser-pickaxe.png',
      'plasma-cutter': 'plasma-cutter.png',
      'quantum-disruptor': 'quantum-disruptor.png',
      'antimatter-crusher': 'antimatter-crusher.png',
      'graviton-hammer': 'graviton-hammer.png',
      'dark-energy-drill': 'dark-energy-drill.png',
      'cosmic-excavator': 'cosmic-excavator.png',
      'infinity-pickaxe': 'infinity-pickaxe.png',
    };
    
    return mapping[id] || 'wooden-pickaxe.png';
  };

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
          borderColor: '#2E3D32',
          glowColors: ['transparent', 'transparent'] as [string, string],
          starColor: 'transparent',
          label: ''
        };
    }
  };

  const evolutionColors = getEvolutionColors(upgrade.evolutionLevel);
  
  // Render stars based on evolution level
  const renderEvolutionStars = () => {
    if (!upgrade.owned || !upgrade.evolutionLevel) return null;
    
    return (
      <View style={styles.evolutionStars}>
        {[...Array(upgrade.evolutionLevel)].map((_, i) => (
          <MaterialCommunityIcons 
            key={i} 
            name="star" 
            size={14} 
            color={evolutionColors.starColor} 
            style={styles.evolutionStar}
          />
        ))}
      </View>
    );
  };
  
  return (
    <View style={[
      styles.upgradeItemWrapper,
      upgrade.evolutionLevel > 0 && styles.evolvedWrapper
    ]}>
      {upgrade.evolutionLevel > 0 && (
        <LinearGradient
          colors={evolutionColors.glowColors}
          style={styles.evolutionGlow}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      <TouchableOpacity 
        style={[
          styles.upgradeItem, 
          disabled ? styles.disabledUpgrade : null,
          upgrade.owned ? styles.ownedUpgrade : null,
          isEquipped ? styles.equippedUpgrade : null,
          upgrade.evolutionLevel > 0 && { 
            borderColor: evolutionColors.borderColor,
            borderWidth: 1,
            backgroundColor: upgrade.evolutionLevel === 3 ? 
              'rgba(30, 30, 30, 0.9)' : // Darker for max evolution
              'rgba(46, 61, 50, 0.9)'   // Slightly transparent for others
          }
        ]}
        onPress={upgrade.owned ? () => onEquip(upgrade.id) : onPress}
        disabled={disabled && !upgrade.owned}
      >
        <View style={[
          styles.upgradeIcon,
          upgrade.evolutionLevel > 0 && {
            borderColor: evolutionColors.borderColor,
            borderWidth: 1,
          }
        ]}>
          <PickaxeIcon size={40} pickaxeType={getPickaxeFileName(upgrade.id)} />
          
          {/* Evolution level indicator */}
          {renderEvolutionStars()}
        </View>
        
        <View style={styles.upgradeContent}>
          <Text style={styles.upgradeName}>
            {upgrade.name}
            {upgrade.evolutionLevel > 0 && 
              <Text style={[styles.evolutionText, {color: evolutionColors.starColor}]}>
                {" "}[Tier {upgrade.evolutionLevel}]
              </Text>
            }
          </Text>
          
          <Text style={styles.upgradeDescription}>
            {upgrade.evolutionLevel > 0 
              ? `${upgrade.description} (${(1 + upgrade.evolutionLevel * 0.5).toFixed(1)}x bonus)`
              : upgrade.description
            }
          </Text>
          
          <View style={styles.detailsContainer}>
            {!upgrade.owned ? (
              <CoinDisplay 
                value={upgrade.cost} 
                size="small" 
              />
            ) : (
              <View style={styles.cpcBadge}>
                <Text style={styles.cpcText}>
                  +{formatNumber(upgrade.cpcIncrease * (upgrade.evolutionLevel ? 1 + (upgrade.evolutionLevel * 0.5) : 1))} CPC
                </Text>
              </View>
            )}
            
            {upgrade.owned && (
              <View style={styles.buttonContainer}>
                {isEquipped ? (
                  <View style={styles.equippedBadge}>
                    <Text style={styles.equippedText}>Equipped</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.equipButton}
                    onPress={() => onEquip(upgrade.id)}
                  >
                    <Text style={styles.equipText}>Equip</Text>
                  </TouchableOpacity>
                )}
                
                {canEvolve && upgrade.evolutionLevel < 3 && (
                  <TouchableOpacity 
                    style={[styles.evolveButton, !canEvolve && styles.evolveButtonDisabled]}
                    onPress={() => onEvolve(upgrade.id)}
                    disabled={!canEvolve}
                  >
                    <Text style={styles.evolveText}>
                      Evolve ({upgrade.evolutionCost} 🌟)
                    </Text>
                  </TouchableOpacity>
                )}
                
                {upgrade.evolutionLevel === 3 && (
                  <View style={styles.maxEvolvedBadge}>
                    <Text style={styles.maxEvolvedText}>MAX</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      {upgrade.evolutionLevel > 0 && (
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

export default function UpgradeList() {
  const { state, dispatch } = useGameContext();
  
  // Filter to only show pickaxe upgrades
  const pickaxeUpgrades = state.upgrades.filter(upgrade => upgrade.type === 'pickaxe');
  
  const handleBuyUpgrade = (upgrade: Upgrade) => {
    dispatch({ 
      type: 'BUY_UPGRADE', 
      payload: upgrade.id 
    });
  };
  
  const handleEquipPickaxe = (id: string) => {
    dispatch({
      type: 'SELECT_PICKAXE',
      payload: id
    });
  };
  
  const handleEvolvePickaxe = (id: string) => {
    dispatch({
      type: 'EVOLVE_PICKAXE',
      payload: id
    });
  };
  
  const renderUpgradeItem = ({ item }: { item: Upgrade }) => {
    const canAfford = state.coins >= item.cost;
    const isEquipped = state.selectedPickaxe === item.id;
    const canEvolve = item.owned && 
                      item.evolutionLevel < 3 && 
                      state.goldCoins >= (item.evolutionCost || 0);
    
    return (
      <UpgradeItem
        upgrade={item}
        onPress={() => handleBuyUpgrade(item)}
        onEquip={handleEquipPickaxe}
        onEvolve={handleEvolvePickaxe}
        disabled={!canAfford || item.owned}
        isEquipped={isEquipped}
        canEvolve={canEvolve}
      />
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pickaxes</Text>
      <FlatList
        data={pickaxeUpgrades}
        renderItem={renderUpgradeItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
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
    paddingBottom: 150,
  },
  upgradeItemWrapper: {
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
  upgradeItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    zIndex: 2,
  },
  disabledUpgrade: {
    opacity: 0.7,
    backgroundColor: '#181818',
  },
  ownedUpgrade: {
    backgroundColor: '#2E3D32',
  },
  equippedUpgrade: {
    backgroundColor: '#1E5A2E',
    borderWidth: 1,
    borderColor: '#8EFFB2',
  },
  upgradeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#2E2E2E',
    overflow: 'hidden',
    position: 'relative',
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  upgradeDescription: {
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
  cpcBadge: {
    backgroundColor: '#2E5A2E',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cpcText: {
    color: '#8EFFB2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  equippedBadge: {
    backgroundColor: '#2E5A2E',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  equippedText: {
    color: '#8EFFB2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  equipButton: {
    backgroundColor: '#2E5A2E',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  equipText: {
    color: '#FFFFFF',
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