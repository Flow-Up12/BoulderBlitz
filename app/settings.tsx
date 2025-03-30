import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import { List, Switch, Button, Text, Card, Title, Paragraph, Dialog, TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { formatCoins } from '../utils/formatters';
import { supabase } from '../lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, Alert } from 'react-native';
import { initialState } from '../context/GameContext';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 0;

export default function SettingsScreen() {
  const router = useRouter();
  const { state, dispatch, saveGame, handleRestartGame } = useGameContext();
  const { signOut, authState } = useAuth();
  
  // Modal states
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [deleteAccountDialogVisible, setDeleteAccountDialogVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Local state for toggles
  const [offlineProgress, setOfflineProgress] = useState(state.offlineProgressEnabled);
  const [notifications, setNotifications] = useState(state.notificationsEnabled);
  const [sound, setSound] = useState(state.soundEnabled);
  const [haptics, setHaptics] = useState(state.hapticsEnabled);
  const [tutorialEnabled, setTutorialEnabled] = useState(state.tutorialEnabled || false);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Save game state before logging out
      await saveGame();
      
      // Reset game state to initial state
      dispatch({ type: 'LOAD_GAME', payload: initialState });
      
      // Sign out from Supabase
      await signOut();
      
      // Navigate to root
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      setErrorMessage('Error during logout. Please try again.');
    }
  };

  // Handle login
  const handleLogin = () => {
    router.push('/auth');
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setErrorMessage('Please enter your password');
      return;
    }
    
    try {
      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authState.user?.email || '',
        password: deletePassword,
      });
      
      if (signInError) {
        setErrorMessage('Incorrect password');
        return;
      }
      
      // Delete user data from tables
      if (authState.user?.id) {
        // Delete from game_states
        await supabase.from('game_states').delete().eq('user_id', authState.user.id);
        
        // Delete from user_upgrades
        await supabase.from('user_upgrades').delete().eq('user_id', authState.user.id);
        
        // Delete from user_rocks
        await supabase.from('user_rocks').delete().eq('user_id', authState.user.id);
        
        // Delete from user_achievements
        await supabase.from('user_achievements').delete().eq('user_id', authState.user.id);
        
        // Delete from users table
        await supabase.from('users').delete().eq('id', authState.user.id);
      }
      
      // User deletes their own account
      const { error } = await supabase.auth.updateUser({
        data: { deleted: true }
      });
      
      if (error) {
        console.error('Error deleting account:', error);
        setErrorMessage('Failed to delete account. Please try again.');
        return;
      }
      
      // Sign out and redirect
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Delete account error:', error);
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  // Calculate total auto miners owned
  const totalAutoMiners = state.autoMiners.reduce((sum, miner) => sum + miner.quantity, 0);

  // Handle toggle changes
  const handleOfflineProgressToggle = (value: boolean) => {
    setOfflineProgress(value);
    dispatch({ type: 'TOGGLE_OFFLINE_PROGRESS', payload: value });
    saveGame();
  };
  
  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    dispatch({ type: 'TOGGLE_NOTIFICATIONS', payload: value });
    saveGame();
  };
  
  const handleSoundToggle = (value: boolean) => {
    setSound(value);
    dispatch({ type: 'TOGGLE_SOUND', payload: value });
    saveGame();
  };
  
  const handleHapticsToggle = (value: boolean) => {
    setHaptics(value);
    dispatch({ type: 'TOGGLE_HAPTICS', payload: value });
    saveGame();
  };
  
  const handleTutorialToggle = (value: boolean) => {
    setTutorialEnabled(value);
    // Update in state
    dispatch({ type: 'TOGGLE_TUTORIAL', payload: value });
    // Store tutorial preference in AsyncStorage
    try {
      if (value) {
        AsyncStorage.removeItem('tutorialCompleted');
      } else {
        AsyncStorage.setItem('tutorialCompleted', 'true');
      }
    } catch (error) {
      console.error('Error updating tutorial settings:', error);
    }
    saveGame();
  };

  // Handle data management functions
  const confirmDataDeletion = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your game data? This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: handleDeleteAllData
        }
      ]
    );
  };
  
  const handleDeleteAllData = async () => {
    try {
      // Reset game state
      handleRestartGame();
      
      // Delete from AsyncStorage
      await AsyncStorage.removeItem('gameState');
      
      // If logged in, delete from Supabase
      if (authState.user?.id) {
        const { error } = await supabase
          .from('game_states')
          .delete()
          .eq('user_id', authState.user.id);
          
        if (error) {
          console.error('Error deleting cloud data:', error);
          Alert.alert('Error', 'Could not delete cloud data. Please try again later.');
          return;
        }
      }
      
      Alert.alert('Success', 'All game data has been deleted.');
      router.replace('/');
    } catch (error) {
      console.error('Error deleting data:', error);
      Alert.alert('Error', 'Could not delete data. Please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card style={styles.userCard}>
          <Card.Content>
            <Title style={styles.title}>Hi, {authState.user?.username || 'Player'}!</Title>
            <Paragraph style={styles.paragraph}>Manage your game settings and view your stats</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Title titleStyle={styles.cardTitle} title="Game Statistics" />
          <Card.Content>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Total Coins Earned</Text>
              <Text style={styles.statValue}>{formatCoins(state.totalCoinsEarned)}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Current Coins</Text>
              <Text style={styles.statValue}>{formatCoins(state.coins)}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Gold Coins</Text>
              <Text style={styles.statValue}>{state.goldCoins}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Coins per Click</Text>
              <Text style={styles.statValue}>{formatCoins(state.cpc)}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Coins per Second</Text>
              <Text style={styles.statValue}>{formatCoins(state.cps)}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Total Clicks</Text>
              <Text style={styles.statValue}>{formatCoins(state.totalClicks)}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Rebirths</Text>
              <Text style={styles.statValue}>{state.rebirths}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Auto Miners Owned</Text>
              <Text style={styles.statValue}>{totalAutoMiners}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Upgrades Owned</Text>
              <Text style={styles.statValue}>{state.upgrades.filter(u => u.owned).length}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Special Upgrades</Text>
              <Text style={styles.statValue}>{state.specialUpgrades.filter(u => u.owned).length}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>Achievements</Text>
              <Text style={styles.statValue}>{state.achievements.filter(a => a.unlocked).length}/{state.achievements.length}</Text>
            </View>
          </Card.Content>
        </Card>
        
        <List.Section>
          <List.Subheader style={styles.listSubheader}>Preferences</List.Subheader>
          <List.Item
            title="Notifications"
            titleStyle={styles.listTitle}
            description="Receive game notifications"
            descriptionStyle={styles.listDescription}
            left={props => <List.Icon {...props} icon="bell" color="#ffffff" />}
            right={props => (
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
                color="#7B68EE"
              />
            )}
          />
          <List.Item
            title="Offline Progress"
            titleStyle={styles.listTitle}
            description={state.specialUpgrades.find(u => u.id === 'offline-progress')?.owned 
              ? "Earn coins while away" 
              : "Requires special upgrade"}
            descriptionStyle={styles.listDescription}
            left={props => <List.Icon {...props} icon="clock" color="#ffffff" />}
            right={props => (
              <Switch
                value={offlineProgress}
                onValueChange={handleOfflineProgressToggle}
                disabled={!state.specialUpgrades.find(u => u.id === 'offline-progress')?.owned}
                color="#7B68EE"
              />
            )}
          />
          <List.Item
            title="Sound"
            titleStyle={styles.listTitle}
            description="Play sound effects"
            descriptionStyle={styles.listDescription}
            left={props => <List.Icon {...props} icon="volume-high" color="#ffffff" />}
            right={props => (
              <Switch
                value={sound}
                onValueChange={handleSoundToggle}
                color="#7B68EE"
              />
            )}
          />
          <List.Item
            title="Haptic Feedback"
            titleStyle={styles.listTitle}
            description="Feel vibrations when clicking"
            descriptionStyle={styles.listDescription}
            left={props => <List.Icon {...props} icon="vibrate" color="#ffffff" />}
            right={props => (
              <Switch
                value={haptics}
                onValueChange={handleHapticsToggle}
                color="#7B68EE"
              />
            )}
          />
          <List.Item
            title="Tutorial"
            titleStyle={styles.listTitle}
            description="Show tutorial on game start (Currently disabled due to stability issues)"
            descriptionStyle={{ ...styles.listDescription, color: '#CF6679' }}
            left={props => <List.Icon {...props} icon="help-circle" color="#CF6679" />}
            right={props => (
              <Switch
                value={false} // Force off for now
                onValueChange={handleTutorialToggle}
                color="#7B68EE"
                disabled={true} // Disable the switch since tutorial is causing crashes
              />
            )}
          />
        </List.Section>

        <List.Section>
          <List.Subheader style={styles.listSubheader}>Account</List.Subheader>
          {authState.isAuthenticated ? (
            <>
              <List.Item
                title="Log Out"
                titleStyle={styles.listTitle}
                description="Save and exit to welcome screen"
                descriptionStyle={styles.listDescription}
                left={props => <List.Icon {...props} icon="logout" color="#ffffff" />}
                onPress={() => setLogoutDialogVisible(true)}
              />
              <List.Item
                title="Delete Account"
                titleStyle={{ ...styles.listTitle, color: '#CF6679' }}
                description="Permanently delete your account and all game data"
                descriptionStyle={styles.listDescription}
                left={props => <List.Icon {...props} icon="delete" color="#CF6679" />}
                onPress={() => setDeleteAccountDialogVisible(true)}
              />
            </>
          ) : (
            <List.Item
              title="Log In"
              titleStyle={styles.listTitle}
              description="Sign in to sync your progress across devices"
              descriptionStyle={styles.listDescription}
              left={props => <List.Icon {...props} icon="login" color="#ffffff" />}
              onPress={handleLogin}
            />
          )}
          <List.Item
            title="Reset Progress"
            titleStyle={{ ...styles.listTitle, color: '#CF6679' }}
            description="Delete all game data and reset progress"
            descriptionStyle={styles.listDescription}
            left={props => <List.Icon {...props} icon="refresh" color="#CF6679" />}
            onPress={confirmDataDeletion}
          />
        </List.Section>

      </ScrollView>

      {/* Logout Dialog */}
      <LogoutDialog
        visible={logoutDialogVisible}
        onDismiss={() => setLogoutDialogVisible(false)}
        onConfirm={handleLogout}
      />
      
      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        visible={deleteAccountDialogVisible}
        onDismiss={() => {
          setDeleteAccountDialogVisible(false);
          setDeletePassword('');
          setErrorMessage('');
        }}
        onConfirm={handleDeleteAccount}
        password={deletePassword}
        onChangePassword={setDeletePassword}
        errorMessage={errorMessage}
      />
    </SafeAreaView>
  );
}

// Logout Dialog Component
function LogoutDialog({ visible, onDismiss, onConfirm }) {
  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title style={styles.dialogTitle}>Log Out</Dialog.Title>
      <Dialog.Content>
        <Text style={styles.dialogContent}>
          Are you sure you want to log out? Your progress will be saved.
        </Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button onPress={onConfirm}>Log Out</Button>
      </Dialog.Actions>
    </Dialog>
  );
}

// Delete Account Dialog Component
function DeleteAccountDialog({ visible, onDismiss, onConfirm, password, onChangePassword, errorMessage }) {
  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title style={styles.dialogTitle}>Delete Account</Dialog.Title>
      <Dialog.Content>
        <Text style={styles.dialogContent}>
          This will permanently delete your account and all associated game data. This action cannot be undone.
        </Text>
        <Text style={styles.dialogContent}>
          Please enter your password to confirm:
        </Text>
        <TextInput
          value={password}
          onChangeText={onChangePassword}
          secureTextEntry
          style={styles.passwordInput}
          placeholder="Password"
        />
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button onPress={onConfirm} color="#CF6679">Delete</Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    paddingTop: STATUS_BAR_HEIGHT,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  userCard: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#2A2A2A',
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    backgroundColor: '#2A2A2A',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    opacity: 0.7,
    color: '#FFFFFF',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonContainer: {
    margin: 16,
    marginBottom: 40,
  },
  title: {
    color: '#FFFFFF',
  },
  paragraph: {
    color: '#DDDDDD',
  },
  cardTitle: {
    color: '#FFFFFF',
  },
  listSubheader: {
    color: '#7B68EE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listTitle: {
    color: '#FFFFFF',
  },
  listDescription: {
    color: '#AAAAAA',
  },
  button: {
    backgroundColor: '#7B68EE',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
    backgroundColor: '#7B68EE',
  },
  dialog: {
    backgroundColor: '#2A2A2A',
  },
  dialogTitle: {
    color: '#FFFFFF',
  },
  dialogContent: {
    color: '#DDDDDD',
  },
  passwordInput: {
    marginTop: 16,
    backgroundColor: '#323232',
  },
  errorText: {
    color: '#CF6679',
    marginTop: 8,
  },
}); 