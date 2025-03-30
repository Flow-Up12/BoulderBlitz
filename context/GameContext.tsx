import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase/client';
import { useAuth } from './AuthContext';
import { debounce } from 'lodash';
import { SoundManager } from '../utils/SoundManager';

// Game state types
export type Rock = {
  id: string;
  name: string;
  baseCpc: number;
  cost: number;
  image: string;
  unlocked: boolean;
  _hasShownNotification?: boolean; // For UI tracking
};

export type AutoMiner = {
  id: string;
  name: string;
  description: string;
  cost: number;
  cps: number; // Coins per second
  owned: boolean;
  quantity: number;
  icon: string; // Add icon path
};

export type Upgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  cpcIncrease: number;
  owned: boolean;
  type: 'pickaxe' | 'special'; // Type of upgrade
  icon: string; // Add icon path
};

export type SpecialUpgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  owned: boolean;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  reward?: number;
  _hasShownNotification?: boolean; // For UI tracking
};

export type Ability = {
  id: string;
  name: string;
  description: string;
  cost: number;
  cooldown: number; // Cooldown in seconds
  duration: number; // Duration in seconds
  level: number;
  maxLevel: number;
  upgradeCost: number;
  active: boolean;
  timeRemaining?: number; // Time remaining in seconds when active
  cooldownRemaining?: number; // Cooldown remaining in seconds
  effect: string; // Effect type
  multiplier: number; // Effect multiplier based on level
};

export interface GameState {
  coins: number;
  totalCoinsEarned: number;
  goldCoins: number;
  cpc: number;
  baseCpc: number;
  cps: number; // Coins per second
  totalClicks: number;
  clickProgress: number; // Progress towards the 500 click bonus
  rebirths: number;
  rebirthTokens: number;
  bonusMultiplier: number;
  theme: string;
  rocks: Rock[];
  selectedRock: Rock;
  upgrades: Upgrade[];
  autoMiners: AutoMiner[];
  specialUpgrades: SpecialUpgrade[];
  achievements: Achievement[];
  abilities: Ability[]; // Added missing abilities array
  showPickaxes: boolean; // Toggle between pickaxes and auto miners
  lastSaved: number; // Timestamp for offline progress calculation
  offlineProgressEnabled: boolean; // Whether offline progress is enabled
  notificationsEnabled: boolean; // Whether notifications are enabled
  soundEnabled: boolean; // Whether sound effects are enabled
  hapticsEnabled: boolean; // Whether haptic feedback is enabled
  _needsSave?: boolean; // Optional flag to trigger a save
  dataLoaded?: boolean; // Add this property
  version?: number; // Add version number for conflict resolution
}

// Default game state
const defaultRock: Rock = {
  id: 'stone',
  name: 'Stone Rock',
  baseCpc: 1,
  cost: 0,
  image: 'stone.png',
  unlocked: true,
};

const initialUpgrades: Upgrade[] = [
  {
    id: 'wooden-pickaxe',
    name: 'Wooden Pickaxe',
    description: 'Increases CPC by 1',
    cost: 10,
    cpcIncrease: 1,
    owned: false,
    type: 'pickaxe',
    icon: 'wooden-pickaxe.png'
  },
  {
    id: 'stone-pickaxe',
    name: 'Stone Pickaxe',
    description: 'Increases CPC by 3',
    cost: 50,
    cpcIncrease: 3,
    owned: false,
    type: 'pickaxe',
    icon: 'stone-pickaxe.png'
  },
  {
    id: 'copper-pickaxe',
    name: 'Copper Pickaxe',
    description: 'Increases CPC by 5',
    cost: 100,
    cpcIncrease: 5,
    owned: false,
    type: 'pickaxe',
    icon: 'copper-pickaxe.png'
  },
  {
    id: 'iron-pickaxe',
    name: 'Iron Pickaxe',
    description: 'Increases CPC by 10',
    cost: 500,
    cpcIncrease: 10,
    owned: false,
    type: 'pickaxe',
    icon: 'iron-pickaxe.png'
  },
  {
    id: 'gold-pickaxe',
    name: 'Gold Pickaxe',
    description: 'Increases CPC by 25',
    cost: 2500,
    cpcIncrease: 25,
    owned: false,
    type: 'pickaxe',
    icon: 'gold-pickaxe.png'
  },
  {
    id: 'diamond-pickaxe',
    name: 'Diamond Pickaxe',
    description: 'Increases CPC by 50',
    cost: 10000,
    cpcIncrease: 50,
    owned: false,
    type: 'pickaxe',
    icon: 'diamond-pickaxe.png'
  },
  {
    id: 'obsidian-pickaxe',
    name: 'Obsidian Pickaxe',
    description: 'Increases CPC by 100',
    cost: 50000,
    cpcIncrease: 100,
    owned: false,
    type: 'pickaxe',
    icon: 'obsidian-pickaxe.png'
  },
  {
    id: 'plasma-pickaxe',
    name: 'Plasma Pickaxe',
    description: 'Increases CPC by 250',
    cost: 250000,
    cpcIncrease: 250,
    owned: false,
    type: 'pickaxe',
    icon: 'plasma-pickaxe.png'
  },
  {
    id: 'quantum-pickaxe',
    name: 'Quantum Pickaxe',
    description: 'Increases CPC by 1000',
    cost: 1000000,
    cpcIncrease: 1000,
    owned: false,
    type: 'pickaxe',
    icon: 'quantum-pickaxe.png'
  },
];

const initialAutoMiners: AutoMiner[] = [
  {
    id: 'caveman-apprentice',
    name: 'Caveman Apprentice',
    description: 'Mines 1 coin per second',
    cost: 100,
    cps: 1,
    owned: false,
    quantity: 0,
    icon: 'caveman-apprentice.png'
  },
  {
    id: 'caveman-miner',
    name: 'Caveman Miner',
    description: 'Mines 3 coins per second',
    cost: 500,
    cps: 3,
    owned: false,
    quantity: 0,
    icon: 'caveman-miner.png'
  },
  {
    id: 'skilled-miner',
    name: 'Skilled Miner',
    description: 'Mines 8 coins per second',
    cost: 2000,
    cps: 8,
    owned: false,
    quantity: 0,
    icon: 'skilled-miner.png'
  },
  {
    id: 'mining-expert',
    name: 'Mining Expert',
    description: 'Mines 20 coins per second',
    cost: 10000,
    cps: 20,
    owned: false,
    quantity: 0,
    icon: 'mining-expert.png'
  },
  {
    id: 'drill-operator',
    name: 'Drill Operator',
    description: 'Mines 50 coins per second',
    cost: 50000,
    cps: 50,
    owned: false,
    quantity: 0,
    icon: 'drill-operator.png'
  },
  {
    id: 'mining-robot',
    name: 'Mining Robot',
    description: 'Mines 150 coins per second',
    cost: 200000,
    cps: 150,
    owned: false,
    quantity: 0,
    icon: 'mining-robot.png'
  },
  {
    id: 'quantum-miner',
    name: 'Quantum Miner',
    description: 'Mines 500 coins per second',
    cost: 1000000,
    cps: 500,
    owned: false,
    quantity: 0,
    icon: 'quantum-miner.png'
  },
];

const initialSpecialUpgrades: SpecialUpgrade[] = [
  {
    id: 'double-click',
    name: 'Double Click',
    description: 'Double all click earnings',
    cost: 1,
    effect: 'doubles_cpc',
    owned: false,
  },
  {
    id: 'auto-miner-boost',
    name: 'Auto Miner Boost',
    description: 'Increases auto miner efficiency by 50%',
    cost: 2,
    effect: 'boosts_auto_miners',
    owned: false,
  },
  {
    id: 'click-combo',
    name: 'Click Combo',
    description: 'Every 10 clicks in a row gives bonus coins',
    cost: 3,
    effect: 'click_combo',
    owned: false,
  },
  {
    id: 'offline-progress',
    name: 'Offline Progress',
    description: 'Earn coins while away from the game',
    cost: 5,
    effect: 'offline_progress',
    owned: false,
  },
  {
    id: 'golden-gloves',
    name: 'Golden Gloves',
    description: 'Increases click power by 25%',
    cost: 3,
    effect: 'increases_cpc_by_25_percent',
    owned: false,
  },
  {
    id: 'miners-helmet',
    name: 'Miner\'s Helmet',
    description: 'Auto miners work 25% faster',
    cost: 4,
    effect: 'increases_cps_by_25_percent',
    owned: false,
  },
  {
    id: 'cosmic-drill',
    name: 'Cosmic Drill',
    description: 'Triples the effect of all pickaxe upgrades',
    cost: 10,
    effect: 'triples_pickaxe_effects',
    owned: false,
  },
  {
    id: 'lucky-charm',
    name: 'Lucky Charm',
    description: '10% chance to get double coins from each click',
    cost: 5,
    effect: 'chance_for_double_coins',
    owned: false,
  },
  {
    id: 'time-warp',
    name: 'Time Warp Device',
    description: 'Abilities recharge 50% faster',
    cost: 7,
    effect: 'faster_ability_cooldown',
    owned: false,
  },
  {
    id: 'quantum-compressor',
    name: 'Quantum Compressor',
    description: 'Condenses rebirth requirements by 20%',
    cost: 15,
    effect: 'easier_rebirth',
    owned: false,
  },
];

const initialAbilities: Ability[] = [
  {
    id: 'coin-scatter',
    name: 'Coin Scatter',
    description: 'Dramatically increases coin earnings for a short time',
    cost: 10000,
    cooldown: 300, // 5 minutes
    duration: 30, // 30 seconds
    level: 1,
    maxLevel: 5,
    upgradeCost: 50000,
    active: false,
    effect: 'cpc_multiplier',
    multiplier: 10, // 10x at level 1
  },
  {
    id: 'auto-tap',
    name: 'Auto Tap',
    description: 'Automatically taps for you at high speed',
    cost: 25000,
    cooldown: 600, // 10 minutes
    duration: 60, // 60 seconds
    level: 1,
    maxLevel: 5,
    upgradeCost: 100000,
    active: false,
    effect: 'auto_tap',
    multiplier: 5, // 5 taps per second at level 1
  },
  {
    id: 'gold-rush',
    name: 'Gold Rush',
    description: 'Chance to earn gold coins with each click',
    cost: 100000,
    cooldown: 1800, // 30 minutes
    duration: 60, // 60 seconds
    level: 1,
    maxLevel: 3,
    upgradeCost: 500000,
    active: false,
    effect: 'gold_chance',
    multiplier: 0.05, // 5% chance at level 1
  },
  {
    id: 'miners-frenzy',
    name: 'Miners Frenzy',
    description: 'Miners work twice as fast for a limited time',
    cost: 50000,
    cooldown: 900, // 15 minutes
    duration: 120, // 2 minutes
    level: 1,
    maxLevel: 5,
    upgradeCost: 150000,
    active: false,
    effect: 'cps_multiplier',
    multiplier: 2, // 2x at level 1
  },
];

const initialRocks: Rock[] = [
  defaultRock,
  {
    id: 'granite',
    name: 'Granite Rock',
    baseCpc: 10,
    cost: 10000,
    image: 'granite.png',
    unlocked: false,
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    baseCpc: 50,
    cost: 100000,
    image: 'obsidian.png',
    unlocked: false,
  },
  {
    id: 'meteorite',
    name: 'Meteorite',
    baseCpc: 250,
    cost: 1000000,
    image: 'meteorite.png',
    unlocked: false,
  },
  {
    id: 'alien-core',
    name: 'Alien Core',
    baseCpc: 1000,
    cost: 1000000000,
    image: 'alien-core.png',
    unlocked: false,
  },
];

// Add new achievements for abilities and advanced items
const newAchievements: Achievement[] = [
  {
    id: 'ability-owner',
    name: 'Ability Collector',
    description: 'Purchase your first ability',
    unlocked: false,
    reward: 1000,
  },
  {
    id: 'ability-master',
    name: 'Ability Master',
    description: 'Own all abilities',
    unlocked: false,
    reward: 10000,
  },
  {
    id: 'ability-upgrader',
    name: 'Ability Upgrader',
    description: 'Upgrade any ability to level 3',
    unlocked: false,
    reward: 5000,
  },
  {
    id: 'advanced-miner',
    name: 'Advanced Miner',
    description: 'Purchase a Nano Miner or better',
    unlocked: false,
    reward: 20000,
  },
  {
    id: 'black-hole-power',
    name: 'Black Hole Power',
    description: 'Own a Black Hole Miner',
    unlocked: false,
    reward: 50000,
  },
  {
    id: 'laser-cutter',
    name: 'Laser Precision',
    description: 'Own the Laser Pickaxe',
    unlocked: false,
    reward: 30000,
  },
  {
    id: 'quantum-power',
    name: 'Quantum Power',
    description: 'Own the Quantum Disruptor',
    unlocked: false,
    reward: 100000,
  },
  {
    id: 'trillionaire',
    name: 'Trillionaire',
    description: 'Earn 1T coins',
    unlocked: false,
    reward: 50000,
  },
];

const initialAchievements: Achievement[] = [
  {
    id: 'first-strike',
    name: 'First Strike',
    description: 'Click the rock once',
    unlocked: false,
    reward: 10,
  },
  {
    id: 'rock-enthusiast',
    name: 'Rock Enthusiast',
    description: 'Earn 1K coins',
    unlocked: false,
    reward: 50,
  },
  {
    id: 'pickaxe-collector',
    name: 'Pickaxe Collector',
    description: 'Buy 3 different upgrades',
    unlocked: false,
    reward: 100,
  },
  {
    id: 'master-miner',
    name: 'Master Miner',
    description: 'Reach 1B coins',
    unlocked: false,
    reward: 1000,
  },
  {
    id: 'click-machine',
    name: 'Click Machine',
    description: 'Click 1,000 times',
    unlocked: false,
    reward: 500,
  },
  {
    id: 'click-addict',
    name: 'Click Addict',
    description: 'Click 10,000 times',
    unlocked: false,
    reward: 2000,
  },
  {
    id: 'auto-mining',
    name: 'Auto Mining',
    description: 'Purchase your first auto miner',
    unlocked: false,
    reward: 200,
  },
  {
    id: 'mining-company',
    name: 'Mining Company',
    description: 'Own 10 auto miners in total',
    unlocked: false,
    reward: 1000,
  },
  {
    id: 'mining-corporation',
    name: 'Mining Corporation',
    description: 'Own 50 auto miners in total',
    unlocked: false,
    reward: 5000,
  },
  {
    id: 'rock-collection',
    name: 'Rock Collection',
    description: 'Unlock all rocks',
    unlocked: false,
    reward: 10000,
  },
  {
    id: 'rebirth-master',
    name: 'Rebirth Master',
    description: 'Complete your first rebirth',
    unlocked: false,
    reward: 0,
  },
  {
    id: 'golden-touch',
    name: 'Golden Touch',
    description: 'Earn your first gold coin',
    unlocked: false,
    reward: 5000,
  },
  // New achievements
  {
    id: 'clicker-novice',
    name: 'Clicker Novice',
    description: 'Click 100 times',
    unlocked: false,
    reward: 100,
  },
  {
    id: 'click-legend',
    name: 'Click Legend',
    description: 'Click 100,000 times',
    unlocked: false,
    reward: 10000,
  },
  {
    id: 'small-savings',
    name: 'Small Savings',
    description: 'Earn 10K coins',
    unlocked: false,
    reward: 200,
  },
  {
    id: 'treasure-hoard',
    name: 'Treasure Hoard',
    description: 'Earn 100K coins',
    unlocked: false,
    reward: 500,
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Earn 1M coins',
    unlocked: false,
    reward: 1500,
  },
  {
    id: 'billionaire',
    name: 'Billionaire',
    description: 'Earn 1B coins',
    unlocked: false,
    reward: 5000,
  },
  {
    id: 'big-spender',
    name: 'Big Spender',
    description: 'Spend 50K coins',
    unlocked: false,
    reward: 1000,
  },
  {
    id: 'upgrade-enthusiast',
    name: 'Upgrade Enthusiast',
    description: 'Buy 5 different pickaxes',
    unlocked: false,
    reward: 300,
  },
  {
    id: 'pickaxe-master',
    name: 'Pickaxe Master',
    description: 'Buy all pickaxes',
    unlocked: false,
    reward: 2000,
  },
  {
    id: 'automation-beginner',
    name: 'Automation Beginner',
    description: 'Own 5 auto miners in total',
    unlocked: false,
    reward: 500,
  },
  {
    id: 'rebirth-addict',
    name: 'Rebirth Addict',
    description: 'Complete 5 rebirths',
    unlocked: false,
    reward: 10000,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Reach 100 coins per click',
    unlocked: false,
    reward: 1000,
  },
  {
    id: 'clicking-god',
    name: 'Clicking God',
    description: 'Reach 1000 coins per click',
    unlocked: false,
    reward: 5000,
  },
  {
    id: 'special-collector',
    name: 'Special Collector',
    description: 'Buy your first special upgrade',
    unlocked: false,
    reward: 2000,
  },
  ...newAchievements
];

// Additional auto miners
const additionalAutoMiners: AutoMiner[] = [
  {
    id: 'nano-miner',
    name: 'Nano Miner',
    description: 'Mines 1,500 coins per second',
    cost: 5000000,
    cps: 1500,
    owned: false,
    quantity: 0,
    icon: 'nano-miner.png'
  },
  {
    id: 'gravity-miner',
    name: 'Gravity Miner',
    description: 'Mines 5,000 coins per second',
    cost: 25000000,
    cps: 5000,
    owned: false,
    quantity: 0,
    icon: 'gravity-miner-colorful.png'
  },
  {
    id: 'time-miner',
    name: 'Time Miner',
    description: 'Mines 20,000 coins per second',
    cost: 150000000,
    cps: 20000,
    owned: false,
    quantity: 0,
    icon: 'time-miner.png'
  },
  {
    id: 'black-hole-miner',
    name: 'Black Hole Miner',
    description: 'Mines 100,000 coins per second',
    cost: 1000000000,
    cps: 100000,
    owned: false,
    quantity: 0,
    icon: 'black-hole-miner.png'
  }
];

// Additional pickaxe upgrades
const additionalUpgrades: Upgrade[] = [
  {
    id: 'ultra-diamond-pickaxe',
    name: 'Ultra Diamond Pickaxe',
    description: 'A super strong diamond pickaxe',
    cost: 10000000,
    cpcIncrease: 5000,
    owned: false,
    type: 'pickaxe',
    icon: 'ultra-diamond-pickaxe.png'
  },
  {
    id: 'laser-pickaxe',
    name: 'Laser Pickaxe',
    description: 'Cuts through rock with a precision laser',
    cost: 50000000,
    cpcIncrease: 20000,
    owned: false,
    type: 'pickaxe',
    icon: 'laser-pickaxe.png'
  },
  {
    id: 'plasma-cutter',
    name: 'Plasma Cutter',
    description: 'Melts rock instantly with super-heated plasma',
    cost: 250000000,
    cpcIncrease: 75000,
    owned: false,
    type: 'pickaxe',
    icon: 'plasma-cutter.png'
  },
  {
    id: 'quantum-disruptor',
    name: 'Quantum Disruptor',
    description: 'Breaks atomic bonds in rock for maximum efficiency',
    cost: 1000000000,
    cpcIncrease: 300000,
    owned: false,
    type: 'pickaxe',
    icon: 'quantum-disruptor.png'
  }
];

// Default game state with initial values
export const initialState: GameState = {
  coins: 0,
  totalCoinsEarned: 0,
  goldCoins: 0,
  cpc: 1,
  baseCpc: 1,
  cps: 0,
  totalClicks: 0,
  clickProgress: 0,
  rebirths: 0,
  rebirthTokens: 0,
  bonusMultiplier: 1,
  theme: 'default',
  rocks: [
    defaultRock,
    ...initialRocks
  ],
  selectedRock: defaultRock,
  upgrades: [...initialUpgrades, ...additionalUpgrades],
  autoMiners: [...initialAutoMiners, ...additionalAutoMiners],
  specialUpgrades: initialSpecialUpgrades,
  achievements: initialAchievements,
  abilities: initialAbilities,
  showPickaxes: true,
  lastSaved: Date.now(),
  offlineProgressEnabled: false,
  notificationsEnabled: false,
  soundEnabled: true,
  hapticsEnabled: true,
  _needsSave: false,
  dataLoaded: false,
};

// Actions
type GameAction =
  | { type: 'CLICK_ROCK' }
  | { type: 'BUY_UPGRADE'; payload: string }
  | { type: 'BUY_AUTO_MINER'; payload: string }
  | { type: 'BUY_SPECIAL_UPGRADE'; payload: string }
  | { type: 'BUY_ABILITY'; payload: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'MARK_ACHIEVEMENT_SHOWN'; payload: string }
  | { type: 'TOGGLE_SHOP_VIEW' }
  | { type: 'TOGGLE_OFFLINE_PROGRESS'; payload: boolean }
  | { type: 'TOGGLE_NOTIFICATIONS'; payload: boolean }
  | { type: 'TOGGLE_SOUND'; payload: boolean }
  | { type: 'TOGGLE_HAPTICS'; payload: boolean }
  | { type: 'ABILITY_TICK'; payload: number }
  | { type: 'LOAD_SAVED_GAME'; payload: GameState }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'MERGE_GAME_DATA'; payload: GameState }
  | { type: 'UNLOCK_ROCK'; payload: string }
  | { type: 'SELECT_ROCK'; payload: string }
  | { type: 'ACTIVATE_ABILITY'; payload: string }
  | { type: 'DEACTIVATE_ABILITY'; payload: string }
  | { type: 'UPGRADE_ABILITY'; payload: string }
  | { type: 'REBIRTH' }
  | { type: 'AUTO_MINE'; payload: { coins: number, multiplier: number } };

// Context setup
type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  isInitializing: boolean;
  databaseError: string | null;
  saveGame: () => Promise<void>;
  loadGame: (forceReload?: boolean) => Promise<{
    success: boolean;
    message: string;
    source?: string;
    error?: string;
  }>;
  handleRestartGame: () => void;
  forceSyncData: () => Promise<{
    success: boolean;
    message: string;
  }>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

// Helper function to calculate total CPC with all boosts, including active abilities
const calculateTotalCPC = (state: GameState) => {
  const pickaxeBonus = state.upgrades
    .filter(u => u.owned && u.type === 'pickaxe')
    .reduce((sum, u) => sum + u.cpcIncrease, 0);
  
  // Use the proper bonusMultiplier from rebirth instead of calculating
  const rebirthMultiplier = state.bonusMultiplier;
  
  // Special upgrade bonuses
  const doubleClickBonus = state.specialUpgrades.find(u => u.id === 'double-click')?.owned ? 2 : 1;
  
  // New equipment bonuses
  const goldenGlovesBonus = state.specialUpgrades.find(u => u.id === 'golden-gloves')?.owned ? 1.25 : 1;
  const cosmicDrillBonus = state.specialUpgrades.find(u => u.id === 'cosmic-drill')?.owned ? 3 : 1;
  
  // Apply cosmic drill effect to pickaxe bonus
  const effectivePickaxeBonus = state.specialUpgrades.find(u => u.id === 'cosmic-drill')?.owned 
    ? pickaxeBonus * cosmicDrillBonus 
    : pickaxeBonus;
  
  // Check for active coin scatter ability
  const coinScatterAbility = state.abilities.find(a => a.id === 'coin-scatter' && a.active);
  const abilityMultiplier = coinScatterAbility ? coinScatterAbility.multiplier : 1;
  
  return (state.baseCpc + effectivePickaxeBonus) * rebirthMultiplier * doubleClickBonus * goldenGlovesBonus * abilityMultiplier;
};

// Helper function to calculate total CPS from all auto miners, including active abilities
const calculateTotalCPS = (state: GameState) => {
  const baseAutoMinerOutput = state.autoMiners.reduce((sum, miner) => {
    return sum + (miner.cps * miner.quantity);
  }, 0);
  
  // Apply auto miner boost if the special upgrade is owned
  const autoMinerBoost = state.specialUpgrades.find(u => u.id === 'auto-miner-boost')?.owned ? 1.5 : 1;
  
  // Apply miners-helmet boost if owned
  const minersHelmetBoost = state.specialUpgrades.find(u => u.id === 'miners-helmet')?.owned ? 1.25 : 1;
  
  // Use the proper bonusMultiplier from rebirth instead of calculating
  const rebirthMultiplier = state.bonusMultiplier;
  
  // Check for active miners frenzy ability
  const minersFrenzyAbility = state.abilities.find(a => a.id === 'miners-frenzy' && a.active);
  const abilityMultiplier = minersFrenzyAbility ? minersFrenzyAbility.multiplier : 1;
  
  return baseAutoMinerOutput * autoMinerBoost * minersHelmetBoost * rebirthMultiplier * abilityMultiplier;
};

// Helper to check and update achievements
const checkAchievements = (state: GameState): GameState => {
  let updatedState = { ...state };
  let achievementsUpdated = false;
  
  // Helper to unlock an achievement if it's not already unlocked
  const unlockAchievement = (id: string): boolean => {
    const achievement = updatedState.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      console.log(`Unlocking achievement: ${id} - ${achievement.name}`);
      
      // Play achievement sound
      SoundManager.playSound('achievement', updatedState.soundEnabled);
      
      updatedState.achievements = updatedState.achievements.map(a => 
        a.id === id ? { ...a, unlocked: true } : a
      );
      updatedState.coins += achievement.reward || 0;
      updatedState.totalCoinsEarned += achievement.reward || 0;
      return true;
    }
    return false;
  };
  
  // Click count achievements
  if (updatedState.totalClicks >= 100) {
    achievementsUpdated = unlockAchievement('clicker-novice') || achievementsUpdated;
  }
  if (updatedState.totalClicks >= 1000) {
    achievementsUpdated = unlockAchievement('click-machine') || achievementsUpdated;
  }
  if (updatedState.totalClicks >= 10000) {
    achievementsUpdated = unlockAchievement('click-addict') || achievementsUpdated;
  }
  if (updatedState.totalClicks >= 100000) {
    achievementsUpdated = unlockAchievement('click-legend') || achievementsUpdated;
  }
  
  // Coin milestone achievements
  if (updatedState.totalCoinsEarned >= 1000) {
    achievementsUpdated = unlockAchievement('rock-enthusiast') || achievementsUpdated;
  }
  if (updatedState.totalCoinsEarned >= 10000) {
    achievementsUpdated = unlockAchievement('small-savings') || achievementsUpdated;
  }
  if (updatedState.totalCoinsEarned >= 100000) {
    achievementsUpdated = unlockAchievement('treasure-hoard') || achievementsUpdated;
  }
  if (updatedState.totalCoinsEarned >= 1000000) {
    achievementsUpdated = unlockAchievement('millionaire') || achievementsUpdated;
  }
  if (updatedState.totalCoinsEarned >= 1000000000) {
    achievementsUpdated = unlockAchievement('billionaire') || achievementsUpdated;
    achievementsUpdated = unlockAchievement('master-miner') || achievementsUpdated;
  }
  
  // Upgrade achievements
  const ownedUpgrades = updatedState.upgrades.filter(u => u.owned).length;
  if (ownedUpgrades >= 3) {
    achievementsUpdated = unlockAchievement('pickaxe-collector') || achievementsUpdated;
  }
  if (ownedUpgrades >= 5) {
    achievementsUpdated = unlockAchievement('upgrade-enthusiast') || achievementsUpdated;
  }
  if (ownedUpgrades === updatedState.upgrades.length) {
    achievementsUpdated = unlockAchievement('pickaxe-master') || achievementsUpdated;
  }
  
  // Auto-miner achievements
  const hasAutoMiner = updatedState.autoMiners.some(m => m.owned);
  if (hasAutoMiner) {
    achievementsUpdated = unlockAchievement('auto-mining') || achievementsUpdated;
  }
  
  const totalMiners = updatedState.autoMiners.reduce((total, miner) => total + miner.quantity, 0);
  if (totalMiners >= 5) {
    achievementsUpdated = unlockAchievement('automation-beginner') || achievementsUpdated;
  }
  if (totalMiners >= 10) {
    achievementsUpdated = unlockAchievement('mining-company') || achievementsUpdated;
  }
  if (totalMiners >= 50) {
    achievementsUpdated = unlockAchievement('mining-corporation') || achievementsUpdated;
  }
  
  // CPC achievements
  if (updatedState.cpc >= 100) {
    achievementsUpdated = unlockAchievement('speed-demon') || achievementsUpdated;
  }
  if (updatedState.cpc >= 1000) {
    achievementsUpdated = unlockAchievement('clicking-god') || achievementsUpdated;
  }
  
  // Special upgrade achievements
  const hasSpecialUpgrade = updatedState.specialUpgrades.some(u => u.owned);
  if (hasSpecialUpgrade) {
    achievementsUpdated = unlockAchievement('special-collector') || achievementsUpdated;
  }
  
  // Rock collection achievement
  const allRocksUnlocked = updatedState.rocks.every(r => r.unlocked);
  if (allRocksUnlocked) {
    achievementsUpdated = unlockAchievement('rock-collection') || achievementsUpdated;
  }
  
  // New achievement checks for abilities
  const hasAnyAbility = updatedState.abilities.some(a => a.cost === 0);
  if (hasAnyAbility) {
    achievementsUpdated = unlockAchievement('ability-owner') || achievementsUpdated;
  }
  
  const hasAllAbilities = updatedState.abilities.every(a => a.cost === 0);
  if (hasAllAbilities) {
    achievementsUpdated = unlockAchievement('ability-master') || achievementsUpdated;
  }
  
  const hasHighLevelAbility = updatedState.abilities.some(a => a.level >= 3);
  if (hasHighLevelAbility) {
    achievementsUpdated = unlockAchievement('ability-upgrader') || achievementsUpdated;
  }
  
  // Advanced miner achievements
  const hasAdvancedMiner = updatedState.autoMiners.some(m => 
    ['nano-miner', 'gravity-miner', 'time-miner', 'black-hole-miner'].includes(m.id) && m.quantity > 0
  );
  if (hasAdvancedMiner) {
    achievementsUpdated = unlockAchievement('advanced-miner') || achievementsUpdated;
  }
  
  const hasBlackHoleMiner = updatedState.autoMiners.find(m => m.id === 'black-hole-miner')?.quantity > 0;
  if (hasBlackHoleMiner) {
    achievementsUpdated = unlockAchievement('black-hole-power') || achievementsUpdated;
  }
  
  // Advanced pickaxe achievements
  const hasLaserPickaxe = updatedState.upgrades.find(u => u.id === 'laser-pickaxe')?.owned;
  if (hasLaserPickaxe) {
    achievementsUpdated = unlockAchievement('laser-cutter') || achievementsUpdated;
  }
  
  const hasQuantumDisruptor = updatedState.upgrades.find(u => u.id === 'quantum-disruptor')?.owned;
  if (hasQuantumDisruptor) {
    achievementsUpdated = unlockAchievement('quantum-power') || achievementsUpdated;
  }
  
  // Trillionaire achievement
  if (updatedState.totalCoinsEarned >= 1000000000000) { // 1 trillion
    achievementsUpdated = unlockAchievement('trillionaire') || achievementsUpdated;
  }
  
  return updatedState;
};

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CLICK_ROCK': {
      // Calculate bonus multiplier from active effects
      let multiplier = 1;
      
      // Apply special upgrades bonuses
      if (state.specialUpgrades.find(u => u.id === 'double-click' && u.owned)) {
        multiplier *= 2;
      }
      
      // Apply lucky charm effect (10% chance to double coins)
      if (state.specialUpgrades.find(u => u.id === 'lucky-charm' && u.owned)) {
        if (Math.random() < 0.1) { // 10% chance
          multiplier *= 2;
        }
      }
      
      // Calculate click combo if enabled
      let comboBonus = 0;
      let newClickProgress = state.clickProgress;
      
      if (state.specialUpgrades.find(u => u.id === 'click-combo' && u.owned)) {
        // Track progress towards 10-click combo
        newClickProgress = (state.clickProgress + 1) % 10;
        
        // Award bonus on every 10th click
        if (newClickProgress === 0) {
          // Bonus is 10x the CPC
          comboBonus = state.cpc * 10;
        }
      }
      
      let coinsToAdd = state.cpc * multiplier;
      
      // Check for first-click achievement
      const achievements = [...state.achievements];
      const firstClickAchievement = achievements.find(a => a.id === 'first-strike');
      
      // If this is the first click and achievement is not yet unlocked
      if (state.totalClicks === 0 && firstClickAchievement && !firstClickAchievement.unlocked) {
        console.log('Unlocking first click achievement');
        
        // Update the achievement
        const updatedAchievements = achievements.map(a => 
          a.id === 'first-strike' ? { ...a, unlocked: true } : a
        );
        
        const newState = {
          ...state,
          coins: state.coins + coinsToAdd + (firstClickAchievement.reward || 0),
          totalCoinsEarned: state.totalCoinsEarned + coinsToAdd + (firstClickAchievement.reward || 0),
          totalClicks: state.totalClicks + 1,
          clickProgress: newClickProgress,
          achievements: updatedAchievements
        };
        
        // Check for other achievements
        return checkAchievements(newState);
      }
      
      // Check for click count achievements
      if (state.totalClicks + 1 === 1000) {
        const clickMachineAchievement = achievements.find(a => a.id === 'click-machine');
        if (clickMachineAchievement && !clickMachineAchievement.unlocked) {
          const updatedAchievements = achievements.map(a => 
            a.id === 'click-machine' ? { ...a, unlocked: true } : a
          );
          
          const newState = {
            ...state,
            coins: state.coins + coinsToAdd + (clickMachineAchievement.reward || 0),
            totalCoinsEarned: state.totalCoinsEarned + coinsToAdd + (clickMachineAchievement.reward || 0),
            totalClicks: state.totalClicks + 1,
            clickProgress: newClickProgress,
            achievements: updatedAchievements
          };
          
          // Check for other achievements
          return checkAchievements(newState);
        }
      }
      
      if (state.totalClicks + 1 === 10000) {
        const clickAddictAchievement = achievements.find(a => a.id === 'click-addict');
        if (clickAddictAchievement && !clickAddictAchievement.unlocked) {
          const updatedAchievements = achievements.map(a => 
            a.id === 'click-addict' ? { ...a, unlocked: true } : a
          );
          
          const newState = {
            ...state,
            coins: state.coins + coinsToAdd + (clickAddictAchievement.reward || 0),
            totalCoinsEarned: state.totalCoinsEarned + coinsToAdd + (clickAddictAchievement.reward || 0),
            totalClicks: state.totalClicks + 1,
            clickProgress: newClickProgress,
            achievements: updatedAchievements,
            _needsSave: true // Only save on milestone achievements
          };
          
          // Check for other achievements
          return checkAchievements(newState);
        }
      }
      
      const newState = {
        ...state,
        coins: state.coins + coinsToAdd,
        totalCoinsEarned: state.totalCoinsEarned + coinsToAdd,
        totalClicks: state.totalClicks + 1,
        clickProgress: newClickProgress,
      };
      
      // Check for achievements
      return checkAchievements(newState);
    }
    
    case 'BUY_UPGRADE': {
      const upgradeId = action.payload;
      const upgrade = state.upgrades.find(u => u.id === upgradeId);
      
      if (!upgrade || upgrade.owned || state.coins < upgrade.cost) {
        return state;
      }
      
      // Play purchase sound
      SoundManager.playSound('purchase', state.soundEnabled);
      
      const newUpgrades = state.upgrades.map(u => 
        u.id === upgradeId ? { ...u, owned: true } : u
      );
      
      const newCPC = calculateTotalCPC({
        ...state,
        upgrades: newUpgrades
      });
      
      const newState = {
        ...state,
        coins: state.coins - upgrade.cost,
        cpc: newCPC,
        upgrades: newUpgrades,
        _needsSave: true // Save on upgrade purchase
      };
      
      // Check for achievements
      return checkAchievements(newState);
    }

    case 'BUY_AUTO_MINER': {
      const minerId = action.payload;
      const miner = state.autoMiners.find(m => m.id === minerId);
      
      if (!miner || state.coins < miner.cost) {
        return state;
      }
      
      // Play purchase sound
      SoundManager.playSound('purchase', state.soundEnabled);
      
      const newAutoMiners = state.autoMiners.map(m => 
        m.id === minerId ? { 
          ...m, 
          owned: true, 
          quantity: m.quantity + 1,
          // Increase cost by 15% for each purchase
          cost: Math.floor(m.cost * 1.15)
        } : m
      );
      
      const newCPS = calculateTotalCPS({
        ...state,
        autoMiners: newAutoMiners
      });
      
      const newState = {
        ...state,
        coins: state.coins - miner.cost,
        cps: newCPS,
        autoMiners: newAutoMiners,
        _needsSave: true // Save on auto miner purchase
      };
      
      // Check for achievements
      return checkAchievements(newState);
    }

    case 'BUY_SPECIAL_UPGRADE': {
      const upgradeId = action.payload;
      const upgrade = state.specialUpgrades.find(u => u.id === upgradeId);
      
      if (!upgrade || upgrade.owned || state.goldCoins < upgrade.cost) {
        return state;
      }
      
      // Play purchase sound
      SoundManager.playSound('purchase', state.soundEnabled);
      
      const newSpecialUpgrades = state.specialUpgrades.map(u => 
        u.id === upgradeId ? { ...u, owned: true } : u
      );
      
      const newState = {
        ...state,
        goldCoins: state.goldCoins - upgrade.cost,
        specialUpgrades: newSpecialUpgrades,
        _needsSave: true // Save on special upgrade purchase
      };
      
      // Check for achievements
      return checkAchievements(newState);
    }
    
    case 'BUY_ABILITY': {
      const abilityId = action.payload;
      const ability = state.abilities.find(a => a.id === abilityId);
      
      if (!ability || ability.cost === 0 || state.coins < ability.cost) {
        return state;
      }
      
      // Update the ability to purchased (set cost to 0)
      const updatedAbilities = state.abilities.map(a => 
        a.id === abilityId 
          ? { 
              ...a, 
              cost: 0, // Mark as purchased
            } 
          : a
      );
      
      const newState = {
        ...state,
        coins: state.coins - ability.cost,
        abilities: updatedAbilities,
        _needsSave: true,
      };
      
      // Check for achievement - buying first ability
      if (!state.achievements.find(a => a.id === 'ability-owner')?.unlocked) {
        return {
          ...newState,
          achievements: newState.achievements.map(a => 
            a.id === 'ability-owner' 
              ? { ...a, unlocked: true, shown: false } 
              : a
          ),
        };
      }
      
      // Check for achievement - owning all abilities
      const allAbilitiesPurchased = newState.abilities.every(a => a.cost === 0);
      if (allAbilitiesPurchased && !state.achievements.find(a => a.id === 'ability-master')?.unlocked) {
        return {
          ...newState,
          achievements: newState.achievements.map(a => 
            a.id === 'ability-master' 
              ? { ...a, unlocked: true, shown: false } 
              : a
          ),
        };
      }
      
      return newState;
    }
    
    case 'SELECT_ROCK': {
      const rockId = action.payload;
      const rock = state.rocks.find(r => r.id === rockId);
      
      if (!rock || rock.id === state.selectedRock.id) {
        return state;
      }
      
      if (!rock.unlocked) {
        if (state.coins < rock.cost) {
          return state;
        }
        
        // Unlock the rock
        const newRocks = state.rocks.map(r => 
          r.id === rockId ? { ...r, unlocked: true } : r
        );
        
        // Check if all rocks are now unlocked (for achievement)
        const allRocksUnlocked = newRocks.every(r => r.unlocked);
        
        const newState = {
          ...state,
          coins: state.coins - rock.cost,
          baseCpc: rock.baseCpc,
          selectedRock: rock,
          rocks: newRocks,
        };
        
        // Recalculate CPC with new base
        newState.cpc = calculateTotalCPC(newState);
        
        // Check for achievements
        return checkAchievements(newState);
      } else {
        // Rock is already unlocked, just select it
        const newState = {
          ...state,
          baseCpc: rock.baseCpc,
          selectedRock: rock,
        };
        
        // Recalculate CPC with new base
        newState.cpc = calculateTotalCPC(newState);
        
        // Check for achievements
        return checkAchievements(newState);
      }
    }
    
    case 'UNLOCK_ACHIEVEMENT': {
      const achievementId = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      
      if (!achievement || achievement.unlocked) {
        return state;
      }
      
      const newAchievements = state.achievements.map(a => 
        a.id === achievementId ? { ...a, unlocked: true } : a
      );
      
      return {
        ...state,
        coins: state.coins + (achievement.reward || 0),
        totalCoinsEarned: state.totalCoinsEarned + (achievement.reward || 0),
        achievements: newAchievements,
      };
    }
    
    case 'MARK_ACHIEVEMENT_SHOWN': {
      const achievementId = action.payload;
      
      // Map through achievements and update the _hasShownNotification flag
      const newAchievements = state.achievements.map(a => 
        a.id === achievementId ? { ...a, _hasShownNotification: true } : a
      );
      
      // Flag the state to be saved soon
      const newState = {
        ...state,
        achievements: newAchievements,
        _needsSave: true, // Add this flag to trigger a save
      };
      
      return newState;
    }
    
    case 'TOGGLE_SHOP_VIEW': {
      return {
        ...state,
        showPickaxes: !state.showPickaxes,
      };
    }
    
    case 'TOGGLE_OFFLINE_PROGRESS': {
      // Only allow toggling if the user has the upgrade
      if (!state.specialUpgrades.find(u => u.id === 'offline-progress')?.owned) {
        return state;
      }
      
      return {
        ...state,
        offlineProgressEnabled: action.payload,
      };
    }
    
    case 'TOGGLE_NOTIFICATIONS': {
      return {
        ...state,
        notificationsEnabled: action.payload,
      };
    }
    
    case 'TOGGLE_SOUND': {
      return {
        ...state,
        soundEnabled: action.payload,
      };
    }
    
    case 'TOGGLE_HAPTICS': {
      return {
        ...state,
        hapticsEnabled: action.payload,
      };
    }
    
    case 'REBIRTH': {
      // Apply quantum compressor effect if owned (reduces rebirth requirement by 20%)
      const quantumCompressorOwned = state.specialUpgrades.find(u => u.id === 'quantum-compressor')?.owned;
      const rebirthRequirement = quantumCompressorOwned 
        ? 800000000  // 800M instead of 1B (20% reduction)
        : 1000000000; // 1B
      
      // Check if player has enough coins for rebirth
      if (state.coins < rebirthRequirement) {
        return state;
      }
      
      // Play rebirth sound
      SoundManager.playSound('rebirth', state.soundEnabled);
      
      // Award gold coins based on progress
      const goldCoinsToAward = Math.floor(Math.log10(state.totalCoinsEarned) - 8);
      
      // Unlock the rebirth-master achievement if this is the first rebirth
      const newAchievements = state.achievements.map(a => 
        a.id === 'rebirth-master' && state.rebirths === 0 
          ? { ...a, unlocked: true } 
          : a
      );
      
      // Check for rebirth-addict achievement (5 rebirths)
      const updatedAchievements = newAchievements.map(a => 
        a.id === 'rebirth-addict' && state.rebirths === 4 
          ? { ...a, unlocked: true } 
          : a
      );
      
      // Preserve purchased abilities but reset activation status
      const preservedAbilities = state.abilities.map(ability => ({
        ...ability,
        active: false,
        timeRemaining: 0,
        cooldownRemaining: 0,
        // Keep purchased status (cost === 0 means purchased)
        cost: ability.cost === 0 ? 0 : ability.cost,
        // Keep ability level and upgrade costs
        level: ability.level,
        upgradeCost: ability.upgradeCost,
        multiplier: ability.multiplier
      }));
      
      console.log(`Rebirth: Gold coins earned ${goldCoinsToAward}, New total: ${state.goldCoins + goldCoinsToAward}`);
      console.log(`Rebirth: New bonus multiplier: ${state.bonusMultiplier + 0.1}`);
      
      // Reset the game to initial state but keep certain progress
      const resetState = {
        ...initialState,
        goldCoins: state.goldCoins + goldCoinsToAward,
        rebirths: state.rebirths + 1,
        rebirthTokens: state.rebirthTokens + 1,
        bonusMultiplier: state.bonusMultiplier + 0.1, // Each rebirth adds 10% to the base multiplier
        totalCoinsEarned: 0,
        achievements: updatedAchievements,
        specialUpgrades: state.specialUpgrades, // Keep special upgrades
        abilities: preservedAbilities, // Keep purchased abilities
        theme: state.theme, // Keep the selected theme
        soundEnabled: state.soundEnabled, // Keep sound preference
        hapticsEnabled: state.hapticsEnabled, // Keep haptic preference
        notificationsEnabled: state.notificationsEnabled, // Keep notification preference
        offlineProgressEnabled: state.offlineProgressEnabled, // Keep offline progress preference
        _needsSave: true, // Always save on rebirth
        dataLoaded: true // Mark data as loaded to prevent auto-reload
      };
      
      // Make sure CPC and CPS are calculated with the bonusMultiplier
      resetState.cpc = calculateTotalCPC(resetState);
      resetState.cps = calculateTotalCPS(resetState);
      
      return resetState;
    }
    
    case 'LOAD_SAVED_GAME': {
      // When loading a saved game, we mark it as loaded
      return {
        ...action.payload,
        dataLoaded: true,
        _needsSave: false // Don't trigger a save right after loading
      };
    }
    
    case 'LOAD_GAME': {
      // When loading a game (from login/manual load), preserve needsSave flag
      return {
        ...action.payload,
        dataLoaded: true
      };
    }
    
    case 'MERGE_GAME_DATA': {
      return {...state, ...action.payload};
    }
    
    case 'UNLOCK_ROCK': {
      const rockId = action.payload;
      const rock = state.rocks.find(r => r.id === rockId);
      
      if (!rock || rock.unlocked) {
        return state;
      }
      
      const newRocks = state.rocks.map(r => 
        r.id === rockId ? { ...r, unlocked: true } : r
      );
      
      const newState = {
        ...state,
        rocks: newRocks,
      };
      
      // Recalculate CPC with new base
      newState.cpc = calculateTotalCPC(newState);
      
      // Check for achievements
      return checkAchievements(newState);
    }
    
    case 'ACTIVATE_ABILITY': {
      const abilityId = action.payload;
      const ability = state.abilities.find(a => a.id === abilityId);
      
      if (!ability || ability.cost > 0 || ability.active || (ability.cooldownRemaining && ability.cooldownRemaining > 0)) {
        return state;
      }
      
      // Play ability sound
      SoundManager.playSound('ability', state.soundEnabled);
      
      // Activate the ability
      const updatedAbilities = state.abilities.map(a => 
        a.id === abilityId 
          ? { 
              ...a, 
              active: true, 
              timeRemaining: a.duration
            } 
          : a
      );
      
      // Recalculate CPC and CPS with active abilities
      const newCPC = calculateTotalCPC({
        ...state,
        abilities: updatedAbilities
      });
      
      const newCPS = calculateTotalCPS({
        ...state,
        abilities: updatedAbilities
      });
      
      console.log(`Activated ${ability.name} - New CPC: ${newCPC}, New CPS: ${newCPS}`);
      
      return {
        ...state,
        abilities: updatedAbilities,
        cpc: newCPC,
        cps: newCPS,
        _needsSave: true,
      };
    }
    
    case 'DEACTIVATE_ABILITY': {
      const abilityId = action.payload;
      const ability = state.abilities.find(a => a.id === abilityId);
      
      if (!ability || !ability.active || (ability.cooldownRemaining && ability.cooldownRemaining > 0)) {
        return state;
      }
      
      // Deactivate the ability
      const updatedAbilities = state.abilities.map(a => 
        a.id === abilityId 
          ? { 
              ...a, 
              active: false, 
              timeRemaining: 0,
              cooldownRemaining: ability.cooldown
            } 
          : a
      );
      
      // Recalculate CPC and CPS with deactivated abilities
      const newCPC = calculateTotalCPC({
        ...state,
        abilities: updatedAbilities
      });
      
      const newCPS = calculateTotalCPS({
        ...state,
        abilities: updatedAbilities
      });
      
      return {
        ...state,
        abilities: updatedAbilities,
        cpc: newCPC,
        cps: newCPS,
        _needsSave: true,
      };
    }
    
    case 'UPGRADE_ABILITY': {
      const abilityId = action.payload;
      const ability = state.abilities.find(a => a.id === abilityId);
      
      if (!ability || ability.cost > 0 || ability.level >= ability.maxLevel || state.coins < ability.upgradeCost) {
        return state;
      }
      
      // Calculate new multiplier based on level
      let newMultiplier = ability.multiplier;
      switch (ability.effect) {
        case 'cpc_multiplier':
          newMultiplier = 10 + (ability.level * 5); // 10, 15, 20, 25, 30x
          break;
        case 'auto_tap':
          newMultiplier = 5 + (ability.level * 2); // 5, 7, 9, 11, 13 taps/sec
          break;
        case 'gold_chance':
          newMultiplier = 0.05 + (ability.level * 0.05); // 5%, 10%, 15%
          break;
        case 'cps_multiplier':
          newMultiplier = 2 + (ability.level * 0.5); // 2, 2.5, 3, 3.5, 4x
          break;
      }
      
      // Update the ability with new level and multiplier
      const updatedAbilities = state.abilities.map(a => 
        a.id === abilityId 
          ? { 
              ...a, 
              level: a.level + 1, 
              multiplier: newMultiplier,
              upgradeCost: Math.floor(a.upgradeCost * 1.8) // Increase upgrade cost for next level
            } 
          : a
      );
      
      // Get the ability's current upgrade cost before we update it
      const currentUpgradeCost = ability.upgradeCost;
      
      return {
        ...state,
        coins: state.coins - currentUpgradeCost,
        abilities: updatedAbilities,
        _needsSave: true,
      };
    }
    
    case 'ABILITY_TICK': {
      const seconds = action.payload;
      
      // Check if we have any active abilities or abilities on cooldown
      const hasActiveOrCooldown = state.abilities.some(a => 
        a.active || (a.cooldownRemaining && a.cooldownRemaining > 0)
      );
      
      if (!hasActiveOrCooldown) {
        return state;
      }
      
      // Update each ability
      const updatedAbilities = state.abilities.map(a => {
        // If ability is active, decrease time remaining
        if (a.active && a.timeRemaining) {
          const newTimeRemaining = Math.max(0, a.timeRemaining - seconds);
          
          // If time just ran out, deactivate and start cooldown
          if (newTimeRemaining === 0 && a.timeRemaining > 0) {
            return {
              ...a,
              active: false,
              timeRemaining: 0,
              cooldownRemaining: a.cooldown
            };
          }
          
          return {
            ...a,
            timeRemaining: newTimeRemaining
          };
        } 
        // If ability is on cooldown, decrease cooldown time
        else if (!a.active && a.cooldownRemaining && a.cooldownRemaining > 0) {
          // Apply time warp effect if owned (abilities recharge 50% faster)
          const timeWarpMultiplier = state.specialUpgrades.find(u => u.id === 'time-warp')?.owned ? 1.5 : 1;
          const cooldownReduction = seconds * timeWarpMultiplier;
          const newCooldownRemaining = Math.max(0, a.cooldownRemaining - cooldownReduction);
          
          return {
            ...a,
            cooldownRemaining: newCooldownRemaining
          };
        }
        
        return a;
      });
      
      // Check if we need to recalculate CPC and CPS
      // (if an ability just activated or deactivated)
      const activeAbilitiesChanged = state.abilities.some(a => 
        (a.active && updatedAbilities.find(ua => ua.id === a.id)?.active === false) ||
        (!a.active && updatedAbilities.find(ua => ua.id === a.id)?.active === true)
      );
      
      // Look for specific ability status changes for special handling
      const autoTapDeactivated = state.abilities.find(a => a.id === 'auto-tap' && a.active) && 
        !updatedAbilities.find(a => a.id === 'auto-tap')?.active;
      
      const coinScatterDeactivated = state.abilities.find(a => a.id === 'coin-scatter' && a.active) && 
        !updatedAbilities.find(a => a.id === 'coin-scatter')?.active;
      
      // Always recalculate CPC and CPS to ensure ability effects are properly applied
      const newCPC = calculateTotalCPC({
        ...state,
        abilities: updatedAbilities
      });
      
      const newCPS = calculateTotalCPS({
        ...state,
        abilities: updatedAbilities
      });
      
      // Special handling for ability deactivations
      if (autoTapDeactivated || coinScatterDeactivated) {
        // Play sound for ability ending
        SoundManager.playSound('ability', state.soundEnabled);
        console.log(`Ability deactivated - New CPC: ${newCPC}, New CPS: ${newCPS}`);
      }
      
      // Always update CPC and CPS to ensure they're kept in sync with abilities
      return {
        ...state,
        abilities: updatedAbilities,
        cpc: newCPC,
        cps: newCPS,
        _needsSave: activeAbilitiesChanged, // Only mark for save if something important changed
      };
    }
    
    case 'AUTO_MINE': {
      const { coins, multiplier } = action.payload;
      
      // Use the precomputed multiplier instead of recalculating each time
      const coinsToAdd = coins * multiplier;
      
      return {
        ...state,
        coins: state.coins + coinsToAdd,
        totalCoinsEarned: state.totalCoinsEarned + coinsToAdd
      };
    }
    
    default:
      return state;
  }
}

// Provider component
interface GameProviderProps {
  children: React.ReactNode;
}

// Update the type for autoMiningCache
type AutoMiningCache = {
  multiplier: number;
  batchedCoins: number;
  lastUpdate: number;
  intervalId: NodeJS.Timeout | null;
  updateCount: number;
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { authState } = useAuth();
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update the type annotation for autoMiningCache
  const autoMiningCache = useRef<AutoMiningCache>({
    multiplier: 1,
    batchedCoins: 0,
    lastUpdate: 0,
    intervalId: null,
    updateCount: 0
  });
  
  // Optimize auto-mining for better performance
  useEffect(() => {
    // Skip if no auto miners are active
    if (state.cps <= 0) {
      return;
    }
    
    // Initialize the auto mining cache
    if (!autoMiningCache.current) {
      autoMiningCache.current = {
        lastUpdate: Date.now(),
        batchedCoins: 0,
        multiplier: 1,
        intervalId: null,
        updateCount: 0
      };
    }
    
      // Calculate multiplier only when CPS changes, not on every tick
      let multiplier = 1;
      
      // Apply miners helmet effect if owned
      if (state.specialUpgrades.find(u => u.id === 'miners-helmet' && u.owned)) {
        multiplier *= 1.25;
      }
      
      // Apply active ability multipliers
      const activeAbilities = state.abilities.filter(a => a.active && a.effect === 'cps_multiplier');
      for (const ability of activeAbilities) {
        multiplier *= ability.multiplier;
      }
      
      // Store the calculated multiplier in the cache
      autoMiningCache.current.multiplier = multiplier;
      
      // Only start one interval if it doesn't exist
      if (!autoMiningCache.current.intervalId) {
        const intervalId = setInterval(() => {
          const now = Date.now();
          const deltaTime = now - autoMiningCache.current.lastUpdate;
          autoMiningCache.current.lastUpdate = now;
          
          // Skip first iteration if lastUpdate is 0
          if (deltaTime > 1000 || deltaTime <= 0) {
            return;
          }
          
          // Calculate coins to add for this tick
          const secondFraction = deltaTime / 1000;
          const tickCoins = state.cps * secondFraction;
          
          // Batch small amounts before dispatching to reduce renders
          autoMiningCache.current.batchedCoins += tickCoins;
        autoMiningCache.current.updateCount += 1;
        
        // Only dispatch after accumulating a significant amount, every 10 ticks, or after 500ms
        if (autoMiningCache.current.batchedCoins >= state.cps / 2 || 
            autoMiningCache.current.updateCount >= 10 ||
            deltaTime >= 500) {
            dispatch({ 
              type: 'AUTO_MINE', 
              payload: { 
                coins: autoMiningCache.current.batchedCoins,
                multiplier: autoMiningCache.current.multiplier
              } 
            });
            // Reset the batch
            autoMiningCache.current.batchedCoins = 0;
          autoMiningCache.current.updateCount = 0;
          }
      }, 50); // 50ms interval for smoother increments
        
        autoMiningCache.current.intervalId = intervalId;
        autoMiningCache.current.lastUpdate = Date.now();
      }
      
      return () => {
      if (autoMiningCache.current && autoMiningCache.current.intervalId) {
          clearInterval(autoMiningCache.current.intervalId);
          autoMiningCache.current.intervalId = null;
          
          // Dispatch any remaining batched coins
          if (autoMiningCache.current.batchedCoins > 0) {
            dispatch({ 
              type: 'AUTO_MINE', 
              payload: { 
                coins: autoMiningCache.current.batchedCoins,
                multiplier: autoMiningCache.current.multiplier
              } 
            });
            autoMiningCache.current.batchedCoins = 0;
          }
        }
      };
  }, [state.cps, state.specialUpgrades, state.abilities]);

  // Add a performance optimization for ability ticks - batch updates
  const performAbilityTick = useCallback((seconds) => {
    // Skip if no active abilities or cooldowns
    const hasActiveOrCooldown = state.abilities.some(a => 
      a.active || (a.cooldownRemaining && a.cooldownRemaining > 0)
    );
    
    if (!hasActiveOrCooldown) return;
    
    dispatch({ type: 'ABILITY_TICK', payload: seconds });
  }, [dispatch, state.abilities]);
  
  // Modified initialization logic
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize sounds
        await SoundManager.loadSounds();

        // Always try to load from local storage first
        const result = await loadGame();
        if (result.success) {
          setDataLoaded(true);
        } else {
          // If load failed but we have auth, try one more time
          if (authState.isAuthenticated && authState.user?.id) {
            console.log('Initial load failed, retrying with forced reload');
            const retryResult = await loadGame(true);
            setDataLoaded(retryResult.success);
          }
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  // Reference for offline earnings notification
  const offlineEarningsRef = useRef('');

  // Function to calculate offline progress when user returns to game
  const calculateOfflineProgress = () => {
    // Skip if offline progress is not enabled or if user doesn't have the upgrade
    if (!state.offlineProgressEnabled) {
      console.log('Offline progress disabled, skipping');
      return;
    }
    
    const offlineUpgrade = state.specialUpgrades.find(u => u.id === 'offline-progress');
    if (!offlineUpgrade?.owned) {
      console.log('User does not have offline progress upgrade, skipping');
      return;
    }
    
    const now = Date.now();
    const lastSaved = state.lastSaved || now;
    const offlineTime = now - lastSaved;
    
    // Only calculate if last saved was more than 30 seconds ago
    if (offlineTime < 30000) {
      console.log('Last played less than 30 seconds ago, skipping offline progress');
      return;
    }
    
    console.log(`Calculating offline progress for ${offlineTime / 1000} seconds`);
    
    // Cap offline progress at 24 hours
    const cappedOfflineTime = Math.min(offlineTime, 24 * 60 * 60 * 1000);
    const offlineSeconds = cappedOfflineTime / 1000;
    
    // Calculate coins earned based on cps
    const offlineCoins = Math.floor(state.cps * offlineSeconds);
    
    if (offlineCoins > 0) {
      console.log(`Earned ${offlineCoins} coins while offline`);
      
      // Update the game state with the offline earnings
      dispatch({
        type: 'MERGE_GAME_DATA',
        payload: {
          ...state,  // Include the full state to satisfy GameState type
          coins: state.coins + offlineCoins,
          totalCoinsEarned: state.totalCoinsEarned + offlineCoins,
          _needsSave: true
        }
      });
      
      // Store the notification text to show the user
      offlineEarningsRef.current = `You earned ${offlineCoins.toLocaleString()} coins while away!`;
    }
  };

  // Monitor app state to handle background/foreground transitions
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App has come to the foreground, checking for updated data');
        
        // Only reload if we're authenticated (for cross-device sync)
        if (authState.isAuthenticated && authState.user?.id) {
          try {
            // Check if there's newer data in the cloud before doing a full reload
            const { data: cloudStateData, error: fetchError } = await supabase
              .from('game_states')
              .select('updated_at, game_data')
              .eq('user_id', authState.user.id)
              .limit(1)
              .maybeSingle();
              
            if (!fetchError && cloudStateData?.game_data) {
              // Parse cloud data to compare timestamps
              try {
                const cloudData = typeof cloudStateData.game_data === 'string'
                  ? JSON.parse(cloudStateData.game_data)
                  : cloudStateData.game_data;
                
                // Get local data to compare timestamps
                const localDataStr = await AsyncStorage.getItem('gameState');
                if (localDataStr) {
                  const localData = JSON.parse(localDataStr);
                  
                  // If cloud data is newer, trigger a full reload
                  if (cloudData.lastSaved > localData.lastSaved) {
                    console.log('Detected newer cloud data, reloading game state');
                    await loadGame(true);
                  } else {
                    // If local data is newer or same, calculate offline progress
                    if (state.offlineProgressEnabled) {
                      calculateOfflineProgress();
                    }
                  }
                }
              } catch (error) {
                console.error('Error checking cloud data on resume:', error);
              }
            } else {
              // If no cloud data, still calculate offline progress
              if (state.offlineProgressEnabled) {
                calculateOfflineProgress();
              }
            }
          } catch (error) {
            console.error('Error connecting to database on resume:', error);
            // Still calculate offline progress on error
            if (state.offlineProgressEnabled) {
              calculateOfflineProgress();
            }
          }
        } else {
          // Not authenticated, just calculate offline progress
          if (state.offlineProgressEnabled) {
            calculateOfflineProgress();
          }
        }
        
        // Save current state when coming to foreground
        if (dataLoaded && !isInitializing) {
          saveGame();
        }
      } else if (nextAppState === 'background') {
        // When going to background, save state
        console.log('App going to background, saving game state');
        if (dataLoaded && !isInitializing) {
          saveGame();
        }
      }
    };
    
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [authState.isAuthenticated, authState.user?.id, dataLoaded, isInitializing, state.offlineProgressEnabled]);
  
  // Handle game restart (for testing or after completing the game)
  const handleRestartGame = () => {
    // First confirm with the user
    if (confirm('Are you sure you want to restart the game? All progress will be lost!')) {
      // Reset to initial state
      dispatch({ type: 'LOAD_GAME', payload: initialState });
      
      // Save the reset state
      setTimeout(() => saveGame(), 500);
      
      // Show a confirmation message
      alert('Game has been reset to the beginning. Good luck!');
    }
  };
  
  // Save game data to AsyncStorage and optionally to Supabase
  const saveGame = async () => {
    // Don't save if data hasn't been loaded yet
    if (!dataLoaded) {
      console.log('Skipping save - data not fully loaded yet');
      return;
    }

    // Prevent multiple simultaneous saves
    if (isSaving) {
      console.log('Already saving game data, skipping this save');
      return;
    }
    
    // Don't save to database if we're initializing after login
    if (isInitializing) {
      console.log('Still initializing after login, skipping save to prevent data loss');
      return;
    }
    
    // Safety check - don't save empty data to database
    if (state.coins === 0 && state.totalCoinsEarned === 0 && authState.isAuthenticated) {
      // console.log('Preventing save of empty data to database');
      // Check if we have cloud data before saving
      try {
        const { data: cloudStateData, error: fetchError } = await supabase
          .from('game_states')
          .select('game_data')
          .eq('user_id', authState.user.id)
          .limit(1)
          .maybeSingle();
          
        if (!fetchError && cloudStateData?.game_data) {
          // We have existing cloud data, don't overwrite with empty data
          console.log('Found existing cloud data, skipping save of empty state');
          return;
        }
      } catch (error) {
        console.error('Error checking for cloud data before save:', error);
      }
    }

    setIsSaving(true);

    try {
      // Add a version number to track updates
      const gameData = {
        ...state,
        lastSaved: Date.now(),
        dataLoaded: true,
        version: (state.version || 0) + 1, // Increment version with each save
      };

      const gameDataStr = JSON.stringify(gameData);

      // Always save to AsyncStorage
      await AsyncStorage.setItem('gameState', gameDataStr);
      console.log(`Saved game to local storage at ${new Date().toISOString()} with coins: ${gameData.coins}, version: ${gameData.version}`);

      // If user is logged in, also save to Supabase
      if (authState.isAuthenticated && authState.user?.id) {
        try {
          // Check if a game state already exists for this user
          const { data: existingState, error: fetchError } = await supabase
            .from('game_states')
            .select('id, updated_at, game_data')
            .eq('user_id', authState.user.id)
            .limit(1)
            .maybeSingle();

          if (fetchError) {
            console.error('Error checking existing game state:', fetchError);
            return;
          }

          if (existingState) {
            // Check for version conflicts with cloud data
              try {
                const cloudData = typeof existingState.game_data === 'string'
                  ? JSON.parse(existingState.game_data)
                  : existingState.game_data;
                
              const cloudVersion = cloudData.version || 0;
              const localVersion = gameData.version || 0;
              
              // If cloud data is a newer version, merge instead of overwriting
              if (cloudVersion > localVersion) {
                // console.log(`Cloud version (${cloudVersion}) is newer than local version (${localVersion}), merging data...`);
                  const mergedData = mergeGameData(gameData, cloudData);
                mergedData.version = Math.max(cloudVersion, localVersion) + 1; // Set version to highest + 1
                
                // Update local state with merged data
                dispatch({ type: 'LOAD_GAME', payload: mergedData });
                
                // Update AsyncStorage with merged data
                const mergedDataStr = JSON.stringify(mergedData);
                await AsyncStorage.setItem('gameState', mergedDataStr);
                
                // Update cloud with merged data
                  const { error: updateError } = await supabase
                    .from('game_states')
                    .update({ 
                    game_data: mergedDataStr,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', existingState.id);

                  if (updateError) {
                  console.error('Error updating cloud with merged data:', updateError);
                  } else {
                  console.log('Successfully synchronized data across devices (version: ' + mergedData.version + ')');
                  }
                  return;
                }
              } catch (parseError) {
              console.error('Error processing cloud data for version check:', parseError);
            }
            
            // Normal update if no version conflicts
            const { error: updateError } = await supabase
              .from('game_states')
              .update({ 
                game_data: gameDataStr,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingState.id);

            if (updateError) {
              console.error('Error updating game state:', updateError);
              // Don't try database operations again if we get an RLS error
              if (updateError.code === '42501') {
                console.log('Security policy error detected, stopping database operations');
                return;
              }
            } else {
              console.log(`Successfully updated cloud game state (version: ${gameData.version})`);
            }
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from('game_states')
              .insert([{ 
                user_id: authState.user.id,
                game_data: gameDataStr
              }]);

            if (insertError) {
              console.error('Error inserting game state:', insertError);
              // Don't try database operations again if we get an RLS error
              if (insertError.code === '42501') {
                console.log('Security policy error detected, stopping database operations');
                return;
              }
            } else {
              console.log(`Successfully created new cloud game state (version: ${gameData.version})`);
            }
          }
        } catch (error) {
          console.error('Error saving to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error saving game data:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add debounced save callback here, after saveGame is defined
  const debouncedSaveGame = useCallback(
    debounce(async () => {
      await saveGame();
    }, 3000), // 3 second delay before saving
    [saveGame]
  );
  
  // Trigger debounced save when _needsSave flag is set
  useEffect(() => {
    if (state._needsSave) {
      // console.log('State marked for saving, scheduling save');
      debouncedSaveGame();
    }
  }, [state._needsSave]);
  
  // Load game data from AsyncStorage and optionally from Supabase
  const loadGame = useCallback(async (forceReload = false) => {
    if (!forceReload && dataLoaded) {
      console.log('Game data already loaded, skipping load');
      return { success: true, message: 'Game data already loaded', source: 'cache' };
    }

    setIsLoading(true);

    try {
      console.log('Loading game data...');
      
      // Set a reasonable timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Loading game data timed out')), 10000)
      );
      
      // First try to load from localStorage
      let gameData = null;
      let source = 'local';
      
      try {
        const localDataStr = await Promise.race([
          AsyncStorage.getItem('gameState'),
          timeoutPromise
        ]);
        
        if (localDataStr) {
          gameData = JSON.parse(localDataStr);
          console.log(`Loaded game data from local storage with ${gameData.coins} coins`);
        }
      } catch (localError) {
        console.error('Error loading from local storage:', localError);
      }

      // If user is authenticated AND forceReload is true (explicitly requested), try to load from Supabase
      // This ensures we only load from the database when explicitly requested
      if (forceReload && authState.isAuthenticated && authState.user?.id) {
        try {
          const { data: cloudState, error: fetchError } = await supabase
            .from('game_states')
            .select('game_data')
            .eq('user_id', authState.user.id)
            .limit(1)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching game data from database:', fetchError);
            setDatabaseError('Error connecting to database. Please set up the database or continue without saving.');
          } else if (cloudState?.game_data) {
            let cloudData;
            
            // Parse cloud data
            try {
              cloudData = typeof cloudState.game_data === 'string'
                ? JSON.parse(cloudState.game_data)
                : cloudState.game_data;
            } catch (parseError) {
              console.error('Error parsing cloud data:', parseError);
              // Continue with local data if parsing fails
            }
            
            if (cloudData) {
              // Only use cloud data if explicitly requested via forceReload
              gameData = cloudData;
              source = 'cloud';
              console.log('Explicitly loading cloud data as requested');
            }
          }
        } catch (cloudError) {
          console.error('Error accessing cloud data:', cloudError);
        }
      }

      // If we have data, load it
      if (gameData) {
        // Apply merge with current state if needed
        const finalState = gameData;
        finalState.dataLoaded = true;
        
        // Load the data into the state
        dispatch({ type: 'LOAD_GAME', payload: finalState });
        
        setIsLoading(false);
        console.log(`Loaded game data from ${source} with ${finalState.coins} coins`);
        return { success: true, message: `Loaded game data from ${source}`, source };
      } else {
        console.log('No saved game data found, using initial state');
        
        // Load initial state
        dispatch({ type: 'LOAD_GAME', payload: { ...initialState, dataLoaded: true } });
        
        setIsLoading(false);
        return { success: true, message: 'Using initial state', source: 'initial' };
      }
    } catch (error) {
      console.error('Error in loadGame function:', error);
      setIsLoading(false);
      
      // Even on error, mark data as loaded to prevent UI hanging
      dispatch({ type: 'LOAD_GAME', payload: { ...initialState, dataLoaded: true } });
      
      return { 
        success: false, 
        message: 'Error loading game data', 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }, [isLoading, dataLoaded, state._needsSave, authState.isAuthenticated, authState.user?.id]);
  
  // Create a better debounced version with a longer delay to prevent frequent calls
  const debouncedLoadGame = useCallback(
    debounce(async (forceReload = false) => {
      await loadGame(forceReload);
    }, 1000), // Increased from 500ms to 1000ms
    [loadGame]
  );

  // Handle logout and login properly
  useEffect(() => {
    // When user logs in after being logged out
    if (authState.isAuthenticated && !authState.wasAuthenticated) {
      console.log('User logged in, checking for data across devices...');
      
      // Set a flag to prevent auto-saving during this initial load
      setIsInitializing(true);
      
      // Force load cloud data with higher priority
      setTimeout(async () => {
        try {
          // First check if there's cloud data for this user
          const { data: cloudStateData, error: fetchError } = await supabase
            .from('game_states')
            .select('game_data, updated_at')
            .eq('user_id', authState.user.id)
            .limit(1)
            .maybeSingle();
            
          // Also check local storage
          const localDataStr = await AsyncStorage.getItem('gameState');
          let localData = null;
          
          if (localDataStr) {
            try {
              localData = JSON.parse(localDataStr);
              console.log('Found local data:', {
                coins: localData.coins, 
                version: localData.version || 0,
                lastSaved: new Date(localData.lastSaved).toISOString()
              });
            } catch (error) {
              console.error('Error parsing local data:', error);
            }
          }
          
          if (!fetchError && cloudStateData?.game_data) {
            // We have cloud data, parse and examine it
            const cloudData = typeof cloudStateData.game_data === 'string'
              ? JSON.parse(cloudStateData.game_data)
              : cloudStateData.game_data;
            
            console.log('Found cloud data:', { 
              coins: cloudData.coins, 
              version: cloudData.version || 0,
              lastSaved: cloudData.lastSaved ? new Date(cloudData.lastSaved).toISOString() : 'unknown'
            });
              
            // We have both cloud and local data, need to decide which to use
            if (localData) {
              const cloudVersion = cloudData.version || 0;
              const localVersion = localData.version || 0;
              
              // If local version is higher, we have local changes not in the cloud
              if (localVersion > cloudVersion) {
                console.log(`Local version (${localVersion}) is newer than cloud (${cloudVersion}), syncing up...`);
                // Create merged state with local version taking priority
                const mergedData = mergeGameData(cloudData, localData);
                mergedData.version = localVersion; // Keep the higher version number
                
                // Apply merged data
                dispatch({ type: 'LOAD_GAME', payload: mergedData });
                setDataLoaded(true);
                
                // Update cloud with our local changes
                const mergedDataStr = JSON.stringify(mergedData);
                
                try {
                  const { error: updateError } = await supabase
                    .from('game_states')
                    .update({ 
                      game_data: mergedDataStr,
                      updated_at: new Date().toISOString()
                    })
                    .eq('user_id', authState.user.id);
                    
                  if (updateError) {
                    console.error('Error syncing local changes to cloud:', updateError);
                  } else {
                    console.log('Successfully synced local changes to cloud');
                  }
                } catch (error) {
                  console.error('Error during cloud update:', error);
                }
              } else {
                // Cloud version is newer or equal, use it
                console.log(`Cloud version (${cloudVersion}) is newer or equal to local (${localVersion}), using cloud data`);
                
                // If versions are equal but data differs, merge them
                if (cloudVersion === localVersion && (cloudData.coins !== localData.coins || cloudData.totalCoinsEarned !== localData.totalCoinsEarned)) {
                  console.log('Same version but different data, merging...');
                  const mergedData = mergeGameData(cloudData, localData);
                  mergedData.version = cloudVersion + 1; // Increment version after merge
                  
                  // Apply merged data
                  dispatch({ type: 'LOAD_GAME', payload: mergedData });
                  setDataLoaded(true);
                  
                  // Update both local and cloud storage
                  const mergedDataStr = JSON.stringify(mergedData);
                  await AsyncStorage.setItem('gameState', mergedDataStr);
                  
                  try {
                    const { error: updateError } = await supabase
                      .from('game_states')
                      .update({ 
                        game_data: mergedDataStr,
                        updated_at: new Date().toISOString()
                      })
                      .eq('user_id', authState.user.id);
                      
                    if (updateError) {
                      console.error('Error updating cloud with merged data:', updateError);
                    } else {
                      console.log('Successfully synchronized merged data to cloud');
                    }
                  } catch (error) {
                    console.error('Error updating cloud:', error);
                  }
                } else {
                  // Simple case - cloud version is newer, use it directly
                  dispatch({ type: 'LOAD_GAME', payload: cloudData });
                  setDataLoaded(true);
                  
                  // Update local storage with cloud data
                  await AsyncStorage.setItem('gameState', JSON.stringify(cloudData));
                  console.log('Applied cloud data to local state');
                }
              }
            } else {
              // Only have cloud data, use it directly
              dispatch({ type: 'LOAD_GAME', payload: cloudData });
              setDataLoaded(true);
              
              // Update local storage
              await AsyncStorage.setItem('gameState', JSON.stringify(cloudData));
              console.log('No local data, applied cloud data');
            }
          } else if (localData) {
            // Only have local data, use it and sync to cloud
            console.log('No cloud data found, using local data and syncing to cloud');
            
            dispatch({ type: 'LOAD_GAME', payload: localData });
            setDataLoaded(true);
            
            // Sync local data to cloud
            try {
              const { error: insertError } = await supabase
                .from('game_states')
                .insert([{ 
                  user_id: authState.user.id,
                  game_data: JSON.stringify({
                    ...localData,
                    version: (localData.version || 0) + 1 // Increment version when syncing to cloud
                  })
                }]);
                
              if (insertError) {
                console.error('Error syncing local data to cloud:', insertError);
              } else {
                console.log('Successfully synced local data to cloud');
              }
            } catch (error) {
              console.error('Error during cloud insert:', error);
            }
          } else {
            // No data anywhere, start fresh
            console.log('No existing data found, starting fresh');
            dispatch({ type: 'LOAD_GAME', payload: { ...initialState, dataLoaded: true } });
            setDataLoaded(true);
          }
        } catch (error) {
          console.error('Error during login data sync:', error);
          
          // Fallback to local data if available
          try {
            const localDataStr = await AsyncStorage.getItem('gameState');
            if (localDataStr) {
              const localData = JSON.parse(localDataStr);
              dispatch({ type: 'LOAD_GAME', payload: localData });
              setDataLoaded(true);
              console.log('Error accessing cloud, fallback to local data');
            } else {
              // Nothing available, start fresh
              dispatch({ type: 'LOAD_GAME', payload: { ...initialState, dataLoaded: true } });
              setDataLoaded(true);
            }
          } catch (localError) {
            console.error('Error accessing local storage:', localError);
            dispatch({ type: 'LOAD_GAME', payload: { ...initialState, dataLoaded: true } });
            setDataLoaded(true);
          }
        } finally {
      setIsInitializing(false);
    }
      }, 1000); // Slight delay to ensure auth is established
    }
    
    // When user logs out
    if (authState.wasAuthenticated && !authState.isAuthenticated) {
      console.log('User logged out, saving state to local storage only');
      
      try {
        // Only save to local storage when logging out, never to the database
        const gameDataStr = JSON.stringify({
          ...state,
          lastSaved: Date.now(),
          dataLoaded: true,
          version: (state.version || 0) + 1 // Increment version on logout to track changes
        });
        
        // Keep local data for offline play
        AsyncStorage.setItem('gameState', gameDataStr)
          .then(() => console.log('Game state saved locally before logout'))
          .catch(err => console.error('Error saving game state before logout:', err));
      } catch (error) {
        console.error('Error during logout cleanup:', error);
      }
    }
  }, [authState.isAuthenticated, authState.wasAuthenticated, authState.user?.id]);
  
  // Periodically check for achievements that might have been missed
  useEffect(() => {
    // Check achievements every 5 seconds
    const achievementCheckInterval = setInterval(() => {
      // Create a copy of the current state to check
      const updatedState = checkAchievements(state);
      
      // If achievements were updated, dispatch the new state
      if (JSON.stringify(updatedState.achievements) !== JSON.stringify(state.achievements)) {
        console.log('Periodic achievement check found new achievements');
        dispatch({
          type: 'MERGE_GAME_DATA',
          payload: updatedState
        });
      }
    }, 5000);
    
    return () => clearInterval(achievementCheckInterval);
  }, [state]);
  
  // Add to the useEffect section that checks for achievements
  useEffect(() => {
    // Find all newly unlocked achievements that haven't been shown yet
    const newlyUnlockedAchievements = state.achievements.filter(
      a => a.unlocked && !achievementNotifications.includes(a.id)
    );
    
    if (newlyUnlockedAchievements.length > 0) {
      // Add these achievement IDs to our notification tracking
      setAchievementNotifications(prev => [
        ...prev, 
        ...newlyUnlockedAchievements.map(a => a.id)
      ]);
      
      // Dispatch achievement unlocked events with slight delay between them
      newlyUnlockedAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          dispatch({ 
            type: 'UNLOCK_ACHIEVEMENT', 
            payload: achievement.id
          });
        }, index * 500); // Stagger notifications
      });
    }
  }, [state.achievements]);
  
  // Make the context value
  const contextValue: GameContextType = {
    state,
    dispatch,
    loadGame: debouncedLoadGame,
    saveGame,
    databaseError,
    isInitializing,
    handleRestartGame,
    forceSyncData: async () => {
      // Skip if not authenticated
      if (!authState.isAuthenticated || !authState.user?.id) {
        console.log('Cannot sync - not authenticated');
        return { 
          success: false, 
          message: 'You must be logged in to sync data across devices' 
        };
      }
      
      // Set temporary flag to prevent auto-saving during sync
      setIsSaving(true);
      
      try {
        console.log('Forcing cross-device data synchronization...');
        
        // Check for cloud data
        const { data: cloudStateData, error: fetchError } = await supabase
          .from('game_states')
          .select('game_data, updated_at')
          .eq('user_id', authState.user.id)
          .limit(1)
          .maybeSingle();
        
        if (fetchError) {
          console.error('Error fetching cloud data:', fetchError);
          return { 
            success: false, 
            message: 'Unable to access cloud data. Please try again later.'
          };
        }
        
        // Get latest local data from AsyncStorage
        const localDataStr = await AsyncStorage.getItem('gameState');
        let localData = null;
        
        if (localDataStr) {
          try {
            localData = JSON.parse(localDataStr);
          } catch (error) {
            console.error('Error parsing local data:', error);
          }
        }
        
        // Merge current state, local storage, and cloud data
        let finalData;
        
        if (cloudStateData?.game_data) {
          // Parse cloud data
          const cloudData = typeof cloudStateData.game_data === 'string'
            ? JSON.parse(cloudStateData.game_data)
            : cloudStateData.game_data;
          
          console.log('Performing 3-way merge between state, local storage, and cloud');
          
          // First merge local and state
          const localMerged = localData ? mergeGameData(state, localData) : state;
          
          // Then merge with cloud
          finalData = mergeGameData(localMerged, cloudData);
          
          // Set a new version higher than any current version
          finalData.version = Math.max(
            state.version || 0,
            localData?.version || 0,
            cloudData?.version || 0
          ) + 1;
        } else if (localData) {
          // Only have local data to sync with
          console.log('No cloud data, merging state with local storage');
          finalData = mergeGameData(state, localData);
          finalData.version = Math.max(state.version || 0, localData.version || 0) + 1;
        } else {
          // Only have current state
          console.log('No cloud or local storage data found, using current state');
          finalData = { 
            ...state,
            version: (state.version || 0) + 1,
            lastSaved: Date.now()
          };
        }
        
        // Apply the merged data locally first
        dispatch({ type: 'LOAD_GAME', payload: finalData });
        
        // Update local storage
        await AsyncStorage.setItem('gameState', JSON.stringify(finalData));
        
        // Sync to cloud
        const finalDataStr = JSON.stringify(finalData);
        
        if (cloudStateData) {
          // Update existing cloud data
          const { error: updateError } = await supabase
            .from('game_states')
            .update({ 
              game_data: finalDataStr,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', authState.user.id);
          
          if (updateError) {
            console.error('Error updating cloud data:', updateError);
            return { 
              success: false, 
              message: 'Data synced locally but failed to update cloud. Your progress is safe.'
            };
          }
        } else {
          // Create new cloud record
          const { error: insertError } = await supabase
            .from('game_states')
            .insert([{ 
              user_id: authState.user.id,
              game_data: finalDataStr
            }]);
          
          if (insertError) {
            console.error('Error creating cloud data:', insertError);
            return { 
              success: false, 
              message: 'Data synced locally but failed to create cloud record. Your progress is safe.'
            };
          }
        }
        
        console.log(`Force sync complete (version: ${finalData.version}), data synchronized across devices`);
        
        return { 
          success: true, 
          message: 'Successfully synchronized data across all your devices!' 
        };
      } catch (error) {
        console.error('Error during force sync:', error);
        return { 
          success: false, 
          message: 'An error occurred during synchronization. Please try again.'
        };
      } finally {
        setIsSaving(false);
      }
    },
  };
  
  // Add a ref to track the auto-tap interval
  const autoTapRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create effect to handle auto-tap ability
  useEffect(() => {
    // Check if auto-tap ability is active
    const autoTapAbility = state.abilities.find(a => a.id === 'auto-tap' && a.active);
    
    // Clean up any existing interval
    if (autoTapRef.current) {
      clearInterval(autoTapRef.current);
      autoTapRef.current = null;
    }
    
    // If auto-tap is active, start clicking at the ability's rate
    if (autoTapAbility) {
      const clicksPerSecond = autoTapAbility.multiplier;
      const intervalDelay = Math.floor(1000 / clicksPerSecond);
      
      autoTapRef.current = setInterval(() => {
        // Simulate clicking by dispatching CLICK_ROCK action
        dispatch({ type: 'CLICK_ROCK' });
      }, intervalDelay);
    }
    
    // Clean up when component unmounts or ability deactivates
    return () => {
      if (autoTapRef.current) {
        clearInterval(autoTapRef.current);
        autoTapRef.current = null;
      }
    };
  }, [state.abilities, dispatch]);
  
  // Improved logic for merging game data with conflict resolution
  const mergeGameData = (localData, cloudData) => {
    console.log(`Merging data: Local (ver=${localData?.version || 0}, coins=${localData?.coins || 0}) with Cloud (ver=${cloudData?.version || 0}, coins=${cloudData?.coins || 0})`);
    
    // Ensure we're working with valid data objects
    if (!localData || typeof localData !== 'object') {
      console.log('Invalid local data, using cloud data only');
      return { ...cloudData, lastSaved: Date.now() };
    }
    
    if (!cloudData || typeof cloudData !== 'object') {
      console.log('Invalid cloud data, using local data only');
      return { ...localData, lastSaved: Date.now() };
    }
    
    // Get versions for comparison
    const localVersion = localData.version || 0;
    const cloudVersion = cloudData.version || 0;
    
    // Start with the newer data as the base
    // But ALWAYS prioritize active player state over stored data
    let baseData;
    let otherData;
    
    // Special priority for rebirth mechanics and active game state
    const isActiveLocalState = localData._needsSave || 
                              (Date.now() - (localData.lastSaved || 0) < 60000); // If saved less than 1 minute ago
    
    if (isActiveLocalState) {
      console.log('Detected active local game state, prioritizing local changes');
      baseData = { ...localData };
      otherData = cloudData;
    } else if (localVersion >= cloudVersion) {
      console.log('Local version is newer or equal, using local as base');
      baseData = { ...localData };
      otherData = cloudData;
    } else {
      console.log('Cloud version is newer, using cloud as base');
      baseData = { ...cloudData };
      otherData = localData;
    }
    
    // Make a deep copy to avoid mutation issues
    baseData = JSON.parse(JSON.stringify(baseData));
    
    // NUMERICAL VALUES: Always take the maximum value to ensure progress isn't lost
    baseData.coins = Math.max(localData.coins || 0, cloudData.coins || 0);
    baseData.totalCoinsEarned = Math.max(localData.totalCoinsEarned || 0, cloudData.totalCoinsEarned || 0);
    baseData.goldCoins = Math.max(localData.goldCoins || 0, cloudData.goldCoins || 0);
    baseData.cpc = Math.max(localData.cpc || 1, cloudData.cpc || 1);
    baseData.baseCpc = Math.max(localData.baseCpc || 1, cloudData.baseCpc || 1);
    baseData.cps = Math.max(localData.cps || 0, cloudData.cps || 0);
    baseData.totalClicks = Math.max(localData.totalClicks || 0, cloudData.totalClicks || 0);
    baseData.clickProgress = Math.max(localData.clickProgress || 0, cloudData.clickProgress || 0);
    baseData.rebirths = Math.max(localData.rebirths || 0, cloudData.rebirths || 0);
    baseData.rebirthTokens = Math.max(localData.rebirthTokens || 0, cloudData.rebirthTokens || 0);
    baseData.bonusMultiplier = Math.max(localData.bonusMultiplier || 1, cloudData.bonusMultiplier || 1);
    
    // If local game has active game state flags, preserve them
    if (localData._needsSave) {
      baseData._needsSave = true;
    }
    
    // Use most recent selected rock
    baseData.selectedRock = (localData.lastSaved || 0) > (cloudData.lastSaved || 0) 
      ? localData.selectedRock 
      : cloudData.selectedRock;
      
    // IMPORTANT: If we're merging after a rebirth, ensure the rebirth state is preserved
    // This is to fix the issue where rebirth progress gets lost
    if (localData.rebirths > cloudData.rebirths) {
      console.log('Detected recent rebirth, preserving rebirth state');
      // Take all numerical values from local data since a rebirth resets but increases tokens
      baseData.coins = localData.coins;
      baseData.cpc = localData.cpc;
      baseData.baseCpc = localData.baseCpc;
      baseData.cps = localData.cps;
      baseData.rebirths = localData.rebirths;
      baseData.rebirthTokens = localData.rebirthTokens;
      baseData.bonusMultiplier = localData.bonusMultiplier;
    }
    
    // For rocks, if unlocked in either source, it should be unlocked in the result
    if (baseData.rocks && otherData.rocks) {
      baseData.rocks = baseData.rocks.map(rock => {
        const otherRock = otherData.rocks.find(r => r.id === rock.id);
        if (!otherRock) return rock;
        
        return {
          ...rock,
          unlocked: rock.unlocked || otherRock.unlocked
        };
      });
    }
    
    // For upgrades, if owned in either source, should be owned in result
    if (baseData.upgrades && otherData.upgrades) {
    baseData.upgrades = baseData.upgrades.map(upgrade => {
      const otherUpgrade = otherData.upgrades.find(u => u.id === upgrade.id);
        if (!otherUpgrade) return upgrade;
        
      return {
        ...upgrade,
          owned: upgrade.owned || otherUpgrade.owned
      };
    });
    }
    
    // For special upgrades, if owned in either source, should be owned in result
    if (baseData.specialUpgrades && otherData.specialUpgrades) {
    baseData.specialUpgrades = baseData.specialUpgrades.map(upgrade => {
      const otherUpgrade = otherData.specialUpgrades.find(u => u.id === upgrade.id);
        if (!otherUpgrade) return upgrade;
        
      return {
        ...upgrade,
          owned: upgrade.owned || otherUpgrade.owned
      };
    });
    }
    
    // For auto miners, take the highest quantity and owned status
    if (baseData.autoMiners && otherData.autoMiners) {
    baseData.autoMiners = baseData.autoMiners.map(miner => {
      const otherMiner = otherData.autoMiners.find(m => m.id === miner.id);
        if (!otherMiner) return miner;
        
      return {
        ...miner,
          owned: miner.owned || otherMiner.owned,
          quantity: Math.max(miner.quantity, otherMiner.quantity)
      };
    });
    }
    
    // For achievements, if unlocked in either source, should be unlocked in result
    if (baseData.achievements && otherData.achievements) {
    baseData.achievements = baseData.achievements.map(achievement => {
      const otherAchievement = otherData.achievements.find(a => a.id === achievement.id);
        if (!otherAchievement) return achievement;
        
      return {
        ...achievement,
          unlocked: achievement.unlocked || otherAchievement.unlocked,
          _hasShownNotification: achievement._hasShownNotification || otherAchievement._hasShownNotification
      };
    });
    }
    
    // For abilities, take highest level and purchase status from either source
    if (baseData.abilities && otherData.abilities) {
    baseData.abilities = baseData.abilities.map(ability => {
      const otherAbility = otherData.abilities.find(a => a.id === ability.id);
        if (!otherAbility) return ability;
        
        // If purchased in either source (cost === 0), keep it purchased
        const isPurchased = ability.cost === 0 || otherAbility.cost === 0;
        
        // Take the highest level
        const highestLevel = Math.max(ability.level, otherAbility.level);
        
        // For active abilities, prefer the one that's active, or use the primary source
        const isActive = (ability.active || otherAbility.active) ? true : false;
        
        // For cooldowns and timeRemaining, use the lowest value (favoring the ready state)
        const cooldownRemaining = (ability.cooldownRemaining && otherAbility.cooldownRemaining) ? 
          Math.min(ability.cooldownRemaining, otherAbility.cooldownRemaining) : 
          (ability.cooldownRemaining || otherAbility.cooldownRemaining || 0);
          
        const timeRemaining = (ability.timeRemaining && otherAbility.timeRemaining) ?
          Math.max(ability.timeRemaining, otherAbility.timeRemaining) :
          (ability.timeRemaining || otherAbility.timeRemaining || 0);
        
      return {
        ...ability,
          level: highestLevel,
          cost: isPurchased ? 0 : ability.cost,
          active: isActive,
          cooldownRemaining: isActive ? 0 : cooldownRemaining,
          timeRemaining: isActive ? timeRemaining : 0
      };
    });
    }
    
    // Set the timestamp to now to indicate a fresh merge
    baseData.lastSaved = Date.now();
    baseData.dataLoaded = true;
    baseData._needsSave = true;
    
    // Set the version to the highest version + 1
    baseData.version = Math.max(localVersion, cloudVersion) + 1;
    
    console.log(`Data merge complete - resulting: version=${baseData.version}, coins=${baseData.coins}`);
    return baseData;
  };
  
  // Add automatic periodic sync to ensure data consistency across devices
  useEffect(() => {
    // Skip if not authenticated or still initializing
    if (!authState.isAuthenticated || isInitializing || !dataLoaded) {
      return;
    }
    
    // Set up periodic sync at much longer intervals (15 minutes instead of 5)
    const syncInterval = setInterval(async () => {
      // Skip sync if user is actively playing or has pending actions
      if (state._needsSave || isLoading || isSaving) {
        console.log('Skipping periodic sync - game state is changing or saving in progress');
        return;
      }
      
      console.log('Running periodic cross-device sync check...');
      
      try {
        // Check for newer data in the cloud
        const { data: cloudStateData, error: fetchError } = await supabase
          .from('game_states')
          .select('game_data, updated_at')
          .eq('user_id', authState.user.id)
          .limit(1)
          .maybeSingle();
        
        if (fetchError) {
          console.error('Error checking cloud data during periodic sync:', fetchError);
    return;
  }
  
        if (!cloudStateData?.game_data) {
          console.log('No cloud data found during periodic sync, skipping');
    return;
  }
  
        // Parse cloud data
        const cloudData = typeof cloudStateData.game_data === 'string'
          ? JSON.parse(cloudStateData.game_data)
          : cloudStateData.game_data;
        
        // Compare versions
        const cloudVersion = cloudData.version || 0;
        const localVersion = state.version || 0;
        
        console.log(`Periodic sync check - Local version: ${localVersion}, Cloud version: ${cloudVersion}`);
        
        // Only sync if cloud version is SIGNIFICANTLY higher (more than 1 version difference)
        // This prevents constant back-and-forth syncing for minor changes
        if (cloudVersion > localVersion + 1) {
          console.log('Found significantly newer data from another device, syncing...');
          
          // Always prioritize local progress for key game metrics
          if (state.coins > cloudData.coins || state.totalCoinsEarned > cloudData.totalCoinsEarned) {
            console.log('Local progress detected, performing careful merge to preserve progress');
            
            // Merge the data but ALWAYS prefer local numeric progress
            const mergedData = {
              ...cloudData,
              coins: Math.max(state.coins, cloudData.coins),
              totalCoinsEarned: Math.max(state.totalCoinsEarned, cloudData.totalCoinsEarned),
              cpc: Math.max(state.cpc, cloudData.cpc),
              cps: Math.max(state.cps, cloudData.cps),
              totalClicks: Math.max(state.totalClicks, cloudData.totalClicks),
              version: cloudVersion + 1 // Increment version to avoid immediate re-sync
            };
            
            // Apply the merged data locally
            dispatch({ type: 'LOAD_GAME', payload: mergedData });
            
            // Update local storage
            await AsyncStorage.setItem('gameState', JSON.stringify(mergedData));
            
            console.log('Successfully merged data while preserving local progress');
          } else {
            // Traditional merge approach for when cloud has more progress
            const mergedData = mergeGameData(state, cloudData);
            
            // Apply the merged data locally
            dispatch({ type: 'LOAD_GAME', payload: mergedData });
            
            // Update local storage
            await AsyncStorage.setItem('gameState', JSON.stringify(mergedData));
            
            console.log('Successfully synced data from another device');
          }
        }
        // Only push changes if our version is SIGNIFICANTLY higher
        else if (localVersion > cloudVersion + 1) {
          console.log('Local data is significantly newer, pushing to cloud...');
          
          // Create merged data that preserves our changes
          const mergedData = mergeGameData(cloudData, state);
          const mergedDataStr = JSON.stringify(mergedData);
          
          // Update the cloud with our changes
          const { error: updateError } = await supabase
            .from('game_states')
            .update({ 
              game_data: mergedDataStr,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', authState.user.id);
          
          if (updateError) {
            console.error('Error updating cloud during periodic sync:', updateError);
          } else {
            console.log('Successfully pushed local changes to cloud');
          }
        } 
        // Special case: Only sync if there's a major difference in progress
        else if (
          Math.abs(state.coins - cloudData.coins) > 1000 || 
          Math.abs(state.totalCoinsEarned - cloudData.totalCoinsEarned) > 5000
        ) {
          console.log('Detected significant progress difference, syncing...');
          
          // Always take the higher values for game progress
          const mergedData = {
            ...state,
            coins: Math.max(state.coins, cloudData.coins),
            totalCoinsEarned: Math.max(state.totalCoinsEarned, cloudData.totalCoinsEarned),
            version: Math.max(localVersion, cloudVersion) + 1
          };
          
          // Update both local and cloud with the best progress
          dispatch({ type: 'LOAD_GAME', payload: mergedData });
          await AsyncStorage.setItem('gameState', JSON.stringify(mergedData));
          
          // Push to cloud if we had the better progress
          if (state.coins > cloudData.coins || state.totalCoinsEarned > cloudData.totalCoinsEarned) {
            const mergedDataStr = JSON.stringify(mergedData);
            
            const { error: updateError } = await supabase
              .from('game_states')
              .update({ 
                game_data: mergedDataStr,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', authState.user.id);
            
            if (updateError) {
              console.error('Error updating cloud with progress sync:', updateError);
            } else {
              console.log('Successfully synced significant progress difference');
            }
          }
        } else {
          console.log('Data versions are close or identical, skipping sync to prevent overwrites');
        }
      } catch (error) {
        console.error('Error during periodic sync:', error);
      }
    }, 15 * 60 * 1000); // Run every 15 minutes instead of 5
    
    return () => clearInterval(syncInterval);
  }, [authState.isAuthenticated, authState.user?.id, isInitializing, dataLoaded, state, dispatch, isLoading, isSaving]);
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};