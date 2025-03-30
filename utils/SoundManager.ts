import { Audio } from 'expo-av';

// Define all available sound types
export type SoundType = 'click' | 'achievement' | 'purchase' | 'rebirth' | 'ability' | 'upgrade';

// Track loading status to prevent multiple load attempts
let soundsInitialized = false;
let soundsLoading = false;
let loadAttemptCount = 0;
const MAX_LOAD_ATTEMPTS = 3;

// Track loaded sounds by type with pools for frequently used sounds
type SoundPool = {
  sounds: Audio.Sound[];
  currentIndex: number;
};

interface SoundCache {
  [key: string]: Audio.Sound | SoundPool;
}

const soundCache: SoundCache = {};

// Pool size for frequently used sounds like clicks
const POOL_SIZE = 3;

// Debug mode for logging
let DEBUG_MODE = false;

export const SoundManager = {
  // Initialize and load all sounds
  async loadSounds(forceReload = false): Promise<boolean> {
    // If already initialized and not forcing reload, skip
    if (soundsInitialized && !forceReload) {
      return true;
    }
    
    // If currently loading, don't start again
    if (soundsLoading) {
      return false;
    }
    
    // Track loading attempt
    loadAttemptCount++;
    if (loadAttemptCount > MAX_LOAD_ATTEMPTS) {
      this.logDebug('Max load attempts reached, will not try again');
      return false;
    }
    
    soundsLoading = true;
    
    try {
      // If forcing reload, unload first
      if (forceReload) {
        await this.unloadAll();
        soundsInitialized = false;
      }
      
      // Set audio mode once for better performance
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      // Load all sounds in parallel
      await Promise.all([
        // Regular sounds
        this.loadSound('achievement'),
        this.loadSound('purchase'),
        this.loadSound('rebirth'),
        this.loadSound('ability'),
        this.loadSound('upgrade'),
        // Create a pool for click sounds
        this.createSoundPool('click', POOL_SIZE)
      ]);
      
      soundsInitialized = true;
      this.logDebug('All sounds loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading sounds:', error);
      return false;
    } finally {
      soundsLoading = false;
    }
  },

  // Enable or disable debug mode
  setDebugMode(enabled: boolean): void {
    DEBUG_MODE = enabled;
    this.logDebug(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  },
  
  // Log debug messages if debug mode is enabled
  logDebug(message: string, ...args: any[]): void {
    if (DEBUG_MODE) {
      console.log(`[SoundManager] ${message}`, ...args);
    }
  },

  // Create a pool of sounds for frequently used sound types
  async createSoundPool(type: SoundType, size: number): Promise<void> {
    try {
      const soundSource = this.getSoundSource(type);
      const pool: SoundPool = {
        sounds: [],
        currentIndex: 0
      };
      
      // Create multiple sound instances
      for (let i = 0; i < size; i++) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            soundSource,
            { shouldPlay: false, volume: 0.8 }
          );
          
          // Store the sound in the pool
          pool.sounds.push(sound);
        } catch (error) {
          console.error(`Error creating sound ${i} in pool for ${type}:`, error);
          // Add a placeholder to maintain indices
          pool.sounds.push(null);
        }
      }
      
      // Only save the pool if at least one sound loaded successfully
      if (pool.sounds.some(sound => sound !== null)) {
        // Store the pool in our cache
        soundCache[type] = pool;
        this.logDebug(`Created sound pool for ${type} with ${pool.sounds.filter(s => s !== null).length}/${size} instances`);
      } else {
        this.logDebug(`Failed to create any sounds in pool for ${type}`);
      }
    } catch (error) {
      console.error(`Error creating sound pool for ${type}:`, error);
    }
  },

  // Load a specific sound
  async loadSound(type: SoundType): Promise<void> {
    // Skip if this type has a pool
    if (soundCache[type] && 'sounds' in soundCache[type]) {
      return;
    }
    
    try {
      // Unload existing sound if it exists
      if (soundCache[type]) {
        await this.unloadSound(type);
      }
      
      const { sound } = await Audio.Sound.createAsync(
        this.getSoundSource(type),
        { shouldPlay: false, volume: 0.8 }
      );
      
      // Store the sound in our cache
      soundCache[type] = sound;
      
      this.logDebug(`Successfully loaded ${type} sound`);
    } catch (error) {
      console.error(`Error loading ${type} sound:`, error);
    }
  },
  
  // Unload a specific sound
  async unloadSound(type: SoundType): Promise<void> {
    try {
      const entry = soundCache[type];
      
      if (!entry) return;
      
      if ('sounds' in entry) {
        // Unload all sounds in the pool
        for (const sound of entry.sounds) {
          if (sound) {
            try {
              await sound.unloadAsync();
            } catch (e) {
              // Ignore errors when unloading
            }
          }
        }
      } else {
        // Unload individual sound
        try {
          await entry.unloadAsync();
        } catch (e) {
          // Ignore errors when unloading
        }
      }
      
      // Remove from cache
      delete soundCache[type];
      this.logDebug(`Unloaded ${type} sound`);
    } catch (error) {
      console.error(`Error unloading ${type} sound:`, error);
    }
  },

  // Reset by unloading everything and resetting state
  async reset(): Promise<void> {
    await this.unloadAll();
    soundsInitialized = false;
    soundsLoading = false;
    loadAttemptCount = 0;
    this.logDebug('Sound system reset');
  },

  // Get status of sound initialization
  isInitialized(): boolean {
    return soundsInitialized;
  },

  // Play a sound effect if sound is enabled
  async playSound(type: SoundType, soundEnabled: boolean): Promise<void> {
    if (!soundEnabled) return;
    
    // If sounds aren't loaded yet, try to load them
    if (!soundsInitialized && !soundsLoading) {
      try {
        await this.loadSounds();
      } catch (error) {
        console.error(`Couldn't load sounds when trying to play ${type}:`, error);
        return;
      }
    }
    
    try {
      // Handle pooled sounds (like clicks)
      if (soundCache[type] && 'sounds' in soundCache[type]) {
        const pool = soundCache[type] as SoundPool;
        
        // Find a valid sound in the pool
        let soundIndex = pool.currentIndex;
        let sound = pool.sounds[soundIndex];
        let attempts = 0;
        
        // Try to find a working sound in the pool
        while (!sound && attempts < pool.sounds.length) {
          soundIndex = (soundIndex + 1) % pool.sounds.length;
          sound = pool.sounds[soundIndex];
          attempts++;
        }
        
        if (!sound) {
          this.logDebug(`No valid sounds in pool for ${type}, attempting to reload`);
          await this.createSoundPool(type, POOL_SIZE);
          return;
        }
        
        // Check sound status and reset if necessary
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              // If already playing, move to next sound
              pool.currentIndex = (soundIndex + 1) % pool.sounds.length;
              this.playSound(type, soundEnabled);
              return;
            }
            
            // Reset position and play
            await sound.setPositionAsync(0);
            await sound.playAsync();
            
            // Move to next sound in pool for next play
            pool.currentIndex = (soundIndex + 1) % pool.sounds.length;
          } else {
            // If not loaded, try to reload it
            await this.reloadPoolSound(type, soundIndex);
            // Skip to next sound
            pool.currentIndex = (soundIndex + 1) % pool.sounds.length;
            this.playSound(type, soundEnabled);
          }
        } catch (error) {
          this.logDebug(`Error playing pooled sound ${type}:`, error);
          // Try to reload this sound for next time
          await this.reloadPoolSound(type, soundIndex);
          // Skip to next sound
          pool.currentIndex = (soundIndex + 1) % pool.sounds.length;
        }
        return;
      }
      
      // Handle regular sounds
      const sound = soundCache[type] as Audio.Sound;
      if (!sound) {
        // Try to load the sound if it's not in the cache
        await this.loadSound(type);
        // Try playing again after loading
        await this.playSound(type, soundEnabled);
        return;
      }
      
      // Check if sound is loaded
      try {
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) {
          await this.loadSound(type);
          await this.playSound(type, soundEnabled);
          return;
        }
        
        // If already playing, stop first or just let it continue
        if (status.isPlaying) {
          // For short sounds like clicks, just return
          if (type === 'click') {
            return;
          }
          
          // For longer sounds, stop current playback
          await sound.stopAsync();
        }
        
        // Reset the sound to the beginning and play it
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch (error) {
        this.logDebug(`Error playing ${type} sound:`, error);
        // Try to reload the sound for next time
        await this.loadSound(type);
      }
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
    }
  },
  
  // Reload a specific sound in a pool
  async reloadPoolSound(type: SoundType, index: number): Promise<void> {
    try {
      const pool = soundCache[type] as SoundPool;
      
      if (pool && pool.sounds[index]) {
        // Unload the sound
        try {
          await pool.sounds[index].unloadAsync();
        } catch (e) {
          // Ignore unload errors
        }
        
        // Create a new sound
        try {
          const { sound } = await Audio.Sound.createAsync(
            this.getSoundSource(type),
            { shouldPlay: false, volume: 0.8 }
          );
          
          // Replace in the pool
          pool.sounds[index] = sound;
          this.logDebug(`Reloaded sound ${index} in ${type} pool`);
        } catch (error) {
          console.error(`Failed to reload sound ${index} in ${type} pool:`, error);
          pool.sounds[index] = null;
        }
      }
    } catch (error) {
      console.error(`Error handling sound reload in pool (${type}, ${index}):`, error);
    }
  },
  
  // Unload all sounds to free memory
  async unloadAll(): Promise<void> {
    try {
      // Unload all sounds
      const types = Object.keys(soundCache) as SoundType[];
      
      for (const type of types) {
        await this.unloadSound(type);
      }
      
      // Clear cache entirely
      Object.keys(soundCache).forEach(key => delete soundCache[key]);
      
      this.logDebug('All sounds unloaded');
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  },
  
  // Map sound types to asset files
  getSoundSource(type: SoundType): any {
    switch (type) {
      case 'click':
        return require('../assets/sounds/click.mp3');
      case 'achievement':
        return require('../assets/sounds/achievement.mp3');
      case 'purchase':
        return require('../assets/sounds/purchase.mp3');
      case 'rebirth':
        return require('../assets/sounds/rebirth.mp3');
      case 'ability':
        return require('../assets/sounds/ability.mp3');
      case 'upgrade':
        return require('../assets/sounds/upgrade.mp3');
      default:
        throw new Error(`Unknown sound type: ${type}`);
    }
  },
  
  // Preload sounds before they're needed
  preloadSounds: async function(enabled: boolean): Promise<boolean> {
    if (!enabled) {
      this.logDebug('Sounds disabled, skipping preload');
      return false;
    }
    
    try {
      this.logDebug('Preloading sounds...');
      const success = await this.loadSounds();
      if (success) {
        this.logDebug('Sound preload complete');
      } else {
        this.logDebug('Sound preload failed');
      }
      return success;
    } catch (error) {
      console.error('Error during sound preload:', error);
      return false;
    }
  }
}; 