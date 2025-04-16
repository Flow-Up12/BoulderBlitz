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
  const { state, dispatch } = useGameContext();

  const handleUpgrade = (e) => {
    e.stopPropagation(); // Prevent triggering the parent touchable
    dispatch({ 
      type: 'UPGRADE_SPECIAL_UPGRADE', 
      payload: upgrade.id 
    });
  };

  // Calculate the effect description based on level
  const getEffectDescription = (effectId: string, level: number = 1, multiplier: number = 1): string => {
    const baseDescription = {
      'doubles_cpc': `${2 * level}x click power`,
      'boosts_auto_miners': `+${50 * level}% auto miner efficiency`,
      'click_combo': `${10 * level}x CPC on every 10th click`,
      'offline_progress': `${50 * level}% offline earnings`,
      'increases_cpc_by_25_percent': `+${25 * level}% click power`,
      'increases_cps_by_25_percent': `+${25 * level}% auto miner speed`,
      'triples_pickaxe_effects': `${3 * level}x pickaxe effects`,
      'chance_for_double_coins': `${10 * level}% chance for double coins`,
      'faster_ability_cooldown': `${50 * level}% faster ability cooldowns`,
      'easier_rebirth': `${20 * level}% easier rebirth`,
      'auto_collect_coins': `${30 * level}% larger coin collection radius`,
      'critical_strike_chance': `${5 * level}% chance for critical hits`
    };
    
    return baseDescription[effectId] || effectId;
  };
  
  const canUpgrade = upgrade.owned && 
                     upgrade.level < upgrade.maxLevel && 
                     state.goldCoins >= upgrade.upgradeCost;
  
  return (
    <TouchableOpacity 
      style={[
        styles.upgradeItem, 
        disabled ? styles.disabledUpgrade : null,
        upgrade.owned ? styles.ownedUpgrade : null
      ]}
      onPress={onPress}
      disabled={disabled || (upgrade.owned && !canUpgrade)}
    >
      <View style={styles.upgradeIcon}>
        <MaterialCommunityIcons 
          name="star" 
          size={24} 
          color={upgrade.owned ? '#FFD700' : disabled ? '#666666' : '#FFD700'} 
        />
      </View>
      
      <View style={styles.upgradeContent}>
        <View style={styles.nameContainer}>
          <Text style={styles.upgradeName}>{upgrade.name}</Text>
          {upgrade.owned && (
            <Text style={styles.levelText}>Level {upgrade.level}/{upgrade.maxLevel}</Text>
          )}
        </View>
        <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
        <Text style={styles.upgradeEffect}>{getEffectDescription(upgrade.effect, upgrade.level, upgrade.effectMultiplier)}</Text>
        
        {!upgrade.owned && (
          <View style={styles.costContainer}>
            <CoinDisplay 
              value={upgrade.cost} 
              size="small"
              isGold={true}
            />
          </View>
        )}
        
        {upgrade.owned && upgrade.level < upgrade.maxLevel && (
          <View style={styles.upgradeButtonContainer}>
            <View style={styles.costContainer}>
              <CoinDisplay 
                value={upgrade.upgradeCost} 
                size="small"
                isGold={true}
              />
            </View>
            <TouchableOpacity 
              style={[
                styles.upgradeButton,
                !canUpgrade && styles.disabledUpgradeButton
              ]}
              onPress={handleUpgrade}
              disabled={!canUpgrade}
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {upgrade.owned && upgrade.level >= upgrade.maxLevel && (
          <View style={styles.maxLevelBadge}>
            <Text style={styles.maxLevelText}>Maximum Level</Text>
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
        key={item.id}
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
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  upgradeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeButton: {
    backgroundColor: '#7B5F00',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  disabledUpgradeButton: {
    backgroundColor: '#3A3A3A',
    opacity: 0.7,
  },
  upgradeButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  maxLevelBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#4A3800',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  maxLevelText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 