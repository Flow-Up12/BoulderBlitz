import { Audio } from 'expo-av';

type SoundType = 'achievement' | 'purchase' | 'rebirth' | 'ability' | 'click' | 'upgrade';

// Track loaded sounds
const soundCache: Record<string, Audio.Sound> = {};

export const SoundManager = {
  // Initialize and load all sounds
  async loadSounds(): Promise<void> {
    try {
      await Promise.all([
        this.loadSound('achievement'),
        this.loadSound('purchase'),
        this.loadSound('rebirth'),
        this.loadSound('ability'),
        this.loadSound('click'),
        this.loadSound('upgrade')
      ]);
      console.log('All sounds loaded successfully');
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  },

  // Load a specific sound
  async loadSound(type: SoundType): Promise<void> {
    try {
      // Unload existing sound if it exists
      if (soundCache[type]) {
        await soundCache[type].unloadAsync();
        delete soundCache[type];
      }
      
      const { sound } = await Audio.Sound.createAsync(
        this.getSoundSource(type),
        { shouldPlay: false }
      );
      
      // Store the sound in our cache
      soundCache[type] = sound;
      
      // Set a listener for when playback finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.isPlaying === false && status.positionMillis > 0 && status.durationMillis === status.positionMillis) {
          // This indicates the sound finished playing
          // Instead of unloading, keep it in cache for quicker replay
        }
      });
      
      console.log(`Successfully loaded ${type} sound`);
    } catch (error) {
      console.error(`Error loading ${type} sound:`, error);
    }
  },

  // Play a sound effect if sound is enabled
  async playSound(type: SoundType, soundEnabled: boolean): Promise<void> {
    if (!soundEnabled) return;
    
    try {
      // Load the sound if it's not in the cache
      if (!soundCache[type]) {
        await this.loadSound(type);
      }
      
      const sound = soundCache[type];
      if (!sound) {
        console.warn(`Sound ${type} not found in cache. Trying to load again.`);
        await this.loadSound(type);
        return;
      }
      
      // Check if sound is currently playing and stop it first
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.stopAsync();
      }
      
      // Reset the sound to the beginning and play it
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
      // If playing fails, try to reload the sound for next time
      this.loadSound(type).catch(e => console.error(`Error reloading ${type} sound:`, e));
    }
  },

  // Get the correct sound file path
  getSoundSource(type: SoundType): any {
    switch (type) {
      case 'achievement':
        return require('../assets/sounds/achievement.mp3');
      case 'purchase':
        return require('../assets/sounds/purchase.mp3');
      case 'rebirth':
        return require('../assets/sounds/rebirth.mp3');
      case 'ability':
        return require('../assets/sounds/ability.mp3');
      case 'click':
        // Reuse purchase sound for click for now
        return require('../assets/sounds/purchase.mp3');
      case 'upgrade':
        // Reuse achievement sound for upgrade
        return require('../assets/sounds/achievement.mp3');
      default:
        return require('../assets/sounds/purchase.mp3');
    }
  }
}; 