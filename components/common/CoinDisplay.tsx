import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatNumber } from '../../utils/formatters';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type CoinDisplayProps = {
  value: number;
  label?: string;
  isGold?: boolean;
  size?: 'small' | 'medium' | 'large';
};

export default function CoinDisplay({ value, label, isGold = false, size = 'medium' }: CoinDisplayProps) {
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
  const fontSize = size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name={isGold ? "circle" : "circle-outline"} 
        size={iconSize} 
        color={isGold ? "#FFD700" : "#C0C0C0"} 
      />
      <Text style={[
        styles.value, 
        { fontSize, color: isGold ? "#FFD700" : "#FFFFFF" }
      ]}>
        {formatNumber(value)}
      </Text>
      {label && <Text style={[styles.label, { fontSize: fontSize * 0.8 }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  value: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
  label: {
    color: '#CCCCCC',
    marginLeft: 4,
  },
}); 