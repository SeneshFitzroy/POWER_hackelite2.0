import React, { useState, useEffect, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { GOOGLE_MAPS_CONFIG } from '../config/maps';

// Professional Map Component with Uber-style features
const MapComponent = ({ 
  deliveryData, 
  driverLocation, 
  onMapLoad,
  trackingActive = true 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: GOOGLE_MAPS_CONFIG.defaultCenter,
        zoom: GOOGLE_MAPS_CONFIG.defaultZoom,
        styles: GOOGLE_MAPS_CONFIG.mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative'
      });

      setMap(googleMap);
      
      // Initialize directions service and renderer
      const dirService = new window.google.maps.DirectionsService();
      const dirRenderer = new window.google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: GOOGLE_MAPS_CONFIG.routeColors.primary,
          strokeWeight: 4,
          strokeOpacity: 0.8
        },
        suppressMarkers: true // We'll add custom markers
      });
      
      dirRenderer.setMap(googleMap);
      setDirectionsService(dirService);
      setDirectionsRenderer(dirRenderer);

      if (onMapLoad) onMapLoad(googleMap);
    }
  }, [map, onMapLoad]);

  // Add markers for pharmacy, customer, and driver
  useEffect(() => {
    if (!map || !deliveryData) return;

    const newMarkers = {};

    // Pharmacy marker (green)
    const pharmacyMarker = new window.google.maps.Marker({
      position: { lat: deliveryData.pharmacy.lat, lng: deliveryData.pharmacy.lng },
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#4CAF50',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3
      },
      title: deliveryData.pharmacy.name
    });

    // Customer marker (blue)
    const customerMarker = new window.google.maps.Marker({
      position: { lat: deliveryData.customer.lat, lng: deliveryData.customer.lng },
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#2196F3',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3
      },
      title: deliveryData.customer.name
    });

    newMarkers.pharmacy = pharmacyMarker;
    newMarkers.customer = customerMarker;

    // Driver marker (if location available)
    if (driverLocation) {
      const driverMarker = new window.google.maps.Marker({
        position: { lat: driverLocation.lat, lng: driverLocation.lng },
        map: map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#FF5722" stroke="#fff" stroke-width="3"/>
              <path d="M20 8 L28 20 L20 32 L12 20 Z" fill="#fff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        },
        title: 'Driver Location'
      });

      newMarkers.driver = driverMarker;
    }

    setMarkers(newMarkers);

    // Cleanup function
    return () => {
      Object.values(newMarkers).forEach(marker => marker.setMap(null));
    };
  }, [map, deliveryData, driverLocation]);

  // Calculate and display route
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !deliveryData || !driverLocation) return;

    const waypoints = [];
    let origin, destination;

    // Route from driver to customer (via pharmacy if not picked up)
    if (trackingActive) {
      origin = { lat: driverLocation.lat, lng: driverLocation.lng };
      destination = { lat: deliveryData.customer.lat, lng: deliveryData.customer.lng };
      
      // Add pharmacy as waypoint if driver hasn't reached there yet
      const distanceToPharmacy = calculateDistance(
        driverLocation, 
        deliveryData.pharmacy
      );
      
      if (distanceToPharmacy > 0.1) { // More than 100m from pharmacy
        waypoints.push({
          location: { lat: deliveryData.pharmacy.lat, lng: deliveryData.pharmacy.lng },
          stopover: true
        });
      }
    }

    directionsService.route({
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    }, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        
        // Fit map to show entire route
        const bounds = new window.google.maps.LatLngBounds();
        result.routes[0].legs.forEach(leg => {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        });
        map.fitBounds(bounds, { padding: 50 });
      }
    });
  }, [directionsService, directionsRenderer, deliveryData, driverLocation, trackingActive, map]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

// Helper function to calculate distance between two points
const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Wrapper component with Google Maps API
const ProfessionalMapWrapper = (props) => {
  const render = (status) => {
    if (status === 'LOADING') {
      return (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#666', margin: 0 }}>Loading map...</p>
          </div>
        </div>
      );
    }

    if (status === 'FAILURE') {
      return (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#ffebee'
        }}>
          <p style={{ color: '#c62828', textAlign: 'center' }}>
            Failed to load map. Please check your internet connection.
          </p>
        </div>
      );
    }

    return <MapComponent {...props} />;
  };

  return (
    <Wrapper 
      apiKey={GOOGLE_MAPS_CONFIG.apiKey} 
      render={render}
      libraries={['geometry', 'places']}
    />
  );
};

export default ProfessionalMapWrapper;
