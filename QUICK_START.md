# Quick Start Guide

## 🚀 Start Backend & Frontend

### Terminal 1: Start Backend Server
```bash
cd backend
npm start
```

Wait for:
```
✅ Connected to MongoDB Atlas
🚀 Server running on port 5000
✨ Ready to accept requests!
```

### Terminal 2: Start Expo App
```bash
# From project root
npm run dev
```

## 📱 Testing on Physical Device

1. **Find your computer's IP address:**
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac: `ifconfig` (look for inet)
   - Linux: `ip addr`

2. **Update API URL:**
   Edit `services/api.ts`:
   ```typescript
   export const API_URL = 'http://YOUR_IP:5000/api'
   // Example: 'http://192.168.1.100:5000/api'
   ```

3. **Ensure same WiFi:**
   - Phone and computer must be on same network
   - Disable VPN if active

## ✅ Verify Setup

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/
   ```

2. **Test Signup:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123","name":"Test","role":"student"}'
   ```

3. **Test Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
   ```

## 🎯 What to Test in App

1. **User Registration** (Student/Employee/Driver)
2. **User Login**
3. **Route Selection**
4. **Driver Shift Start/Stop**
5. **Location Tracking**
6. **Profile Photo Upload**
7. **Real-time Shuttle Tracking on Map**

## 📝 Common Issues

### Backend won't start
- Check MongoDB connection string in `backend/.env`
- Verify port 5000 is not in use

### App can't connect to backend
- Check API_URL in `services/api.ts`
- Verify backend is running
- Check firewall settings

### Location not updating
- Grant location permissions
- Check driver is on shift
- Verify location service is running

---

**Ready to go!** Start both terminals and test your app! 🎉
