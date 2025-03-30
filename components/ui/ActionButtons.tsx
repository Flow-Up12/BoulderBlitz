import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ActionButtons = () => {
  const router = useRouter();

  const handleUpgradesPress = () => {
    // For now just show an alert
    alert('Upgrades coming soon!');
  };

  const handleStorePress = () => {
    // For now just show an alert
    alert('Store coming soon!');
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleUpgradesPress}>
        <Ionicons name="hammer" size={24} color="#FFF" />
        <Text style={styles.buttonText}>Upgrades</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleStorePress}>
        <Ionicons name="cart" size={24} color="#FFF" />
        <Text style={styles.buttonText}>Store</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleSettingsPress}>
        <Ionicons name="settings" size={24} color="#FFF" />
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: 'rgba(30, 20, 10, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    marginTop: 5,
    fontWeight: '600',
  },
});

export default ActionButtons; 