import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { routes, Route } from '@/constants/routes';
import { ChevronRight } from 'lucide-react-native';

export default function RouteSelectionScreen() {
  const handleSelectRoute = (route: Route) => {
    console.log(`Selected route: ${route.name}`);
    router.replace('/(tabs)/map');
  };

  const renderRoute = ({ item }: { item: Route }) => (
    <TouchableOpacity
      style={[styles.routeCard, { borderLeftColor: item.color }]}
      onPress={() => handleSelectRoute(item)}
      testID={`route-${item.id}`}
    >
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.name}</Text>
        <Text style={styles.routeStops}>{item.stops.join(' → ')}</Text>
      </View>
      <ChevronRight size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Your Route</Text>
      <FlatList
        data={routes}
        renderItem={renderRoute}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
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
    marginBottom: 40,
    color: '#007AFF',
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
});