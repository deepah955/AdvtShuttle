# Mappls Map Integration

## API Key Configuration

The Mappls API key is stored in: **`constants/config.ts`**

```typescript
export const MAPPLS_API_KEY = '593a29c1ddea78f35035c5ae0fb01c65';
```

## Where Mappls is Used

1. **Rider Map View** (`components/MapView.tsx`)
   - Shows live shuttle locations with white bus icons
   - Blue markers for LH/PRP route shuttles
   - Orange markers for MH route shuttles
   - Red marker for user location
   - Tap shuttles to see details in bottom sheet (driver name, vehicle, ETA, speed)

2. **Driver Map View** (`app/driver-map.tsx`)
   - Shows driver's current location with green shuttle icon
   - Updates in real-time as driver moves
   - Includes Mark Pickup and SOS buttons

## Route Configuration

Routes are defined in **`constants/routes.ts`**:

- **LH/PRP Route** (Blue #007AFF) - 7 stops
- **MH Route** (Orange #FF9500) - 4 stops

## Features

✅ Real-time shuttle tracking
✅ Live location updates every 5 seconds
✅ ETA calculation using Haversine formula
✅ Interactive shuttle markers with details
✅ White bus icons for visual clarity
✅ Route-based color coding
✅ Bottom sheet for shuttle details

## To Update API Key

Edit `constants/config.ts` and change the `MAPPLS_API_KEY` value.
