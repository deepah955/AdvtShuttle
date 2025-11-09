import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from './firebase';

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

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  userData: Omit<UserData, 'uid' | 'createdAt'>
): Promise<User> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: userData.name,
      photoURL: userData.photoURL || null
    });

    // Save user data to Realtime Database
    const completeUserData: UserData = {
      ...userData,
      uid: user.uid,
      email: user.email!,
      createdAt: Date.now()
    };

    const userRef = ref(database, `users/${user.uid}`);
    await set(userRef, completeUserData);

    // If driver, also save to drivers collection
    if (userData.role === 'driver') {
      const driverRef = ref(database, `drivers/${user.uid}`);
      await set(driverRef, {
        name: userData.name,
        email: user.email,
        employeeId: userData.employeeId,
        phone: userData.phone,
        vehicleNo: userData.vehicleNo,
        photoURL: userData.photoURL,
        isOnShift: false,
        currentRoute: null,
        createdAt: Date.now()
      });
    }

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
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
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Get user data from database
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as UserData;
    }
    return null;
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
    const userRef = ref(database, `users/${uid}`);
    await set(userRef, updates);

    // Update auth profile if name or photo changed
    const user = auth.currentUser;
    if (user && (updates.name || updates.photoURL)) {
      await updateProfile(user, {
        displayName: updates.name || user.displayName,
        photoURL: updates.photoURL || user.photoURL
      });
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
  return onAuthStateChanged(auth, callback);
};
