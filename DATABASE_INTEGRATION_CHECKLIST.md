# Database Integration Checklist

Use this checklist to track your progress when integrating the new database.

## 🎯 Phase 1: Database Setup

- [ ] Choose database solution (Supabase, MongoDB, PostgreSQL, etc.)
- [ ] Create database project/instance
- [ ] Get connection credentials (API keys, connection strings)
- [ ] Create environment variables file (`.env.local`)
- [ ] Install database client library (`npm install ...`)

## 🗄️ Phase 2: Schema Creation

- [ ] Create `users` table/collection
  - [ ] uid (primary key)
  - [ ] email, name, role
  - [ ] registration_number, employee_id, phone
  - [ ] photo_url, vehicle_no
  - [ ] created_at timestamp

- [ ] Create `drivers` table/collection
  - [ ] driver_id (foreign key to users)
  - [ ] name, email, employee_id, phone
  - [ ] vehicle_no, photo_url
  - [ ] is_on_shift, current_route
  - [ ] created_at timestamp

- [ ] Create `shuttle_locations` table/collection
  - [ ] driver_id (foreign key to drivers)
  - [ ] route_id
  - [ ] lat, lon, speed, bearing
  - [ ] timestamp

- [ ] Create `user_routes` table/collection (optional)
  - [ ] user_id (foreign key to users)
  - [ ] selected_route
  - [ ] last_route_update timestamp

- [ ] Set up database indexes for performance
  - [ ] Index on users.email
  - [ ] Index on drivers.is_on_shift
  - [ ] Index on shuttle_locations.driver_id

## 🔐 Phase 3: Authentication Implementation

File: `services/auth.ts`

- [ ] Implement `signUp(email, password, userData)`
  - [ ] Create user account
  - [ ] Save user data to database
  - [ ] If driver, create driver record
  - [ ] Return user object

- [ ] Implement `signIn(email, password)`
  - [ ] Authenticate user
  - [ ] Return user object

- [ ] Implement `signOut()`
  - [ ] Clear user session
  - [ ] Clean up any local state

- [ ] Implement `getCurrentUser()`
  - [ ] Get current authenticated user
  - [ ] Return user or null

- [ ] Implement `getUserData(uid)`
  - [ ] Fetch user data from database
  - [ ] Return UserData object

- [ ] Implement `updateUserProfile(uid, updates)`
  - [ ] Update user data in database
  - [ ] Update auth profile if needed

- [ ] Implement `onAuthStateChange(callback)`
  - [ ] Set up auth state listener
  - [ ] Call callback on state changes
  - [ ] Return unsubscribe function

## 💾 Phase 4: Data Operations Implementation

File: `services/data.ts`

### User Data
- [ ] Implement `saveUserData(uid, userData)`
- [ ] Implement `getUserData(uid)`

### Driver Management
- [ ] Implement `updateDriverShiftStatus(driverId, isOnShift, routeId)`
- [ ] Implement `getDriverData(driverId)`
- [ ] Implement `updateDriverRoute(driverId, routeId)`
- [ ] Implement `updateDriverVehicleNumber(driverId, vehicleNo)`
- [ ] Implement `initializeDriverData(driverId)`

### Shuttle Tracking
- [ ] Implement `getActiveShuttles()`
  - [ ] Query drivers where is_on_shift = true
  - [ ] Join with shuttle_locations
  - [ ] Return array of Shuttle objects

- [ ] Implement `subscribeToActiveShuttles(callback)`
  - [ ] Set up real-time subscription
  - [ ] Call callback on data changes
  - [ ] Return unsubscribe function

- [ ] Implement `subscribeToDriverData(driverId, callback)`
  - [ ] Set up real-time subscription for driver
  - [ ] Call callback on data changes
  - [ ] Return unsubscribe function

### Route Management
- [ ] Implement `updateUserRoute(userId, routeId)`
- [ ] Implement `getUserRoute(userId)`

## 📍 Phase 5: Location Storage Implementation

File: `services/location.ts`

- [ ] Implement `updateLocation(driverId, location)`
  - [ ] Save location to database
  - [ ] Update or insert shuttle_locations record

- [ ] Implement `subscribeToShuttleLocations(callback)`
  - [ ] Set up real-time subscription
  - [ ] Call callback on location updates
  - [ ] Return unsubscribe function

- [ ] Update `stopLocationTracking(driverId)`
  - [ ] Remove location from database
  - [ ] Stop local tracking

## 🖼️ Phase 6: File Storage Implementation

File: `utils/imageUtils.ts`

- [ ] Choose storage solution (S3, Cloudinary, Supabase Storage, etc.)
- [ ] Set up storage bucket/container
- [ ] Configure access permissions
- [ ] Implement `uploadProfilePhoto(uri, userId)`
  - [ ] Convert image to blob/buffer
  - [ ] Upload to storage
  - [ ] Get public URL
  - [ ] Return download URL

## 🧪 Phase 7: Testing

### Authentication Tests
- [ ] Test user registration (student, employee, driver)
- [ ] Test user login
- [ ] Test user logout
- [ ] Test auth state persistence
- [ ] Test profile updates

### Data Tests
- [ ] Test driver shift start/stop
- [ ] Test route selection (driver and user)
- [ ] Test vehicle number updates
- [ ] Test shuttle tracking on map
- [ ] Test real-time updates

### Location Tests
- [ ] Test location tracking start
- [ ] Test location updates
- [ ] Test location tracking stop
- [ ] Test real-time location on map

### Storage Tests
- [ ] Test profile photo upload
- [ ] Test photo URL retrieval
- [ ] Test photo display in app

## 🚀 Phase 8: Deployment

- [ ] Set up production database
- [ ] Configure production environment variables
- [ ] Test in production environment
- [ ] Set up database backups
- [ ] Monitor database performance
- [ ] Set up error logging

## 📊 Progress Tracking

**Started**: ___________  
**Database Setup Complete**: ___________  
**Schema Created**: ___________  
**Auth Implemented**: ___________  
**Data Operations Implemented**: ___________  
**Location Storage Implemented**: ___________  
**File Storage Implemented**: ___________  
**Testing Complete**: ___________  
**Deployed**: ___________  

---

## 🆘 Need Help?

When you're ready to start implementing, share:
1. Which database solution you've chosen
2. Your database credentials (API keys, connection strings)
3. Any specific requirements or constraints

I'll help you implement each phase step by step!
