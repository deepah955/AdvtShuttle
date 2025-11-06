import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Truck } from 'lucide-react-native';

export default function UserTypeScreen() {
  const riderScale = useRef(new Animated.Value(1)).current;
  const driverScale = useRef(new Animated.Value(1)).current;

  const animatePress = (scale: Animated.Value, isPressed: boolean) => {
    Animated.spring(scale, {
      toValue: isPressed ? 0.95 : 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectType = (type: 'rider' | 'driver') => {
    console.log(`Selected user type: ${type}`);
    router.push(`/auth?type=${type}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to VIT Shuttle</Text>
      <Text style={styles.subtitle}>Select your role to get started</Text>
      <View style={styles.cardsContainer}>
        <Animated.View style={[styles.card, { transform: [{ scale: riderScale }] }]}>
          <TouchableOpacity
            style={styles.cardContent}
            onPressIn={() => animatePress(riderScale, true)}
            onPressOut={() => animatePress(riderScale, false)}
            onPress={() => handleSelectType('rider')}
            testID="rider-card"
          >
            <User size={48} color="#007AFF" />
            <Text style={styles.cardTitle}>Student / Employee</Text>
            <Text style={styles.cardSubtitle}>Track shuttles and get ETA</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.card, { transform: [{ scale: driverScale }] }]}>
          <TouchableOpacity
            style={styles.cardContent}
            onPressIn={() => animatePress(driverScale, true)}
            onPressOut={() => animatePress(driverScale, false)}
            onPress={() => handleSelectType('driver')}
            testID="driver-card"
          >
            <Truck size={48} color="#34C759" />
            <Text style={styles.cardTitle}>Driver</Text>
            <Text style={styles.cardSubtitle}>Manage routes and share location</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardContent: {
    padding: 30,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});