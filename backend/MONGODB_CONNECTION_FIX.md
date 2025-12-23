# 🔧 MongoDB Connection Fix

## Issue
The MongoDB connection string contains a special character `@` in the password which needs to be URL-encoded.

## Original Connection String
```
mongodb+srv://deepah955:Deepah@2004@cluster1.cx9x5kg.mongodb.net/?appName=Cluster1
```

## Problem
The password `Deepah@2004` contains `@` which conflicts with the MongoDB URI format.

## Solution
URL-encode the password:
- `@` becomes `%40`
- Password: `Deepah@2004` → `Deepah%402004`

## Fixed Connection String
```
mongodb+srv://deepah955:Deepah%402004@cluster1.cx9x5kg.mongodb.net/?appName=Cluster1
```

## Update backend/.env

Replace the MONGODB_URI line with:
```
MONGODB_URI=mongodb+srv://deepah955:Deepah%402004@cluster1.cx9x5kg.mongodb.net/?appName=Cluster1
```

## Alternative: Change MongoDB Password

1. Go to MongoDB Atlas Dashboard
2. Database Access → Edit User
3. Change password to something without special characters
   - Example: `Deepah2004` (no @ symbol)
4. Update connection string:
   ```
   mongodb+srv://deepah955:Deepah2004@cluster1.cx9x5kg.mongodb.net/?appName=Cluster1
   ```

## Test Connection

After fixing, test with:
```bash
cd backend
node server.js
```

You should see:
```
✅ Connected to MongoDB Atlas
📦 Database: shuttle_tracker
🚀 Server running on port 5000
```

---

**Quick Fix:** Update `backend/.env` line 4 with the URL-encoded password!
