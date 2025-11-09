import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { routes, Route } from '@/constants/routes';
import { getCurrentUser } from '@/services/auth';
import { updateDriverRoute, getDriverData, subscribeToDriverData } from '@/services/data';

export default function DriverRouteSelectionScreen() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCurrentRoute();
    setupRealtimeUpdates();
  }, []);

  const setupRealtimeUpdates = () => {
    const user = getCurrentUser();
    if (!user) return;

    console.log('[ROUTE SELECTION] Setting up real-time route updates');
    const unsubscribe = subscribeToDriverData(user.uid, (driverData) => {
      if (driverData) {
        console.log('[ROUTE SELECTION] Real-time update received:', {
          currentRoute: driverData.currentRoute,
          isOnShift: driverData.isOnShift
        });
        
        if (driverData.currentRoute) {
          setSelectedRoute(driverData.currentRoute);
        }
      } else {
        console.log('[ROUTE SELECTION] No driver data in real-time update');
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('[ROUTE SELECTION] Cleaning up route subscription');
      unsubscribe();
    };
  };

  const loadCurrentRoute = async () => {
    try {
      console.log('[ROUTE SELECTION] Loading current route...');
      const user = getCurrentUser();
      if (!user) {
        console.log('[ROUTE SELECTION] No authenticated user, redirecting');
        router.replace('/user-type');
        return;
      }

      // Initialize driver data if needed
      let driverData = await getDriverData(user.uid);
      
      if (!driverData) {
        console.log('[ROUTE SELECTION] No driver data found, initializing...');
        const { initializeDriverData } = await import('@/services/data');
        driverData = await initializeDriverData(user.uid);
      }

      if (driverData && driverData.currentRoute) {
        console.log('[ROUTE SELECTION] Current route loaded:', driverData.currentRoute);
        setSelectedRoute(driverData.currentRoute);
      } else {
        console.log('[ROUTE SELECTION] No current route found');
      }
    } catch (error) {
      console.error('[ROUTE SELECTION] ❌ Load route error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRoute = (routeId: string) => {
    console.log('Route selected:', routeId);
    setSelectedRoute(routeId);
    
    // Provide immediate visual feedback
    const routeName = routeId === 'lh-prp' ? 'LH/PRP Route' : 'MH Route';
    console.log(`Selected route: ${routeName}`);
  };

  const handleConfirm = async () => {
    if (!selectedRoute) {
      Alert.alert('❌ No Route Selected', 'Please select a route to continue.');
      return;
    }

    // Prevent double-clicking
    if (saving) {
      console.log('[ROUTE SELECTION] Already saving, ignoring click');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      Alert.alert('❌ Error', 'User not authenticated');
      return;
    }

    // Get route name for navigation params
    const routeName = selectedRoute === 'lh-prp' ? 'LH/PRP Route' : 'MH Route';

    console.log('[ROUTE SELECTION] 🚀 Starting route save and navigation:', selectedRoute);
    
    // Prepare navigation params FIRST (before any async operations)
    const routeParam = selectedRoute;
    const nameParam = routeName;
    const fromSelectionParam = 'true';
    
    console.log('[ROUTE SELECTION] 🎯 Navigation params:', {
      selectedRoute: routeParam,
      routeName: nameParam,
      fromRouteSelection: fromSelectionParam
    });
    
    // NAVIGATE FIRST - before any state updates or async operations
    console.log('[ROUTE SELECTION] 🚀 Executing navigation immediately (before save)...');
    
    // Use replace to ensure navigation happens and replaces current screen
    const navParams = {
      pathname: '/driver-home' as const,
      params: {
        selectedRoute: routeParam,
        routeName: nameParam,
        fromRouteSelection: fromSelectionParam,
        timestamp: Date.now().toString()
      }
    };
    
    console.log('[ROUTE SELECTION] Navigation params object:', navParams);
    
    // Execute navigation - use replace for more reliable navigation
    router.replace(navParams);
    
    console.log('[ROUTE SELECTION] ✅ Navigation command executed - using router.replace');
    
    // Verify navigation was triggered (for debugging)
    console.log('[ROUTE SELECTION] Current route after navigation:', router);
    
    // Update UI state after navigation is triggered
    setSaving(true);

    // Save route to Firebase in background (non-blocking, happens after navigation)
    const saveRoute = async () => {
      try {
        await updateDriverRoute(user.uid, selectedRoute);
        console.log('[ROUTE SELECTION] ✅ Route saved to Firebase:', selectedRoute);
        setSaving(false);
      } catch (error: any) {
        console.error('[ROUTE SELECTION] ⚠️ Route save error (non-critical):', error);
        setSaving(false);
        // Don't block - route will sync via real-time updates
      }
    };

    // Start saving in background
    saveRoute();
    
    // Note: Success message will be shown by driver-home screen after navigation
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderRoute = ({ item }: { item: Route }) => {
    const isSelected = selectedRoute === item.id;
    return (
      <TouchableOpacity
        style={[styles.routeCard, { borderLeftColor: item.color }, isSelected && styles.selectedCard]}
        onPress={() => selectRoute(item.id)}
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            console.log('Back button pressed, navigating to driver home');
            router.push('/driver-home');
          }}
        >
          <ArrowLeft size={24} color="#34C759" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Your Route</Text>
        <View style={styles.placeholder} />
      </View>
      <Text style={styles.subtitle}>Choose the route you will be driving</Text>
      <FlatList
        data={routes}
        renderItem={renderRoute}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity 
        style={[styles.confirmButton, saving && styles.buttonDisabled, !selectedRoute && styles.buttonDisabled]} 
        onPress={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('[ROUTE SELECTION] Confirm button pressed');
          handleConfirm();
        }} 
        disabled={!selectedRoute}
        testID="confirm-button"
      >
        {saving ? (
          <View style={styles.savingContainer}>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.savingText}>Navigating...</Text>
          </View>
        ) : (
          <Text style={styles.confirmText}>
            {selectedRoute ? 'Confirm Selection' : 'Select a Route First'}
          </Text>
        )}
      </TouchableOpacity>
      
      {selectedRoute && (
        <View style={styles.selectedRouteInfo}>
          <Text style={styles.selectedRouteText}>
            Selected: {selectedRoute === 'lh-prp' ? 'LH/PRP Route' : 'MH Route'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  placeholder: {
    width: 44, // Same width as back button for centering
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
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  selectedRouteInfo: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  selectedRouteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
});