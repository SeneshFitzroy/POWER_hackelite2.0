// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  // Replace with your actual Google Maps API key
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyBpMZ7i3yWOI9FwJwG7gWAZwOQgJWEWnX4',
  
  // Map configuration
  defaultCenter: {
    lat: 6.9271, // Colombo, Sri Lanka
    lng: 79.8612
  },
  
  // Default zoom level
  defaultZoom: 13,
  
  // Map styles (dark theme for professional look)
  mapStyles: [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [{"weight": "2.00"}]
    },
    {
      "featureType": "all",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#9c9c9c"}]
    },
    {
      "featureType": "all",
      "elementType": "labels.text",
      "stylers": [{"visibility": "on"}]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [{"color": "#f2f2f2"}]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "road",
      "elementType": "all",
      "stylers": [{"saturation": -100}, {"lightness": 45}]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#eeeeee"}]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#7b7b7b"}]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [{"visibility": "simplified"}]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.icon",
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#c8d7d4"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#070707"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#ffffff"}]
    }
  ],
  
  // Delivery route colors
  routeColors: {
    primary: '#00C853',
    secondary: '#1976D2',
    completed: '#4CAF50',
    pending: '#FF9800'
  }
};

// Mock delivery locations for demo
export const MOCK_DELIVERY_DATA = {
  pharmacy: {
    lat: 6.9271,
    lng: 79.8612,
    name: 'NPK Pharmacy',
    address: '123 Main Street, Colombo 03'
  },
  
  customer: {
    lat: 6.9344,
    lng: 79.8435,
    name: 'Customer Location',
    address: '456 Galle Road, Colombo 04'
  },
  
  driver: {
    lat: 6.9300,
    lng: 79.8500,
    name: 'Kamal Perera',
    phone: '+94 77 123 4567',
    vehicle: 'Motorcycle - ABC 1234',
    photo: '/images/avatars/driver-avatar.jpg',
    rating: 4.8
  }
};

// ETA calculation (mock implementation)
export const calculateETA = (startLat, startLng, endLat, endLng) => {
  // Simple distance calculation (in real app, use Google Distance Matrix API)
  const distance = Math.sqrt(
    Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2)
  ) * 111; // Rough km conversion
  
  // Estimate 30 km/h average speed
  const estimatedMinutes = Math.round((distance / 30) * 60);
  return Math.max(5, estimatedMinutes); // Minimum 5 minutes
};
