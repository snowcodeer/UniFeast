import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import MapView, { Marker, Overlay } from "react-native-maps";
import * as Location from 'expo-location';

const Map = () => {
  const mapRef = useRef<MapView>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Request location permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to see your position on the map.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  // Imperial College London coordinates
  const IMPERIAL_COLLEGE = {
    latitude: 51.4994,
    longitude: -0.1749,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const flyToCampus = () => {
    if (!mapRef.current) return;
    
    mapRef.current.animateToRegion({
      latitude: 51.4994,
      longitude: -0.1749,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Imperial College London</Text>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={IMPERIAL_COLLEGE}
        showsUserLocation={locationPermission}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        showsCompass={true}
        showsScale={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
      >
        <Marker
          coordinate={{
            latitude: 51.4994,
            longitude: -0.1749,
          }}
          title="Imperial College London"
          description="South Kensington Campus"
          pinColor="red"
        />
      </MapView>

      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={flyToCampus}
        >
          <Text style={styles.buttonText}>Fly to Campus</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Campus Map</Text>
        <Text style={styles.infoText}>📍 Imperial College London</Text>
        <Text style={styles.infoText}>🎯 Interactive map controls</Text>
        <Text style={styles.infoText}>🏗️ 3D Buildings enabled</Text>
        <Text style={styles.infoText}>🧭 Compass and scale available</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    padding: 16,
    backgroundColor: "white",
    color: "#333",
  },
  map: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
  },
});

export default Map; 