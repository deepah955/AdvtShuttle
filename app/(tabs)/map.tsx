import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, FlatList, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import MapView from '@/components/MapView';
import { Shuttle, Route, routes } from '@/constants/routes';
import { Filter, MapPin, ChevronRight } from 'lucide-react-native';
import { subscribeToActiveShuttles, getUserRoute, updateUserRoute } from '@/services/data';
import { getCurrentUser } from '@/services/auth';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const routeFromNav = params.selectedRoute as string;
  const routeNameFromNav = params.routeName as string;
  
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [allShuttles, setAllShuttles] = useState<Shuttle[]>([]);
  const [filteredShuttles, setFilteredShuttles] = useState<Shuttle[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(true);
  const [selectingRoute, setSelectingRoute] = useState(false);
  const [savingRoute, setSavingRoute] = useState(false);
  
  // Ref to track if user just selected a route (to prevent reload)
  const userJustSelectedRoute = useRef(false);

  // Load user's selected route from Firebase (only if user didn't just select one)
  const loadUserRoute = async () => {
    // Don't reload if user just selected a route
    if (userJustSelectedRoute.current) {
      console.log('⏭️ [MAP] Skipping route load - user just selected a route');
      setRouteLoading(false);
      return;
    }
    
    try {
      const user = getCurrentUser();
      if (!user) {
        setRouteLoading(false);
        if (!selectedRoute) {
          setSelectingRoute(true);
        }
        return;
      }

      const route = await getUserRoute(user.uid);
      if (route) {
        // Only update if we don't already have a route selected and user didn't just select one
        if (!selectedRoute && !userJustSelectedRoute.current) {
          setSelectedRoute(route);
          setSelectingRoute(false);
          console.log('✅ [MAP] Loaded user route from Firebase:', route);
        }
      } else {
        console.log('⚠️ [MAP] No route selected for user - showing route selection');
        if (!selectedRoute && !userJustSelectedRoute.current) {
          setSelectedRoute(null);
          setSelectingRoute(true);
        }
      }
    } catch (error) {
      console.error('❌ [MAP] Error loading user route:', error);
      if (!selectedRoute && !userJustSelectedRoute.current) {
        setSelectingRoute(true);
      }
    } finally {
      setRouteLoading(false);
    }
  };

  // Load route on initial mount
  useEffect(() => {
    // Only load if we don't have navigation params
    if (!routeFromNav) {
      loadUserRoute();
    } else {
      // Route from navigation params
      console.log('🎯 [MAP] Route received from navigation:', routeFromNav, routeNameFromNav);
      setSelectedRoute(routeFromNav);
      setSelectingRoute(false);
      setRouteLoading(false);
    }
  }, []); // Only run once on mount

  // Handle route from navigation params when they change
  useEffect(() => {
    if (routeFromNav) {
      console.log('🎯 [MAP] Route received from navigation:', routeFromNav, routeNameFromNav);
      setSelectedRoute(routeFromNav);
      setSelectingRoute(false);
      setRouteLoading(false);
      console.log('✅ [MAP] Route set from navigation - shuttles will be filtered');
    }
  }, [routeFromNav, routeNameFromNav]);

  // Load location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocation({ lat: 12.9716, lon: 79.1587 });
        } else {
          let loc = await Location.getCurrentPositionAsync({});
          setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        }
      } catch (error) {
        console.error('Location error:', error);
        setLocation({ lat: 12.9716, lon: 79.1587 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Subscribe to real-time shuttle updates from Firebase
  useEffect(() => {
    console.log('📡 [MAP] Subscribing to active shuttles...');
    const unsubscribe = subscribeToActiveShuttles((activeShuttles) => {
      console.log(`✅ [MAP] Received ${activeShuttles.length} shuttle updates`);
      setAllShuttles(activeShuttles);
    });

    return () => {
      console.log('📡 [MAP] Unsubscribing from active shuttles');
      unsubscribe();
    };
  }, []);

  // Filter shuttles by selected route
  useEffect(() => {
    if (selectedRoute) {
      const filtered = allShuttles.filter(shuttle => shuttle.routeId === selectedRoute);
      console.log(`🗺️ [MAP] Filtered ${filtered.length} shuttles for route ${selectedRoute}`);
      setFilteredShuttles(filtered);
    } else {
      // If no route selected, show all shuttles
      setFilteredShuttles(allShuttles);
    }
  }, [allShuttles, selectedRoute]);

  // Handle route selection
  const handleSelectRoute = async (route: Route) => {
    if (savingRoute) return;
    
    console.log(`🎯 [MAP] Route selected: ${route.name} (${route.id})`);
    
    // Mark that user just selected a route (prevent reload from overwriting)
    userJustSelectedRoute.current = true;
    
    // Update UI immediately for instant feedback
    setSelectedRoute(route.id);
    setSelectingRoute(false);
    setRouteLoading(false); // Ensure route loading is complete
    setSavingRoute(true);
    
    try {
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('❌ Error', 'User not authenticated');
        // Revert state if error
        userJustSelectedRoute.current = false;
        setSelectedRoute(null);
        setSelectingRoute(true);
        setSavingRoute(false);
        return;
      }

      // Save route to Firebase (fire and forget for better UX)
      console.log('💾 [MAP] Saving route to Firebase...');
      updateUserRoute(user.uid, route.id)
        .then(() => {
          console.log('✅ [MAP] Route saved to Firebase:', route.id);
          // Reset flag after successful save (allow future reloads)
          setTimeout(() => {
            userJustSelectedRoute.current = false;
          }, 1000);
        })
        .catch((error) => {
          console.error('❌ [MAP] Error saving route to Firebase:', error);
          // Don't revert UI - route is still selected, just log error
          // Reset flag even on error after a delay
          setTimeout(() => {
            userJustSelectedRoute.current = false;
          }, 1000);
        });
      
      // Show success message after a brief delay
      setTimeout(() => {
        Alert.alert(
          '✅ Route Selected!',
          `Now showing shuttles on ${route.name}. You can track their real-time locations on the map.`,
          [{ text: 'OK' }]
        );
      }, 500);
      
    } catch (error: any) {
      console.error('❌ [MAP] Error selecting route:', error);
      // Revert state if error
      userJustSelectedRoute.current = false;
      setSelectedRoute(null);
      setSelectingRoute(true);
      Alert.alert(
        '❌ Failed to Select Route', 
        error.message || 'Failed to save route. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSavingRoute(false);
    }
  };

  const handleChangeRoute = () => {
    console.log('🔄 [MAP] User requested to change route');
    setSelectingRoute(true);
    // Don't clear selectedRoute yet - keep it until new one is selected
  };

  const renderRouteCard = ({ item }: { item: Route }) => {
    const isSelected = selectedRoute === item.id;
    const isSaving = savingRoute && isSelected;
    
    return (
      <TouchableOpacity
        style={[
          styles.routeCard, 
          { borderLeftColor: item.color },
          isSelected && styles.routeCardSelected
        ]}
        onPress={() => handleSelectRoute(item)}
        disabled={savingRoute}
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

  // Show loading screen (only if we don't have location AND we're not just waiting for route selection)
  if ((loading || !location) && !selectedRoute && !selectingRoute) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Show route selection UI if explicitly selecting OR if no route is selected (and not loading)
  if (selectingRoute || (!selectedRoute && !routeLoading && location)) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Select Your Route</Text>
            <Text style={styles.headerSubtitle}>Choose a route to track shuttles</Text>
          </View>
        </View>
        <ScrollView style={styles.routeSelectionContainer} contentContainerStyle={styles.routeList}>
          {routes.map((route) => {
            const isCurrentlySelected = selectedRoute === route.id;
            const isCurrentlySaving = savingRoute && isCurrentlySelected;
            
            return (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeCard, 
                  { borderLeftColor: route.color },
                  isCurrentlySelected && styles.routeCardSelected
                ]}
                onPress={() => handleSelectRoute(route)}
                disabled={savingRoute}
              >
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <Text style={styles.routeStops}>{route.stops.join(' → ')}</Text>
                </View>
                {isCurrentlySaving ? (
                  <ActivityIndicator size="small" color={route.color} />
                ) : (
                  <ChevronRight size={24} color="#666" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
  
  // If we have a selected route, show the map (even if location is still loading, use default)
  if (selectedRoute && !selectingRoute) {
    // Use default location if location not loaded yet
    const mapLocation = location || { lat: 12.9716, lon: 79.1587 };
    
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Shuttle Tracker</Text>
            {selectedRoute && (
              <Text style={styles.routeBadge}>
                {selectedRoute === 'lh-prp' ? 'LH/PRP Route' : 'MH Route'}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.routeButton} 
              onPress={handleChangeRoute}
              testID="route-button"
            >
              <MapPin size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} testID="filter-button">
              <Filter size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
        <MapView
          shuttles={filteredShuttles}
          userLat={mapLocation.lat}
          userLon={mapLocation.lon}
        />
        {filteredShuttles.length === 0 && selectedRoute && (
          <View style={styles.noShuttlesOverlay}>
            <View style={styles.noShuttlesCard}>
              <Text style={styles.noShuttlesText}>
                No active shuttles on {selectedRoute === 'lh-prp' ? 'LH/PRP Route' : 'MH Route'} at the moment.
              </Text>
              <Text style={styles.noShuttlesSubtext}>
                Shuttles will appear here when drivers start their shifts.
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }
  
  // Fallback: show loading
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  routeBadge: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeButton: {
    padding: 8,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },
  filterButton: {
    padding: 10,
  },
  routeSelectionContainer: {
    flex: 1,
    padding: 20,
  },
  routeList: {
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
  noShuttlesOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  noShuttlesCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  noShuttlesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  noShuttlesSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});