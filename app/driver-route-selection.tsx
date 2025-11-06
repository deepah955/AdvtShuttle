import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { routes, Route } from '@/constants/routes';

export default function DriverRouteSelectionScreen() {
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  const toggleRoute = (routeId: string) => {
    setSelectedRoutes(prev =>
      prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const handleConfirm = () => {
    console.log('Selected routes:', selectedRoutes);
    router.back();
  };

  const renderRoute = ({ item }: { item: Route }) => {
    const isSelected = selectedRoutes.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.routeCard, { borderLeftColor: item.color }, isSelected && styles.selectedCard]}
        onPress={() => toggleRoute(item.id)}
        testID={`route-${item.id}`}
      >
        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{item.name}</Text>
          <Text style={styles.routeStops}>{item.stops.join(' → ')}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checked]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Active Routes</Text>
      <Text style={styles.subtitle}>Choose routes you will be driving today</Text>
      <FlatList
        data={routes}
        renderItem={renderRoute}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} testID="confirm-button">
        <Text style={styles.confirmText}>Confirm Selection</Text>
      </TouchableOpacity>
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
    textAlign: 'center',
    marginBottom: 10,
    color: '#34C759',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  list: {
    paddingBottom: 20,
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#E8F5E8',
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  routeStops: {
    color: '#666',
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});