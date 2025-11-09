# Implementation Plan

- [x] 1. Install Firebase dependencies and initialize configuration


  - Install firebase package using npm
  - Create services/firebase.ts with Firebase configuration
  - Initialize Firebase app, auth, database, and storage
  - Add Firebase config to environment variables or constants
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_



- [ ] 2. Create authentication service
  - Create services/auth.ts file
  - Implement signUp function with email/password and user data storage
  - Implement signIn function with Firebase Authentication
  - Implement signOut function
  - Implement getCurrentUser function to get authenticated user
  - Implement updateUserProfile function


  - Add auth state listener for session management
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Create data service for user and shuttle data
  - Create services/data.ts file
  - Implement saveUserData function to store user profiles in Realtime Database
  - Implement getUserData function to fetch user profiles


  - Implement updateDriverShiftStatus function
  - Implement getActiveShuttles function
  - Implement subscribeToActiveShuttles function with real-time listener
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Create location tracking service
  - Create services/location.ts file



  - Implement startLocationTracking function with GPS tracking every 5 seconds
  - Implement stopLocationTracking function
  - Implement updateLocation function to write to Firebase
  - Implement subscribeToShuttleLocations function
  - Implement unsubscribeFromShuttleLocations function


  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Create image utilities for bus icon
  - Create utils/imageUtils.ts file
  - Implement loadBusImage function to load bus.png from assets
  - Implement createColoredBusMarker function to apply route colors
  - Implement uploadProfilePhoto function for Firebase Storage


  - Test bus icon loading and color application
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Update authentication screens to use Firebase
  - Update app/auth.tsx to use auth service for sign up
  - Update app/auth.tsx to use auth service for sign in
  - Add proper error handling and user feedback


  - Implement email validation for VIT domain (students)
  - Store user data in Firebase after successful sign up
  - Navigate to appropriate screen after authentication
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_



- [ ] 7. Update driver dashboard for shift management
  - Update app/driver-home.tsx to use location service
  - Implement Start Shift button to begin location tracking
  - Implement End Shift button to stop location tracking
  - Update shift status in Firebase when starting/ending shift
  - Ensure route is selected before allowing shift start


  - Display current shift status from Firebase
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4_

- [ ] 8. Update driver route selection to persist in Firebase
  - Update app/driver-route-selection.tsx to save route to Firebase
  - Store selected route in driver's profile
  - Associate route with driver's location updates


  - Validate route selection before confirming
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Update MapView component to use bus.png icon
  - Update components/MapView.tsx to load bus.png image
  - Replace SVG shuttle icons with bus.png image


  - Apply route-specific colors to bus icon (blue for LH/PRP, orange for MH)
  - Ensure icon displays correctly at different zoom levels
  - Test icon rendering on both web and mobile platforms
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Update MapView to subscribe to real-time shuttle locations


  - Update components/MapView.tsx to use subscribeToShuttleLocations
  - Replace mockShuttles with real-time data from Firebase
  - Filter shuttles to only show those with isOnShift === true
  - Update shuttle markers when location data changes
  - Unsubscribe from Firebase listeners on component unmount



  - Handle connection errors and display appropriate messages
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 11. Update map screen to use Firebase data
  - Update app/(tabs)/map.tsx to remove mock data simulation
  - Subscribe to real-time shuttle locations from Firebase
  - Display only active shuttles (drivers on shift)
  - Handle loading states while fetching data
  - Implement error handling for data fetch failures
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 12. Implement session management and protected routes
  - Create auth context or hook for managing user session
  - Add auth state listener to check if user is logged in
  - Redirect to login if user is not authenticated
  - Redirect to appropriate home screen based on user role
  - Persist auth state across app restarts
  - _Requirements: 1.4, 1.5_

- [ ] 13. Add Firebase Security Rules
  - Configure Firebase Realtime Database security rules
  - Set read/write permissions for users, drivers, and shuttle locations
  - Configure Firebase Storage security rules for profile photos
  - Test security rules to ensure proper access control
  - _Requirements: 2.5, 7.2_

- [ ] 14. Test complete authentication and tracking flow
  - Test user sign up with email and password
  - Test user sign in and session persistence
  - Test driver shift start with location tracking
  - Test real-time location updates appearing on student map
  - Test driver shift end and location removal
  - Test bus icon display with correct colors for different routes
  - Verify all user data is stored correctly in Firebase
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_