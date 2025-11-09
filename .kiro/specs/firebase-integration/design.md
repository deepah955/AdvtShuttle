# Design Document

## Overview

This design implements a complete Firebase-based authentication and real-time shuttle tracking system. The system will replace mock data with Firebase Realtime Database, implement email/password authentication, use the bus.png image for shuttle markers, and synchronize driver locations in real-time with student/employee map views.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Authentication│  │   Realtime   │  │   Storage    │      │
│  │   (Email/PW)  │  │   Database   │  │  (Photos)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │Location Service│ │ Data Service │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth Screens│  │  Map Views   │  │Driver Dashboard│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Firebase Configuration Service

**File**: `services/firebase.ts`

```typescript
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Initialize Firebase app
// Export auth, database, and storage instances
```

### 2. Authentication Service

**File**: `services/auth.ts`

```typescript
interface UserData {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'employee' | 'driver';
  registrationNumber?: string;
  employeeId?: string;
  phone?: string;
  photoURL?: string;
  createdAt: number;
}

// Functions:
// - signUp(email, password, userData)
// - signIn(email, password)
// - signOut()
// - getCurrentUser()
// - updateUserProfile(userData)
```

### 3. Location Tracking Service

**File**: `services/location.ts`

```typescript
interface DriverLocation {
  driverId: string;
  routeId: string;
  lat: number;
  lon: number;
  speed: number;
  bearing: number;
  timestamp: number;
  isOnShift: boolean;
}

// Functions:
// - startLocationTracking(driverId, routeId)
// - stopLocationTracking(driverId)
// - updateLocation(driverId, location)
// - subscribeToShuttleLocations(callback)
// - unsubscribeFromShuttleLocations()
```

### 4. Data Service

**File**: `services/data.ts`

```typescript
interface ShuttleData {
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

// Functions:
// - saveUserData(uid, userData)
// - getUserData(uid)
// - updateDriverShiftStatus(driverId, isOnShift, routeId)
// - getActiveShuttles()
// - subscribeToActiveShuttles(callback)
```

### 5. Image Utilities

**File**: `utils/imageUtils.ts`

```typescript
// Functions:
// - loadBusImage(): Promise<string> // Load bus.png as base64
// - createColoredBusMarker(color: string): string // Apply color overlay
// - uploadProfilePhoto(uri: string, userId: string): Promise<string>
```

## Data Models

### Firebase Realtime Database Structure

```json
{
  "users": {
    "<uid>": {
      "email": "user@vit.ac.in",
      "name": "John Doe",
      "role": "student",
      "registrationNumber": "21BCE1234",
      "photoURL": "https://...",
      "createdAt": 1234567890
    }
  },
  "drivers": {
    "<driverId>": {
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "employeeId": "EMP001",
      "phone": "+919876543210",
      "vehicleNo": "TN01AB1234",
      "photoURL": "https://...",
      "isOnShift": true,
      "currentRoute": "lh-prp",
      "createdAt": 1234567890
    }
  },
  "shuttleLocations": {
    "<driverId>": {
      "lat": 12.9716,
      "lon": 79.1587,
      "speed": 30,
      "bearing": 45,
      "timestamp": 1234567890,
      "routeId": "lh-prp"
    }
  },
  "routes": {
    "lh-prp": {
      "name": "LH/PRP Route",
      "color": "#007AFF",
      "stops": ["VIT Main Gate", "LH Block", ...]
    }
  }
}
```

## Error Handling

### Authentication Errors
- Invalid email format → Display user-friendly message
- Wrong password → "Invalid credentials" message
- Email already exists → "Account already exists" message
- Network errors → "Connection error, please try again"

### Location Tracking Errors
- Permission denied → Request permissions with explanation
- GPS unavailable → Use last known location or default
- Firebase write failure → Retry with exponential backoff
- Location accuracy low → Display warning to user

### Data Synchronization Errors
- Connection lost → Show offline indicator
- Data fetch failure → Use cached data if available
- Real-time listener disconnected → Attempt reconnection

## Testing Strategy

### Unit Tests
- Test Firebase initialization
- Test authentication functions (sign up, sign in, sign out)
- Test location update logic
- Test data transformation functions
- Test image utility functions

### Integration Tests
- Test complete authentication flow
- Test location tracking start/stop
- Test real-time data synchronization
- Test shuttle marker updates on map
- Test shift status changes

### Manual Testing
- Verify email authentication works
- Confirm location updates in Firebase console
- Test map displays shuttles with bus.png icon
- Verify real-time updates between driver and student views
- Test shift start/stop functionality
- Verify route selection persists

## Implementation Details

### Bus Icon Implementation

The bus.png image will be used for all shuttle markers with route-specific color overlays:

1. Load bus.png from assets/images/bus.png
2. Convert to base64 data URL
3. Apply color filter using SVG or Canvas API
4. Use colored image as marker icon in MAPPLS

**Color Mapping**:
- LH/PRP Route: Blue (#007AFF)
- MH Route: Orange (#FF9500)

### Real-Time Location Updates

**Driver Side**:
1. When "Start Shift" clicked:
   - Request location permissions
   - Start GPS tracking (update every 5 seconds)
   - Write location to Firebase: `/shuttleLocations/<driverId>`
   - Update shift status: `/drivers/<driverId>/isOnShift = true`

2. When "End Shift" clicked:
   - Stop GPS tracking
   - Update shift status: `/drivers/<driverId>/isOnShift = false`
   - Remove location data: `/shuttleLocations/<driverId> = null`

**Student/Employee Side**:
1. Subscribe to `/shuttleLocations` on map screen mount
2. Filter shuttles where `isOnShift === true`
3. Update map markers when location data changes
4. Unsubscribe on screen unmount

### Authentication Flow

**Sign Up**:
1. Collect user data (email, password, name, etc.)
2. Create Firebase Auth account
3. Upload profile photo to Firebase Storage (if provided)
4. Save user data to Realtime Database
5. Navigate to onboarding screen

**Sign In**:
1. Authenticate with Firebase Auth
2. Fetch user data from Realtime Database
3. Store user session locally
4. Navigate to appropriate home screen based on role

**Session Management**:
- Use Firebase Auth state listener
- Persist auth state across app restarts
- Auto-redirect to home if already logged in

## Dependencies

### New Dependencies to Install
```json
{
  "firebase": "^10.x.x",
  "@react-native-firebase/app": "^18.x.x",
  "@react-native-firebase/auth": "^18.x.x",
  "@react-native-firebase/database": "^18.x.x",
  "@react-native-firebase/storage": "^18.x.x"
}
```

### Existing Dependencies
- expo-location: For GPS tracking
- expo-image-picker: For profile photos
- react-native-webview: For map rendering
- expo-router: For navigation

## Security Considerations

### Firebase Security Rules

**Authentication**:
- Require email verification for students (VIT email domain)
- Implement rate limiting for sign-up attempts

**Database Rules**:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "drivers": {
      "$driverId": {
        ".read": true,
        ".write": "$driverId === auth.uid"
      }
    },
    "shuttleLocations": {
      ".read": true,
      "$driverId": {
        ".write": "$driverId === auth.uid"
      }
    },
    "routes": {
      ".read": true,
      ".write": false
    }
  }
}
```

**Storage Rules**:
- Only authenticated users can upload
- Limit file size to 5MB
- Only allow image file types

## Migration Strategy

1. **Phase 1**: Set up Firebase and authentication
   - Initialize Firebase configuration
   - Implement auth service
   - Update auth screens to use Firebase

2. **Phase 2**: Implement data storage
   - Create data service
   - Migrate user data to Firebase
   - Update profile screens

3. **Phase 3**: Implement location tracking
   - Create location service
   - Update driver dashboard for real-time tracking
   - Test location updates in Firebase

4. **Phase 4**: Update map views
   - Implement bus.png icon loading
   - Subscribe to real-time shuttle locations
   - Update MapView component
   - Test synchronization between driver and student views

5. **Phase 5**: Testing and refinement
   - End-to-end testing
   - Performance optimization
   - Bug fixes and polish