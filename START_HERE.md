# ⚡ START HERE - Simple 3-Step Guide

## 🔧 STEP 1: Fix MongoDB Password (30 seconds)

**Open this file in any text editor:**
```
C:\Users\deepa\OneDrive\Desktop\Laptop backup\ADVTapp\AdvtShuttle\backend\.env
```

**Find line 4 and change:**
```
FROM: MONGODB_URI=mongodb+srv://deepah955:Deepah@2004@cluster1...
TO:   MONGODB_URI=mongodb+srv://deepah955:Deepah%402004@cluster1...
```

**Just change `@` to `%40` in the password!**

Save and close.

---

## 🖥️ STEP 2: Start Backend

**Open PowerShell and copy-paste:**

```powershell
cd "c:\Users\deepa\OneDrive\Desktop\Laptop backup\ADVTapp\AdvtShuttle\backend"
npm start
```

**Wait for:** `✅ Connected to MongoDB Atlas`

**Keep this window open!**

---

## 📱 STEP 3: Start App

**Open NEW PowerShell and copy-paste:**

```powershell
cd "c:\Users\deepa\OneDrive\Desktop\Laptop backup\ADVTapp\AdvtShuttle"
npm run dev
```

**Then press `w` for web browser**

---

## ✅ Done!

Your app is running! Create an account and test it.

**Problems?** See `HOW_TO_RUN.md` for detailed help.
