import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatNumber } from '../../utils/formatters';
import CoinDisplay from '../common/CoinDisplay';
import { SpecialUpgrade } from '../../context/GameContext';

type SpecialUpgradeItemProps = {
  upgrade: SpecialUpgrade;
  onPress: () => void;
  disabled: boolean;
};

const SpecialUpgradeItem = ({ upgrade, onPress, disabled }: SpecialUpgradeItemProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.upgradeItem, 
        disabled ? styles.disabledUpgrade : null,
        upgrade.owned ? styles.ownedUpgrade : null
      ]}
      onPress={onPress}
      disabled={disabled || upgrade.owned}
    >
      <View style={styles.upgradeIcon}>
        <MaterialCommunityIcons 
          name="star" 
          size={24} 
          color={upgrade.owned ? '#FFD700' : disabled ? '#666666' : '#FFD700'} 
        />
      </View>
      
      <View style={styles.upgradeContent}>
        <Text style={styles.upgradeName}>{upgrade.name}</Text>
        <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
        <Text style={styles.upgradeEffect}>{getEffectDescription(upgrade.effect)}</Text>
        
        {!upgrade.owned && (
          <View style={styles.costContainer}>
            <CoinDisplay 
              value={upgrade.cost} 
              size="small"
              isGold={true}
            />
          </View>
        )}
        
        {upgrade.owned && (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedText}>Owned</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SpecialUpgradeShop() {
  const { state, dispatch } = useGameContext();
  
  const handleBuySpecialUpgrade = (upgradeId: string) => {
    dispatch({ 
      type: 'BUY_SPECIAL_UPGRADE', 
      payload: upgradeId 
    });
  };
  
  const renderUpgradeItem = ({ item }: { item: SpecialUpgrade }) => {
    const canAfford = state.goldCoins >= item.cost;
    
    return (
      <SpecialUpgradeItem
        upgrade={item}
        onPress={() => handleBuySpecialUpgrade(item.id)}
        disabled={!canAfford}
      />
    );
  };
  
  // Create ListHeaderComponent for the FlatList
  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Special Upgrades</Text>
      <View style={styles.goldCoinsDisplay}>
        <CoinDisplay value={state.goldCoins} isGold={true} />
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {state.specialUpgrades.length > 0 ? (
        <FlatList
          data={state.specialUpgrades}
          renderItem={renderUpgradeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={ListHeader}
        />
      ) : (
        <>
          <ListHeader />
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="lock" size={48} color="#555555" />
            <Text style={styles.emptyText}>
              Complete a rebirth to unlock special upgrades!
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  goldCoinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
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
    backgroundColor: '#1E1A00',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  upgradeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E2E2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    marginBottom: 4,
  },
  upgradeEffect: {
    fontSize: 12,
    color: '#FFD700',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  ownedText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Add this helper function to convert effect IDs into readable text
const getEffectDescription = (effectId: string): string => {
  const effectMap = {
    'doubles_cpc': 'Doubles click power',
    'boosts_auto_miners': 'Auto miners work 50% faster',
    'click_combo': 'Every 10 clicks gives 10x CPC bonus',
    'offline_progress': 'Earn coins while away',
    'increases_cpc_by_25_percent': '25% boost to click power',
    'increases_cps_by_25_percent': '25% boost to auto miners',
    'triples_pickaxe_effects': 'Triple effect of all pickaxes',
    'chance_for_double_coins': '10% chance for double coins per click',
    'faster_ability_cooldown': '50% faster ability cooldowns',
    'easier_rebirth': '20% less coins needed for rebirth'
  };
  
  return effectMap[effectId] || effectId;
}; 