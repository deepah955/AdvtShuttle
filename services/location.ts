// Location service - MongoDB Backend Integration
import * as Location from 'expo-location';
import { apiRequest } from './api';

export interface DriverLocation {
  driverId: string;
  routeId: string;
  lat: number;
  lon: number;
  speed: number;
  bearing: number;
  timestamp: number;
  isOnShift: boolean;
}

// Store subscriptions per driver to handle multiple instances
const locationSubscriptions: Map<string, Location.LocationSubscription> = new Map();

/**
 * Start location tracking for a driver
 */
export const startLocationTracking = async (
  driverId: string,
  routeId: string
): Promise<void> => {
  try {
    console.log(`📍 [LOCATION] Starting location tracking for driver: ${driverId}, route: ${routeId}`);

    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted. Please enable location permissions in settings.');
    }
    console.log('✅ [LOCATION] Location permission granted');

    // Stop any existing tracking for this driver
    if (locationSubscriptions.has(driverId)) {
      console.log('🛑 [LOCATION] Stopping existing tracking for driver:', driverId);
      const existingSub = locationSubscriptions.get(driverId);
      if (existingSub) {
        existingSub.remove();
      }
      locationSubscriptions.delete(driverId);
    }

    // Get initial location immediately
    try {
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialLocationData: DriverLocation = {
        driverId,
        routeId,
        lat: initialLocation.coords.latitude,
        lon: initialLocation.coords.longitude,
        speed: initialLocation.coords.speed ? initialLocation.coords.speed * 3.6 : 0,
        bearing: initialLocation.coords.heading || 0,
        timestamp: Date.now(),
        isOnShift: true
      };

      await updateLocation(driverId, initialLocationData);
      console.log('✅ [LOCATION] Initial location saved:', initialLocationData.lat, initialLocationData.lon);
    } catch (initialError) {
      console.error('⚠️ [LOCATION] Failed to get initial location:', initialError);
      // Continue anyway - watchPositionAsync will handle updates
    }

    // Start watching location
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Or when moved 10 meters
      },
      async (location) => {
        try {
          const locationData: DriverLocation = {
            driverId,
            routeId,
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            speed: location.coords.speed ? location.coords.speed * 3.6 : 0, // Convert m/s to km/h
            bearing: location.coords.heading || 0,
            timestamp: Date.now(),
            isOnShift: true
          };

          await updateLocation(driverId, locationData);
          console.log(`📍 [LOCATION] Updated location for ${driverId}:`, locationData.lat, locationData.lon);
        } catch (updateError) {
          console.error('❌ [LOCATION] Error updating location:', updateError);
          // Don't throw - continue tracking
        }
      }
    );

    locationSubscriptions.set(driverId, subscription);
    console.log('✅ [LOCATION] Location tracking started for driver:', driverId);
  } catch (error: any) {
    console.error('❌ [LOCATION] Start location tracking error:', error);
    throw new Error(error.message || 'Failed to start location tracking');
  }
};

/**
 * Stop location tracking for a driver
 */
export const stopLocationTracking = async (driverId: string): Promise<void> => {
  try {
    console.log(`🛑 [LOCATION] Stopping location tracking for driver: ${driverId}`);

    // Stop location subscription for this driver
    if (locationSubscriptions.has(driverId)) {
      const subscription = locationSubscriptions.get(driverId);
      if (subscription) {
        subscription.remove();
        console.log('✅ [LOCATION] Location subscription removed');
      }
      locationSubscriptions.delete(driverId);
    }

    // Remove location from database
    try {
      await apiRequest(`/locations/${driverId}`, {
        method: 'DELETE'
      });
      console.log('✅ [LOCATION] Location removed from database');
    } catch (dbError) {
      console.error('⚠️ [LOCATION] Error removing location from database:', dbError);
      // Continue even if database removal fails
    }

    console.log('✅ [LOCATION] Location tracking stopped for driver:', driverId);
  } catch (error: any) {
    console.error('❌ [LOCATION] Stop location tracking error:', error);
    throw new Error(error.message || 'Failed to stop location tracking');
  }
};

/**
 * Update driver location in database
 */
export const updateLocation = async (
  driverId: string,
  location: DriverLocation
): Promise<void> => {
  try {
    await apiRequest('/locations/update', {
      method: 'POST',
      body: JSON.stringify({
        driverId,
        routeId: location.routeId,
        lat: location.lat,
        lon: location.lon,
        speed: location.speed,
        bearing: location.bearing,
        timestamp: location.timestamp
      })
    });
  } catch (error: any) {
    console.error('Update location error:', error);
    // Don't throw error to avoid breaking location tracking
  }
};

/**
 * Subscribe to shuttle locations (polling)
 */
export const subscribeToShuttleLocations = (
  callback: (locations: Record<string, any>) => void
): (() => void) => {
  let intervalId: NodeJS.Timeout;

  const fetchLocations = async () => {
    try {
      const response = await apiRequest('/locations/active');

      // Convert array to object keyed by driverId
      const locationsMap: Record<string, any> = {};
      response.forEach((shuttle: any) => {
        locationsMap[shuttle.id] = {
          lat: shuttle.lat,
          lon: shuttle.lon,
          speed: shuttle.speed,
          bearing: shuttle.bearing,
          routeId: shuttle.routeId,
          timestamp: shuttle.timestamp
        };
      });

      callback(locationsMap);
    } catch (error) {
      console.error('Fetch shuttle locations error:', error);
      callback({});
    }
  };

  // Initial fetch
  fetchLocations();

  // Poll for updates every 5 seconds
  intervalId = setInterval(fetchLocations, 5000);

  // Return unsubscribe function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

/**
 * Unsubscribe from shuttle locations
 */
export const unsubscribeFromShuttleLocations = (): void => {
  console.warn('unsubscribeFromShuttleLocations: Use the unsubscribe function returned by subscribeToShuttleLocations');
};

/**
 * Get current location once
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
  } catch (error: any) {
    console.error('Get current location error:', error);
    throw new Error(error.message || 'Failed to get current location');
  }
};
