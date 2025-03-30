import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Animated, Easing } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { Achievement } from '../../context/GameContext';

interface UnlockModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const UnlockModal = ({ achievement, onClose }: UnlockModalProps) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any existing timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Only handle animation when achievement changes
  useEffect(() => {
    // Skip if already animating or no achievement
    if (!achievement || animating) return;
    
    // Prevent multiple animations
    setAnimating(true);
    
    // Reset animations
    scaleAnim.setValue(0.5);
    rotateAnim.setValue(0);
    
    // Run entrance animation once
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Auto close after animation completes
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        onClose();
        setAnimating(false);
      }, 3000);
    });
  }, [achievement?.id]); // Only re-run when achievement ID changes
  
  if (!achievement) {
    return null;
  }
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={!!achievement}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [
                { scale: scaleAnim },
              ]
            }
          ]}
        >
          <View style={styles.headerContainer}>
            <Animated.View style={[styles.iconContainer, { transform: [{ rotate }] }]}>
              <FontAwesome name="trophy" size={32} color="#FFD700" />
            </Animated.View>
            <Text style={styles.title}>Achievement Unlocked!</Text>
          </View>
          
          <View style={styles.achievementContainer}>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDesc}>{achievement.description}</Text>
            {achievement.reward ? (
              <View style={styles.rewardContainer}>
                <FontAwesome name="dollar" size={18} color="#FFD700" />
                <Text style={styles.reward}>+{achievement.reward}</Text>
              </View>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
              }
              onClose();
              setAnimating(false);
            }}
          >
            <Text style={styles.closeButtonText}>Nice!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  achievementContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#3A3A3C',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 10,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 5,
  },
  reward: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 