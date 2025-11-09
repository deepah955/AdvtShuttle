# Testing Guide - Shuttle Tracker Firebase Integration

## Overview

This guide provides comprehensive testing instructions for the Firebase-integrated shuttle tracking system.

## Prerequisites

1. Firebase project is set up with the provided configuration
2. Firebase Security Rules are deployed (see FIREBASE_SETUP.md)
3. Development server is running: `npm run dev`
4. Test devices/browsers are ready

## Test Scenarios

### 1. User Authentication Flow

#### Test 1.1: Student/Employee Sign Up
**Steps:**
1. Open the app and select "Student / Employee"
2. Click "Sign Up" tab
3. Fill in:
   - Name: "Test Student"
   - Email: "test@vit.ac.in"
   - Password: "test123456"
   - Confirm Password: "test123456"
   - Registration Number: "21BCE1234"
4. Click "Sign Up"

**Expected Result:**
- Account created successfully
- User redirected to onboarding screen
- User data stored in Firebase under `/users/{uid}`

#### Test 1.2: Driver Sign Up
**Steps:**
1. Open the app and select "Driver"
2. Click "Sign Up" tab
3. Fill in:
   - Name: "Test Driver"
   - Email: "driver@example.com"
   - Password: "test123456"
   - Confirm Password: "test123456"
   - Employee ID: "EMP001"
   - Phone: "+919876543210"
   - Vehicle Number: "TN01AB1234"
   - Upload a profile photo
4. Click "Sign Up"

**Expected Result:**
- Account created successfully
- Photo uploaded to Firebase Storage
- User redirected to driver onboarding
- Driver data stored in Firebase under `/drivers/{uid}`

#### Test 1.3: Login
**Steps:**
1. Open the app
2. Select user type (Student/Employee or Driver)
3. Enter email and password
4. Click "Login"

**Expected Result:**
- User authenticated successfully
- Redirected to appropriate home screen based on role
- Session persists across app restarts

#### Test 1.4: Logout
**Steps:**
1. Navigate to driver dashboard or profile screen
2. Click "Logout"
3. Confirm logout

**Expected Result:**
- User logged out
- Redirected to user type selection screen
- Session cleared

### 2. Driver Route Selection

#### Test 2.1: Select Route
**Steps:**
1. Login as driver
2. Navigate to driver dashboard
3. Click "Select Route"
4. Choose "LH/PRP Route"
5. Click "Confirm Selection"

**Expected Result:**
- Route saved to Firebase under `/drivers/{uid}/currentRoute`
- Success message displayed
- Returned to driver dashboard
- Selected route displayed on dashboard

#### Test 2.2: Cannot Start Shift Without Route
**Steps:**
1. Login as new driver (no route selected)
2. Click "Start Shift"

**Expected Result:**
- Alert displayed: "Please select a route before starting your shift"
- Option to navigate to route selection
- Shift does not start

#### Test 2.3: Cannot Change Route While On Shift
**Steps:**
1. Login as driver with active shift
2. Click "Select Route"

**Expected Result:**
- Alert displayed: "Please end your current shift before selecting a different route"
- Route selection screen not opened

### 3. Driver Shift Management

#### Test 3.1: Start Shift
**Steps:**
1. Login as driver
2. Select a route (if not already selected)
3. Click "Start Shift"
4. Grant location permissions if prompted

**Expected Result:**
- Shift status updated in Firebase: `/drivers/{uid}/isOnShift = true`
- Location tracking starts
- Location updates sent to Firebase every 5 seconds: `/shuttleLocations/{uid}`
- Success message: "You are now sharing your location"
- Button changes to "End Shift"

#### Test 3.2: Location Updates During Shift
**Steps:**
1. Start shift as driver
2. Move to different locations (or simulate movement)
3. Check Firebase Console

**Expected Result:**
- Location data updates in `/shuttleLocations/{uid}` every 5 seconds
- Data includes: lat, lon, speed, bearing, timestamp, routeId

#### Test 3.3: End Shift
**Steps:**
1. While on shift, click "End Shift"
2. Confirm in the alert dialog

**Expected Result:**
- Shift status updated: `/drivers/{uid}/isOnShift = false`
- Location tracking stops
- Location data removed from `/shuttleLocations/{uid}`
- Success message: "Location sharing has been stopped"
- Button changes to "Start Shift"

### 4. Student/Employee Map View

#### Test 4.1: View Active Shuttles
**Steps:**
1. Login as student/employee
2. Navigate to Map tab
3. Grant location permissions if prompted

**Expected Result:**
- Map displays with user's current location
- All active shuttles (drivers on shift) displayed with bus icons
- Blue bus icons for LH/PRP route
- Orange bus icons for MH route
- No shuttles shown for drivers who are off shift

#### Test 4.2: Real-Time Shuttle Updates
**Steps:**
1. Open map as student/employee
2. Have a driver start their shift
3. Watch the map

**Expected Result:**
- New shuttle appears on map immediately
- Shuttle position updates every 5 seconds
- Smooth marker movement

#### Test 4.3: Shuttle Details
**Steps:**
1. View map with active shuttles
2. Tap on a shuttle marker

**Expected Result:**
- Bottom sheet slides up
- Displays:
  - Driver name
  - Vehicle number
  - ETA (calculated)
  - Current speed
  - Next stop
- Can close by tapping X

#### Test 4.4: Shuttle Disappears When Shift Ends
**Steps:**
1. View map with active shuttles
2. Have a driver end their shift
3. Watch the map

**Expected Result:**
- Shuttle marker disappears from map immediately
- Bottom sheet closes if that shuttle was selected

### 5. Bus Icon Display

#### Test 5.1: Bus Icon Rendering
**Steps:**
1. View map with active shuttles
2. Zoom in and out

**Expected Result:**
- Bus icons display clearly at all zoom levels
- Icons maintain proper size and proportions
- Icons are distinguishable from each other

#### Test 5.2: Route-Specific Colors
**Steps:**
1. Have drivers on different routes start shifts
2. View map

**Expected Result:**
- LH/PRP route shuttles: Blue bus icons
- MH route shuttles: Orange bus icons
- Colors are clearly distinguishable

### 6. Session Management

#### Test 6.1: Session Persistence
**Steps:**
1. Login as any user
2. Close the app completely
3. Reopen the app

**Expected Result:**
- User remains logged in
- Redirected to appropriate home screen
- No need to login again

#### Test 6.2: Auto-Redirect on Launch
**Steps:**
1. Open app while logged in as driver
2. Open app while logged in as student

**Expected Result:**
- Driver: Redirected to driver dashboard
- Student: Redirected to map screen
- No intermediate screens shown

### 7. Error Handling

#### Test 7.1: Invalid Email
**Steps:**
1. Try to sign up with "invalidemail"

**Expected Result:**
- Error message: "Invalid email address"

#### Test 7.2: Weak Password
**Steps:**
1. Try to sign up with password "123"

**Expected Result:**
- Error message: "Password must be at least 6 characters"

#### Test 7.3: Email Already Exists
**Steps:**
1. Try to sign up with an existing email

**Expected Result:**
- Error message: "This email is already registered. Please login instead."

#### Test 7.4: Wrong Password
**Steps:**
1. Try to login with correct email but wrong password

**Expected Result:**
- Error message: "Invalid email or password"

#### Test 7.5: Location Permission Denied
**Steps:**
1. Deny location permissions
2. Try to start shift as driver

**Expected Result:**
- Error message: "Location permission not granted"
- Shift does not start

#### Test 7.6: Network Error
**Steps:**
1. Disconnect from internet
2. Try to perform any Firebase operation

**Expected Result:**
- Appropriate error message displayed
- App doesn't crash
- Can retry when connection restored

### 8. Data Validation

#### Test 8.1: Firebase Data Structure
**Steps:**
1. Perform various operations
2. Check Firebase Console

**Expected Result:**
- `/users/{uid}`: Contains user profile data
- `/drivers/{uid}`: Contains driver-specific data
- `/shuttleLocations/{uid}`: Contains real-time location data
- All required fields present
- Data types correct

#### Test 8.2: Security Rules
**Steps:**
1. Try to read another user's data
2. Try to write to another driver's location

**Expected Result:**
- Permission denied errors
- Operations fail as expected
- Security rules enforced

## Performance Testing

### Test P.1: Location Update Frequency
**Steps:**
1. Start shift as driver
2. Monitor Firebase Console
3. Count updates over 1 minute

**Expected Result:**
- Approximately 12 updates per minute (every 5 seconds)
- Consistent update frequency

### Test P.2: Multiple Concurrent Drivers
**Steps:**
1. Have 5+ drivers start shifts simultaneously
2. View map as student

**Expected Result:**
- All shuttles display correctly
- No performance degradation
- Smooth map interactions

### Test P.3: App Responsiveness
**Steps:**
1. Perform various operations
2. Measure response times

**Expected Result:**
- Authentication: < 2 seconds
- Route selection: < 1 second
- Shift start/stop: < 2 seconds
- Map updates: < 1 second

## Known Issues & Limitations

1. **Location Accuracy**: GPS accuracy depends on device and environment
2. **Battery Usage**: Continuous location tracking may drain battery
3. **Network Dependency**: Requires active internet connection
4. **Concurrent Edits**: Last write wins for conflicting updates

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Screenshots/videos if applicable
4. Device/browser information
5. Firebase Console logs
6. App console logs

## Success Criteria

All tests should pass with:
- ✅ No crashes or freezes
- ✅ Correct data in Firebase
- ✅ Smooth user experience
- ✅ Proper error handling
- ✅ Security rules enforced
- ✅ Real-time updates working
- ✅ Bus icons displaying correctly
