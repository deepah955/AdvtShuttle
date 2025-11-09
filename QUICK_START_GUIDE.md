# Quick Start Guide - Shuttle Tracker App

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```
Then press 'Y' when asked about using port 8082.

### 2. Deploy Firebase Security Rules

#### Database Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `shuttle-tracker-a8ee8`
3. Go to **Realtime Database** → **Rules**
4. Copy contents from `firebase-security-rules.json`
5. Paste and click **Publish**

#### Storage Rules:
1. Go to **Storage** → **Rules**
2. Copy contents from `firebase-storage-rules.txt`
3. Paste and click **Publish**

## 👥 User Flows

### Student/Employee Flow:
```
1. Select "Student / Employee"
2. Sign Up:
   - Name
   - VIT Email (@vit.ac.in)
   - Password
   - Registration Number
3. Complete onboarding
4. View map with active shuttles
5. Tap shuttles for details
```

### Driver Flow:
```
1. Select "Driver"
2. Sign Up:
   - Name
   - Email
   - Password
   - Employee ID
   - Phone Number
   - Photo (optional)
3. Complete onboarding
4. Select Route
5. Enter Vehicle Number
6. Start Shift
7. Location shared automatically
8. End Shift when done
```

## 🎯 Key Features

### ✅ What Works:
- Email/password authentication
- Real-time location tracking (every 5 seconds)
- Live shuttle positions on map
- Bus icons with route-specific colors
- Route selection with Firebase persistence
- Vehicle number entry in dashboard
- Session management (stay logged in)
- Success/failure messages
- Optional photo upload

### 🔒 Security:
- Users can only access their own data
- Drivers can only update their own location
- Students can view all active shuttles
- Firebase Security Rules enforced

## 📱 Testing the App

### Test Driver Account:
```
Email: testdriver@example.com
Password: test123456
Employee ID: EMP001
Phone: +919876543210
```

### Test Student Account:
```
Email: teststudent@vit.ac.in
Password: test123456
Registration: 21BCE1234
```

## 🐛 Troubleshooting

### Photo Upload Fails:
- **Solution**: Photo is optional, account will still be created
- Can add photo later if needed

### Cannot Start Shift:
- **Check**: Route selected?
- **Check**: Vehicle number entered?
- **Check**: Location permissions granted?

### Shuttles Not Showing:
- **Check**: Is driver on shift?
- **Check**: Internet connection active?
- **Check**: Firebase rules deployed?

### Login Fails:
- **Check**: Correct email and password?
- **Check**: Account created (sign up first)?
- **Check**: Internet connection?

## 📊 Firebase Console Monitoring

### Check Real-Time Data:
1. Go to Firebase Console
2. **Realtime Database** → **Data**
3. See:
   - `/users` - All user accounts
   - `/drivers` - Driver information
   - `/shuttleLocations` - Active driver locations

### Check Authentication:
1. **Authentication** → **Users**
2. See all registered users

### Check Storage:
1. **Storage** → **Files**
2. See uploaded profile photos in `/profilePhotos`

## 🎨 UI Features

### Success Messages (Green ✅):
- Account created
- Login successful
- Shift started
- Shift ended
- Route selected

### Error Messages (Red ❌):
- Authentication failed
- Invalid credentials
- Missing required fields
- Network errors

### Warning Messages (Orange ⚠️):
- No route selected
- No vehicle number
- Photo upload failed (but account created)

## 📈 Performance

### Expected Behavior:
- **Authentication**: < 2 seconds
- **Route Selection**: < 1 second
- **Shift Start**: < 2 seconds
- **Location Updates**: Every 5 seconds
- **Map Updates**: < 1 second

### Battery Usage:
- Location tracking uses GPS continuously during shift
- Recommend drivers keep device charged
- Location tracking stops when shift ends

## 🔄 Data Synchronization

### Real-Time Updates:
- Driver starts shift → Shuttle appears on student map immediately
- Driver location updates → Student map updates within 5 seconds
- Driver ends shift → Shuttle disappears from student map immediately

### No Manual Refresh Needed:
- Everything updates automatically
- Firebase Realtime Database handles synchronization

## 📞 Support

### Common Issues:

**"Permission denied" errors:**
- Deploy Firebase Security Rules
- Check user is authenticated
- Verify user accessing own data

**"Network error":**
- Check internet connection
- Check Firebase project is active
- Verify API keys are correct

**"Location not updating":**
- Check location permissions granted
- Verify shift is started
- Check GPS is enabled on device

## 🎓 For Developers

### Project Structure:
```
services/
  ├── firebase.ts      # Firebase initialization
  ├── auth.ts          # Authentication
  ├── data.ts          # Database operations
  └── location.ts      # GPS tracking

app/
  ├── auth.tsx         # Login/Signup
  ├── driver-home.tsx  # Driver dashboard
  └── (tabs)/map.tsx   # Student map view

contexts/
  └── AuthContext.tsx  # Auth state management
```

### Key Functions:
- `signUp()` - Create new account
- `signIn()` - Login user
- `startLocationTracking()` - Begin GPS tracking
- `subscribeToActiveShuttles()` - Get real-time shuttle updates
- `updateDriverShiftStatus()` - Start/end shift

## ✨ Tips for Best Experience

### For Drivers:
1. Ensure good GPS signal before starting shift
2. Keep app in foreground for best tracking
3. End shift when done to save battery
4. Update vehicle number if changed

### For Students/Employees:
1. Grant location permissions for accurate ETA
2. Tap shuttle markers for detailed info
3. Check map regularly for shuttle positions
4. Report issues to driver if shuttle not moving

## 🎉 Success Indicators

### Everything Working When:
- ✅ Can sign up and login
- ✅ Driver can select route
- ✅ Driver can enter vehicle number
- ✅ Driver can start/end shift
- ✅ Students see active shuttles on map
- ✅ Shuttle positions update in real-time
- ✅ Bus icons display with correct colors
- ✅ Success/error messages show clearly

---

**Need Help?** Check:
1. `TESTING_GUIDE.md` - Comprehensive testing instructions
2. `FIREBASE_SETUP.md` - Security rules setup
3. `FINAL_CHANGES_SUMMARY.md` - Recent changes
4. `IMPLEMENTATION_SUMMARY.md` - Complete feature list

**Status**: ✅ Ready to Use - 100% Functional
