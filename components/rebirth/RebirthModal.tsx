import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatNumber } from '../../utils/formatters';

type RebirthModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function RebirthModal({ visible, onClose }: RebirthModalProps) {
  const { state, dispatch } = useGameContext();
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Calculate gold coins to be earned
  const goldCoinsToEarn = Math.floor(Math.sqrt(state.totalCoinsEarned / 1000000));
  
  // This is to display the exact calculation to the player for transparency
  const goldCoinsCalculation = () => {
    const formula = '√(Total Coins / 1,000,000)';
    const calculation = `√(${formatNumber(state.totalCoinsEarned)} / 1,000,000) = ${goldCoinsToEarn}`;
    return (
      <View style={styles.calculationContainer}>
        <Text style={styles.calculationTitle}>Calculation:</Text>
        <Text style={styles.calculationFormula}>{formula}</Text>
        <Text style={styles.calculationResult}>{calculation}</Text>
      </View>
    );
  };
  
  // Reset confirmation when modal closes
  React.useEffect(() => {
    if (!visible) {
      setIsConfirming(false);
    }
  }, [visible]);
  
  const handleRebirth = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    
    // Perform rebirth
    dispatch({ type: 'REBIRTH' });
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="refresh" size={24} color="#FFD700" />
            <Text style={styles.title}>Rebirth</Text>
          </View>
          
          {/* Description */}
          <Text style={styles.description}>
            Restarting your journey will reset your progress, but you'll earn gold coins and permanent bonuses.
          </Text>
          
          {/* Requirements */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Coins:</Text>
              <Text style={styles.infoValue}>{formatNumber(state.coins)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Requirement:</Text>
              <Text 
                style={[
                  styles.infoValue, 
                  state.coins >= 1000000000 ? styles.metRequirement : styles.unmetRequirement
                ]}
              >
                1,000,000,000
              </Text>
            </View>
          </View>
          
          {/* Rewards */}
          <View style={styles.rewardsContainer}>
            <Text style={styles.rewardsTitle}>You will receive:</Text>
            
            <View style={styles.rewardRow}>
              <MaterialCommunityIcons name="circle" size={20} color="#FFD700" />
              <Text style={styles.goldCoinsText}>{goldCoinsToEarn} Gold Coins</Text>
            </View>
            
            <View style={styles.rewardRow}>
              <MaterialCommunityIcons name="percent" size={20} color="#64B5F6" />
              <Text style={styles.bonusText}>+10% Permanent CPC Bonus</Text>
            </View>
          </View>
          
          {/* What you'll lose */}
          <View style={styles.loseContainer}>
            <Text style={styles.loseTitle}>You will lose:</Text>
            <Text style={styles.loseItem}>• All regular coins</Text>
            <Text style={styles.loseItem}>• All upgrades and auto miners</Text>
            <Text style={styles.loseItem}>• Rock progress</Text>
          </View>
          
          {/* What you'll keep */}
          <View style={styles.keepContainer}>
            <Text style={styles.keepTitle}>You will keep:</Text>
            <Text style={styles.keepItem}>• Gold coins and special upgrades</Text>
            <Text style={styles.keepItem}>• Achievements</Text>
            <Text style={styles.keepItem}>• All permanent bonuses</Text>
          </View>
          
          {/* Calculation */}
          {goldCoinsCalculation()}
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.rebirthButton,
                isConfirming ? styles.confirmButton : null,
                state.coins < 1000000000 ? styles.disabledButton : null,
              ]} 
              onPress={handleRebirth}
              disabled={state.coins < 1000000000}
            >
              <Text style={styles.rebirthButtonText}>
                {isConfirming ? "Confirm Rebirth" : "Rebirth"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  description: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metRequirement: {
    color: '#4CAF50',
  },
  unmetRequirement: {
    color: '#F44336',
  },
  rewardsContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  rewardsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goldCoinsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bonusText: {
    color: '#64B5F6',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loseContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  loseTitle: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loseItem: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 4,
  },
  keepContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  keepTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  keepItem: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rebirthButton: {
    flex: 2,
    paddingVertical: 12,
    backgroundColor: '#512DA8',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#D32F2F',
  },
  disabledButton: {
    backgroundColor: '#555555',
    opacity: 0.7,
  },
  rebirthButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calculationContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  calculationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  calculationFormula: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 8,
  },
  calculationResult: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 