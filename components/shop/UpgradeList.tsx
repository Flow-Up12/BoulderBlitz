import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatters';
import CoinDisplay from '../common/CoinDisplay';
import { Upgrade } from '../../context/GameContext';
import PickaxeIcon from '../game/PickaxeIcon';

type UpgradeItemProps = {
  upgrade: Upgrade;
  onPress: () => void;
  disabled: boolean;
};

const UpgradeItem = ({ upgrade, onPress, disabled }: UpgradeItemProps) => {
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
      'quantum-disruptor': 'quantum-disruptor.png'
    };
    
    return mapping[id] || 'wooden-pickaxe.png';
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.upgradeItem, 
        disabled ? styles.disabledUpgrade : null,
        upgrade.owned ? styles.ownedUpgrade : null
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.upgradeIcon}>
        <PickaxeIcon size={40} pickaxeType={getPickaxeFileName(upgrade.id)} />
      </View>
      
      <View style={styles.upgradeContent}>
        <Text style={styles.upgradeName}>{upgrade.name}</Text>
        <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
        
        <View style={styles.detailsContainer}>
          <CoinDisplay 
            value={upgrade.cost} 
            size="small" 
          />
          
          {upgrade.owned && (
            <View style={styles.cpcBadge}>
              <Text style={styles.cpcText}>
                +{formatNumber(upgrade.cpcIncrease)} CPC
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
  
  const renderUpgradeItem = ({ item }: { item: Upgrade }) => {
    const canAfford = state.coins >= item.cost;
    
    return (
      <UpgradeItem
        upgrade={item}
        onPress={() => handleBuyUpgrade(item)}
        disabled={!canAfford || item.owned}
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
  upgradeItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  disabledUpgrade: {
    opacity: 0.7,
    backgroundColor: '#181818',
  },
  ownedUpgrade: {
    backgroundColor: '#2E3D32',
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
}); 