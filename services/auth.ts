// Authentication service - MongoDB + JWT Backend Integration

import { apiRequest, storeToken, removeToken, getStoredToken } from './api';

export interface UserData {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'employee' | 'driver';
  registrationNumber?: string;
  employeeId?: string;
  phone?: string;
  photoURL?: string;
  vehicleNo?: string;
  createdAt: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Store current user in memory
let currentUser: User | null = null;
let authStateListeners: Array<(user: User | null) => void> = [];

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  userData: Omit<UserData, 'uid' | 'createdAt'>
): Promise<User> => {
  try {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        ...userData
      })
    });

    // Store JWT token
    await storeToken(response.token);

    // Create user object
    const user: User = {
      uid: response.user.uid,
      email: response.user.email,
      displayName: response.user.name,
      photoURL: response.user.photoURL || null
    };

    currentUser = user;
    notifyAuthStateListeners(user);

    return user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const response = await apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Store JWT token
    await storeToken(response.token);

    // Create user object
    const user: User = {
      uid: response.user.uid,
      email: response.user.email,
      displayName: response.user.displayName,
      photoURL: response.user.photoURL || null
    };

    currentUser = user;
    notifyAuthStateListeners(user);

    return user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await removeToken();
    currentUser = null;
    notifyAuthStateListeners(null);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return currentUser;
};

/**
 * Initialize auth state from stored token
 */
export const initializeAuth = async (): Promise<User | null> => {
  try {
    const token = await getStoredToken();
    if (!token) {
      return null;
    }

    // Decode JWT to get user info (basic decode, not verification)
    const payload = JSON.parse(atob(token.split('.')[1]));

    const user: User = {
      uid: payload.userId,
      email: payload.email,
      displayName: null,
      photoURL: null
    };

    // Fetch full user data
    try {
      const userData = await getUserData(payload.userId);
      if (userData) {
        user.displayName = userData.name;
        user.photoURL = userData.photoURL || null;
      }
    } catch (error) {
      console.warn('Could not fetch user data:', error);
    }

    currentUser = user;
    notifyAuthStateListeners(user);
    return user;
  } catch (error) {
    console.error('Initialize auth error:', error);
    await removeToken();
    return null;
  }
};

/**
 * Get user data from database
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const response = await apiRequest(`/users/${uid}`);
    return {
      uid: response._id,
      email: response.email,
      name: response.name,
      role: response.role,
      registrationNumber: response.registrationNumber,
      employeeId: response.employeeId,
      phone: response.phone,
      photoURL: response.photoURL,
      vehicleNo: response.vehicleNo,
      createdAt: new Date(response.createdAt).getTime()
    };
  } catch (error: any) {
    console.error('Get user data error:', error);
    throw new Error(error.message || 'Failed to get user data');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserData>
): Promise<void> => {
  try {
    await apiRequest(`/users/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    // Update current user if it's the same user
    if (currentUser && currentUser.uid === uid) {
      if (updates.name) currentUser.displayName = updates.name;
      if (updates.photoURL !== undefined) currentUser.photoURL = updates.photoURL;
      notifyAuthStateListeners(currentUser);
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  authStateListeners.push(callback);

  // Immediately call with current state
  callback(currentUser);

  // Return unsubscribe function
  return () => {
    authStateListeners = authStateListeners.filter(listener => listener !== callback);
  };
};

/**
 * Notify all auth state listeners
 */
const notifyAuthStateListeners = (user: User | null) => {
  authStateListeners.forEach(listener => listener(user));
};

// Initialize auth on module load
initializeAuth();
