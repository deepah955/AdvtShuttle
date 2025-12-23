import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Truck, MapPin, Settings, LogOut } from 'lucide-react-native';
import { getCurrentUser, signOut, getUserData } from '@/services/auth';
import { getDriverData, subscribeToDriverData, updateDriverShiftStatus, updateDriverVehicleNumber } from '@/services/data';
import { startLocationTracking, stopLocationTracking } from '@/services/location';

export default function DriverHomeScreen() {
  const [isOnShift, setIsOnShift] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('Driver');
  const [loading, setLoading] = useState(true);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [showVehicleInput, setShowVehicleInput] = useState(false);
  const [justSelectedRoute, setJustSelectedRoute] = useState(false);
  const isUpdatingShiftRef = useRef(false); // Use ref to prevent subscription from overriding user actions

  // Get navigation parameters
  const params = useLocalSearchParams();
  const routeFromNav = params.selectedRoute as string;
  const routeNameFromNav = params.routeName as string;
  const fromRouteSelection = params.fromRouteSelection as string;

  // Initial load - always load driver data, but respect navigation params for route
  useEffect(() => {
    // Always load driver data (user name, shift status, vehicle, etc.)
    // But navigation params will take priority for route selection
    loadDriverData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle immediate route synchronization from navigation - PRIORITY: HIGH
  // This effect runs whenever navigation params change
  useEffect(() => {
    console.log('🔄 [DRIVER HOME] Navigation params changed:', {
      routeFromNav,
      routeNameFromNav,
      fromRouteSelection
    });

    if (routeFromNav && fromRouteSelection === 'true') {
      console.log('🎯 [DRIVER HOME] Route received from navigation:', routeFromNav, routeNameFromNav);

      // Immediately update UI with the selected route - no delays
      setSelectedRoute(routeFromNav);
      setJustSelectedRoute(true);
      setLoading(false); // Ensure loading is false so UI renders immediately

      console.log('✅ [DRIVER HOME] Route synchronized immediately from navigation');

      // Show success message after a brief delay to ensure screen is visible
      const alertTimeout = setTimeout(() => {
        Alert.alert(
          '✅ Route Selected Successfully!',
          `${routeNameFromNav || routeFromNav} has been selected and is now active.`,
          [{ text: 'OK' }]
        );
      }, 500);

      // Remove the "just selected" indicator after 5 seconds
      const indicatorTimeout = setTimeout(() => {
        setJustSelectedRoute(false);
      }, 5000);

      // Cleanup timeouts on unmount
      return () => {
        clearTimeout(alertTimeout);
        clearTimeout(indicatorTimeout);
      };
    } else if (routeFromNav) {
      // Route from nav but not from route selection - still use it
      console.log('🎯 [DRIVER HOME] Route from navigation (non-selection):', routeFromNav);
      setSelectedRoute(routeFromNav);
      setLoading(false);
    }
  }, [routeFromNav, routeNameFromNav, fromRouteSelection]);

  // Reload data when screen comes into focus (but not when coming from route selection)
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 [DRIVER HOME] Screen focused, fromRouteSelection:', fromRouteSelection);

      // If coming from route selection, ensure route is set immediately
      if (fromRouteSelection === 'true' && routeFromNav) {
        console.log('✅ [DRIVER HOME] Setting route immediately from navigation params');
        setSelectedRoute(routeFromNav);
        setJustSelectedRoute(true);
        setLoading(false);
        // Don't reload data - use the navigation params instead
        return;
      }

      // Only reload if not coming from route selection (to avoid overriding fresh data)
      if (fromRouteSelection !== 'true') {
        console.log('🔄 [DRIVER HOME] Reloading data on focus');
        loadDriverData();
      } else {
        console.log('⏭️ [DRIVER HOME] Skipping reload - fresh route data from navigation');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromRouteSelection, routeFromNav])
  );
//hello
  // Subscribe to real-time driver data updates
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    console.log('📡 [DRIVER HOME] Setting up real-time driver data subscription');

    const unsubscribe = subscribeToDriverData(user.uid, (driverData) => {
      if (driverData) {
        console.log('📡 [DRIVER HOME] Real-time update received:', {
          isOnShift: driverData.isOnShift,
          isUpdatingShift: isUpdatingShiftRef.current,
          currentState: isOnShift
        });

        // CRITICAL: Only update from Firebase if we're not in the middle of a local update
        // This prevents race conditions where Firebase hasn't updated yet from our action
        if (!isUpdatingShiftRef.current) {
          // Only update if state is different (avoid unnecessary updates)
          if (driverData.isOnShift !== isOnShift) {
            console.log('✅ [DRIVER HOME] Updating shift state from Firebase:', driverData.isOnShift);
            setIsOnShift(driverData.isOnShift);
          }
        } else {
          console.log('⏸️ [DRIVER HOME] Skipping Firebase update - local update in progress (user action)');
          // Don't update - user action takes priority
          return;
        }

        // Update vehicle number (safe to update)
        if (driverData.vehicleNo && driverData.vehicleNo !== vehicleNo) {
          setVehicleNo(driverData.vehicleNo);
        }

        // Priority: Navigation params > Real-time updates
        // Only update route from real-time if we don't have fresh navigation data
        const hasNavRoute = routeFromNav && fromRouteSelection === 'true';
        if (!hasNavRoute) {
          // No navigation route, use real-time data
          if (driverData.currentRoute && driverData.currentRoute !== selectedRoute) {
            setSelectedRoute(driverData.currentRoute);
            console.log('📡 [DRIVER HOME] Route updated from real-time:', driverData.currentRoute);
          }
        } else {
          // We have navigation route - verify it matches Firebase (should match)
          if (driverData.currentRoute && driverData.currentRoute !== routeFromNav) {
            console.log('⚠️ [DRIVER HOME] Route mismatch - nav:', routeFromNav, 'firebase:', driverData.currentRoute);
            // Update to match Firebase (source of truth)
            setSelectedRoute(driverData.currentRoute);
          } else {
            console.log('✅ [DRIVER HOME] Navigation route matches Firebase - keeping navigation route');
            setSelectedRoute(routeFromNav);
          }
        }

        // Update vehicle input visibility (only if not on shift)
        if (!driverData.isOnShift) {
          const shouldShowInput = !driverData.vehicleNo;
          setShowVehicleInput(shouldShowInput);
        } else {
          setShowVehicleInput(false);
        }
      }
    });

    return () => {
      console.log('🔌 [DRIVER HOME] Cleaning up driver data subscription');
      unsubscribe();
    };
  }, [routeFromNav, fromRouteSelection, isOnShift, vehicleNo, selectedRoute]);

  const loadDriverData = async () => {
    try {
      console.log('📊 [DRIVER HOME] Loading driver data...');
      const user = getCurrentUser();
      if (!user) {
        console.log('❌ [DRIVER HOME] No authenticated user, redirecting');
        router.replace('/user-type');
        return;
      }

      const userData = await getUserData(user.uid);
      if (userData) {
        setDriverName(userData.name);
        console.log('👤 [DRIVER HOME] User name loaded:', userData.name);
      }

      const driverData = await getDriverData(user.uid);
      if (driverData) {
        console.log('📊 [DRIVER HOME] Driver data loaded:', {
          isOnShift: driverData.isOnShift,
          currentRoute: driverData.currentRoute,
          vehicleNo: driverData.vehicleNo
        });

        setIsOnShift(driverData.isOnShift);
        setVehicleNo(driverData.vehicleNo || '');

        // Priority handling: Navigation params take precedence over Firebase data
        // Check if we're coming from route selection with fresh route data
        const hasNavRoute = routeFromNav && fromRouteSelection === 'true';
        if (hasNavRoute) {
          // We have navigation route - ALWAYS use it (don't let Firebase override)
          // This ensures the route selected by user is immediately visible
          setSelectedRoute(routeFromNav);
          console.log('✅ [DRIVER HOME] Using navigation route (priority):', routeFromNav);

          // Verify Firebase matches (it should after save completes)
          // But don't override - navigation params are the source of truth when present
          if (driverData.currentRoute && driverData.currentRoute !== routeFromNav) {
            console.log('⚠️ [DRIVER HOME] Firebase route differs - keeping navigation route, will sync via real-time');
          } else if (driverData.currentRoute === routeFromNav) {
            console.log('✅ [DRIVER HOME] Firebase route matches navigation route - perfect sync!');
          }
        } else {
          // No navigation route - use Firebase data as normal
          if (driverData.currentRoute) {
            setSelectedRoute(driverData.currentRoute);
            console.log('📊 [DRIVER HOME] Route updated from Firebase:', driverData.currentRoute);
          }
        }

        // Show vehicle input if no vehicle number and not on shift
        const shouldShowInput = !driverData.vehicleNo && !driverData.isOnShift;
        setShowVehicleInput(shouldShowInput);
        console.log('🚗 [DRIVER HOME] Should show vehicle input:', shouldShowInput);
      } else {
        // New driver - show vehicle input
        // But if we have navigation route, keep it
        if (routeFromNav && fromRouteSelection === 'true') {
          setSelectedRoute(routeFromNav);
          console.log('✅ [DRIVER HOME] New driver but has navigation route:', routeFromNav);
        }
        setShowVehicleInput(true);
        console.log('🆕 [DRIVER HOME] New driver - showing vehicle input');
      }
    } catch (error) {
      console.error('❌ [DRIVER HOME] Load driver data error:', error);
    } finally {
      // Always set loading to false - navigation effect will ensure route is set immediately
      // if we have navigation params
      setLoading(false);
    }
  };

  const handleStartShift = async () => {
    if (!selectedRoute) {
      Alert.alert(
        '⚠️ No Route Selected',
        'Please select a route before starting your shift.',
        [
          {
            text: 'Select Route',
            onPress: () => router.push('/driver-route-selection')
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    if (!vehicleNo || vehicleNo.trim().length === 0) {
      Alert.alert(
        '⚠️ Vehicle Number Required',
        'Please enter your vehicle number before starting your shift.'
      );
      setShowVehicleInput(true);
      return;
    }

    // Prevent double-clicking
    if (shiftLoading || isOnShift) {
      console.log('⏸️ [START SHIFT] Already on shift or loading, ignoring click');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      Alert.alert('❌ Error', 'User not authenticated');
      return;
    }

    console.log('🚀 [START SHIFT] Starting shift for driver:', user.uid);
    console.log('🚀 [START SHIFT] Route:', selectedRoute);
    console.log('🚀 [START SHIFT] Vehicle:', vehicleNo);

    // CRITICAL: Update UI state IMMEDIATELY for instant feedback
    console.log('🔄 [START SHIFT] Updating UI state immediately');
    setIsOnShift(true);
    setShowVehicleInput(false);
    setShiftLoading(true);
    isUpdatingShiftRef.current = true; // Block subscription updates

    // Backend update in background (non-blocking)
    const updateBackend = async () => {
      try {
        // Update vehicle number and shift status
        await updateDriverVehicleNumber(user.uid, vehicleNo.trim());
        await updateDriverShiftStatus(user.uid, true, selectedRoute);
        console.log('✅ [START SHIFT] Backend updated successfully');

        // Start location tracking after Firebase update
        try {
          await startLocationTracking(user.uid, selectedRoute);
          console.log('✅ [START SHIFT] Location tracking started');
        } catch (locationError: any) {
          console.error('⚠️ [START SHIFT] Location tracking error:', locationError);
          // Location will retry - don't fail the shift start
        }

        // Clear loading state first (button will now show "End Shift")
        setShiftLoading(false);

        // Allow subscription updates after Firebase is synced (3 seconds to ensure sync)
        setTimeout(() => {
          isUpdatingShiftRef.current = false;
          console.log('✅ [START SHIFT] Allowing subscription updates - state should be synced');
        }, 3000);

        // Show success message after a brief delay
        setTimeout(() => {
          Alert.alert('✅ Shift Started', 'You are now sharing your location with students and employees.');
        }, 500);
      } catch (error: any) {
        console.error('❌ [START SHIFT] Firebase update error:', error);
        setShiftLoading(false);
        // Only revert UI state on critical errors (network issues, etc.)
        // For minor errors, keep the shift started state
        if (error.code === 'network-error' || error.code === 'permission-denied') {
          setIsOnShift(false);
          setShowVehicleInput(true);
          isUpdatingShiftRef.current = false;
          Alert.alert('❌ Error', error.message || 'Failed to start shift. Please check your connection and try again.');
        } else {
          // For other errors, keep shift started but log the error
          console.warn('⚠️ [START SHIFT] Minor error but shift remains active:', error);
          isUpdatingShiftRef.current = false;
          // Try to update backend again in background
          setTimeout(async () => {
            try {
              await updateDriverShiftStatus(user.uid, true, selectedRoute);
            } catch (retryError) {
              console.error('❌ [START SHIFT] Retry update failed:', retryError);
            }
          }, 1000);
        }
      }
    };

    // Start backend update in background
    updateBackend();
  };

  const confirmEndShift = () => {
    const user = getCurrentUser();
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('❌ Error: User not authenticated');
      } else {
        Alert.alert('❌ Error', 'User not authenticated');
      }
      return;
    }

    console.log('✅ [END SHIFT] User confirmed - ending shift for driver:', user.uid);

    // CRITICAL: Update UI state IMMEDIATELY for instant feedback
    console.log('🔄 [END SHIFT] Updating UI state immediately');
    setIsOnShift(false);
    setShiftLoading(true);
    isUpdatingShiftRef.current = true; // Block subscription updates

    // Backend update in background (non-blocking)
    const updateBackend = async () => {
      try {
        console.log('🔄 [END SHIFT] Step 1: Stopping location tracking...');
        // Stop location tracking first
        try {
          await stopLocationTracking(user.uid);
          console.log('✅ [END SHIFT] Location tracking stopped successfully');
        } catch (locationError: any) {
          console.error('⚠️ [END SHIFT] Location stop error:', locationError);
          // Continue even if location stop fails
        }

        console.log('🔄 [END SHIFT] Step 2: Updating backend shift status...');
        console.log('🔄 [END SHIFT] Calling updateDriverShiftStatus with:', {
          driverId: user.uid,
          isOnShift: false,
          routeId: null
        });

        // Update shift status in backend
        await updateDriverShiftStatus(user.uid, false, null);
        console.log('✅ [END SHIFT] Backend updated successfully');

        // Clear loading state first (button will now show "Start Shift")
        setShiftLoading(false);

        // Allow subscription updates after backend is synced (3 seconds to ensure sync)
        setTimeout(() => {
          isUpdatingShiftRef.current = false;
          console.log('✅ [END SHIFT] Allowing subscription updates - state should be synced');
        }, 3000);

        // Show success message after a brief delay
        setTimeout(() => {
          if (Platform.OS === 'web') {
            window.alert('✅ Shift Ended Successfully!\n\nLocation sharing has been stopped. You can now select a different route.');
          } else {
            Alert.alert('✅ Shift Ended Successfully!', 'Location sharing has been stopped. You can now select a different route.');
          }
        }, 500);
      } catch (error: any) {
        console.error('❌ [END SHIFT] Backend update error:', error);
        console.error('❌ [END SHIFT] Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });

        setShiftLoading(false);

        // Show detailed error to user
        const errorMessage = error.message || 'Unknown error occurred';
        console.log('❌ [END SHIFT] Showing error alert to user:', errorMessage);

        // Check if it's a network error
        if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
          if (Platform.OS === 'web') {
            window.alert('❌ Network Error\n\nCould not connect to the server. Please check:\n\n1. Backend server is running\n2. Your internet connection\n3. API URL is correct\n\nShift status updated locally, but may not sync until connection is restored.');
          } else {
            Alert.alert(
              '❌ Network Error',
              'Could not connect to the server. Please check:\n\n1. Backend server is running\n2. Your internet connection\n3. API URL is correct\n\nShift status updated locally, but may not sync until connection is restored.',
              [{ text: 'OK' }]
            );
          }
          // Keep shift ended locally
          isUpdatingShiftRef.current = false;
        } else if (error.code === 'permission-denied') {
          // Revert state for permission errors
          setIsOnShift(true);
          isUpdatingShiftRef.current = false;
          if (Platform.OS === 'web') {
            window.alert('❌ Permission Denied\n\nYou do not have permission to end this shift. Please contact support.');
          } else {
            Alert.alert(
              '❌ Permission Denied',
              'You do not have permission to end this shift. Please contact support.',
              [{ text: 'OK' }]
            );
          }
        } else {
          // For other errors, keep shift ended but show warning
          console.warn('⚠️ [END SHIFT] Non-critical error, keeping shift ended:', error);
          isUpdatingShiftRef.current = false;

          if (Platform.OS === 'web') {
            window.alert(`⚠️ Warning\n\nShift ended locally, but server update failed:\n\n${errorMessage}\n\nRetrying in background...`);
          } else {
            Alert.alert(
              '⚠️ Warning',
              `Shift ended locally, but server update failed:\n\n${errorMessage}\n\nRetrying in background...`,
              [{ text: 'OK' }]
            );
          }

          // Try to update backend again in background
          setTimeout(async () => {
            try {
              console.log('🔄 [END SHIFT] Retrying backend update...');
              await updateDriverShiftStatus(user.uid, false, null);
              console.log('✅ [END SHIFT] Retry successful');
            } catch (retryError) {
              console.error('❌ [END SHIFT] Retry update failed:', retryError);
            }
          }, 1000);
        }
      }
    };

    // Start backend update in background
    updateBackend();
  };

  const handleEndShift = async () => {
    console.log('🛑 [END SHIFT] Button clicked');
    
    // Prevent double-clicking
    if (shiftLoading) {
      console.log('⏸️ [END SHIFT] Already loading, ignoring click');
      return;
    }

    if (!isOnShift) {
      console.log('⏸️ [END SHIFT] Not on shift, ignoring click');
      if (Platform.OS === 'web') {
        window.alert('⚠️ Not On Shift\n\nYou are not currently on shift.');
      } else {
        Alert.alert('⚠️ Not On Shift', 'You are not currently on shift.');
      }
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('❌ Error: User not authenticated');
      } else {
        Alert.alert('❌ Error', 'User not authenticated');
      }
      return;
    }

    console.log('✅ [END SHIFT] Showing confirmation alert');

    // Use web-compatible confirmation
    if (Platform.OS === 'web') {
      // Use window.confirm for web (works reliably)
      const confirmed = window.confirm('Are you sure you want to end your shift? Location sharing will stop.');
      if (confirmed) {
        confirmEndShift();
      } else {
        console.log('❌ [END SHIFT] User cancelled');
      }
    } else {
      // Use Alert.alert for mobile
      Alert.alert(
        'End Shift',
        'Are you sure you want to end your shift? Location sharing will stop.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              console.log('❌ [END SHIFT] User cancelled');
            }
          },
          {
            text: 'End Shift',
            style: 'destructive',
            onPress: confirmEndShift
          }
        ],
        { cancelable: true }
      );
    }
  };

  const handleSelectRoute = () => {
    if (isOnShift) {
      Alert.alert(
        'End Shift First',
        'Please end your current shift before selecting a different route.',
        [{ text: 'OK' }]
      );
      return;
    }
    console.log('Navigating to route selection...');
    router.push('/driver-route-selection');
  };

  const handleLogout = async () => {
    if (isOnShift) {
      Alert.alert(
        'End Shift First',
        'Please end your shift before logging out.',
        [{ text: 'OK' }]
      );
      return;
    }

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
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Don't show loading screen if we have navigation params (route selection)
  // This ensures immediate navigation works
  const shouldShowLoading = loading && !(routeFromNav && fromRouteSelection === 'true');

  if (shouldShowLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>Driver Dashboard</Text>
          <Text style={styles.welcomeText}>Welcome, {driverName}!</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={async () => {
            console.log('🔄 [DRIVER HOME] Manual refresh triggered');
            setLoading(true);

            // Force refresh from Firebase
            const user = getCurrentUser();
            if (user) {
              try {
                const freshData = await getDriverData(user.uid);
                if (freshData) {
                  console.log('📊 [DRIVER HOME] Fresh data loaded:', freshData);
                  setIsOnShift(freshData.isOnShift);
                  setSelectedRoute(freshData.currentRoute);
                  setVehicleNo(freshData.vehicleNo || '');
                  setJustSelectedRoute(false); // Clear the indicator

                  const shouldShowInput = !freshData.vehicleNo && !freshData.isOnShift;
                  setShowVehicleInput(shouldShowInput);

                  Alert.alert('✅ Refreshed', 'Data refreshed from server');
                }
              } catch (error) {
                console.error('❌ [DRIVER HOME] Refresh error:', error);
                Alert.alert('❌ Error', 'Failed to refresh data');
              }
            }
            setLoading(false);
          }}
        >
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <Truck size={48} color={isOnShift ? '#34C759' : '#FF9500'} />
        <Text style={styles.statusText}>
          {isOnShift ? 'On Shift - Sharing Location' : 'Off Shift'}
        </Text>
        {selectedRoute && (
          <View style={styles.routeContainer}>
            <Text style={styles.routeText}>
              Route: {selectedRoute === 'lh-prp' ? 'LH/PRP Route' : 'MH Route'}
            </Text>
            {justSelectedRoute && (
              <Text style={styles.justSelectedIndicator}>✨ Just Selected!</Text>
            )}
          </View>
        )}
        {vehicleNo && !showVehicleInput && (
          <Text style={styles.vehicleText}>
            Vehicle: {vehicleNo}
          </Text>
        )}
        {!selectedRoute && !isOnShift && (
          <Text style={styles.warningText}>⚠️ Please select a route first</Text>
        )}

        {/* Vehicle Number Section - Always show when not on shift */}
        {!isOnShift && (
          <View style={styles.vehicleSection}>
            <Text style={styles.vehicleSectionTitle}>Vehicle Information</Text>

            {showVehicleInput ? (
              <View style={styles.vehicleInputContainer}>
                <TextInput
                  style={styles.vehicleInput}
                  placeholder="Enter Vehicle Number (e.g., TN01AB1234)"
                  value={vehicleNo}
                  onChangeText={setVehicleNo}
                  autoCapitalize="characters"
                  testID="vehicle-number-input"
                />
                <TouchableOpacity
                  style={[styles.saveVehicleButton, vehicleNo.length === 0 && styles.saveVehicleButtonDisabled]}
                  onPress={async () => {
                    if (vehicleNo.trim().length > 0) {
                      try {
                        const user = getCurrentUser();
                        if (user) {
                          await updateDriverVehicleNumber(user.uid, vehicleNo.trim());
                          console.log('✅ Vehicle number saved to backend');
                        }
                        setShowVehicleInput(false);
                      } catch (error) {
                        console.error('Error saving vehicle number:', error);
                        Alert.alert('Error', 'Failed to save vehicle number. Please try again.');
                      }
                    }
                  }}
                  disabled={vehicleNo.length === 0}
                >
                  <Text style={styles.saveVehicleText}>✓</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.vehicleDisplayContainer}>
                {vehicleNo ? (
                  <>
                    <Text style={styles.vehicleDisplayText}>Vehicle: {vehicleNo}</Text>
                    <TouchableOpacity
                      style={styles.editVehicleButton}
                      onPress={() => setShowVehicleInput(true)}
                    >
                      <Text style={styles.editVehicleText}>Edit</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.addVehicleButton}
                    onPress={() => setShowVehicleInput(true)}
                  >
                    <Text style={styles.addVehicleText}>+ Add Vehicle Number</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Show vehicle info when on shift */}
        {isOnShift && vehicleNo && (
          <Text style={styles.vehicleText}>Vehicle: {vehicleNo}</Text>
        )}
        <TouchableOpacity
          style={[
            styles.shiftButton,
            isOnShift && styles.endShiftButton,
            shiftLoading && styles.buttonDisabled
          ]}
          onPress={isOnShift ? handleEndShift : handleStartShift}
          disabled={shiftLoading}
          testID="shift-button"
        >
          {shiftLoading ? (
            <View style={styles.shiftButtonLoading}>
              <ActivityIndicator color="white" size="small" />
              <Text style={[styles.shiftButtonText, { marginLeft: 10 }]}>
                {isOnShift ? 'Ending...' : 'Starting...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.shiftButtonText}>
              {isOnShift ? 'End Shift' : 'Start Shift'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSelectRoute} testID="route-button">
          <MapPin size={24} color="#007AFF" />
          <Text style={styles.actionText}>Select Route</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/driver-map')} testID="map-button">
          <Truck size={24} color="#007AFF" />
          <Text style={styles.actionText}>View Map</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} testID="settings-button">
          <Settings size={20} color="#666" />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleLogout} testID="logout-button">
          <LogOut size={20} color="#FF3B30" />
          <Text style={[styles.footerText, { color: '#FF3B30' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#34C759',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  refreshButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  refreshText: {
    fontSize: 20,
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
  routeContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  routeText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  justSelectedIndicator: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginTop: 3,
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  vehicleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    marginTop: 10,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  vehicleSection: {
    width: '100%',
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  vehicleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  vehicleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  vehicleInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  saveVehicleButton: {
    backgroundColor: '#34C759',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveVehicleButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveVehicleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  vehicleDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleDisplayText: {
    fontSize: 16,
    color: '#495057',
    flex: 1,
  },
  editVehicleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  editVehicleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  addVehicleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  addVehicleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
  },
  shiftButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endShiftButton: {
    backgroundColor: '#FF3B30',
  },
  shiftButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  actionText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerButton: {
    alignItems: 'center',
  },
  footerText: {
    marginTop: 5,
    fontSize: 14,
  },
});