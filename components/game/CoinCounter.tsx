import React, { useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatters';

interface CoinCounterProps {
  coins: number;
  cpc: number;
  cps: number;
}

// Pure component with React.memo to prevent unnecessary rerenders
const CoinCounter: React.FC<CoinCounterProps> = React.memo(({ coins, cpc, cps }) => {
  // Memoize formatted values to avoid recalculating them on every render
  const formattedValues = useMemo(() => {
    return {
      coins: formatNumber(coins),
      cpc: formatNumber(cpc),
      cps: formatNumber(cps)
    };
  }, [coins, cpc, cps]);

  return (
    <View style={styles.container}>
      <View style={styles.coinContainer}>
        <View style={styles.coinIconContainer}>
          <Text style={styles.coinSymbol}>$</Text>
        </View>
        <View style={styles.coinTextContainer}>
          <Text style={styles.coinText}>{formattedValues.coins}</Text>
          <Text style={styles.cpcText}>{formattedValues.cpc}/click</Text>
          <Text style={styles.cpsText}>{formattedValues.cps}/second</Text>
        </View>
      </View>
    </View>
  );
});

export default function CoinCounterWrapper() {
  const { state } = useGameContext();
  
  // Use useRef for mutable values that shouldn't trigger rerenders
  const clickStats = useRef({
    clickCount: 0,
    startTime: Date.now(),
    clicksPerSecond: 0,
    lastUpdated: Date.now(),
    intervalId: null as NodeJS.Timeout | null,
    calculationPending: false
  });
  
  // Calculate clicksPerSecond without triggering state updates during calculation phase
  const getClicksPerSecond = useCallback(() => {
    const now = Date.now();
    const stats = clickStats.current;
    
    // Reset to zero if no clicks for 5 seconds
    if (now - stats.lastUpdated > 5000 && stats.clicksPerSecond > 0) {
      stats.clicksPerSecond = 0;
      return 0;
    }
    
    return stats.clicksPerSecond;
  }, []);
  
  // Update the click stats with new clicks
  const updateClicksPerSecond = useCallback(() => {
    const now = Date.now();
    const stats = clickStats.current;
    
    if (state.totalClicks > stats.clickCount && !stats.calculationPending) {
      // Set a flag to prevent multiple calculations in quick succession
      stats.calculationPending = true;
      
      const timeElapsed = (now - stats.startTime) / 1000; // in seconds
      const newClicks = state.totalClicks - stats.clickCount;
      
      if (timeElapsed >= 0.3) { // Calculate even for small time intervals to be responsive
        stats.clicksPerSecond = newClicks / timeElapsed;
        stats.clickCount = state.totalClicks;
        stats.startTime = now;
        stats.lastUpdated = now;
        
        // Reset the calculation lock after a short delay
        setTimeout(() => {
          stats.calculationPending = false;
        }, 50);
      } else {
        // For very rapid clicks, increase the estimated CPS
        if (newClicks > 0) {
          // If clicking faster than 3 times per second, immediately boost the CPS
          stats.clicksPerSecond = Math.max(stats.clicksPerSecond, 3);
          stats.lastUpdated = now;
        }
        stats.calculationPending = false;
      }
    }
  }, [state.totalClicks]);
  
  // Monitor clicks for instant CPS updates
  React.useEffect(() => {
    // Detect new clicks immediately
    updateClicksPerSecond();
  }, [state.totalClicks, updateClicksPerSecond]);
  
  // Start tracking on first render
  React.useEffect(() => {
    // Set up interval to update click stats periodically
    if (!clickStats.current.intervalId) {
      clickStats.current.intervalId = setInterval(() => {
        updateClicksPerSecond();
      }, 1000);
    }
    
    return () => {
      if (clickStats.current.intervalId) {
        clearInterval(clickStats.current.intervalId);
        clickStats.current.intervalId = null;
      }
    };
  }, [updateClicksPerSecond]);
  
  // Calculate total CPS from miners and clicking efficiency
  // Use useMemo to only recalculate when dependencies change
  const totalCPS = useMemo(() => {
    // Get CPS from auto miners (this is efficient because it doesn't recreate arrays)
    const minerCPS = state.autoMiners.reduce((total, miner) => {
      return total + (miner.cps * miner.quantity);
    }, 0);
    
    // Add CPS from clicking (average clicks per second * coins per click)
    const clickingCPS = getClicksPerSecond() * state.cpc;
    
    return minerCPS + clickingCPS;
  }, [state.autoMiners, state.cpc, state.totalClicks, state.coins]);
  
  return <CoinCounter coins={state.coins} cpc={state.cpc} cps={totalCPS} />;
}

const STATUS_BAR_HEIGHT = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingTop: Platform.OS === 'ios' ? STATUS_BAR_HEIGHT : STATUS_BAR_HEIGHT + 5,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  coinIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(36, 36, 36, 0.8)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  coinSymbol: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  coinTextContainer: {
    flex: 1,
  },
  coinText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cpcText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  cpsText: {
    color: '#8EDBFF',
    fontSize: 14,
    fontWeight: 'bold',
  }
}); 