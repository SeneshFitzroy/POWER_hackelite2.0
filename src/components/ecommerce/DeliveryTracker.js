import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton,
  Divider,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  
  LinearProgress,
  Alert,
  AppBar,
  Toolbar,
  Slide,
  Fab,
  Badge,
  CircularProgress
} from '@mui/material';
import { Grid } from '@mui/material';
// Material-UI Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import MessageIcon from '@mui/icons-material/Message';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import NavigationIcon from '@mui/icons-material/Navigation';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ShareIcon from '@mui/icons-material/Share';
import CallIcon from '@mui/icons-material/Call';
import SmsIcon from '@mui/icons-material/Sms';
import DirectionsIcon from '@mui/icons-material/Directions';
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from '@mui/icons-material/Schedule';

const DeliveryTracker = ({ orderId, onClose }) => {
  const [currentStep, setCurrentStep] = useState(2);
  const [deliveryProgress, setDeliveryProgress] = useState(65);
  const [estimatedTime, setEstimatedTime] = useState(12);
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [driverLocation, setDriverLocation] = useState({ lat: 6.9271, lng: 79.8612 }); // Colombo
  const [customerLocation] = useState({ lat: 6.9344, lng: 79.8428 }); // Slightly different location
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('Colombo 03, Sri Lanka');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);

  // Professional delivery data with real-time simulation
  const deliveryData = {
    orderId: orderId || 'NPK-2025-001234',
    status: 'in_transit',
    estimatedDelivery: '3:45 PM',
    estimatedMinutes: Math.round(estimatedTime),
    distance: '2.3 km',
    currentLocation: currentAddress,
    driver: {
      name: 'Kasun Perera',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      phone: '+94 77 123 4567',
      vehicleNumber: 'WP CAB-1234',
      vehicleType: 'Delivery Bike',
      totalDeliveries: 2847,
      vehicleColor: 'Blue',
      isOnline: true
    },
    timeline: [
      {
        label: 'Order Confirmed',
        time: '1:15 PM',
        completed: true,
        description: 'Your order has been confirmed and payment processed',
        icon: CheckCircleIcon,
        color: '#10b981'
      },
      {
        label: 'Pharmacy Preparing',
        time: '1:30 PM',
        completed: true,
        description: 'Medicines are being prepared and quality checked',
        icon: LocalShippingIcon,
        color: '#3b82f6'
      },
      {
        label: 'Out for Delivery',
        time: '2:45 PM',
        completed: true,
        description: 'Driver has picked up your order and is on the way',
        icon: DirectionsCarIcon,
        color: '#f59e0b'
      },
      {
        label: 'Delivered',
        time: 'Soon',
        completed: false,
        description: 'Order will be delivered to your doorstep',
        icon: CheckCircleOutlineIcon,
        color: '#64748b'
      }
    ],
    items: [
      { name: 'Panadol Extra 500mg', quantity: 2, price: 450, image: '/api/placeholder/40/40' },
      { name: 'Vitamin C 1000mg', quantity: 1, price: 1250, image: '/api/placeholder/40/40' },
      { name: 'Omeprazole 20mg', quantity: 1, price: 850, image: '/api/placeholder/40/40' }
    ],
    deliveryAddress: {
      name: 'John Silva',
      address: '123 Galle Road, Colombo 03',
      phone: '+94 77 987 6543',
      coordinates: customerLocation
    },
    paymentMethod: 'Cash on Delivery',
    totalAmount: 2550,
    deliveryFee: 200
  };

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (window.google && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: driverLocation,
          zoom: 15,
          styles: [
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
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true
        });

        mapInstanceRef.current = map;

        // Add driver marker with custom icon
        const driverIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#10b981" stroke="white" stroke-width="3"/>
              <path d="M20 10 L26 18 L14 18 Z" fill="white"/>
              <circle cx="20" cy="20" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        };

        driverMarkerRef.current = new window.google.maps.Marker({
          position: driverLocation,
          map: map,
          icon: driverIcon,
          title: `${deliveryData.driver.name} - ${deliveryData.driver.vehicleNumber}`,
          animation: window.google.maps.Animation.DROP
        });

        // Add customer marker
        const customerIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 0 C6.7 0 0 6.7 0 15 C0 25 15 40 15 40 S30 25 30 15 C30 6.7 23.3 0 15 0 Z" fill="#ef4444"/>
              <circle cx="15" cy="15" r="8" fill="white"/>
              <circle cx="15" cy="15" r="4" fill="#ef4444"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 40),
          anchor: new window.google.maps.Point(15, 40)
        };

        customerMarkerRef.current = new window.google.maps.Marker({
          position: customerLocation,
          map: map,
          icon: customerIcon,
          title: 'Delivery Location'
        });

        // Add route between driver and customer
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });
        directionsRenderer.setMap(map);

        directionsService.route({
          origin: driverLocation,
          destination: customerLocation,
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          }
        });

        setMapLoaded(true);
      }
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [driverLocation, customerLocation]);

  // Simulate real-time driver location updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (deliveryProgress < 100 && mapLoaded) {
        // Simulate driver movement towards customer
        setDriverLocation(prev => {
          const newLat = prev.lat + (customerLocation.lat - prev.lat) * 0.005;
          const newLng = prev.lng + (customerLocation.lng - prev.lng) * 0.005;
          
          // Update marker position
          if (driverMarkerRef.current) {
            driverMarkerRef.current.setPosition({ lat: newLat, lng: newLng });
          }

          return { lat: newLat, lng: newLng };
        });

        setDeliveryProgress(prev => Math.min(prev + 0.5, 100));
        setEstimatedTime(prev => Math.max(prev - 0.1, 0));

        // Update address based on location (mock)
        const addresses = [
          'Colombo 03, Near Town Hall',
          'Galle Road, Bambalapitiya',
          'Marine Drive, Colombo 03',
          'Your delivery address'
        ];
        const addressIndex = Math.floor(deliveryProgress / 25);
        if (addresses[addressIndex]) {
          setCurrentAddress(addresses[addressIndex]);
        }
      }
    }, 2000); // Update every 2 seconds for smooth animation

    return () => clearInterval(interval);
  }, [deliveryProgress, mapLoaded, customerLocation]);

  const handleCallDriver = () => {
    window.open(`tel:${deliveryData.driver.phone}`);
  };

  const handleMessageDriver = () => {
    // In real app, this would open WhatsApp or in-app chat
    const message = `Hi ${deliveryData.driver.name}, I'm tracking my NPK Pharmacy order ${deliveryData.orderId}. Thank you!`;
    const whatsappUrl = `https://wa.me/${deliveryData.driver.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'NPK Pharmacy Delivery Tracking',
        text: `Track my medicine delivery: Order ${deliveryData.orderId}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tracking link copied to clipboard!');
    }
  };

  const centerMapOnDriver = () => {
    if (mapInstanceRef.current && driverMarkerRef.current) {
      mapInstanceRef.current.setCenter(driverLocation);
      mapInstanceRef.current.setZoom(16);
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      fullScreen
      PaperProps={{
        sx: { 
          borderRadius: 0,
          backgroundColor: '#f8fafc'
        }
      }}
    >
      {/* Professional Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} sx={{ mr: 2 }}>
            <CloseIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="600">
              Live Delivery Tracking
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Order #{deliveryData.orderId} • {deliveryData.driver.name}
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleShareLocation}>
            <ShareIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Live Map Section */}
        <Box sx={{ height: '50%', position: 'relative', backgroundColor: '#e2e8f0' }}>
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#e2e8f0'
            }}
          />
          
          {/* Map Loading Overlay */}
          {!mapLoaded && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(248, 250, 252, 0.9)',
                zIndex: 1000
              }}
            >
              <Box textAlign="center">
                <CircularProgress size={48} sx={{ color: '#3b82f6', mb: 2 }} />
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Loading Live Map...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connecting to GPS tracking system
                </Typography>
              </Box>
            </Box>
          )}

          {/* Map Controls */}
          <Fab
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
            onClick={centerMapOnDriver}
          >
            <MyLocationIcon sx={{ color: '#3b82f6' }} />
          </Fab>

          {/* Live Status Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: 'rgba(16, 185, 129, 0.95)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                backgroundColor: '#4ade80',
                borderRadius: '50%',
                mr: 1,
                animation: 'pulse 2s infinite'
              }}
            />
            <Typography variant="body2" fontWeight="600">
              LIVE TRACKING
            </Typography>
          </Box>
        </Box>

        {/* Bottom Content Section */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Status Header */}
          <Box sx={{ px: 3, py: 2, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h5" fontWeight="700" color="#1e293b">
                  Arriving in {deliveryData.estimatedMinutes} mins
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <LocationOnIcon sx={{ fontSize: 16, color: '#64748b', mr: 0.5 }} />
                  <Typography variant="body2" color="#64748b">
                    {currentAddress} • {deliveryData.distance}
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="right">
                <Chip
                  label="ON THE WAY"
                  sx={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
                <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                  {Math.round(deliveryProgress)}% complete
                </Typography>
              </Box>
            </Box>

            <LinearProgress
              variant="determinate"
              value={deliveryProgress}
              sx={{
                mt: 2,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#10b981',
                  borderRadius: 3
                }
              }}
            />
          </Box>

          {/* Driver Information Card */}
          <Box sx={{ px: 3, py: 2, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="600" color="#1e293b">
                Your Delivery Partner
              </Typography>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    mr: 1
                  }}
                />
                <Typography variant="body2" color="#10b981" fontWeight="600">
                  Online
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={3}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      border: '2px solid white'
                    }}
                  />
                }
              >
                <Avatar
                  src={deliveryData.driver.photo}
                  sx={{ width: 64, height: 64, mr: 2, border: '3px solid #e2e8f0' }}
                />
              </Badge>
              <Box flex={1}>
                <Typography variant="h6" fontWeight="600" color="#1e293b">
                  {deliveryData.driver.name}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <StarIcon sx={{ fontSize: 16, color: '#fbbf24', mr: 0.5 }} />
                  <Typography variant="body2" fontWeight="600" color="#1e293b">
                    {deliveryData.driver.rating}
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ ml: 1 }}>
                    ({deliveryData.driver.totalDeliveries.toLocaleString()} deliveries)
                  </Typography>
                </Box>
                <Typography variant="body2" color="#64748b">
                  {deliveryData.driver.vehicleType} • {deliveryData.driver.vehicleNumber}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CallIcon />}
                  onClick={handleCallDriver}
                  sx={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    '&:hover': {
                      backgroundColor: '#059669',
                      boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
                    }
                  }}
                >
                  Call Driver
                </Button>
              </Grid>
              <Grid xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SmsIcon />}
                  onClick={handleMessageDriver}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#374151',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb'
                    }
                  }}
                >
                  Message
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Delivery Timeline */}
          <Box sx={{ px: 3, py: 3, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight="600" color="#1e293b" mb={3}>
              Delivery Progress
            </Typography>

            <Box>
              {deliveryData.timeline.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Box key={index} display="flex" alignItems="flex-start" mb={index < deliveryData.timeline.length - 1 ? 3 : 0}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: step.completed ? step.color : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                        flexShrink: 0,
                        border: step.completed ? 'none' : '2px solid #e2e8f0'
                      }}
                    >
                      <IconComponent
                        sx={{
                          fontSize: 20,
                          color: step.completed ? 'white' : '#94a3b8'
                        }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Typography
                          variant="body1"
                          fontWeight="600"
                          color={step.completed ? '#1e293b' : '#64748b'}
                        >
                          {step.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={step.completed ? '#059669' : '#94a3b8'}
                          fontWeight="500"
                        >
                          {step.time}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="#64748b">
                        {step.description}
                      </Typography>
                      {index < deliveryData.timeline.length - 1 && (
                        <Box
                          sx={{
                            width: 2,
                            height: 24,
                            backgroundColor: step.completed ? step.color : '#e2e8f0',
                            ml: 2.5,
                            mt: 1
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Order Summary */}
          <Box sx={{ px: 3, py: 3, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight="600" color="#1e293b" mb={3}>
              Order Summary
            </Typography>

            {deliveryData.items.map((item, index) => (
              <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#f1f5f9',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <LocalShippingIcon sx={{ fontSize: 20, color: '#64748b' }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight="500" color="#1e293b">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="#64748b">
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" fontWeight="600" color="#1e293b">
                  Rs. {item.price.toLocaleString()}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="#64748b">
                Subtotal
              </Typography>
              <Typography variant="body2" color="#64748b">
                Rs. {deliveryData.totalAmount.toLocaleString()}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2" color="#64748b">
                Delivery Fee
              </Typography>
              <Typography variant="body2" color="#64748b">
                Rs. {deliveryData.deliveryFee.toLocaleString()}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="700" color="#1e293b">
                Total Amount
              </Typography>
              <Typography variant="h6" fontWeight="700" color="#059669">
                Rs. {(deliveryData.totalAmount + deliveryData.deliveryFee).toLocaleString()}
              </Typography>
            </Box>

            <Box mt={2} p={2} sx={{ backgroundColor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
              <Typography variant="body2" color="#166534" fontWeight="500">
                💰 Payment Method: {deliveryData.paymentMethod}
              </Typography>
            </Box>
          </Box>

          {/* Delivery Address */}
          <Box sx={{ px: 3, py: 3, backgroundColor: 'white' }}>
            <Typography variant="h6" fontWeight="600" color="#1e293b" mb={3}>
              Delivery Address
            </Typography>
            
            <Box display="flex" alignItems="flex-start">
              <LocationOnIcon sx={{ color: '#ef4444', mr: 2, mt: 0.5, fontSize: 24 }} />
              <Box flex={1}>
                <Typography variant="body1" fontWeight="600" color="#1e293b" mb={0.5}>
                  {deliveryData.deliveryAddress.name}
                </Typography>
                <Typography variant="body2" color="#64748b" mb={1}>
                  {deliveryData.deliveryAddress.address}
                </Typography>
                <Box display="flex" alignItems="center">
                  <PhoneIcon sx={{ fontSize: 16, color: '#64748b', mr: 1 }} />
                  <Typography variant="body2" color="#64748b">
                    {deliveryData.deliveryAddress.phone}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Global Styles for Professional Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .driver-marker {
          animation: pulse 2s infinite;
        }
        
        .status-badge {
          animation: pulse 2s infinite;
        }
        
        .tracking-card {
          animation: slideInUp 0.5s ease-out;
        }
        
        /* Custom scrollbar for better UX */
        .delivery-content::-webkit-scrollbar {
          width: 4px;
        }
        
        .delivery-content::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        .delivery-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        
        .delivery-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </Dialog>
  );
};

export default DeliveryTracker;


