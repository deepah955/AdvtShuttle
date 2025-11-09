import { ref, set, get, onValue, off, update } from 'firebase/database';
import { database } from './firebase';
import { Shuttle } from '@/constants/routes';

export interface ShuttleData {
  id: string;
  driverId: string;
  driverName: string;
  vehicleNo: string;
  routeId: string;
  location: {
    lat: number;
    lon: number;
    speed: number;
    bearing: number;
  };
  isOnShift: boolean;
  lastUpdated: number;
}

export interface DriverData {
  name: string;
  email: string;
  employeeId?: string;
  phone?: string;
  vehicleNo?: string;
  photoURL?: string;
  isOnShift: boolean;
  currentRoute: string | null;
  createdAt: number;
}

/**
 * Save user data to Firebase
 */
export const saveUserData = async (uid: string, userData: any): Promise<void> => {
  try {
    const userRef = ref(database, `users/${uid}`);
    await set(userRef, userData);
  } catch (error: any) {
    console.error('Save user data error:', error);
    throw new Error(error.message || 'Failed to save user data');
  }
};

/**
 * Get user data from Firebase
 */
export const getUserData = async (uid: string): Promise<any> => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error: any) {
    console.error('Get user data error:', error);
    throw new Error(error.message || 'Failed to get user data');
  }
};

/**
 * Update driver shift status
 */
export const updateDriverShiftStatus = async (
  driverId: string,
  isOnShift: boolean,
  routeId: string | null
): Promise<void> => {
  try {
    const driverRef = ref(database, `drivers/${driverId}`);
    await update(driverRef, {
      isOnShift,
      currentRoute: routeId
    });
  } catch (error: any) {
    console.error('Update shift status error:', error);
    throw new Error(error.message || 'Failed to update shift status');
  }
};

/**
 * Get active shuttles (drivers on shift)
 */
export const getActiveShuttles = async (): Promise<Shuttle[]> => {
  try {
    const driversRef = ref(database, 'drivers');
    const locationsRef = ref(database, 'shuttleLocations');
    const usersRef = ref(database, 'users');
    
    const [driversSnapshot, locationsSnapshot, usersSnapshot] = await Promise.all([
      get(driversRef),
      get(locationsRef),
      get(usersRef)
    ]);
    
    const shuttles: Shuttle[] = [];
    
    if (driversSnapshot.exists() && locationsSnapshot.exists()) {
      const drivers = driversSnapshot.val();
      const locations = locationsSnapshot.val();
      const users = usersSnapshot.exists() ? usersSnapshot.val() : {};
      
      Object.keys(drivers).forEach(driverId => {
        const driver = drivers[driverId];
        const location = locations[driverId];
        const user = users[driverId] || {};
        
        // Only include drivers who are on shift and have location data
        if (driver.isOnShift && location && location.lat && location.lon) {
          // Use name from users collection if available, otherwise from drivers
          const driverName = user.name || driver.name || 'Driver';
          
          shuttles.push({
            id: driverId,
            routeId: driver.currentRoute || location.routeId || 'unknown',
            lat: location.lat,
            lon: location.lon,
            speed: location.speed || 0,
            bearing: location.bearing || 0,
            driverName: driverName,
            vehicleNo: driver.vehicleNo || 'N/A'
          });
        }
      });
    }
    
    console.log(`✅ Found ${shuttles.length} active shuttles`);
    return shuttles;
  } catch (error: any) {
    console.error('❌ Get active shuttles error:', error);
    throw new Error(error.message || 'Failed to get active shuttles');
  }
};

/**
 * Subscribe to active shuttles with real-time updates
 */
export const subscribeToActiveShuttles = (
  callback: (shuttles: Shuttle[]) => void
): (() => void) => {
  const driversRef = ref(database, 'drivers');
  const locationsRef = ref(database, 'shuttleLocations');
  
  const updateShuttles = async () => {
    try {
      const shuttles = await getActiveShuttles();
      callback(shuttles);
    } catch (error) {
      console.error('Subscribe to shuttles error:', error);
    }
  };
  
  // Listen to both drivers and locations changes
  onValue(driversRef, updateShuttles);
  onValue(locationsRef, updateShuttles);
  
  // Return unsubscribe function
  return () => {
    off(driversRef);
    off(locationsRef);
  };
};

/**
 * Get driver data
 */
export const getDriverData = async (driverId: string): Promise<DriverData | null> => {
  try {
    const driverRef = ref(database, `drivers/${driverId}`);
    const snapshot = await get(driverRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as DriverData;
    }
    return null;
  } catch (error: any) {
    console.error('Get driver data error:', error);
    throw new Error(error.message || 'Failed to get driver data');
  }
};

/**
 * Update driver route selection with comprehensive sync
 */
export const updateDriverRoute = async (
  driverId: string,
  routeId: string
): Promise<void> => {
  try {
    console.log(`Updating route for driver ${driverId} to ${routeId}`);
    
    const driverRef = ref(database, `drivers/${driverId}`);
    const updateData = {
      currentRoute: routeId,
      lastRouteUpdate: Date.now()
    };
    
    await update(driverRef, updateData);
    console.log('Route update completed in Firebase');
    
    // Verify the update was successful
    const snapshot = await get(driverRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Verification - current route in Firebase:', data.currentRoute);
      if (data.currentRoute !== routeId) {
        throw new Error('Route update verification failed');
      }
    } else {
      throw new Error('Driver data not found after update');
    }
  } catch (error: any) {
    console.error('Update driver route error:', error);
    throw new Error(error.message || 'Failed to update driver route');
  }
};

/**
 * Update driver vehicle number
 */
export const updateDriverVehicleNumber = async (
  driverId: string,
  vehicleNo: string
): Promise<void> => {
  try {
    console.log(`[VEHICLE UPDATE] Updating vehicle number for driver ${driverId} to ${vehicleNo}`);
    
    const driverRef = ref(database, `drivers/${driverId}`);
    const updateData = {
      vehicleNo: vehicleNo.trim(),
      vehicleUpdatedAt: Date.now()
    };
    
    await update(driverRef, updateData);
    
    // Verify the update
    const verificationSnapshot = await get(driverRef);
    if (verificationSnapshot.exists()) {
      const data = verificationSnapshot.val();
      if (data.vehicleNo === vehicleNo.trim()) {
        console.log('[VEHICLE UPDATE] ✅ Vehicle number updated and verified');
      } else {
        throw new Error('Vehicle number verification failed');
      }
    } else {
      throw new Error('Driver data not found after vehicle update');
    }
  } catch (error: any) {
    console.error('[VEHICLE UPDATE] ❌ Error:', error);
    throw new Error(error.message || 'Failed to update vehicle number');
  }
};

/**
 * Initialize driver data if it doesn't exist
 */
export const initializeDriverData = async (driverId: string): Promise<DriverData> => {
  try {
    console.log(`[DRIVER INIT] Initializing driver data for ${driverId}`);
    
    const driverRef = ref(database, `drivers/${driverId}`);
    const driverSnapshot = await get(driverRef);
    
    if (driverSnapshot.exists()) {
      console.log('[DRIVER INIT] Driver data already exists');
      return driverSnapshot.val() as DriverData;
    }
    
    // Get user data to create driver record
    const userRef = ref(database, `users/${driverId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('User data not found - cannot initialize driver');
    }
    
    const userData = userSnapshot.val();
    const initialDriverData: DriverData = {
      name: userData.name,
      email: userData.email,
      employeeId: userData.employeeId || undefined,
      phone: userData.phone || undefined,
      vehicleNo: userData.vehicleNo || undefined,
      photoURL: userData.photoURL || undefined,
      isOnShift: false,
      currentRoute: null,
      createdAt: Date.now()
    };
    
    console.log('[DRIVER INIT] Creating new driver record:', initialDriverData);
    await set(driverRef, initialDriverData);
    
    // Verify creation
    const verificationSnapshot = await get(driverRef);
    if (!verificationSnapshot.exists()) {
      throw new Error('Failed to create driver record');
    }
    
    console.log('[DRIVER INIT] ✅ Driver data initialized successfully');
    return initialDriverData;
  } catch (error: any) {
    console.error('[DRIVER INIT] ❌ Error:', error);
    throw new Error(error.message || 'Failed to initialize driver data');
  }
};

/**
 * Subscribe to driver data changes for real-time updates
 */
export const subscribeToDriverData = (
  driverId: string,
  callback: (driverData: DriverData | null) => void
): (() => void) => {
  const driverRef = ref(database, `drivers/${driverId}`);
  
  const listener = onValue(driverRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as DriverData;
      console.log('Driver data updated:', data);
      callback(data);
    } else {
      callback(null);
    }
  });
  
  // Return unsubscribe function
  return () => {
    off(driverRef);
  };
};

/**
 * Update user's selected route (for students/employees)
 */
export const updateUserRoute = async (
  userId: string,
  routeId: string
): Promise<void> => {
  try {
    console.log(`Updating route for user ${userId} to ${routeId}`);
    
    const userRef = ref(database, `users/${userId}`);
    const updateData = {
      selectedRoute: routeId,
      lastRouteUpdate: Date.now()
    };
    
    await update(userRef, updateData);
    console.log('User route update completed in Firebase');
  } catch (error: any) {
    console.error('Update user route error:', error);
    throw new Error(error.message || 'Failed to update user route');
  }
};

/**
 * Get user's selected route (for students/employees)
 */
export const getUserRoute = async (userId: string): Promise<string | null> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return data.selectedRoute || null;
    }
    return null;
  } catch (error: any) {
    console.error('Get user route error:', error);
    throw new Error(error.message || 'Failed to get user route');
  }
};