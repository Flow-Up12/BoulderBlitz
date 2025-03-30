import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { formatCoins } from '../../utils/formatters';
import type { Rock } from '../../context/GameContext';

interface RockItemProps {
  rock: Rock;
  selected: boolean;
  onSelect: (id: string) => void;
  canAfford: boolean;
}

const RockItem = ({ rock, selected, onSelect, canAfford }: RockItemProps) => (
  <TouchableOpacity
    style={[
      styles.rockItem,
      selected && styles.selectedRock,
      !canAfford && !rock.unlocked && styles.cantAfford
    ]}
    onPress={() => onSelect(rock.id)}
    disabled={selected || (!rock.unlocked && !canAfford)}
  >
    <Text style={styles.rockName}>{rock.name}</Text>
    <Text style={styles.rockStat}>+{rock.baseCpc} CPC</Text>
    
    {!rock.unlocked ? (
      <Text style={[styles.rockPrice, !canAfford && styles.cantAffordText]}>
        {formatCoins(rock.cost)}
      </Text>
    ) : (
      <Text style={[styles.rockStatus, selected ? styles.selectedText : null]}>
        {selected ? 'Selected' : 'Unlocked'}
      </Text>
    )}
  </TouchableOpacity>
);

export const RockShop = () => {
  const { state, dispatch } = useGameContext();
  
  const handleSelectRock = (rockId: string) => {
    dispatch({ type: 'SELECT_ROCK', payload: rockId });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rock Shop</Text>
      <FlatList
        data={state.rocks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RockItem
            rock={item}
            selected={state.selectedRock.id === item.id}
            onSelect={handleSelectRock}
            canAfford={state.coins >= item.cost}
          />
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingBottom: 150,
  },
  rockItem: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedRock: {
    backgroundColor: '#e1f5fe',
    borderWidth: 1,
    borderColor: '#03a9f4',
  },
  cantAfford: {
    opacity: 0.5,
  },
  rockName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rockStat: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  rockPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff9800',
    marginTop: 5,
  },
  rockStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 5,
  },
  selectedText: {
    color: '#03a9f4',
  },
  cantAffordText: {
    color: '#999',
  },
}); 