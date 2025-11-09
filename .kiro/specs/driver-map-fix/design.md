# Design Document

## Overview

The driver map fix involves implementing platform-specific rendering similar to the working MapView component used by students/employees. The main issue is that the current driver-map.tsx only uses WebView for all platforms, while it should use iframe for web and WebView for mobile platforms to ensure compatibility.

## Architecture

The solution follows the same architectural pattern as the working MapView component:

```
Driver Map Screen
├── Platform Detection (Platform.OS)
├── Web Rendering (iframe)
├── Mobile Rendering (WebView)
├── Location Services (expo-location)
└── MAPPLS Integration (HTML + JavaScript)
```

## Components and Interfaces

### Core Components

1. **DriverMapScreen Component**
   - Main React component that handles platform detection
   - Manages location state and permissions
   - Renders appropriate map implementation based on platform

2. **Platform-Specific Renderers**
   - **Web Renderer**: Uses iframe with srcDoc for MAPPLS HTML
   - **Mobile Renderer**: Uses WebView with HTML source
   - Both share the same HTML template with MAPPLS integration

3. **Location Manager**
   - Handles location permissions using expo-location
   - Provides real-time location updates
   - Falls back to default location if permissions denied

### Key Interfaces

```typescript
interface LocationState {
  lat: number;
  lon: number;
}

interface MapRendererProps {
  location: LocationState;
  mapHTML: string;
}
```

## Data Models

### Location Data
- **Current Location**: `{ lat: number, lon: number }`
- **Default Location**: `{ lat: 12.9716, lon: 79.1587 }` (fallback)
- **Update Frequency**: Real-time via useEffect hooks

### Map Configuration
- **MAPPLS API Key**: Retrieved from constants/config.ts
- **Map Center**: Driver's current location
- **Zoom Level**: 15 (appropriate for street-level view)
- **Marker Icon**: Green truck SVG for driver identification

## Error Handling

### Platform Detection
- Use `Platform.OS === 'web'` to determine rendering method
- Graceful fallback if platform detection fails

### Location Services
- Request permissions before accessing location
- Handle permission denial with default location
- Display loading state while obtaining location

### Map Loading
- Show loading indicator while MAPPLS library loads
- Handle MAPPLS initialization errors
- Provide error messages for debugging

### WebView/iframe Issues
- Enable necessary WebView properties (javaScriptEnabled, domStorageEnabled)
- Handle cross-origin issues with proper whitelist
- Ensure proper HTML escaping and encoding

## Testing Strategy

### Unit Testing
- Test location permission handling
- Test platform detection logic
- Test HTML template generation

### Integration Testing
- Test MAPPLS API integration
- Test location updates and marker positioning
- Test platform-specific rendering

### Manual Testing
- Verify map displays on both web and mobile
- Confirm location updates work correctly
- Test control buttons functionality
- Verify error states and fallbacks

## Implementation Details

### HTML Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://apis.mapmyindia.com/advancedmaps/v1/{API_KEY}/map_load?v=1.5"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    // MAPPLS initialization and marker management
  </script>
</body>
</html>
```

### Platform-Specific Rendering Logic
```typescript
const renderMap = () => {
  if (Platform.OS === 'web') {
    return <iframe srcDoc={mapHTML} />;
  } else {
    return <WebView source={{ html: mapHTML }} />;
  }
};
```

### Location Update Mechanism
- Use expo-location for GPS coordinates
- Update marker position via JavaScript injection
- Maintain map center on driver location

## Dependencies

- **react-native-webview**: For mobile map rendering
- **expo-location**: For GPS location services
- **expo-router**: For navigation
- **MAPPLS API**: For map tiles and services
- **Platform API**: For platform detection

## Migration Strategy

1. **Backup Current Implementation**: Preserve existing driver-map.tsx
2. **Implement Platform Detection**: Add Platform.OS checks
3. **Add Web Rendering**: Implement iframe-based rendering
4. **Test Both Platforms**: Verify functionality on web and mobile
5. **Deploy and Monitor**: Roll out fix and monitor for issues