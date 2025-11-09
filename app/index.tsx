import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If user is authenticated, redirect based on role
  if (user && userData) {
    if (userData.role === 'driver') {
      return <Redirect href="/driver-home" />;
    } else {
      return <Redirect href="/(tabs)/map" />;
    }
  }

  // Not authenticated, go to user type selection
  return <Redirect href="/user-type" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});