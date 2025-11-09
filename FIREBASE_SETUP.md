# Firebase Setup Instructions

## Overview

This document provides instructions for setting up Firebase Security Rules for the Shuttle Tracker application.

## Firebase Realtime Database Rules

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `shuttle-tracker-a8ee8`
3. Navigate to **Realtime Database** → **Rules**
4. Copy the contents of `firebase-security-rules.json` and paste into the rules editor
5. Click **Publish**

### Rules Explanation

- **users**: Users can only read/write their own data
- **drivers**: Anyone can read driver data (for map display), but only the driver can update their own data
- **shuttleLocations**: Anyone can read locations (for tracking), but only the driver can update their own location
- **routes**: Read-only for everyone (routes are predefined)

## Firebase Storage Rules

1. Go to Firebase Console
2. Navigate to **Storage** → **Rules**
3. Copy the contents of `firebase-storage-rules.txt` and paste into the rules editor
4. Click **Publish**

### Rules Explanation

- **profilePhotos**: Anyone can read photos, but only the authenticated user can upload their own photo
- Maximum file size: 5MB
- Only image file types allowed

## Testing Security Rules

### Test Database Rules

```javascript
// Test reading own user data (should succeed)
firebase.database().ref('users/' + currentUserId).once('value');

// Test reading another user's data (should fail)
firebase.database().ref('users/anotherUserId').once('value');

// Test reading driver data (should succeed for anyone)
firebase.database().ref('drivers/driverId').once('value');

// Test writing to own driver data (should succeed)
firebase.database().ref('drivers/' + currentUserId).set({...});

// Test writing to another driver's data (should fail)
firebase.database().ref('drivers/anotherUserId').set({...});
```

### Test Storage Rules

```javascript
// Test uploading own photo (should succeed)
const storageRef = firebase.storage().ref('profilePhotos/' + currentUserId + '.jpg');
await storageRef.put(file);

// Test uploading another user's photo (should fail)
const storageRef = firebase.storage().ref('profilePhotos/anotherUserId.jpg');
await storageRef.put(file);
```

## Important Notes

1. **Never disable security rules** - Always keep authentication and authorization checks in place
2. **Test thoroughly** - Test all read/write operations with different user roles
3. **Monitor usage** - Check Firebase Console for unauthorized access attempts
4. **Update rules carefully** - Always test rule changes in a development environment first

## Troubleshooting

### Permission Denied Errors

If you encounter "Permission denied" errors:

1. Check that the user is authenticated
2. Verify the user is trying to access their own data
3. Check that the data structure matches the validation rules
4. Review Firebase Console logs for detailed error messages

### Data Validation Errors

If data writes fail validation:

1. Ensure all required fields are present
2. Check data types match the validation rules
3. Verify field values are within acceptable ranges
4. Review the specific validation error in Firebase Console
