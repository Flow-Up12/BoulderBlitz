import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Achievement } from '../../context/GameContext';

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  return (
    <View style={[
      styles.container,
      achievement.unlocked ? styles.unlocked : styles.locked
    ]}>
      <View style={styles.content}>
        <Text style={[
          styles.name,
          achievement.unlocked ? styles.unlockedText : styles.lockedText
        ]}>
          {achievement.name}
        </Text>
        <Text style={styles.description}>{achievement.description}</Text>
      </View>
      
      {achievement.reward && (
        <View style={styles.rewardContainer}>
          <Text style={[
            styles.reward, 
            achievement.unlocked ? styles.unlockedReward : styles.lockedReward
          ]}>
            +{achievement.reward}
          </Text>
        </View>
      )}
      
      <View style={[
        styles.statusIndicator,
        achievement.unlocked ? styles.unlockedIndicator : styles.lockedIndicator
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
  },
  unlocked: {
    backgroundColor: '#e8f5e9',
  },
  locked: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unlockedText: {
    color: '#4CAF50',
  },
  lockedText: {
    color: '#9e9e9e',
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  rewardContainer: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  reward: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  unlockedReward: {
    color: '#4CAF50',
  },
  lockedReward: {
    color: '#9e9e9e',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomLeftRadius: 10,
  },
  unlockedIndicator: {
    backgroundColor: '#4CAF50',
  },
  lockedIndicator: {
    backgroundColor: '#9e9e9e',
  },
}); 