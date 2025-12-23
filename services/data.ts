// Data service - MongoDB Backend Integration
import { Shuttle } from '@/constants/routes';
import { apiRequest } from './api';

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

// Polling interval for real-time updates (in milliseconds)
const POLLING_INTERVAL = 5000; // 5 seconds

/**
 * Save user data to database
 */
export const saveUserData = async (uid: string, userData: any): Promise<void> => {
  try {
    await apiRequest(`/users/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  } catch (error: any) {
    console.error('Save user data error:', error);
    throw new Error(error.message || 'Failed to save user data');
  }
};

/**
 * Get user data from database
 */
export const getUserData = async (uid: string): Promise<any> => {
  try {
    const response = await apiRequest(`/users/${uid}`);
    return response;
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
    await apiRequest(`/drivers/${driverId}/shift`, {
      method: 'PUT',
      body: JSON.stringify({ isOnShift, routeId })
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
    const response = await apiRequest('/locations/active');
    return response.map((shuttle: any) => ({
      id: shuttle.id,
      routeId: shuttle.routeId,
      lat: shuttle.lat,
      lon: shuttle.lon,
      speed: shuttle.speed,
      bearing: shuttle.bearing,
      driverName: shuttle.driverName,
      vehicleNo: shuttle.vehicleNo
    }));
  } catch (error: any) {
    console.error('Get active shuttles error:', error);
    return [];
  }
};

/**
 * Subscribe to active shuttles with real-time updates (polling)
 */
export const subscribeToActiveShuttles = (
  callback: (shuttles: Shuttle[]) => void
): (() => void) => {
  let intervalId: NodeJS.Timeout;

  const fetchShuttles = async () => {
    try {
      const shuttles = await getActiveShuttles();
      callback(shuttles);
    } catch (error) {
      console.error('Subscribe to shuttles error:', error);
    }
  };

  // Initial fetch
  fetchShuttles();

  // Poll for updates
  intervalId = setInterval(fetchShuttles, POLLING_INTERVAL);

  // Return unsubscribe function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

/**
 * Get driver data
 */
export const getDriverData = async (driverId: string): Promise<DriverData | null> => {
  try {
    const response = await apiRequest(`/drivers/${driverId}`);
    return {
      name: response.name,
      email: response.email,
      employeeId: response.employeeId,
      phone: response.phone,
      vehicleNo: response.vehicleNo,
      photoURL: response.photoURL,
      isOnShift: response.isOnShift,
      currentRoute: response.currentRoute,
      createdAt: new Date(response.createdAt).getTime()
    };
  } catch (error: any) {
    console.error('Get driver data error:', error);
    throw new Error(error.message || 'Failed to get driver data');
  }
};

/**
 * Update driver route selection
 */
export const updateDriverRoute = async (
  driverId: string,
  routeId: string
): Promise<void> => {
  try {
    await apiRequest(`/drivers/${driverId}/route`, {
      method: 'PUT',
      body: JSON.stringify({ routeId })
    });
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
    await apiRequest(`/drivers/${driverId}/vehicle`, {
      method: 'PUT',
      body: JSON.stringify({ vehicleNo })
    });
  } catch (error: any) {
    console.error('Update vehicle error:', error);
    throw new Error(error.message || 'Failed to update vehicle number');
  }
};

/**
 * Initialize driver data if it doesn't exist
 */
export const initializeDriverData = async (driverId: string): Promise<DriverData> => {
  try {
    const response = await apiRequest('/drivers/initialize', {
      method: 'POST',
      body: JSON.stringify({ userId: driverId })
    });

    return {
      name: response.name,
      email: response.email,
      employeeId: response.employeeId,
      phone: response.phone,
      vehicleNo: response.vehicleNo,
      photoURL: response.photoURL,
      isOnShift: response.isOnShift,
      currentRoute: response.currentRoute,
      createdAt: new Date(response.createdAt).getTime()
    };
  } catch (error: any) {
    console.error('Initialize driver error:', error);
    throw new Error(error.message || 'Failed to initialize driver data');
  }
};

/**
 * Subscribe to driver data changes for real-time updates (polling)
 */
export const subscribeToDriverData = (
  driverId: string,
  callback: (driverData: DriverData | null) => void
): (() => void) => {
  let intervalId: NodeJS.Timeout;

  const fetchDriverData = async () => {
    try {
      const data = await getDriverData(driverId);
      callback(data);
    } catch (error) {
      console.error('Subscribe to driver data error:', error);
      callback(null);
    }
  };

  // Initial fetch
  fetchDriverData();

  // Poll for updates
  intervalId = setInterval(fetchDriverData, POLLING_INTERVAL);

  // Return unsubscribe function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
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
    await apiRequest(`/users/${userId}/route`, {
      method: 'PUT',
      body: JSON.stringify({ routeId })
    });
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
    const response = await apiRequest(`/users/${userId}/route`);
    return response.selectedRoute || null;
  } catch (error: any) {
    console.error('Get user route error:', error);
    return null;
  }
};