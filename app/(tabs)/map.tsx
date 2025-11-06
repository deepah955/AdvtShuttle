import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView from '@/components/MapView';
import { mockShuttles, Shuttle } from '@/constants/routes';
import { Filter } from 'lucide-react-native';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [shuttles, setShuttles] = useState<Shuttle[]>(mockShuttles);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation({ lat: 12.9716, lon: 79.1587 });
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
    })();
  }, []);

  // Simulate realtime updates
  useEffect(() => {
    const interval = setInterval(() => {
      setShuttles(prev => prev.map(shuttle => ({
        ...shuttle,
        lat: shuttle.lat + (Math.random() - 0.5) * 0.001,
        lon: shuttle.lon + (Math.random() - 0.5) * 0.001,
        speed: shuttle.speed + (Math.random() - 0.5) * 5,
      })));
      console.log('Updated shuttle positions');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!location) {
    return (
      <View style={styles.loading}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shuttle Tracker</Text>
        <TouchableOpacity style={styles.filterButton} testID="filter-button">
          <Filter size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <MapView
        shuttles={shuttles}
        userLat={location.lat}
        userLon={location.lon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  filterButton: {
    padding: 10,
  },
});