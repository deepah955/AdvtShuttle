import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { routes, Route } from '@/constants/routes';
import { ChevronRight } from 'lucide-react-native';
import { getCurrentUser } from '@/services/auth';
import { updateUserRoute } from '@/services/data';

export default function RouteSelectionScreen() {
  const [saving, setSaving] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const handleSelectRoute = async (route: Route) => {
    if (saving) return;
    
    setSelectedRouteId(route.id);
    console.log(`🎯 [ROUTE SELECT] Selected route: ${route.name} (${route.id})`);
    
    try {
      setSaving(true);
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('❌ Error', 'User not authenticated');
        setSaving(false);
        return;
      }

      // Save route to Firebase
      console.log('💾 [ROUTE SELECT] Saving route to Firebase...');
      await updateUserRoute(user.uid, route.id);
      console.log('✅ [ROUTE SELECT] Route saved to Firebase:', route.id);
      
      // Navigate to map immediately with route data
      console.log('🗺️ [ROUTE SELECT] Navigating to map with route:', route.name);
      router.replace({
        pathname: '/(tabs)/map',
        params: {
          selectedRoute: route.id,
          routeName: route.name,
          timestamp: Date.now().toString(),
          fromRouteSelection: 'true'
        }
      });
      
      console.log('🎉 [ROUTE SELECT] Navigation completed successfully');
    } catch (error: any) {
      console.error('❌ [ROUTE SELECT] Error:', error);
      Alert.alert(
        '❌ Failed to Select Route', 
        error.message || 'Failed to save route. Please try again.',
        [{ text: 'OK' }]
      );
      setSaving(false);
      setSelectedRouteId(null);
    }
  };

  const renderRoute = ({ item }: { item: Route }) => {
    const isSelected = selectedRouteId === item.id;
    const isSaving = saving && isSelected;
    
    return (
      <TouchableOpacity
        style={[
          styles.routeCard, 
          { borderLeftColor: item.color },
          isSelected && styles.routeCardSelected
        ]}
        onPress={() => handleSelectRoute(item)}
        disabled={saving}
        testID={`route-${item.id}`}
      >
        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{item.name}</Text>
          <Text style={styles.routeStops}>{item.stops.join(' → ')}</Text>
        </View>
        {isSaving ? (
          <ActivityIndicator size="small" color={item.color} />
        ) : (
          <ChevronRight size={24} color="#666" />
        )}
      </TouchableOpacity>
    );
  };

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
  routeCardSelected: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#007AFF',
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