import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { Ability } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatters';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

type AbilityItemProps = {
  ability: Ability;
  onBuy: () => void;
  onActivate: () => void;
  onUpgrade: () => void;
};

const AbilityItem = ({ ability, onBuy, onActivate, onUpgrade }: AbilityItemProps) => {
  const isPurchased = ability.cost === 0;
  const isActive = ability.active;
  const isOnCooldown = !isActive && (ability.cooldownRemaining || 0) > 0;
  const canUpgrade = isPurchased && ability.level < ability.maxLevel;
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };
  
  // Get the appropriate action button
  const renderActionButton = () => {
    if (!isPurchased) {
      return (
        <TouchableOpacity style={styles.buyButton} onPress={onBuy}>
          <Text style={styles.buttonText}>Buy: {formatNumber(ability.cost)}</Text>
        </TouchableOpacity>
      );
    }
    
    if (isActive) {
      const timeRemaining = formatTime(ability.timeRemaining || 0);
      return (
        <View style={styles.activeContainer}>
          <Text style={styles.activeText}>Active: {timeRemaining}</Text>
          <ProgressBar 
            progress={(ability.timeRemaining || 0) / ability.duration} 
            color="#FFD700"
            style={styles.progressBar}
          />
        </View>
      );
    }
    
    if (isOnCooldown) {
      const cooldownRemaining = formatTime(ability.cooldownRemaining || 0);
      return (
        <View style={styles.cooldownContainer}>
          <Text style={styles.cooldownText}>Cooldown: {cooldownRemaining}</Text>
          <ProgressBar 
            progress={1 - ((ability.cooldownRemaining || 0) / ability.cooldown)} 
            color="#4CAF50"
            style={styles.progressBar}
          />
        </View>
      );
    }
    
    return (
      <TouchableOpacity style={styles.activateButton} onPress={onActivate}>
        <Text style={styles.buttonText}>Activate</Text>
      </TouchableOpacity>
    );
  };
  
  // Render upgrade button if applicable
  const renderUpgradeButton = () => {
    if (canUpgrade) {
      return (
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Text style={styles.buttonText}>
            Upgrade: {formatNumber(ability.upgradeCost)}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return null;
  };
  
  // Get the appropriate icon based on ability type
  const getAbilityIcon = () => {
    switch (ability.id) {
      case 'coin-scatter':
        return 'cash-multiple';
      case 'auto-tap':
        return 'gesture-tap';
      case 'gold-rush':
        return 'gold';
      case 'miners-frenzy':
        return 'pickaxe';
      default:
        return 'flash';
    }
  };
  
  return (
    <View style={[
      styles.container,
      isActive && styles.activeAbility,
      isOnCooldown && styles.cooldownAbility
    ]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={getAbilityIcon()} 
          size={32} 
          color={isActive ? '#FFD700' : isPurchased ? '#FFFFFF' : '#777777'} 
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{ability.name}</Text>
          <Text style={styles.level}>Level {ability.level}/{ability.maxLevel}</Text>
        </View>
        
        <Text style={styles.description}>{ability.description}</Text>
        
        <View style={styles.effectContainer}>
          <Text style={styles.effectText}>
            {ability.effect === 'cpc_multiplier' && `${ability.multiplier}x CPC`}
            {ability.effect === 'auto_tap' && `${ability.multiplier} taps/sec`}
            {ability.effect === 'gold_chance' && `${Math.round(ability.multiplier * 100)}% gold chance`}
            {ability.effect === 'cps_multiplier' && `${ability.multiplier}x CPS`}
          </Text>
          <Text style={styles.durationText}>{ability.duration}s duration</Text>
        </View>
        
        <View style={styles.buttonRow}>
          {renderActionButton()}
          {renderUpgradeButton()}
        </View>
      </View>
    </View>
  );
};

const AbilitiesPanel = () => {
  const { state, dispatch } = useGameContext();
  
  // Handle ability tick every second
  useEffect(() => {
    // Skip if there are no active abilities or abilities on cooldown
    const hasActiveOrCooldown = state.abilities.some(a => 
      a.active || (a.cooldownRemaining && a.cooldownRemaining > 0)
    );
    
    if (!hasActiveOrCooldown) return;
    
    const interval = setInterval(() => {
      dispatch({ type: 'ABILITY_TICK', payload: 1 }); // 1 second
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.abilities]);
  
  // Buy an ability
  const handleBuyAbility = (abilityId: string) => {
    console.log(`Buying ability: ${abilityId}`);
    dispatch({
      type: 'BUY_ABILITY',
      payload: abilityId
    });
  };
  
  // Activate an ability
  const handleActivateAbility = (abilityId: string) => {
    console.log(`Activating ability: ${abilityId}`);
    dispatch({
      type: 'ACTIVATE_ABILITY',
      payload: abilityId
    });
  };
  
  // Upgrade an ability
  const handleUpgradeAbility = (abilityId: string) => {
    console.log(`Upgrading ability: ${abilityId}`);
    dispatch({
      type: 'UPGRADE_ABILITY',
      payload: abilityId
    });
  };
  
  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.sectionTitle}>Special Abilities</Text>
      
      {state.abilities.map((ability, index) => (
        <AbilityItem
          key={`${ability.id}-${index}`}
          ability={ability}
          onBuy={() => handleBuyAbility(ability.id)}
          onActivate={() => handleActivateAbility(ability.id)}
          onUpgrade={() => handleUpgradeAbility(ability.id)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingBottom: 150, // Add extra padding at the bottom for better scrolling
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  activeAbility: {
    backgroundColor: '#332600',
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  cooldownAbility: {
    backgroundColor: '#1E262E',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  level: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  description: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  effectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  effectText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 14,
    color: '#2196F3',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  activateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeContainer: {
    flex: 1,
  },
  activeText: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cooldownContainer: {
    flex: 1,
  },
  cooldownText: {
    color: '#2196F3',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
});

export default AbilitiesPanel; 