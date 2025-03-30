import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

interface ActionButtonsProps {
  onUpgradesPress: () => void;
  onStorePress: () => void;
  onSettingsPress: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onUpgradesPress,
  onStorePress,
  onSettingsPress
}) => {
  return (
    <View style={styles.container}>
      <IconButton
        icon="pickaxe"
        size={32}
        style={styles.button}
        onPress={onUpgradesPress}
        iconColor="#FFFFFF"
        containerColor="#7B68EE"
      />
      <IconButton
        icon="store"
        size={32}
        style={styles.button}
        onPress={onStorePress}
        iconColor="#FFFFFF"
        containerColor="#7B68EE"
      />
      <IconButton
        icon="cog"
        size={32}
        style={styles.button}
        onPress={onSettingsPress}
        iconColor="#FFFFFF"
        containerColor="#7B68EE"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
  },
  button: {
    margin: 0,
    borderRadius: 20,
  }
});

export default ActionButtons; 