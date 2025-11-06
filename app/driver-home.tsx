import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Truck, MapPin, Settings, LogOut } from 'lucide-react-native';

export default function DriverHomeScreen() {
  const [isOnShift, setIsOnShift] = useState(false);

  const handleStartShift = () => {
    console.log('Starting shift');
    setIsOnShift(true);
    Alert.alert('Shift Started', 'You are now sharing your location.');
  };

  const handleEndShift = () => {
    console.log('Ending shift');
    setIsOnShift(false);
    Alert.alert('Shift Ended', 'Location sharing stopped.');
  };

  const handleSelectRoute = () => {
    router.push('/driver-route-selection');
  };

  const handleLogout = () => {
    router.replace('/user-type');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Driver Dashboard</Text>
      <View style={styles.statusCard}>
        <Truck size={48} color={isOnShift ? '#34C759' : '#FF9500'} />
        <Text style={styles.statusText}>
          {isOnShift ? 'On Shift - Sharing Location' : 'Off Shift'}
        </Text>
        <TouchableOpacity
          style={[styles.shiftButton, isOnShift && styles.endShiftButton]}
          onPress={isOnShift ? handleEndShift : handleStartShift}
          testID="shift-button"
        >
          <Text style={styles.shiftButtonText}>
            {isOnShift ? 'End Shift' : 'Start Shift'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSelectRoute} testID="route-button">
          <MapPin size={24} color="#007AFF" />
          <Text style={styles.actionText}>Select Route</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/driver-map')} testID="map-button">
          <Truck size={24} color="#007AFF" />
          <Text style={styles.actionText}>View Map</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} testID="settings-button">
          <Settings size={20} color="#666" />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleLogout} testID="logout-button">
          <LogOut size={20} color="#FF3B30" />
          <Text style={[styles.footerText, { color: '#FF3B30' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#34C759',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
  },
  shiftButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  endShiftButton: {
    backgroundColor: '#FF3B30',
  },
  shiftButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  actionText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerButton: {
    alignItems: 'center',
  },
  footerText: {
    marginTop: 5,
    fontSize: 14,
  },
});