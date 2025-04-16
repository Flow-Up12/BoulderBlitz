import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Achievement } from '../../context/GameContext';

type AchievementItemProps = {
  achievement: Achievement;
  index: number;
};

const AchievementItem = ({ achievement, index }: AchievementItemProps) => {
  return (
    <View 
      style={[
        styles.achievementItem, 
        achievement.unlocked ? styles.unlockedAchievement : styles.lockedAchievement
      ]}
    >
      <View style={styles.achievementIcon}>
        <Text>
          <MaterialCommunityIcons 
            name={achievement.unlocked ? "trophy" : "trophy-outline"} 
            size={24} 
            color={achievement.unlocked ? '#FFD700' : '#555555'} 
          />
        </Text>
      </View>
      
      <View style={styles.achievementContent}>
        <Text style={styles.achievementName}>
          <Text>{achievement.name}</Text>
        </Text>
        <Text style={styles.achievementDescription}>
          <Text>{achievement.description}</Text>
        </Text>
        
        {achievement.reward && achievement.unlocked && (
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>
              <Text>+{achievement.reward}% CPC</Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function AchievementList() {
  const { state } = useGameContext();
  
  const renderAchievementItem = ({ item, index }: { item: Achievement, index: number }) => {
    return (
      <AchievementItem 
        achievement={item} 
        index={index} 
      />
    );
  };
  
  // Calculate completion percentage
  const unlockedCount = state.achievements.filter(a => a.unlocked).length;
  const totalCount = state.achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);
  
  // Create a text component for empty state
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        <Text>No achievements yet. Keep clicking!</Text>
      </Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          <Text>Achievements</Text>
        </Text>
        <Text style={styles.completion}>
          <Text>{completionPercentage}% Complete</Text>
        </Text>
      </View>
      
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
      </View>
      
      <FlatList
        data={state.achievements}
        renderItem={renderAchievementItem}
        keyExtractor={(item, index) => `achievement-${item.id}-${index}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyComponent />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  completion: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2E2E2E',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  list: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#AAAAAA',
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  unlockedAchievement: {
    backgroundColor: '#252512',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  lockedAchievement: {
    backgroundColor: '#1E1E1E',
    borderLeftWidth: 4,
    borderLeftColor: '#444444',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E2E2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  rewardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#423C00',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  rewardText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 