import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Dimensions } from 'react-native';
import { supabase } from '../lib/supabase/client';
import { useAuth } from './AuthContext';
import { SoundManager } from '../utils/SoundManager';
import debounce from 'lodash.debounce';

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
  level?: number;    // Current level of the upgrade
  maxLevel?: number; // Maximum level
  upgradeCost?: number; // Cost to upgrade to next level
  effectMultiplier?: number; // Multiplier that increases with each level
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

export type CoinAnimation = {
  id: string;
  amount: number;
  x: number;
  y: number;
  timestamp: number;
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
  selectedPickaxe: string; // ID of the currently equipped pickaxe
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
  _needsCloudSave?: boolean; // Optional flag to trigger a cloud save
  dataLoaded?: boolean; // Add this property
  version?: number; // Add version number for conflict resolution
  coinAnimations?: CoinAnimation[]; // Add coin animations
  rebirthPoints?: number; // Added rebirth points
  tutorialEnabled?: boolean; // Added tutorial flag
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
    description: 'Doubles your click power, upgradeable',
    cost: 1,
    effect: 'doubles_cpc',
    owned: false,
    level: 1,
    maxLevel: 5,
    upgradeCost: 3,
    effectMultiplier: 2 // Starts at 2x, increases with levels
  },
  {
    id: 'auto-miner-boost',
    name: 'Auto Miner Boost',
    description: 'Increases auto miner efficiency, upgradeable',
    cost: 2,
    effect: 'boosts_auto_miners',
    owned: false,
    level: 1,
    maxLevel: 5,
    upgradeCost: 4,
    effectMultiplier: 0.5 // Starts at 50%, increases with levels
  },
  {
    id: 'click-combo',
    name: 'Click Combo',
    description: 'Every 10 clicks gives bonus coins, upgradeable',
    cost: 3,
    effect: 'click_combo',
    owned: false,
    level: 1,
    maxLevel: 5,
    upgradeCost: 5,
    effectMultiplier: 10 // Starts at 10x CPC, increases with levels
  },
  {
    id: 'offline-progress',
    name: 'Offline Progress',
    description: 'Earn coins while away, upgradeable',
    cost: 5,
    effect: 'offline_progress',
    owned: false,
    level: 1,
    maxLevel: 3,
    upgradeCost: 10,
    effectMultiplier: 0.5 // Starts at 50% efficiency, increases with levels
  },
  {
    id: 'golden-gloves',
    name: 'Golden Gloves',
    description: 'Increases click power, upgradeable',
    cost: 3,
    effect: 'increases_cpc_by_25_percent',
    owned: false,
    level: 1,
    maxLevel: 5,
    upgradeCost: 5,
    effectMultiplier: 0.25 // Starts at 25%, increases with levels
  },
  {
    id: 'miners-helmet',
    name: 'Miner\'s Helmet',
    description: 'Auto miners work faster, upgradeable',
    cost: 4,
    effect: 'increases_cps_by_25_percent',
    owned: false,
    level: 1,
    maxLevel: 5,
    upgradeCost: 6,
    effectMultiplier: 0.25 // Starts at 25%, increases with levels
  },
  {
    id: 'cosmic-drill',
    name: 'Cosmic Drill',
    description: 'Multiplies pickaxe effects, upgradeable',
    cost: 10,
    effect: 'triples_pickaxe_effects',
    owned: false,
    level: 1,
    maxLevel: 4,
    upgradeCost: 15,
    effectMultiplier: 3 // Starts at 3x, increases with levels
  },
  {
    id: 'lucky-charm',
    name: 'Lucky Charm',
    description: 'Chance for double coins per click, upgradeable',
    cost: 5,
    effect: 'chance_for_double_coins',
    owned: false,
    level: 1,
    maxLevel: 5,
    upgradeCost: 8,
    effectMultiplier: 0.1 // Starts at 10% chance, increases with levels
  },
  {
    id: 'time-warp',
    name: 'Time Warp Device',
    description: 'Abilities recharge faster, upgradeable',
    cost: 7,
    effect: 'faster_ability_cooldown',
    owned: false,
    level: 1,
    maxLevel: 4,
    upgradeCost: 10,
    effectMultiplier: 0.5 // Starts at 50% faster, increases with levels
  },
  {
    id: 'quantum-compressor',
    name: 'Quantum Compressor',
    description: 'Reduces rebirth requirements, upgradeable',
    cost: 15,
    effect: 'easier_rebirth',
    owned: false,
    level: 1,
    maxLevel: 3,
    upgradeCost: 20,
    effectMultiplier: 0.2 // Starts at 20% reduction, increases with levels
  },
  // New special upgrades
  {
    id: 'cosmic-magnetism',
    name: 'Cosmic Magnetism',
    description: 'Automatically collects coins near clicks',
    cost: 8,
    effect: 'auto_collect_coins',
    owned: false,
    level: 1,
    maxLevel: 3,
    upgradeCost: 12,
    effectMultiplier: 0.3 // Starts at 30% radius, increases with levels
  },
  {
    id: 'critical-strikes',
    name: 'Critical Strikes',
    description: 'Chance for critical clicks that do massive damage',
    cost: 12,
    effect: 'critical_strike_chance',
    owned: false,
    level: 1,
    maxLevel: 5,
    upgradeCost: 18,
    effectMultiplier: 0.05 // Starts at 5% chance, increases with levels
  }
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
  {
    id: 'pickaxe-master',
    name: 'Pickaxe Master',
    description: 'Buy all pickaxes',
    unlocked: false,
    reward: 2000,
  }
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
  },
  // New advanced miners
  {
    id: 'quantum-miner',
    name: 'Quantum Miner',
    description: 'Mines 500,000 coins per second using quantum tunneling',
    cost: 5000000000,
    cps: 500000,
    owned: false,
    quantity: 0,
    icon: 'quantum-miner.png'
  },
  {
    id: 'antimatter-miner',
    name: 'Antimatter Miner',
    description: 'Mines 2,000,000 coins per second using antimatter reactions',
    cost: 25000000000,
    cps: 2000000,
    owned: false,
    quantity: 0,
    icon: 'antimatter-miner.png'
  },
  {
    id: 'dimensional-miner',
    name: 'Dimensional Miner',
    description: 'Mines 10,000,000 coins per second by accessing parallel dimensions',
    cost: 100000000000,
    cps: 10000000,
    owned: false,
    quantity: 0,
    icon: 'dimensional-miner.png'
  },
  {
    id: 'cosmic-miner',
    name: 'Cosmic Miner',
    description: 'Mines 50,000,000 coins per second using cosmic energy',
    cost: 500000000000,
    cps: 50000000,
    owned: false,
    quantity: 0,
    icon: 'cosmic-miner.png'
  },
  {
    id: 'infinity-miner',
    name: 'Infinity Miner',
    description: 'Mines 250,000,000 coins per second by harnessing the power of infinity',
    cost: 1000000000000,
    cps: 250000000,
    owned: false,
    quantity: 0,
    icon: 'infinity-miner.png'
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
  },
  // New advanced pickaxes
  {
    id: 'antimatter-crusher',
    name: 'Antimatter Crusher',
    description: 'Harnesses antimatter to completely obliterate rocks',
    cost: 5000000000,
    cpcIncrease: 1500000,
    owned: false,
    type: 'pickaxe',
    icon: 'antimatter-crusher.png'
  },
  {
    id: 'graviton-hammer',
    name: 'Graviton Hammer',
    description: 'Creates localized gravity wells to crush rocks',
    cost: 25000000000,
    cpcIncrease: 7500000,
    owned: false,
    type: 'pickaxe',
    icon: 'graviton-hammer.png'
  },
  {
    id: 'dark-energy-drill',
    name: 'Dark Energy Drill',
    description: 'Harnesses the power of dark energy to destroy rocks',
    cost: 100000000000,
    cpcIncrease: 30000000,
    owned: false,
    type: 'pickaxe',
    icon: 'dark-energy-drill.png'
  },
  {
    id: 'cosmic-excavator',
    name: 'Cosmic Excavator',
    description: 'Channels cosmic energy from across the universe',
    cost: 500000000000,
    cpcIncrease: 150000000,
    owned: false,
    type: 'pickaxe',
    icon: 'cosmic-excavator.png'
  },
  {
    id: 'infinity-pickaxe',
    name: 'Infinity Pickaxe',
    description: 'The ultimate pickaxe, forged in the heart of a neutron star',
    cost: 1000000000000,
    cpcIncrease: 1000000000,
    owned: false,
    type: 'pickaxe',
    icon: 'infinity-pickaxe.png'
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
  selectedPickaxe: 'wooden-pickaxe',
  upgrades: [...initialUpgrades, ...additionalUpgrades],
  autoMiners: [...initialAutoMiners, ...additionalAutoMiners],
  specialUpgrades: initialSpecialUpgrades,
  achievements: initialAchievements,
  abilities: initialAbilities,
  showPickaxes: true,
  lastSaved: Date.now(),
  offlineProgressEnabled: true,
  notificationsEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
  _needsSave: false,
  dataLoaded: false,
  rebirthPoints: 0,
  tutorialEnabled: false,
};

// Actions
type GameAction =
  | { type: 'CLICK_ROCK' }
  | { type: 'CLICK_ROCK_WITH_ANIMATION'; payload: { x: number, y: number, isAutoTap?: boolean } }
  | { type: 'REMOVE_COIN_ANIMATION'; payload: string }
  | { type: 'BUY_UPGRADE'; payload: string }
  | { type: 'BUY_AUTO_MINER'; payload: string }
  | { type: 'BUY_SPECIAL_UPGRADE'; payload: string }
  | { type: 'UPGRADE_SPECIAL_UPGRADE'; payload: string }
  | { type: 'BUY_ABILITY'; payload: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'MARK_ACHIEVEMENT_SHOWN'; payload: string }
  | { type: 'TOGGLE_SHOP_VIEW' }
  | { type: 'TOGGLE_OFFLINE_PROGRESS'; payload: boolean }
  | { type: 'TOGGLE_NOTIFICATIONS'; payload: boolean }
  | { type: 'TOGGLE_SOUND'; payload: boolean }
  | { type: 'TOGGLE_HAPTICS'; payload: boolean }
  | { type: 'TOGGLE_TUTORIAL'; payload: boolean }
  | { type: 'ABILITY_TICK'; payload: number }
  | { type: 'LOAD_SAVED_GAME'; payload: GameState }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'MERGE_GAME_DATA'; payload: GameState }
  | { type: 'UNLOCK_ROCK'; payload: string }
  | { type: 'SELECT_ROCK'; payload: string }
  | { type: 'SELECT_PICKAXE'; payload: string } // Add SELECT_PICKAXE action
  | { type: 'ACTIVATE_ABILITY'; payload: string }
  | { type: 'DEACTIVATE_ABILITY'; payload: string }
  | { type: 'UPGRADE_ABILITY'; payload: string }
  | { type: 'REBIRTH' }
  | { type: 'AUTO_MINE'; payload: { coins: number, multiplier: number } }
  | { type: 'AUTO_MINE_BACKGROUND'; payload: { coins: number, multiplier: number } };

// Create game context
const GameContext = createContext<GameContextType | null>(null);

// Simple version of GameContextType
type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  isInitializing: boolean;
  databaseError: string | null;
  saveGame: (forceCloudSave?: boolean) => Promise<void>;
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

// Auto mining cache type
type AutoMiningCache = {
  multiplier: number;
  batchedCoins: number;
  lastUpdate: number;
  intervalId: NodeJS.Timeout | null;
  updateCount: number;
  uiUpdateIntervalId: NodeJS.Timeout | null; // For UI updates
};

// Provider props
interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isInitializing, setIsInitializing] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const { authState } = useAuth();
  
  // Auto-mining cache to batch updates
  const autoMiningCache = useRef<AutoMiningCache>({
    multiplier: 1,
    batchedCoins: 0,
    lastUpdate: Date.now(),
    intervalId: null,
    updateCount: 0,
    uiUpdateIntervalId: null
  });

  // Auto-tap ability timer
  const autoTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store the state in a ref to access the latest state in intervals without dependencies
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Setup UI update interval for smoother coin display
  useEffect(() => {
    if (dataLoaded && !autoMiningCache.current.uiUpdateIntervalId) {
      // Create an interval that updates the UI more frequently than state changes
      const id = setInterval(() => {
        const currentState = stateRef.current;
        
        // If we have batched coins to display, update the UI
        if (autoMiningCache.current.batchedCoins > 0) {
          // Only dispatch if the amount is significant enough to notice
          if (autoMiningCache.current.batchedCoins > currentState.cps / 10) {
            dispatch({
              type: 'AUTO_MINE',
              payload: {
                coins: autoMiningCache.current.batchedCoins,
                multiplier: 1
              }
            });
            
            // Reset batched coins
            autoMiningCache.current.batchedCoins = 0;
          }
        }
      }, 50); // Update UI at 20fps for smoothness
      
      autoMiningCache.current.uiUpdateIntervalId = id;
      
      return () => {
        clearInterval(id);
        autoMiningCache.current.uiUpdateIntervalId = null;
      };
    }
  }, [dataLoaded]);

  // Improved auto mining setup with better performance
  useEffect(() => {
    if (dataLoaded && state.cps > 0 && !autoMiningCache.current.intervalId) {
      console.log('Starting auto mining with CPS:', state.cps);
      
      const interval = setInterval(() => {
        const now = Date.now();
        const deltaTime = (now - autoMiningCache.current.lastUpdate) / 1000; // in seconds
        const currentState = stateRef.current;
        
        // Calculate coins earned in this interval
        const coinsEarned = currentState.cps * deltaTime * autoMiningCache.current.multiplier;
        
        // Add to batched coins for UI updates
        autoMiningCache.current.batchedCoins += coinsEarned;
        autoMiningCache.current.lastUpdate = now;
        
        // Increment update count
        autoMiningCache.current.updateCount += 1;
        
        // Every 10 updates, trigger a state update for saving
        if (autoMiningCache.current.updateCount >= 10) {
          autoMiningCache.current.updateCount = 0;
          
          // Dispatch state update for saving purposes, but don't reset batched coins
          // The UI update interval will handle displaying the coins
          if (autoMiningCache.current.batchedCoins > 0) {
            dispatch({
              type: 'AUTO_MINE_BACKGROUND',
              payload: {
                coins: autoMiningCache.current.batchedCoins,
                multiplier: 1
              }
            });
          }
        }
      }, 500); // Run calculations every 500ms for efficiency
      
      autoMiningCache.current.intervalId = interval;
      
      return () => {
        clearInterval(interval);
        autoMiningCache.current.intervalId = null;
      };
    } else if (state.cps === 0 && autoMiningCache.current.intervalId) {
      // Clear interval if CPS drops to 0
      clearInterval(autoMiningCache.current.intervalId);
      autoMiningCache.current.intervalId = null;
    }
  }, [dataLoaded, state.cps]);
  
  // When app is closing or component unmounts, save any batched coins
  useEffect(() => {
    return () => {
      // Clean up timers when component unmounts
      if (autoMiningCache.current.intervalId) {
        clearInterval(autoMiningCache.current.intervalId);
      }
      
      if (autoMiningCache.current.uiUpdateIntervalId) {
        clearInterval(autoMiningCache.current.uiUpdateIntervalId);
      }
      
      // Save any batched coins
      if (autoMiningCache.current.batchedCoins > 0) {
        const finalState = {
          ...stateRef.current,
          coins: stateRef.current.coins + autoMiningCache.current.batchedCoins,
          totalCoinsEarned: stateRef.current.totalCoinsEarned + autoMiningCache.current.batchedCoins
        };
        
        // Save the final state
        AsyncStorage.setItem('gameState', JSON.stringify(finalState))
          .catch(err => console.error('Error saving final state:', err));
      }
    };
  }, []);

  // Initialize sound manager with better error handling
  useEffect(() => {
    // Create an unmounted flag to prevent state updates after unmount
    let isUnmounted = false;
    
    // Initialize sound system with better handling
    const initializeSounds = async () => {
      try {
        // Only load sounds if enabled in settings
        if (state.soundEnabled) {
          console.log('Initializing sound system...');
          
          // Try loading sounds with improved retry logic
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              await SoundManager.loadSounds();
              if (!isUnmounted) {
                console.log('Sound system initialized successfully');
              }
              break; // Exit retry loop on success
            } catch (error) {
              console.warn(`Sound initialization attempt ${attempt}/3 failed:`, error);
              if (attempt < 3) {
                // Wait before retrying with exponential backoff
                await new Promise(r => setTimeout(r, attempt * 1000));
              } else {
                console.error('All sound initialization attempts failed');
              }
            }
          }
        } else {
          // If sounds are disabled, unload any existing sounds to free memory
          await SoundManager.unloadAll();
        }
      } catch (error) {
        if (!isUnmounted) {
          console.error('Error handling sound system:', error);
        }
      }
    };
    
    // Initialize sound system
    initializeSounds();
    
    // Cleanup function
    return () => {
      isUnmounted = true;
      
      // Unload sounds on unmount to prevent memory leaks
      SoundManager.unloadAll().catch(e => 
        console.warn('Error unloading sounds during cleanup:', e)
      );
    };
  }, [state.soundEnabled]);

  // Initialize or load saved game
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load game data
        const result = await loadGame();
        
        if (result.success) {
          setDataLoaded(true);
          console.log('Game data loaded successfully:', result.source);
        } else {
          console.error('Failed to load game data:', result.error);
          // Still mark as loaded so the game can start
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error during game initialization:', error);
        // Fall back to initial state
        dispatch({ type: 'LOAD_GAME', payload: { ...initialState, dataLoaded: true } });
        setDataLoaded(true);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initialize();
    
    return () => {
      // Clean up timers when component unmounts
      if (autoMiningCache.current.intervalId) {
        clearInterval(autoMiningCache.current.intervalId);
      }
    };
  }, []);
  
  // Create a debounced version of saveGame to prevent excessive saves
  const debouncedSaveGame = useCallback(
    debounce(() => {
      if (dataLoaded && state._needsSave) {
        saveGame();
      }
    }, 10000), // Increase to 10 seconds to reduce frequency
    [dataLoaded, state._needsSave]
  );
  
  // Create a highly debounced version for constant UI updates
  const lightlySaveGame = useCallback(
    debounce(() => {
      if (dataLoaded) {
        // Only save locally, skip cloud
        const gameData = {
          ...state,
          lastSaved: Date.now(),
          dataLoaded: true,
          version: (state.version || 0) + 1
        };
        
        AsyncStorage.setItem('gameState', JSON.stringify(gameData))
          .catch(err => console.error('Error in light local save:', err));
      }
    }, 3000),
    [dataLoaded, state]
  );
  
  // Track important state changes
  useEffect(() => {
    if (state._needsSave && dataLoaded) {
      debouncedSaveGame();
    } else {
      // For less important regular UI updates, just save locally
      lightlySaveGame();
    }
  }, [state, dataLoaded, debouncedSaveGame, lightlySaveGame]);

  // Monitor app state for background/foreground transitions
  useEffect(() => {
    // Only set up app state monitoring after data is loaded
    if (!dataLoaded) return;
    
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground - calculate offline progress
        calculateOfflineProgress();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background - save state fully including to cloud
        console.log('App going to background - saving full state');
        // Cancel any pending debounced saves
        debouncedSaveGame.cancel();
        lightlySaveGame.cancel();
        // Force immediate save
        await saveGame();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [dataLoaded, state, debouncedSaveGame, lightlySaveGame]);
  
  // Calculate offline progress when app reopens
  const calculateOfflineProgress = () => {
    if (!state.offlineProgressEnabled) {
      return;
    }
    
    const now = Date.now();
    const offlineTime = now - state.lastSaved;
    
    // Only calculate if more than 1 minute has passed
    if (offlineTime > 60 * 1000 && state.cps > 0) {
      const secondsOffline = Math.floor(offlineTime / 1000);
      const offlineCoins = state.cps * secondsOffline;
      
      // Dispatch action to add coins earned while offline
      dispatch({
        type: 'AUTO_MINE',
        payload: {
          coins: offlineCoins,
          multiplier: 1
        }
      });
      
      // Display a notification here if needed
      console.log(`Added ${offlineCoins} coins from offline progress`);
    }
  };
  
  // Save game to AsyncStorage and optionally to Supabase
  const saveGame = async (forceCloudSave = false) => {
    // Only save if data has been loaded
    if (!dataLoaded) {
      console.log('Skipping save - game data not fully loaded yet');
      return;
    }

    try {
      console.log('Saving game data...');
      
      // Prepare data with timestamp and dataLoaded flag
      const gameData = {
        ...state,
        lastSaved: Date.now(),
        dataLoaded: true,
        version: (state.version || 0) + 1 // Increment version with each save
      };
      
      // First save locally
      await AsyncStorage.setItem('gameState', JSON.stringify(gameData));
      // console.log(`Game saved locally with ${gameData.coins} coins`);
      
      // Only save to cloud if forced or for important events
      const shouldSaveToCloud = forceCloudSave || 
                             (state._needsCloudSave === true) || 
                              state.rebirths > 0 || 
                              state.goldCoins > 0;
      
      // Then save to Supabase if logged in AND we should save to cloud
      if (authState.isAuthenticated && authState.user?.id && shouldSaveToCloud) {
        try {
          // console.log('Syncing to cloud storage...');
          
          // Check if a record already exists for this user
          const { data, error } = await supabase
            .from('game_states')
            .select('id')
            .eq('user_id', authState.user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') {  // PGRST116 is "not found" error
            console.error('Error checking existing game state:', error);
            setDatabaseError('Error checking cloud save status.');
            return;
          }
          
          if (data?.id) {
            // Update existing record
            // console.log('Updating existing cloud save');
            const { error: updateError } = await supabase
              .from('game_states')
              .update({ 
                game_data: gameData,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', authState.user.id);
              
            if (updateError) {
              console.error('Error updating game state in database:', updateError);
              setDatabaseError('Failed to save game to the cloud. Your progress is still saved locally.');
            } else {
              // console.log('Game saved to cloud successfully');
              // Clear any previous error message
              if (databaseError) setDatabaseError(null);
            }
          } else {
            // Create new record
            console.log('Creating new cloud save');
            const { error: insertError } = await supabase
              .from('game_states')
              .insert([{
                user_id: authState.user.id,
                game_data: gameData
              }]);
              
            if (insertError) {
              console.error('Error inserting game state to database:', insertError);
              setDatabaseError('Failed to create cloud save. Your progress is still saved locally.');
            } else {
              console.log('New cloud save created successfully');
              // Clear any previous error message
              if (databaseError) setDatabaseError(null);
            }
          }
        } catch (dbError) {
          console.error('Database error during save:', dbError);
          setDatabaseError('Error connecting to the game server. Your progress is still saved locally.');
        }
      } else if (authState.isAuthenticated) {
        console.log('Skipping cloud save - not necessary for this update');
      }
    } catch (error) {
      console.error('Error saving game:', error);
      setDatabaseError('Failed to save game. Please check your connection and try again.');
    }
  };
  
  // Load game data from AsyncStorage and optionally from Supabase
  const loadGame = async (forceReload = false) => {
    try {
      console.log('Loading game data...');
      let gameData = null;
      let source = 'local';
      
      // First check for local saved data
      try {
        const savedData = await AsyncStorage.getItem('gameState');
        
        if (savedData) {
          gameData = JSON.parse(savedData);
          console.log(`Found local saved data with ${gameData.coins} coins`);
          
          // Mark that data is loaded
          gameData.dataLoaded = true;
        }
      } catch (localError) {
        console.error('Error reading from local storage:', localError);
      }
      
      // Then load from cloud if authenticated and either forced or no local data
      if (authState.isAuthenticated && authState.user?.id && (forceReload || !gameData)) {
        try {
          console.log('Attempting to load data from cloud...');
          const { data, error } = await supabase
            .from('game_states')
            .select('*')
            .eq('user_id', authState.user.id)
            .single();
            
          if (error) {
            console.log('Error loading cloud data:', error.message);
            if (error.code !== 'PGRST116') { // PGRST116 is "not found" error which is normal for new users
              setDatabaseError('Unable to load your saved game. Please try again later.');
            }
          } else if (data?.game_data) {
            // We have cloud data
            const cloudData = data.game_data;
            console.log(`Found cloud data with ${cloudData.coins} coins`);

            // Check if cloud data is more recent than local or if we have no local data
            if (forceReload || !gameData || !gameData.lastSaved || cloudData.lastSaved > gameData.lastSaved) {
              console.log('Using cloud data (newer or forced)');
              gameData = cloudData;
              source = 'cloud';
              
              // Update local storage with cloud data
              try {
                await AsyncStorage.setItem('gameState', JSON.stringify(cloudData));
                console.log('Updated local storage with cloud data');
              } catch (saveError) {
                console.error('Error saving cloud data to local storage:', saveError);
              }
            }
          }
        } catch (cloudError) {
          console.error('Error accessing cloud data:', cloudError);
          setDatabaseError('Error connecting to the game server. Please check your connection.');
        }
      }
      
      // If we have data (either local or cloud), use it
      if (gameData) {
        console.log(`Using ${source} data to initialize game`);
        // Ensure dataLoaded flag is set
        gameData.dataLoaded = true;
        
        // Dispatch the loaded game data
        dispatch({ type: 'LOAD_GAME', payload: gameData });
        
        return {
          success: true,
          message: `Game loaded from ${source} storage`,
          source,
        };
      }
      
      // If we get here, we have no saved data at all
      console.log('No saved data found, starting new game');
      dispatch({ type: 'LOAD_GAME', payload: { ...initialState, dataLoaded: true } });
      
      return {
        success: true,
        message: 'New game started',
        source: 'default',
      };
    } catch (error) {
      console.error('Unexpected error loading game:', error);
      
      // Fall back to initial state
      dispatch({ type: 'LOAD_GAME', payload: { ...initialState, dataLoaded: true } });
      
      return {
        success: false,
        message: 'Error loading game data',
        error: error.message,
      };
    }
  };
  
  // Restart the game (e.g., when user wants to delete all progress)
  const handleRestartGame = () => {
    // Reset to initial state
    dispatch({ type: 'LOAD_GAME', payload: { ...initialState, dataLoaded: true } });
  };
  
  // Force sync game data across devices
  const forceSyncData = async () => {
    // Skip if not authenticated
    if (!authState.isAuthenticated || !authState.user?.id) {
      return {
        success: false, 
        message: 'You must be logged in to sync data across devices' 
      };
    }
    
    try {
      console.log('Forcing data synchronization...');
      
      // First save current state to ensure it's up to date
      await saveGame();
      
      // Then fetch cloud data
      const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_id', authState.user.id)
        .single();
        
      if (error) {
        console.error('Error fetching cloud data:', error);
        return { 
          success: false, 
          message: 'Unable to access cloud data. Please try again later.'
        };
      }
      
      if (data?.game_data) {
        // We have cloud data, use it if it's more recent
        const cloudData = data.game_data;
        
        if (cloudData.lastSaved > state.lastSaved) {
          // Cloud data is newer, load it
          dispatch({ type: 'LOAD_GAME', payload: cloudData });
          
          // Also update local storage
          await AsyncStorage.setItem('gameState', JSON.stringify(cloudData));
          
          return { 
            success: true, 
            message: 'Successfully loaded newer data from cloud!'
          };
        } else {
          // Local data is newer or the same, push it to cloud
          return { 
            success: true, 
            message: 'Your data is already up to date!'
          };
        }
      } else {
        // No cloud data exists yet, create it
        return { 
          success: true, 
          message: 'Successfully uploaded your data to the cloud!'
        };
      }
    } catch (error) {
      console.error('Error during force sync:', error);
      return {
        success: false,
        message: 'An error occurred during synchronization. Please try again.'
      };
    }
  };
  
  // Handle auto-tap ability
  useEffect(() => {
    // Safety check - make sure state is initialized
    if (!state.abilities || state.abilities.length === 0) return;
    
    // Get the auto-tap ability
    const autoTapAbility = state.abilities.find(a => a.id === 'auto-tap');
    
    // Safety check - make sure ability exists
    if (!autoTapAbility) return;
    
    // Clean up previous timer if it exists
    if (autoTapTimerRef.current) {
      clearInterval(autoTapTimerRef.current);
      autoTapTimerRef.current = null;
    }
    
    // Check if auto-tap is active
    if (autoTapAbility.active) {
      // Calculate click interval based on taps per second (multiplier)
      const clickIntervalMs = 1000 / autoTapAbility.multiplier;
      
      // Create a new timer that clicks at the specified rate
      autoTapTimerRef.current = setInterval(() => {
        try {
          // Simulate a click at the center of the screen
          const centerX = Dimensions.get('window').width / 2;
          const centerY = Dimensions.get('window').height / 2;
          
          // Dispatch a rock click action
          dispatch({ 
            type: 'CLICK_ROCK_WITH_ANIMATION', 
            payload: { 
              x: centerX + (Math.random() * 20 - 10), // Add slight randomness
              y: centerY + (Math.random() * 20 - 10),
              isAutoTap: true // Flag this as an auto-tap click
            } 
          });
        } catch (error) {
          console.error('Error in auto-tap timer:', error);
        }
      }, clickIntervalMs);
      
      console.log(`Auto-tap activated at ${autoTapAbility.multiplier} taps/sec`);
    }
    
    // Return cleanup function
    return () => {
      if (autoTapTimerRef.current) {
        clearInterval(autoTapTimerRef.current);
        autoTapTimerRef.current = null;
      }
    };
  }, [state.abilities, state.cpc]); // Also depend on cpc to reflect changes in click value
  
  return (
    <GameContext.Provider value={{ 
      state, 
      dispatch, 
      isInitializing,
      databaseError, 
      saveGame,
      loadGame,
      handleRestartGame,
      forceSyncData
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === null) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
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
      
      let coinsToAdd = state.cpc * multiplier + comboBonus;
      const newTotalClicks = state.totalClicks + 1;
      
      // Fast path for normal clicks (most common case)
      // Only check achievements on milestones to improve performance
      if (newTotalClicks !== 1 && 
          newTotalClicks !== 100 && 
          newTotalClicks !== 1000 && 
          newTotalClicks !== 10000 && 
          newTotalClicks !== 100000 &&
          state.totalCoinsEarned + coinsToAdd < 1000 &&
          state.totalCoinsEarned < 10000 &&
          state.totalCoinsEarned < 100000 &&
          state.totalCoinsEarned < 1000000) {
        
        // Fast path - just update coins and click count
        return {
          ...state,
          coins: state.coins + coinsToAdd,
          totalCoinsEarned: state.totalCoinsEarned + coinsToAdd,
          totalClicks: newTotalClicks,
          clickProgress: newClickProgress,
        };
      }
      
      // Slow path - check for achievements
      
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
          totalClicks: newTotalClicks,
          clickProgress: newClickProgress,
          achievements: updatedAchievements,
          _needsSave: true,
          _needsCloudSave: true // This is a meaningful achievement, save to cloud
        };
        
        // Check for other achievements
        return checkAchievements(newState);
      }
      
      // Check for click count achievements
      if (newTotalClicks === 100) {
        const clickNoviceAchievement = achievements.find(a => a.id === 'clicker-novice');
        if (clickNoviceAchievement && !clickNoviceAchievement.unlocked) {
          const updatedAchievements = achievements.map(a => 
            a.id === 'clicker-novice' ? { ...a, unlocked: true } : a
          );
          
          const newState = {
            ...state,
            coins: state.coins + coinsToAdd + (clickNoviceAchievement.reward || 0),
            totalCoinsEarned: state.totalCoinsEarned + coinsToAdd + (clickNoviceAchievement.reward || 0),
            totalClicks: newTotalClicks,
            clickProgress: newClickProgress,
            achievements: updatedAchievements,
            _needsSave: true
          };
          
          return checkAchievements(newState);
        }
      }
      
      if (newTotalClicks === 1000) {
        const clickMachineAchievement = achievements.find(a => a.id === 'click-machine');
        if (clickMachineAchievement && !clickMachineAchievement.unlocked) {
          const updatedAchievements = achievements.map(a => 
            a.id === 'click-machine' ? { ...a, unlocked: true } : a
          );
          
          const newState = {
            ...state,
            coins: state.coins + coinsToAdd + (clickMachineAchievement.reward || 0),
            totalCoinsEarned: state.totalCoinsEarned + coinsToAdd + (clickMachineAchievement.reward || 0),
            totalClicks: newTotalClicks,
            clickProgress: newClickProgress,
            achievements: updatedAchievements,
            _needsSave: true,
            _needsCloudSave: true // Milestone achievement, save to cloud
          };
          
          return checkAchievements(newState);
        }
      }
      
      if (newTotalClicks === 10000) {
        const clickAddictAchievement = achievements.find(a => a.id === 'click-addict');
        if (clickAddictAchievement && !clickAddictAchievement.unlocked) {
          const updatedAchievements = achievements.map(a => 
            a.id === 'click-addict' ? { ...a, unlocked: true } : a
          );
          
          const newState = {
            ...state,
            coins: state.coins + coinsToAdd + (clickAddictAchievement.reward || 0),
            totalCoinsEarned: state.totalCoinsEarned + coinsToAdd + (clickAddictAchievement.reward || 0),
            totalClicks: newTotalClicks,
            clickProgress: newClickProgress,
            achievements: updatedAchievements,
            _needsSave: true,
            _needsCloudSave: true // Milestone achievement, save to cloud
          };
          
          return checkAchievements(newState);
        }
      }
      
      // Default case - no special achievements triggered
      const newState = {
        ...state,
        coins: state.coins + coinsToAdd,
        totalCoinsEarned: state.totalCoinsEarned + coinsToAdd,
        totalClicks: newTotalClicks,
        clickProgress: newClickProgress,
        _needsSave: newTotalClicks % 100 === 0 // Only save every 100 clicks
      };
      
      // Check for coin milestone achievements less frequently
      return newTotalClicks % 10 === 0 ? checkAchievements(newState) : newState;
    }
    
    case 'CLICK_ROCK_WITH_ANIMATION': {
      const { x, y, isAutoTap = false } = action.payload;
      
      // First do the same calculation as normal click
      let multiplier = 1;
      
      if (state.specialUpgrades.find(u => u.id === 'double-click' && u.owned)) {
        multiplier *= 2;
      }
      
      if (state.specialUpgrades.find(u => u.id === 'lucky-charm' && u.owned)) {
        if (Math.random() < 0.1) {
          multiplier *= 2;
        }
      }
      
      let comboBonus = 0;
      let newClickProgress = state.clickProgress;
      
      // Only apply click combo for manual clicks, not auto-tap
      if (!isAutoTap && state.specialUpgrades.find(u => u.id === 'click-combo' && u.owned)) {
        newClickProgress = (state.clickProgress + 1) % 10;
        if (newClickProgress === 0) {
          comboBonus = state.cpc * 10;
        }
      }
      
      let coinsToAdd = state.cpc * multiplier + comboBonus;
      const newTotalClicks = state.totalClicks + 1;
      
      // Create a coin animation at the click position
      const newAnimation: CoinAnimation = {
        id: `coin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: coinsToAdd,
        x: x,
        y: y,
        timestamp: Date.now()
      };
      
      // Add the animation to the list, limited to 10 animations for performance
      const currentAnimations = state.coinAnimations || [];
      const newAnimations = [
        newAnimation,
        ...currentAnimations.slice(0, 9) // Keep only 9 previous animations max
      ];
      
      // Play click sound - but only 25% chance for auto-tap to reduce sound spam
      if (!isAutoTap || Math.random() < 0.25) {
        try {
          // Use the click sound type - now properly typed
          SoundManager.playSound('click', state.soundEnabled);
        } catch (error) {
          // Silently catch errors to prevent game disruption
          console.warn('Error playing click sound:', error);
        }
      }
      
      // Fast path for auto-tap clicks or non-milestone manual clicks
      if (isAutoTap || (
          newTotalClicks !== 1 && 
          newTotalClicks !== 100 && 
          newTotalClicks !== 1000 && 
          newTotalClicks !== 10000 && 
          newTotalClicks !== 100000)) {
        
        return {
          ...state,
          coins: state.coins + coinsToAdd,
          totalCoinsEarned: state.totalCoinsEarned + coinsToAdd,
          totalClicks: newTotalClicks,
          clickProgress: newClickProgress,
          coinAnimations: newAnimations,
          _needsSave: isAutoTap ? false : (newTotalClicks % 100 === 0) // Save less frequently for auto-tap
        };
      }
      
      // If it's a milestone, use the original logic but add animations
      // This is the slow path with achievement checks
      const achievements = [...state.achievements];
      
      // First click achievement
      if (state.totalClicks === 0) {
        const firstClickAchievement = achievements.find(a => a.id === 'first-strike');
        if (firstClickAchievement && !firstClickAchievement.unlocked) {
          const updatedAchievements = achievements.map(a => 
            a.id === 'first-strike' ? { ...a, unlocked: true } : a
          );
          
          const newState = {
            ...state,
            coins: state.coins + coinsToAdd + (firstClickAchievement.reward || 0),
            totalCoinsEarned: state.totalCoinsEarned + coinsToAdd + (firstClickAchievement.reward || 0),
            totalClicks: newTotalClicks,
            clickProgress: newClickProgress,
            achievements: updatedAchievements,
            coinAnimations: newAnimations,
            _needsSave: true,
            _needsCloudSave: true
          };
          
          return checkAchievements(newState);
        }
      }
      
      // Other click milestones
      if (newTotalClicks === 100 || newTotalClicks === 1000 || newTotalClicks === 10000) {
        const achievementId = newTotalClicks === 100 ? 'clicker-novice' :
                              newTotalClicks === 1000 ? 'click-machine' : 'click-addict';
                              
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
          const updatedAchievements = achievements.map(a => 
            a.id === achievementId ? { ...a, unlocked: true } : a
          );
          
          const newState = {
            ...state,
            coins: state.coins + coinsToAdd + (achievement.reward || 0),
            totalCoinsEarned: state.totalCoinsEarned + coinsToAdd + (achievement.reward || 0),
            totalClicks: newTotalClicks,
            clickProgress: newClickProgress,
            achievements: updatedAchievements,
            coinAnimations: newAnimations,
            _needsSave: true,
            _needsCloudSave: newTotalClicks >= 1000 // Only save big milestones to cloud
          };
          
          return checkAchievements(newState);
        }
      }
      
      // Default case
      const newState = {
        ...state,
        coins: state.coins + coinsToAdd,
        totalCoinsEarned: state.totalCoinsEarned + coinsToAdd,
        totalClicks: newTotalClicks,
        clickProgress: newClickProgress,
        coinAnimations: newAnimations,
        _needsSave: newTotalClicks % 100 === 0
      };
      
      return newTotalClicks % 10 === 0 ? checkAchievements(newState) : newState;
    }
    
    case 'REMOVE_COIN_ANIMATION': {
      // Remove a completed animation from the list
      if (!state.coinAnimations || state.coinAnimations.length === 0) {
        return state;
      }
      
      return {
        ...state,
        coinAnimations: state.coinAnimations.filter(anim => anim.id !== action.payload)
      };
    }
    
    case 'BUY_UPGRADE': {
      const upgradeId = action.payload;
      const upgrade = state.upgrades.find(u => u.id === upgradeId);
      
      if (!upgrade || upgrade.owned || state.coins < upgrade.cost) {
        return state;
      }
      
      // Play purchase sound
      try {
        SoundManager.playSound('purchase', state.soundEnabled);
      } catch (error) {
        // Silently catch errors to prevent game disruption
        console.warn('Error playing purchase sound:', error);
      }
      
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
      try {
        SoundManager.playSound('purchase', state.soundEnabled);
      } catch (error) {
        // Silently catch errors to prevent game disruption
        console.warn('Error playing purchase sound:', error);
      }
      
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
      try {
        SoundManager.playSound('purchase', state.soundEnabled);
      } catch (error) {
        // Silently catch errors to prevent game disruption
        console.warn('Error playing purchase sound:', error);
      }
      
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
    
    case 'UPGRADE_SPECIAL_UPGRADE': {
      const upgradeId = action.payload;
      const upgrade = state.specialUpgrades.find(u => u.id === upgradeId);
      
      if (!upgrade || upgrade.owned || state.goldCoins < upgrade.upgradeCost) {
        return state;
      }
      
      // Play upgrade sound
      try {
        SoundManager.playSound('upgrade', state.soundEnabled);
      } catch (error) {
        // Silently catch errors to prevent game disruption
        console.warn('Error playing upgrade sound:', error);
      }
      
      const newSpecialUpgrades = state.specialUpgrades.map(u => 
        u.id === upgradeId ? { ...u, owned: true, level: u.level + 1, upgradeCost: Math.floor(u.upgradeCost * 1.5) } : u
      );
      
      const newState = {
        ...state,
        goldCoins: state.goldCoins - upgrade.upgradeCost,
        specialUpgrades: newSpecialUpgrades,
        _needsSave: true // Save on upgrade purchase
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
          )
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
    
    case 'SELECT_PICKAXE': {
      const pickaxeId = action.payload;
      
      // Check if this pickaxe exists and is owned
      const pickaxe = state.upgrades.find(u => u.id === pickaxeId && u.type === 'pickaxe');
      
      if (!pickaxe || !pickaxe.owned || pickaxeId === state.selectedPickaxe) {
        return state;
      }
      
      // Play sound when changing pickaxe
      try {
        SoundManager.playSound('click', state.soundEnabled);
      } catch (error) {
        // Silently catch errors to prevent game disruption
        console.warn('Error playing click sound:', error);
      }
      
      return {
        ...state,
        selectedPickaxe: pickaxeId,
        _needsSave: true
      };
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
        _needsSave: true
      };
    }
    
    case 'TOGGLE_TUTORIAL': {
      return {
        ...state,
        tutorialEnabled: action.payload,
        _needsSave: true
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
      try {
        SoundManager.playSound('rebirth', state.soundEnabled);
      } catch (error) {
        // Silently catch errors to prevent game disruption
        console.warn('Error playing rebirth sound:', error);
      }
      
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
      try {
        SoundManager.playSound('ability', state.soundEnabled);
      } catch (error) {
        // Silently catch errors to prevent game disruption
        console.warn('Error playing ability sound:', error);
      }
      
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
      
      // Track which abilities are being deactivated this tick
      const deactivatingAbilities = [];
      
      // Update each ability
      const updatedAbilities = state.abilities.map(a => {
        // If ability is active, decrease time remaining
        if (a.active && a.timeRemaining) {
          const newTimeRemaining = Math.max(0, a.timeRemaining - seconds);
          
          // If time just ran out, deactivate and start cooldown
          if (newTimeRemaining === 0 && a.timeRemaining > 0) {
            // Track that this ability is deactivating
            deactivatingAbilities.push(a.id);
            
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
      
      // Check specifically if auto-tap or other abilities are deactivating
      const autoTapDeactivated = deactivatingAbilities.includes('auto-tap');
      const coinScatterDeactivated = deactivatingAbilities.includes('coin-scatter');
      
      // Special handling for deactivated abilities
      if (deactivatingAbilities.length > 0) {
        try {
          // Play sound effect for ability ending
          SoundManager.playSound('ability', state.soundEnabled);
        } catch (error) {
          // Silently catch errors to prevent game disruption
          console.warn('Error playing ability deactivation sound:', error);
        }
        
        if (autoTapDeactivated) {
          console.log('Auto-tap ability deactivated');
          // Note: The interval for auto-tap is handled by the useEffect
          // which will detect the change in abilities and clear the timer
        }
      }
      
      // Always recalculate CPC and CPS to ensure ability effects are properly applied
      const newCPC = calculateTotalCPC({
        ...state,
        abilities: updatedAbilities
      });
      
      const newCPS = calculateTotalCPS({
        ...state,
        abilities: updatedAbilities
      });
      
      // Always update CPC and CPS to ensure they're kept in sync with abilities
      return {
        ...state,
        abilities: updatedAbilities,
        cpc: newCPC,
        cps: newCPS,
        _needsSave: activeAbilitiesChanged || deactivatingAbilities.length > 0, // Save when abilities change
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
    
    case 'AUTO_MINE_BACKGROUND': {
      // Similar to AUTO_MINE but doesn't trigger achievement checks
      // This is a performance optimization for background processing
      const { coins, multiplier } = action.payload;
      const coinsToAdd = coins * multiplier;
      
      // This doesn't update the UI directly (handled by the UI update interval)
      // It just updates the internal state for saving purposes
      return {
        ...state,
        coins: state.coins + coinsToAdd,
        totalCoinsEarned: state.totalCoinsEarned + coinsToAdd,
        _needsSave: state._needsSave || coinsToAdd > 1000 // Mark for save if significant coins added
      };
    }
    
    default:
      return state;
  }
}

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
  // Check for total coins achievements
  const coinMilestones = [
    { id: 'small-fortune', coins: 1000 },
    { id: 'getting-rich', coins: 10000 },
    { id: 'money-bags', coins: 100000 },
    { id: 'millionaire', coins: 1000000 },
  ];

  let achievementsUpdated = false;
  let updatedAchievements = [...state.achievements];

  // Check each coin milestone
  coinMilestones.forEach(milestone => {
    const achievement = updatedAchievements.find(a => a.id === milestone.id);
    if (achievement && !achievement.unlocked && state.totalCoinsEarned >= milestone.coins) {
      updatedAchievements = updatedAchievements.map(a => 
        a.id === milestone.id ? { ...a, unlocked: true } : a
      );
      achievementsUpdated = true;
    }
  });

  if (achievementsUpdated) {
    return {
      ...state,
      achievements: updatedAchievements,
      _needsSave: true
    };
  }

  return state;
};