import React, { useRef, useState, useEffect } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Shuttle } from '@/constants/routes';
import { calculateETA, formatETA } from '@/utils/eta';
import { MapPin, Clock, User } from 'lucide-react-native';
import { MAPPLS_API_KEY } from '@/constants/config';
import { getBusMarkerForRoute } from '@/utils/imageUtils';

// FIX: Replace conditional require with a direct import to resolve TypeScript error.
import { WebView } from 'react-native-webview';

// Load bus.png from assets
const busImage = require('@/assets/images/bus.png');

const { width, height } = Dimensions.get('window');
const MAP_WIDTH = width;
const MAP_HEIGHT = height * 0.6;

interface MapViewProps {
  shuttles: Shuttle[];
  userLat: number;
  userLon: number;
}

export default function MapView({ shuttles, userLat, userLon }: MapViewProps) {
  const [selectedShuttle, setSelectedShuttle] = useState<Shuttle | null>(null);
  const [busIcons, setBusIcons] = useState<Record<string, string>>({});
  const mapContainerRef = useRef<any>(null);
  const bottomSheetY = useRef(new Animated.Value(height)).current;

  // Load bus.png from assets and convert to data URL for map markers
  useEffect(() => {
    const loadBusIcon = async () => {
      try {
        let busIconUrl: string;
        
        if (Platform.OS === 'web') {
          // For web: Get the image URL from require
          const imageSource = Image.resolveAssetSource(busImage);
          if (imageSource?.uri) {
            // Fetch the image and convert to data URL
            try {
              const response = await fetch(imageSource.uri);
              const blob = await response.blob();
              const reader = new FileReader();
              
              reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const icons: Record<string, string> = {};
                const uniqueRoutes = [...new Set(shuttles.map(s => s.routeId))];
                
                // Use the same bus icon for all routes (from bus.png)
                for (const routeId of uniqueRoutes) {
                  icons[routeId] = dataUrl;
                }
                
                setBusIcons(icons);
                console.log('✅ [MAP] Bus icon loaded from bus.png for routes:', uniqueRoutes);
              };
              
              reader.onerror = () => {
                console.warn('⚠️ [MAP] Failed to convert bus.png to data URL, using SVG fallback');
                // Fallback to SVG
                generateSVGIcons();
              };
              
              reader.readAsDataURL(blob);
            } catch (fetchError) {
              console.warn('⚠️ [MAP] Failed to fetch bus.png, using SVG fallback:', fetchError);
              generateSVGIcons();
            }
          } else {
            console.warn('⚠️ [MAP] Could not resolve bus.png asset, using SVG fallback');
            generateSVGIcons();
          }
        } else {
          // For native: Use Image.resolveAssetSource
          const imageSource = Image.resolveAssetSource(busImage);
          if (imageSource?.uri) {
            const icons: Record<string, string> = {};
            const uniqueRoutes = [...new Set(shuttles.map(s => s.routeId))];
            
            // Use the same bus icon for all routes (from bus.png)
            for (const routeId of uniqueRoutes) {
              icons[routeId] = imageSource.uri;
            }
            
            setBusIcons(icons);
            console.log('✅ [MAP] Bus icon loaded from bus.png for routes:', uniqueRoutes);
          } else {
            console.warn('⚠️ [MAP] Could not resolve bus.png asset, using SVG fallback');
            generateSVGIcons();
          }
        }
      } catch (error) {
        console.error('❌ [MAP] Error loading bus icon:', error);
        generateSVGIcons();
      }
    };

    const generateSVGIcons = () => {
      const icons: Record<string, string> = {};
      const uniqueRoutes = [...new Set(shuttles.map(s => s.routeId))];

      // Fallback: Create enhanced SVG bus icons for each route
      for (const routeId of uniqueRoutes) {
        const color = routeId === 'lh-prp' ? '#007AFF' : '#FF9500';

        // Enhanced bus SVG with better visibility
        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="24" cy="24" r="20" fill="${color}" stroke="white" stroke-width="3" filter="url(#shadow)"/>
            <g transform="translate(12, 12) scale(1.2)">
              <path d="M3 6h14v1c0 .55-.45 1-1 1h-1c-.55 0-1-.45-1-1v-1H3zm0 2v6h14V8H3zm1 1h3v3H4V9zm5 0h3v3H9V9z" fill="white"/>
              <rect x="4" y="3" width="12" height="2" rx="1" fill="white"/>
              <circle cx="6" cy="15" r="1.5" fill="white"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </g>
          </svg>
        `;

        icons[routeId] = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon);
      }

      setBusIcons(icons);
      console.log('✅ [MAP] SVG bus icons generated as fallback for routes:', uniqueRoutes);
    };

    loadBusIcon();
  }, [shuttles]);

  useEffect(() => {
    if (selectedShuttle) {
      Animated.spring(bottomSheetY, {
        toValue: height * 0.4,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.spring(bottomSheetY, {
        toValue: height,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedShuttle, bottomSheetY]);

  useEffect(() => {
    const updateMarkers = () => {
      console.log(`📍 [MAP] Updating markers - ${shuttles.length} shuttles, busIcons loaded: ${Object.keys(busIcons).length}`);

      const markersData = JSON.stringify({
        user: { lat: userLat, lon: userLon },
        shuttles: shuttles.map(s => {
          const icon = busIcons[s.routeId];
          console.log(`🚌 [MAP] Shuttle ${s.id} (${s.routeId}): lat=${s.lat}, lon=${s.lon}, vehicle=${s.vehicleNo}, icon=${icon ? 'loaded' : 'missing'}`);
          return {
            id: s.id,
            lat: s.lat,
            lon: s.lon,
            routeId: s.routeId,
            vehicleNo: s.vehicleNo,
            driverName: s.driverName,
            busIcon: icon || undefined,
          };
        }),
      });

      if (Platform.OS === 'web') {
        const iframe = document.getElementById('map-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          console.log('📤 [MAP] Sending markers to iframe');
          iframe.contentWindow.postMessage({ type: 'updateMarkers', data: markersData }, '*');
        } else {
          console.warn('⚠️ [MAP] Iframe not ready');
        }
      } else {
        if (mapContainerRef.current && mapContainerRef.current.injectJavaScript) {
          console.log('📤 [MAP] Injecting JavaScript to update markers');
          mapContainerRef.current.injectJavaScript(`
            updateMarkers(${markersData});
            true;
          `);
        } else {
          console.warn('⚠️ [MAP] WebView not ready');
        }
      }
    };
    updateMarkers();
  }, [shuttles, userLat, userLon, busIcons]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebMessage = (event: MessageEvent) => {
        try {
          if (event.data && event.data.type === 'shuttleClick' && event.data.shuttleId) {
            const shuttle = shuttles.find(s => s.id === event.data.shuttleId);
            if (shuttle) {
              setSelectedShuttle(shuttle);
            }
          }
        } catch (e) {
          console.log('Error parsing message:', e);
        }
      };
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, [shuttles]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'shuttleClick' && data.shuttleId) {
        const shuttle = shuttles.find(s => s.id === data.shuttleId);
        if (shuttle) {
          setSelectedShuttle(shuttle);
        }
      }
    } catch (e) {
      console.log('Error parsing message:', e);
    }
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <script src="https://apis.mapmyindia.com/advancedmaps/v1/${MAPPLS_API_KEY}/map_load?v=1.5"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
        #loading { 
          position: absolute; 
          top: 50%; 
          left: 50%; 
          transform: translate(-50%, -50%);
          font-family: Arial, sans-serif;
          color: #666;
          z-index: 1000;
        }
      </style>
    </head>
    <body>
      <div id="loading">Loading map...</div>
      <div id="map"></div>
      <script>
        console.log('Map HTML loaded');
        var map, userMarker, shuttleMarkers = {};
        var mapLoaded = false;
        
        function waitForMapmyIndia(callback) {
          if (typeof MapmyIndia !== 'undefined' && MapmyIndia.Map) {
            callback();
          } else {
            console.log('Waiting for MapmyIndia...');
            setTimeout(function() { waitForMapmyIndia(callback); }, 100);
          }
        }
        
        function initMap() {
          console.log('Initializing map...');
          try {
            map = new MapmyIndia.Map('map', {
              center: [${userLat}, ${userLon}],
              zoom: 15,
              zoomControl: true,
              location: true
            });
            
            mapLoaded = true;
            document.getElementById('loading').style.display = 'none';
            console.log('Map created successfully');
            
            map.on('load', function() {
              console.log('Map load event fired');
              updateMarkers({
                user: { lat: ${userLat}, lon: ${userLon} },
                shuttles: ${JSON.stringify(shuttles.map(s => ({
    id: s.id,
    lat: s.lat,
    lon: s.lon,
    routeId: s.routeId,
    vehicleNo: s.vehicleNo,
    busIcon: busIcons[s.routeId] || undefined,
  })))}
              });
            });
          } catch (error) {
            console.error('Error initializing map:', error);
            document.getElementById('loading').innerHTML = 'Error loading map: ' + error.message;
          }
        }
        
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'updateMarkers') {
            try {
              const data = JSON.parse(event.data.data);
              updateMarkers(data);
            } catch (e) {
              console.log('Error updating markers:', e);
            }
          }
        });
        
        function updateMarkers(data) {
          if (!map || !mapLoaded) {
            console.log('⏳ Map not ready yet, waiting...');
            return;
          }
          
          console.log('🗺️ Updating markers with data:', {
            userLat: data.user.lat,
            userLon: data.user.lon,
            shuttleCount: data.shuttles.length,
            shuttles: data.shuttles.map(s => ({
              id: s.id,
              routeId: s.routeId,
              vehicle: s.vehicleNo,
              hasIcon: !!s.busIcon
            }))
          });
          
          // Update user marker
          if (userMarker) {
            userMarker.remove();
          }
          
          userMarker = new MapmyIndia.Marker({
            map: map,
            position: {lat: data.user.lat, lng: data.user.lon},
            fitbounds: false,
            icon: 'https://apis.mapmyindia.com/map_v3/1.png'
          });
          console.log('📍 User marker updated');
          
          // Remove markers for shuttles that no longer exist
          Object.keys(shuttleMarkers).forEach(function(id) {
            if (!data.shuttles.find(function(s) { return s.id === id; })) {
              console.log('🗑️ Removing marker for shuttle:', id);
              shuttleMarkers[id].remove();
              delete shuttleMarkers[id];
            }
          });
          
          // Update or create shuttle markers
          data.shuttles.forEach(function(shuttle) {
            var color = shuttle.routeId === 'lh-prp' ? '#007AFF' : '#FF9500';
            
            // Determine icon URL
            var iconUrl;
            if (shuttle.busIcon) {
              // If we have a bus icon from assets, use it
              iconUrl = shuttle.busIcon;
              console.log('🚌 Using bus.png icon for shuttle:', shuttle.id);
            } else {
              // Fallback to SVG icon with route color
              iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
                '<circle cx="20" cy="20" r="18" fill="' + color + '"/>' +
                '<path d="M17 20H7V21C7 21.5523 6.55228 22 6 22H5C4.44772 22 4 21.5523 4 21V12L2.4453 11.2226C2.17514 11.0875 2 10.8148 2 10.5157V9C2 8.44772 2.44772 8 3 8H4V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V8H21C21.5523 8 22 8.44772 22 9V10.5157C22 10.8148 21.8249 11.0875 21.5547 11.2226L20 12V21C20 21.5523 19.5523 22 19 22H18C17.4477 22 17 21.5523 17 21V20ZM6 5V8H18V5H6ZM6 10V18H18V10H6ZM7 12H11V16H7V12ZM13 12H17V16H13V12Z" transform="translate(9, 9) scale(0.8)" fill="white"/>' +
                '</svg>'
              );
              console.log('⚠️ Using SVG fallback for shuttle:', shuttle.id);
            }
            
            if (shuttleMarkers[shuttle.id]) {
              // Update existing marker position
              console.log('🔄 Updating position for shuttle:', shuttle.id, 'to', shuttle.lat, shuttle.lon);
              shuttleMarkers[shuttle.id].setPosition({lat: shuttle.lat, lng: shuttle.lon});
            } else {
              // Create new marker
              console.log('✨ Creating new marker for shuttle:', shuttle.id, 'at', shuttle.lat, shuttle.lon);
              var marker = new MapmyIndia.Marker({
                map: map,
                position: {lat: shuttle.lat, lng: shuttle.lon},
                fitbounds: false,
                icon: iconUrl,
                title: shuttle.vehicleNo || shuttle.driverName || 'Shuttle'
              });
              
              marker.addListener('click', function() {
                console.log('🖱️ Shuttle clicked:', shuttle.id);
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'shuttleClick',
                    shuttleId: shuttle.id
                  }));
                } else {
                  window.parent.postMessage({
                    type: 'shuttleClick',
                    shuttleId: shuttle.id
                  }, '*');
                }
              });
              
              shuttleMarkers[shuttle.id] = marker;
            }
          });
          
          console.log('✅ Markers updated successfully. Active shuttles:', Object.keys(shuttleMarkers).length);
        }
        
        waitForMapmyIndia(function() {
          console.log('MapmyIndia library loaded');
          initMap();
        });
      </script>
    </body>
    </html>
  `;

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <div
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            position: 'relative',
          }}
        >
          <iframe
            id="map-iframe"
            srcDoc={mapHTML}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#E5E5E5',
            }}
          />
        </div>
      );
    } else {
      // FIX: WebView is imported directly, so the conditional check is not needed.
      return (
        <WebView
          ref={mapContainerRef}
          originWhitelist={['*']}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderMap()}
      <Animated.View
        style={[styles.bottomSheet, { transform: [{ translateY: bottomSheetY }] }]}
      >
        {selectedShuttle ? (
          <>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selectedShuttle.driverName}</Text>
              <TouchableOpacity onPress={() => setSelectedShuttle(null)} testID="close-sheet">
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sheetContent}>
              <View style={styles.detailRow}>
                <User size={16} color="#666" />
                <Text style={styles.detailText}>Vehicle: {selectedShuttle.vehicleNo}</Text>
              </View>
              <View style={styles.detailRow}>
                <Clock size={16} color="#666" />
                <Text style={styles.detailText}>
                  ETA: {formatETA(calculateETA(selectedShuttle.lat, selectedShuttle.lon, userLat, userLon, selectedShuttle.speed))}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MapPin size={16} color="#666" />
                <Text style={styles.detailText}>Speed: {selectedShuttle.speed} km/h</Text>
              </View>
              <Text style={styles.nextStop}>Next Stop: Cafeteria</Text>
            </View>
          </>
        ) : (
          <Text style={styles.sheetPlaceholder}>Tap a shuttle for details</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    backgroundColor: '#E5E5E5',
    position: 'relative',
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    minHeight: height * 0.3,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  sheetContent: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
  },
  nextStop: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 10,
  },
  sheetPlaceholder: {
    textAlign: 'center',
    padding: 40,
    color: '#666',
  },
});