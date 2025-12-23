// API Configuration for Shuttle Tracker Backend

// IMPORTANT: Update this URL based on your environment
// For local development on same machine: http://localhost:5000
// For Expo on physical device: http://YOUR_COMPUTER_IP:5000
// For production: https://your-backend-url.com

export const API_URL = __DEV__
    ? 'http://localhost:5000/api'  // Development
    : 'https://your-production-url.com/api';  // Production

// Storage key for JWT token
export const TOKEN_STORAGE_KEY = '@shuttle_tracker_token';

/**
 * Get stored authentication token
 */
export const getStoredToken = async () => {
    try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
        console.error('Error getting stored token:', error);
        return null;
    }
};

/**
 * Store authentication token
 */
export const storeToken = async (token: string) => {
    try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
        console.error('Error storing token:', error);
    }
};

/**
 * Remove authentication token
 */
export const removeToken = async () => {
    try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
        console.error('Error removing token:', error);
    }
};

/**
 * Make authenticated API request
 */
export const apiRequest = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<any> => {
    try {
        console.log(`🌐 [API] Making request to: ${endpoint}`, {
            method: options.method || 'GET',
            hasBody: !!options.body
        });

        const token = await getStoredToken();
        console.log(`🔑 [API] Token status:`, token ? 'Present' : 'Missing');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const url = `${API_URL}${endpoint}`;
        console.log(`📍 [API] Full URL: ${url}`);

        const response = await fetch(url, {
            ...options,
            headers,
        });

        console.log(`📥 [API] Response status: ${response.status} ${response.statusText}`);

        const data = await response.json();
        console.log(`📦 [API] Response data:`, data);

        if (!response.ok) {
            const errorMsg = data.error || `HTTP ${response.status}: ${response.statusText}`;
            console.error(`❌ [API] Request failed:`, errorMsg);
            throw new Error(errorMsg);
        }

        console.log(`✅ [API] Request successful`);
        return data;
    } catch (error: any) {
        console.error(`❌ [API] Request Error [${endpoint}]:`, error);
        console.error(`❌ [API] Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        throw error;
    }
};
