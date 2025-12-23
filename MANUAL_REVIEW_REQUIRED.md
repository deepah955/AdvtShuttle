# ⚠️ IMPORTANT: Manual Review Required

## Files with Remaining Firebase References

### `app/driver-home.tsx`

This file contains **dynamic Firebase imports** that need to be removed or replaced. These are scattered throughout the file in multiple locations:

#### Locations of Firebase Imports:

1. **Lines 303-304** - Start Shift Firebase Update
   ```typescript
   const { ref, update } = await import('firebase/database');
   const { database } = await import('@/services/firebase');
   ```

2. **Lines 354-355** - Start Shift Retry Logic
   ```typescript
   const { ref, update } = await import('firebase/database');
   const { database } = await import('@/services/firebase');
   ```

3. **Lines 416-417** - End Shift Firebase Update
   ```typescript
   const { ref, update } = await import('firebase/database');
   const { database } = await import('@/services/firebase');
   ```

4. **Lines 453-454** - End Shift Retry Logic
   ```typescript
   const { ref, update } = await import('firebase/database');
   const { database } = await import('@/services/firebase');
   ```

5. **Lines 621-622** - Vehicle Number Save
   ```typescript
   const { ref, update } = await import('firebase/database');
   const { database } = await import('@/services/firebase');
   ```

## Recommended Actions

### Option 1: Use Service Functions (Recommended)
Replace all direct Firebase calls with service function calls:

**Instead of:**
```typescript
const { ref, update } = await import('firebase/database');
const { database } = await import('@/services/firebase');
const driverRef = ref(database, `drivers/${user.uid}`);
await update(driverRef, { isOnShift: true });
```

**Use:**
```typescript
import { updateDriverShiftStatus } from '@/services/data';
await updateDriverShiftStatus(user.uid, true, selectedRoute);
```

### Option 2: Comment Out Until Database Integration
Temporarily comment out these Firebase update calls and add TODO comments:

```typescript
// TODO: Implement with new database
// await updateDriverShiftStatus(user.uid, true, selectedRoute);
console.warn('Database not configured - shift status not saved');
```

### Option 3: Remove All Firebase Logic
Since the service functions now throw errors, you could:
1. Remove all try-catch blocks around Firebase updates
2. Keep only the UI state updates
3. Show warnings that data won't be persisted

## Impact Analysis

### What Works Without Firebase:
- ✅ UI state management (shift on/off, route selection)
- ✅ Local location tracking
- ✅ Navigation between screens
- ✅ Visual feedback

### What Doesn't Work:
- ❌ Persisting shift status to database
- ❌ Saving vehicle number
- ❌ Syncing data across devices
- ❌ Real-time updates from database
- ❌ Data persistence after app restart

## Next Steps

1. **Choose your database solution** (see DATABASE_MIGRATION_GUIDE.md)
2. **Implement the data service functions** in `services/data.ts`
3. **Replace all Firebase imports** in `app/driver-home.tsx` with service function calls
4. **Test the shift start/end functionality** with your new database

## Quick Fix Script

Here's a search-and-replace pattern to help:

### Pattern 1: Start/End Shift Updates
**Find:**
```typescript
const { ref, update } = await import('firebase/database');
const { database } = await import('@/services/firebase');
const driverRef = ref(database, `drivers/${user.uid}`);
await update(driverRef, { 
  isOnShift: true,
  currentRoute: selectedRoute,
  lastShiftUpdate: Date.now()
});
```

**Replace with:**
```typescript
import { updateDriverShiftStatus } from '@/services/data';
await updateDriverShiftStatus(user.uid, true, selectedRoute);
```

### Pattern 2: Vehicle Number Updates
**Find:**
```typescript
const { ref, update } = await import('firebase/database');
const { database } = await import('@/services/firebase');
const driverRef = ref(database, `drivers/${user.uid}`);
await update(driverRef, { vehicleNo: vehicleNo.trim() });
```

**Replace with:**
```typescript
import { updateDriverVehicleNumber } from '@/services/data';
await updateDriverVehicleNumber(user.uid, vehicleNo.trim());
```

---

**Status**: Manual review and updates required for `app/driver-home.tsx`

**Priority**: HIGH - This file is critical for driver functionality
