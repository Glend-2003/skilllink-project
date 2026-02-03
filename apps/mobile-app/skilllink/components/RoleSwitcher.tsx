import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRole } from '../app/context/RoleContext';

export default function RoleSwitcher() {
  const { activeRole, setActiveRole, isProvider } = useRole();

  console.log('🎯 RoleSwitcher: isProvider =', isProvider, 'activeRole =', activeRole);

  if (!isProvider) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, activeRole === 'client' && styles.activeButton]}
        onPress={() => setActiveRole('client')}
      >
        <Text style={[styles.buttonText, activeRole === 'client' && styles.activeButtonText]}>
          Cliente
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, activeRole === 'provider' && styles.activeButton]}
        onPress={() => setActiveRole('provider')}
      >
        <Text style={[styles.buttonText, activeRole === 'provider' && styles.activeButtonText]}>
          Proveedor
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeButtonText: {
    color: '#fff',
  },
});
