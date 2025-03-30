import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatters';
import CoinDisplay from '../common/CoinDisplay';
import { AutoMiner } from '../../context/GameContext';
import MinerIcon from '../game/MinerIcon';

type AutoMinerItemProps = {
  autoMiner: AutoMiner;
  onPress: () => void;
  disabled: boolean;
};

const AutoMinerItem = ({ autoMiner, onPress, disabled }: AutoMinerItemProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.minerItem, 
        disabled ? styles.disabledMiner : null,
        autoMiner.owned ? styles.ownedMiner : null
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.minerIcon}>
        <MinerIcon 
          minerType={autoMiner.icon} 
          size={40}
          position="none"
        />
      </View>
      
      <View style={styles.minerContent}>
        <Text style={styles.minerName}>
          {autoMiner.name} {autoMiner.quantity > 0 ? `(${autoMiner.quantity})` : ''}
        </Text>
        <Text style={styles.minerDescription}>{autoMiner.description}</Text>
        
        <View style={styles.detailsContainer}>
          <CoinDisplay 
            value={autoMiner.cost} 
            size="small" 
          />
          
          {autoMiner.owned && (
            <View style={styles.cpsContainer}>
              <Text style={styles.cpsText}>
                +{formatNumber(autoMiner.cps * autoMiner.quantity)} CPS
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AutoMinerList() {
  const { state, dispatch } = useGameContext();
  
  const handleBuyAutoMiner = (miner: AutoMiner) => {
    dispatch({ 
      type: 'BUY_AUTO_MINER', 
      payload: miner.id 
    });
  };
  
  const renderMinerItem = ({ item }: { item: AutoMiner }) => {
    const canAfford = state.coins >= item.cost;
    
    return (
      <AutoMinerItem
        autoMiner={item}
        onPress={() => handleBuyAutoMiner(item)}
        disabled={!canAfford}
      />
    );
  };
  
  // Create ListHeaderComponent for the FlatList
  const ListHeader = () => (
    <Text style={styles.title}>Auto Miners</Text>
  );
  
  return (
    <View style={styles.container}>
      <FlatList
        data={state.autoMiners}
        renderItem={renderMinerItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={ListHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 150, // Increased bottom padding to ensure last item is easily accessible
  },
  minerItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  disabledMiner: {
    opacity: 0.7,
    backgroundColor: '#181818',
  },
  ownedMiner: {
    backgroundColor: '#1E3A4A',
  },
  minerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E2E2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  minerContent: {
    flex: 1,
  },
  minerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  minerDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cpsContainer: {
    backgroundColor: '#2E4A5A',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cpsText: {
    color: '#8EDBFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 