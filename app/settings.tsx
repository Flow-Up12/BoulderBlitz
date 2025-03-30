import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Modal, Platform } from 'react-native';
import { List, Switch, Button, Text, Divider, Card, Title, Paragraph, FAB, Portal, Dialog, TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { formatCoins } from '../utils/formatters';
import { supabase } from '../lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initialState } from '../context/GameContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 0;

export default function SettingsScreen() {
  const router = useRouter();
  const { state, dispatch, saveGame, handleRestartGame, forceSyncData } = useGameContext();
  const { signOut, authState } = useAuth();
  
  // Modal states
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [deleteAccountDialogVisible, setDeleteAccountDialogVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Local state for toggles
  const [offlineProgress, setOfflineProgress] = useState(state.offlineProgressEnabled);
  const [notifications, setNotifications] = useState(state.notificationsEnabled);
  const [sound, setSound] = useState(state.soundEnabled);
  const [haptics, setHaptics] = useState(state.hapticsEnabled);

  // Add state for sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncSuccess, setSyncSuccess] = useState(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authState.user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', authState.user.id)
          .single();
          
        if (!error && data) {
          setIsAdmin(data.is_admin || false);
        }
      }
    };
    
    checkAdminStatus();
  }, [authState.user?.id]);

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
      
      // Delete the user auth account
      const { error } = await supabase.auth.admin.deleteUser(authState.user?.id || '');
      
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
  
  const handleExportData = () => {
    try {
      // Create a string version of the game data
      const exportData = JSON.stringify(state, null, 2);
      
      // In a real app, we would share this data via a share sheet
      // For now, we'll just show it in an alert
      Alert.alert(
        'Export Data', 
        'Data ready for export. In a full implementation, this would open a share sheet.',
        [
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Could not export data. Please try again later.');
    }
  };
  
  const handleImportData = () => {
    // In a real app, this would open a file picker
    Alert.alert(
      'Import Data',
      'This would allow you to import previously exported game data.',
      [
        { text: 'OK' }
      ]
    );
  };

  // Function to handle manual sync
  const handleSyncData = async () => {
    if (!authState.isAuthenticated) {
      Alert.alert('Sign In Required', 'You need to be signed in to sync data across devices.');
      return;
    }
    
    setIsSyncing(true);
    setSyncMessage('');
    setSyncSuccess(null);
    
    try {
      const result = await forceSyncData();
      setSyncSuccess(result.success);
      setSyncMessage(result.message);
      
      // Show feedback to user
      if (result.success) {
        // Success feedback
        Alert.alert('Sync Complete', result.message);
      } else {
        // Error feedback
        Alert.alert('Sync Issue', result.message);
      }
    } catch (error) {
      console.error('Error during manual sync:', error);
      setSyncSuccess(false);
      setSyncMessage('An unexpected error occurred. Please try again later.');
      Alert.alert('Sync Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsSyncing(false);
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
            {isAdmin && (
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => router.push('/admin')}
              >
                <Text style={styles.adminButtonText}>Admin Panel</Text>
              </TouchableOpacity>
            )}
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
        </List.Section>

        <List.Section>
          <List.Subheader style={styles.listSubheader}>Account</List.Subheader>
          <List.Item
            title="Save Game"
            titleStyle={styles.listTitle}
            description="Manually save your progress"
            descriptionStyle={styles.listDescription}
            left={props => <List.Icon {...props} icon="content-save" color="#ffffff" />}
            onPress={saveGame}
          />
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
        </List.Section>

        <List.Section>
          <List.Subheader style={styles.listSubheader}>Data Management</List.Subheader>
          <List.Item
            title="Export Game Data"
            titleStyle={styles.listTitle}
            description="Export your game data for backup or sharing"
            descriptionStyle={styles.listDescription}
            left={props => <List.Icon {...props} icon="export" color="#ffffff" />}
            onPress={handleExportData}
          />
          <List.Item
            title="Import Game Data"
            titleStyle={styles.listTitle}
            description="Import game data from a previous session"
            descriptionStyle={styles.listDescription}
            left={props => <List.Icon {...props} icon="import" color="#ffffff" />}
            onPress={handleImportData}
          />
          <List.Item
            title="Delete All Game Data"
            titleStyle={{ ...styles.listTitle, color: '#CF6679' }}
            description="Delete all game data and reset progress"
            descriptionStyle={styles.listDescription}
            left={props => <List.Icon {...props} icon="delete" color="#CF6679" />}
            onPress={confirmDataDeletion}
          />
        </List.Section>

        {/* Cross-device Sync Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cross-Device Sync</Text>
          <TouchableOpacity
            style={[
              styles.bigButton,
              authState.isAuthenticated ? styles.syncButton : styles.disabledButton
            ]}
            onPress={handleSyncData}
            disabled={!authState.isAuthenticated || isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="sync" size={24} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.bigButtonText}>Sync Data Across Devices</Text>
              </>
            )}
          </TouchableOpacity>
          
          {syncMessage ? (
            <Text style={[
              styles.syncMessage,
              syncSuccess ? styles.syncSuccess : styles.syncError
            ]}>
              {syncMessage}
            </Text>
          ) : (
            <Text style={styles.syncHelper}>
              {authState.isAuthenticated 
                ? 'Keep your progress in sync across all your devices'
                : 'Sign in to enable cross-device synchronization'}
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => router.back()}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Back to Game
          </Button>
        </View>
      </ScrollView>
      
      <FAB
        icon="arrow-left"
        style={styles.fab}
        onPress={() => router.back()}
        color="#FFFFFF"
      />
      
      {/* Logout confirmation dialog */}
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              Are you sure you want to log out? Your game will be saved automatically.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)} color="#AAAAAA">
              Cancel
            </Button>
            <Button onPress={handleLogout} color="#7B68EE">
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Delete account confirmation dialog */}
      <Portal>
        <Dialog visible={deleteAccountDialogVisible} onDismiss={() => setDeleteAccountDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              Are you sure you want to delete your account? This action cannot be undone and all your game data will be permanently lost.
            </Text>
            <TextInput
              label="Confirm your password"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              style={styles.passwordInput}
              mode="outlined"
              outlineColor="#CF6679"
              activeOutlineColor="#CF6679"
              theme={{ colors: { text: '#FFFFFF', placeholder: '#AAAAAA' } }}
            />
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setDeleteAccountDialogVisible(false);
              setDeletePassword('');
              setErrorMessage('');
            }} color="#AAAAAA">
              Cancel
            </Button>
            <Button onPress={handleDeleteAccount} color="#CF6679">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
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
  adminButton: {
    backgroundColor: '#ff9800',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bigButton: {
    backgroundColor: '#4a6da7',
    padding: 16,
    borderRadius: 5,
    marginBottom: 16,
    alignItems: 'center',
  },
  bigButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  syncButton: {
    backgroundColor: '#4a6da7',
  },
  disabledButton: {
    backgroundColor: '#888',
    opacity: 0.7,
  },
  syncMessage: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  syncSuccess: {
    color: '#4CAF50',
  },
  syncError: {
    color: '#F44336',
  },
  syncHelper: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
  },
}); 