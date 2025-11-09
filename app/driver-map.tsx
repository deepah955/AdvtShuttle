import React, { useRef, useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MAPPLS_API_KEY } from '@/constants/config';

const { width, height } = Dimensions.get('window');
const MAP_WIDTH = width;
const MAP_HEIGHT = height * 0.7;

export default function DriverMapScreen() {
  const webViewRef = useRef<WebView>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation({ lat: 12.9716, lon: 79.1587 });
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
    })();
  }, []);

  useEffect(() => {
    if (location) {
      try {
        if (Platform.OS === 'web') {
          const iframe = document.getElementById('driver-map-iframe') as HTMLIFrameElement;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ 
              type: 'updateDriverLocation', 
              lat: location.lat, 
              lon: location.lon 
            }, '*');
          } else {
            console.warn('Driver map iframe not found or not ready');
          }
        } else {
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              try {
                if (typeof updateDriverLocation === 'function') {
                  updateDriverLocation(${location.lat}, ${location.lon});
                } else {
                  console.warn('updateDriverLocation function not available');
                }
              } catch (error) {
                console.error('Error updating driver location:', error);
              }
              true;
            `);
          } else {
            console.warn('Driver map WebView not ready');
          }
        }
      } catch (error) {
        console.error('Error in location update effect:', error);
      }
    }
  }, [location]);

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading location...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      <div id="loading">Loading driver map...</div>
      <div id="map"></div>
      <script>
        console.log('Driver map HTML loaded');
        var map, driverMarker;
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
          console.log('Initializing driver map...');
          try {
            map = new MapmyIndia.Map('map', {
              center: [${location.lat}, ${location.lon}],
              zoom: 15,
              zoomControl: true,
              location: true
            });
            
            mapLoaded = true;
            document.getElementById('loading').style.display = 'none';
            console.log('Driver map created successfully');
            
            const truckIcon = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#34C759"/><path d="M17 20H7V21C7 21.5523 6.55228 22 6 22H5C4.44772 22 4 21.5523 4 21V12L2.4453 11.2226C2.17514 11.0875 2 10.8148 2 10.5157V9C2 8.44772 2.44772 8 3 8H4V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V8H21C21.5523 8 22 8.44772 22 9V10.5157C22 10.8148 21.8249 11.0875 21.5547 11.2226L20 12V21C20 21.5523 19.5523 22 19 22H18C17.4477 22 17 21.5523 17 21V20ZM6 5V8H18V5H6ZM6 10V18H18V10H6ZM7 12H11V16H7V12ZM13 12H17V16H13V12Z" transform="translate(9, 9) scale(0.8)" fill="white"/></svg>');
            
            map.on('load', function() {
              console.log('Driver map load event fired');
              driverMarker = new MapmyIndia.Marker({
                map: map,
                position: {lat: ${location.lat}, lng: ${location.lon}},
                fitbounds: false,
                icon: truckIcon
              });
            });
          } catch (error) {
            console.error('Error initializing driver map:', error);
            document.getElementById('loading').innerHTML = 'Error loading driver map: ' + error.message;
          }
        }
        
        function updateDriverLocation(lat, lon) {
          if (!map || !mapLoaded) {
            console.log('Driver map not ready yet');
            return;
          }
          
          console.log('Updating driver location:', lat, lon);
          
          if (driverMarker) {
            driverMarker.setPosition({lat: lat, lng: lon});
            map.setCenter({lat: lat, lng: lon});
          }
        }
        
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'updateDriverLocation') {
            updateDriverLocation(event.data.lat, event.data.lon);
          }
        });
        
        waitForMapmyIndia(function() {
          console.log('MapmyIndia library loaded for driver map');
          initMap();
        });
      </script>
    </body>
    </html>
  `;

  const renderMap = () => {
    if (mapError) {
      return (
        <View style={[styles.map, styles.errorContainer]}>
          <Text style={styles.errorText}>Map Error</Text>
          <Text style={styles.errorMessage}>{mapError}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setMapError(null);
              // Trigger re-render
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

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
            id="driver-map-iframe"
            srcDoc={mapHTML}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#E5E5E5',
            }}
            onError={() => setMapError('Failed to load map iframe')}
          />
        </div>
      );
    } else {
      return (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setMapError(`WebView error: ${nativeEvent.description || 'Unknown error'}`);
          }}
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Map</Text>
        <View style={{ width: 24 }} />
      </View>
      {renderMap()}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} testID="pickup-button">
          <MapPin size={20} color="white" />
          <Text style={styles.controlText}>Mark Pickup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.emergencyButton]} testID="emergency-button">
          <Text style={styles.controlText}>SOS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    backgroundColor: '#E5E5E5',
  },
  controls: {
    padding: 20,
    gap: 10,
  },
  controlButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
  },
  controlText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});