import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import CoinCounter from '../components/game/CoinCounter';
import { RockShop } from '../components/shop/RockShop';
import UpgradeList from '../components/shop/UpgradeList';
import AutoMinerList from '../components/shop/AutoMinerList';
import { useGameContext } from '../context/GameContext';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Dimensions } from 'react-native';

export default function ShopScreen() {
  const { state } = useGameContext();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'rocks', title: 'Rocks' },
    { key: 'upgrades', title: 'Pickaxes' },
    { key: 'miners', title: 'Miners' },
  ]);

  const renderScene = SceneMap({
    rocks: () => <RockShop />,
    upgrades: () => <UpgradeList />,
    miners: () => <AutoMinerList />,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <CoinCounter />
      </View>
      
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={styles.indicator}
            labelStyle={styles.label}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  header: {
    paddingVertical: 10,
  },
  tabBar: {
    backgroundColor: '#2A2A2A',
  },
  indicator: {
    backgroundColor: '#7B68EE',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
}); 