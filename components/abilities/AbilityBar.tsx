import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

const { width } = Dimensions.get('window');

const AbilityBar = () => {
  const { state, dispatch } = useGameContext();
  // Force refresh every second to update cooldowns
  useEffect(() => {
    const timer = setInterval(() => {
      // This will trigger updates to the component every second
      dispatch({ type: 'ABILITY_TICK', payload: 1 });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [dispatch]);
  
  // Filter to only show purchased abilities
  const purchasedAbilities = state.abilities.filter(ability => ability.cost === 0);
  
  if (purchasedAbilities.length === 0) {
    return null; // Don't show the bar if no abilities are purchased
  }
  
  const activateAbility = (abilityId: string) => {
    dispatch({ type: 'ACTIVATE_ABILITY', payload: abilityId });
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <View style={styles.container}>
      {purchasedAbilities.map((ability) => {
        const isActive = ability.active;
        const isOnCooldown = !ability.active && ability.cooldownRemaining && ability.cooldownRemaining > 0;
        const isReady = !ability.active && (!ability.cooldownRemaining || ability.cooldownRemaining <= 0);
        
        let progressValue = 0;
        let timeLabel = '';
        
        if (isActive && ability.timeRemaining !== undefined && ability.duration) {
          // For active abilities, show remaining duration
          progressValue = ability.timeRemaining / ability.duration;
          timeLabel = formatTime(ability.timeRemaining);
        } else if (isOnCooldown && ability.cooldownRemaining !== undefined && ability.cooldown) {
          // For cooldown abilities, show remaining cooldown
          progressValue = 1 - (ability.cooldownRemaining / ability.cooldown);
          timeLabel = formatTime(ability.cooldownRemaining);
        }
        
        return (
          <TouchableOpacity 
            key={ability.id}
            style={[
              styles.abilityButton,
              isActive && styles.activeAbility,
              isOnCooldown && styles.cooldownAbility,
              isReady && styles.readyAbility
            ]}
            onPress={() => isReady && activateAbility(ability.id)}
            disabled={!isReady}
          >
            <View style={styles.abilityIconContainer}>
              {getAbilityIcon(ability.id, isActive, isOnCooldown, isReady)}
            </View>
            
            {(isActive || isOnCooldown) && (
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={progressValue} 
                  color={isActive ? '#FFA500' : '#6495ED'} 
                  style={styles.progressBar} 
                />
                <Text style={styles.timeLabel}>
                  {isActive ? 'ACTIVE: ' : 'COOLDOWN: '}
                  {timeLabel}
                </Text>
              </View>
            )}
            
            {isReady && (
              <Text style={styles.readyLabel}>READY</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getAbilityIcon = (
  abilityId: string, 
  isActive: boolean, 
  isOnCooldown: boolean, 
  isReady: boolean
) => {
  const color = isActive ? '#FFA500' : (isOnCooldown ? '#6495ED' : '#4CAF50');
  
  switch (abilityId) {
    case 'coin-scatter':
      return <Ionicons name="cash" size={24} color={color} />;
    case 'auto-tap':
      return <Ionicons name="finger-print" size={24} color={color} />;
    case 'gold-rush':
      return <Ionicons name="star" size={24} color={color} />;
    case 'miners-frenzy':
      return <Ionicons name="speedometer" size={24} color={color} />;
    default:
      return <Ionicons name="rocket" size={24} color={color} />;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Position directly above shop panel
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 5,
    zIndex: 80,
  },
  abilityButton: {
    width: width / 5 - 12,
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    margin: 2,
  },
  activeAbility: {
    borderColor: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  cooldownAbility: {
    borderColor: '#6495ED',
    backgroundColor: 'rgba(100, 149, 237, 0.2)',
  },
  readyAbility: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  abilityIconContainer: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 4,
  },
  progressContainer: {
    width: '100%',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  timeLabel: {
    color: '#CCC',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  readyLabel: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default AbilityBar; 