import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, Avatar } from 'react-native-paper';
import { useGameContext } from '../../context/GameContext';
import { formatCoins } from '../../utils/formatters';
import type { Upgrade } from '../../context/GameContext';

interface UpgradeCardProps {
  upgrade: Upgrade;
}

export const UpgradeCard = ({ upgrade }: UpgradeCardProps) => {
  const { state, dispatch } = useGameContext();
  
  const handlePurchase = () => {
    dispatch({ type: 'BUY_UPGRADE', payload: upgrade.id });
    
    // Check for achievement - buying 3 different upgrades
    const ownedUpgrades = state.upgrades.filter(u => u.owned).length;
    if (ownedUpgrades === 2 && !upgrade.owned) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'pickaxe-collector' });
    }
  };
  
  const canAfford = state.coins >= upgrade.cost;
  
  return (
    <TouchableRipple
      style={[
        styles.container,
        upgrade.owned ? styles.owned : !canAfford ? styles.cantAfford : null
      ]}
      onPress={handlePurchase}
      disabled={upgrade.owned || !canAfford}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <Avatar.Icon
            size={40}
            icon={getUpgradeIcon(upgrade.id)}
            style={[
              styles.icon,
              upgrade.owned && styles.ownedIcon
            ]}
          />
          
          <View style={styles.textContainer}>
            <Text style={styles.name}>{upgrade.name}</Text>
            <Text style={styles.description}>{upgrade.description}</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          {!upgrade.owned ? (
            <Text style={[styles.price, !canAfford && styles.cantAffordText]}>
              {formatCoins(upgrade.cost)}
            </Text>
          ) : (
            <Text style={styles.ownedText}>Owned</Text>
          )}
        </View>
      </View>
    </TouchableRipple>
  );
};

// Helper to get appropriate icon for each upgrade
const getUpgradeIcon = (upgradeId: string) => {
  if (upgradeId.includes('pickaxe')) {
    return 'pickaxe';
  }
  
  return 'toolbox';
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  owned: {
    borderColor: '#4CAF50',
    borderWidth: 1,
    opacity: 0.8,
  },
  cantAfford: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 3,
  },
  icon: {
    marginRight: 12,
    backgroundColor: '#7B68EE', // Match primary color
  },
  ownedIcon: {
    backgroundColor: '#4CAF50', // Green for owned
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  priceContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: 'bold',
    color: '#4CAF50', // Green
  },
  ownedText: {
    fontWeight: 'bold',
    color: '#4CAF50', // Green
  },
  cantAffordText: {
    color: '#F44336', // Red
  },
}); 