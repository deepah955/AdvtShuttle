# 🚀 HOW TO RUN YOUR SHUTTLE TRACKER APP

Follow these steps **in order**:

---

## ⚠️ STEP 1: Fix MongoDB Connection (REQUIRED!)

**Open this file in VS Code:**
```
backend/.env
```

**Find line 4 (MONGODB_URI) and change it to:**
```env
MONGODB_URI=mongodb+srv://deepah955:Deepah%402004@cluster1.cx9x5kg.mongodb.net/?appName=Cluster1
```

**What changed?** 
- `Deepah@2004` → `Deepah%402004` (the @ symbol is URL-encoded to %40)

**Why?** The @ symbol in your password conflicts with MongoDB's connection string format.

---

## 🖥️ STEP 2: Start Backend Server

**Open Terminal 1 (PowerShell or Command Prompt):**

```bash
# Navigate to backend folder
cd "c:\Users\deepa\OneDrive\Desktop\Laptop backup\ADVTapp\AdvtShuttle\backend"

# Start the server
npm start
```

**✅ You should see:**
```
✅ Connected to MongoDB Atlas
📦 Database: shuttle_tracker
🚀 Server running on port 5000
☁️  Cloudinary configured: dxfop0vhr
✨ Ready to accept requests!
```

**❌ If you see an error:**
- Make sure you fixed the .env file in Step 1
- Check that port 5000 is not already in use
- Verify MongoDB connection string is correct

**Keep this terminal running!** Don't close it.

---

## 📱 STEP 3: Start Expo App

**Open Terminal 2 (New PowerShell or Command Prompt):**

```bash
# Navigate to main project folder
cd "c:\Users\deepa\OneDrive\Desktop\Laptop backup\ADVTapp\AdvtShuttle"

# Start Expo
npm run dev
```

**✅ You should see:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

## 📲 STEP 4: Open App on Your Device

### Option A: Physical Device (Recommended)

1. **Install Expo Go app:**
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scan QR code:**
   - Android: Open Expo Go → Scan QR code from Terminal 2
   - iOS: Open Camera app → Scan QR code → Tap notification

3. **⚠️ IMPORTANT for Physical Device:**
   - Your phone and computer must be on the **same WiFi network**
   - Update API URL (see Step 5 below)

### Option B: Emulator/Simulator

**Android Emulator:**
```bash
# In Terminal 2, press 'a'
a
```

**iOS Simulator (Mac only):**
```bash
# In Terminal 2, press 'i'
i
```

**Web Browser:**
```bash
# In Terminal 2, press 'w'
w
```

---

## 🌐 STEP 5: Update API URL (For Physical Device Only)

If testing on a **physical device**, you need to update the API URL:

### 5.1 Find Your Computer's IP Address

**Windows (PowerShell):**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" under your WiFi adapter

### 5.2 Update API Configuration

**Open this file:**
```
services/api.ts
```

**Find line 9 and change:**
```typescript
// FROM:
export const API_URL = __DEV__ 
  ? 'http://localhost:5000/api'
  : 'https://your-production-url.com/api';

// TO (replace with YOUR IP):
export const API_URL = __DEV__ 
  ? 'http://192.168.1.100:5000/api'  // ← Use YOUR computer's IP here!
  : 'https://your-production-url.com/api';
```

**Save the file** and the app will reload automatically.

---

## ✅ STEP 6: Test Your App

### Test 1: User Registration
1. Open the app
2. Select user type (Student/Employee/Driver)
3. Fill in registration form
4. Click "Sign Up"
5. ✅ Should redirect to home screen

### Test 2: User Login
1. Click "Already have an account? Sign In"
2. Enter email and password
3. Click "Sign In"
4. ✅ Should redirect to home screen

### Test 3: Driver Features (if you're a driver)
1. Select a route
2. Enter vehicle number
3. Start shift
4. ✅ Location should start tracking

### Test 4: Map View (for students/employees)
1. Select your route
2. Go to Map tab
3. ✅ Should see active shuttles on map

---

## 🐛 Troubleshooting

### Backend won't start
**Error: "MongoDB connection failed"**
- ✅ Check you fixed the .env file (Step 1)
- ✅ Verify internet connection
- ✅ Check MongoDB Atlas is accessible

**Error: "Port 5000 already in use"**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### App can't connect to backend
**Error: "Network request failed"**
- ✅ Check backend is running (Terminal 1)
- ✅ Update API_URL with your IP (Step 5)
- ✅ Ensure phone and computer on same WiFi
- ✅ Disable VPN if active
- ✅ Check Windows Firewall (allow port 5000)

### Location not updating
- ✅ Grant location permissions when prompted
- ✅ Make sure driver is on shift
- ✅ Check backend logs for location updates

---

## 📊 Quick Reference

### Terminal 1 (Backend)
```bash
cd "c:\Users\deepa\OneDrive\Desktop\Laptop backup\ADVTapp\AdvtShuttle\backend"
npm start
```

### Terminal 2 (Frontend)
```bash
cd "c:\Users\deepa\OneDrive\Desktop\Laptop backup\ADVTapp\AdvtShuttle"
npm run dev
```

### Stop Everything
- Terminal 1: Press `Ctrl+C`
- Terminal 2: Press `Ctrl+C`

---

## 🎯 Summary

1. ✅ Fix MongoDB connection in `backend/.env`
2. ✅ Start backend: `cd backend && npm start`
3. ✅ Start frontend: `npm run dev`
4. ✅ Open app on device/emulator
5. ✅ Update API URL if using physical device
6. ✅ Test registration and login

---

**Need help?** Check the error messages in both terminals and refer to the troubleshooting section above!

**Ready to start?** Begin with Step 1! 🚀
