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
  onEquip: (id: string) => void;
  disabled: boolean;
  isEquipped: boolean;
};

const UpgradeItem = ({ upgrade, onPress, onEquip, disabled, isEquipped }: UpgradeItemProps) => {
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
  
  return (
    <TouchableOpacity 
      style={[
        styles.upgradeItem, 
        disabled ? styles.disabledUpgrade : null,
        upgrade.owned ? styles.ownedUpgrade : null,
        isEquipped ? styles.equippedUpgrade : null
      ]}
      onPress={upgrade.owned ? () => onEquip(upgrade.id) : onPress}
      disabled={disabled && !upgrade.owned}
    >
      <View style={styles.upgradeIcon}>
        <PickaxeIcon size={40} pickaxeType={getPickaxeFileName(upgrade.id)} />
      </View>
      
      <View style={styles.upgradeContent}>
        <Text style={styles.upgradeName}>{upgrade.name}</Text>
        <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
        
        <View style={styles.detailsContainer}>
          {!upgrade.owned ? (
            <CoinDisplay 
              value={upgrade.cost} 
              size="small" 
            />
          ) : (
            <View style={styles.cpcBadge}>
              <Text style={styles.cpcText}>
                +{formatNumber(upgrade.cpcIncrease)} CPC
              </Text>
            </View>
          )}
          
          {upgrade.owned && (
            isEquipped ? (
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
            )
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
  
  const handleEquipPickaxe = (id: string) => {
    dispatch({
      type: 'SELECT_PICKAXE',
      payload: id
    });
  };
  
  const renderUpgradeItem = ({ item }: { item: Upgrade }) => {
    const canAfford = state.coins >= item.cost;
    const isEquipped = state.selectedPickaxe === item.id;
    
    return (
      <UpgradeItem
        upgrade={item}
        onPress={() => handleBuyUpgrade(item)}
        onEquip={handleEquipPickaxe}
        disabled={!canAfford || item.owned}
        isEquipped={isEquipped}
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
}); 