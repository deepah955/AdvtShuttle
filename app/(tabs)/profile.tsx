import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LogOut, Settings, User, Mail, Hash, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/auth';
import { getUserRoute } from '@/services/data';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, userData } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserRoute();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserRoute = async () => {
    try {
      if (user) {
        const route = await getUserRoute(user.uid);
        setSelectedRoute(route);
      }
    } catch (error) {
      console.error('Error loading user route:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/user-type');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Profile</Text>
      
      {/* User Info Section */}
      <View style={styles.section}>
        <View style={styles.profileHeader}>
          {userData?.photoURL ? (
            <Image source={{ uri: userData.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <User size={40} color="#007AFF" />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData?.name || 'User'}</Text>
            <Text style={styles.profileRole}>
              {userData?.role === 'driver' ? 'Driver' : userData?.role === 'student' ? 'Student' : 'Employee'}
            </Text>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.section}>
        <View style={styles.detailRow}>
          <Mail size={20} color="#007AFF" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{userData?.email || user?.email || 'N/A'}</Text>
          </View>
        </View>
        
        {userData?.registrationNumber && (
          <View style={styles.detailRow}>
            <Hash size={20} color="#007AFF" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Registration Number</Text>
              <Text style={styles.detailValue}>{userData.registrationNumber}</Text>
            </View>
          </View>
        )}
        
        {userData?.employeeId && (
          <View style={styles.detailRow}>
            <Hash size={20} color="#007AFF" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Employee ID</Text>
              <Text style={styles.detailValue}>{userData.employeeId}</Text>
            </View>
          </View>
        )}
        
        {selectedRoute && (
          <View style={styles.detailRow}>
            <MapPin size={20} color="#007AFF" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Selected Route</Text>
              <Text style={styles.detailValue}>
                {selectedRoute === 'lh-prp' ? 'LH/PRP Route' : 'MH Route'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.option}>
          <Settings size={24} color="#007AFF" />
          <Text style={styles.optionText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <LogOut size={24} color="#FF3B30" />
          <Text style={[styles.optionText, { color: '#FF3B30' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 30,
    color: '#007AFF',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  detailContent: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 15,
  },
});