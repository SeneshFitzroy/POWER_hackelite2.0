import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tab,
  Tabs,
  Badge,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  AppBar,
  Toolbar,
  Drawer,
  ListItemButton,
  ListItemIcon
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as BikeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Map as MapIcon,
  Route as RouteIcon,
  Speed as SpeedIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  NotificationsActive as AlertIcon,
  Warning as WarningIcon,
  Assignment as OrderIcon,
  Star as StarIcon,
  Logout as LogoutIcon,
  Navigation,
  MyLocation,
  Store as StoreIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const AdminDeliveryManagement = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [mapView, setMapView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDeliveryDialog, setNewDeliveryDialog] = useState(false);
  const [newDriverDialog, setNewDriverDialog] = useState(false);
  
  // Map related states
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  const [deliveryForm, setDeliveryForm] = useState({
    customer: '',
    address: '',
    phone: '',
    driverName: '',
    priority: 'medium',
    value: ''
  });
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    vehicleType: 'Bike',
    licenseNumber: '',
    experience: ''
  });
  
  const drawerWidth = 280;

  // Add global styles for animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.3;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.1;
        }
        100% {
          transform: scale(1);
          opacity: 0.3;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Logout handler
  const handleLogout = () => {
    // Clear only delivery management-specific data, not main authentication
    localStorage.removeItem('deliverySession');
    localStorage.removeItem('currentDeliveryView');
    
    // Navigate back to ERP Dashboard
    window.location.href = '/?screen=dashboard';
  };

  // Mock data for delivery statistics
  const deliveryStats = {
    totalDeliveries: 1247,
    activeDeliveries: 89,
    completedToday: 156,
    pendingPickups: 23,
    avgDeliveryTime: '2.4h',
    onTimeRate: 94.2,
    customerSatisfaction: 4.8
  };

  // Mock data for active deliveries
    const activeDeliveries = [
    {
      id: 'DEL001',
      orderNumber: 'ORD-2024-001',
      customer: 'Dr. Nimal Perera',
      driverName: 'Kamal Silva',
      vehicle: 'Bike',
      status: 'In Transit',
      estimatedTime: '15 mins',
      value: 8500,
      priority: 'High',
      coordinates: { lat: 6.9349, lng: 79.8538 } // Colombo 03
    },
    {
      id: 'DEL002',
      orderNumber: 'ORD-2024-002',
      customer: 'Lanka Hospital',
      driverName: 'Sunil Fernando',
      vehicle: 'Car',
      status: 'Out for Delivery',
      estimatedTime: '8 mins',
      value: 25000,
      priority: 'Critical',
      coordinates: { lat: 6.9147, lng: 79.8731 } // Colombo 05
    },
    {
      id: 'DEL003',
      orderNumber: 'ORD-2024-003',
      customer: 'City Medical Center',
      driverName: 'Chaminda Rathnayake',
      vehicle: 'Truck',
      status: 'Delivered',
      estimatedTime: 'Completed',
      value: 75000,
      priority: 'Medium',
      coordinates: { lat: 6.9022, lng: 79.8610 } // Colombo 06
    },
    {
      id: 'DEL004',
      orderNumber: 'ORD-2024-004',
      customer: 'Apex Pharmacy',
      driverName: 'Ravi Gunasekara',
      vehicle: 'Bike',
      status: 'In Transit',
      estimatedTime: '22 mins',
      value: 12500,
      priority: 'Low',
      coordinates: { lat: 6.9388, lng: 79.8542 } // Colombo 04
    }
  ];

  // Load data from Firestore on component mount
  useEffect(() => {
    loadDeliveries();
    loadDrivers();
  }, []);

  const loadDeliveries = async () => {
    try {
      if (db) {
        const deliveriesRef = collection(db, 'deliveries');
        const q = query(deliveriesRef, orderBy('createdAt', 'desc'));
        onSnapshot(q, (snapshot) => {
          const deliveriesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setDeliveries(deliveriesData.slice(0, 10)); // Limit to 10 recent deliveries
        });
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      if (db) {
        const driversRef = collection(db, 'drivers');
        const q = query(driversRef, orderBy('name'));
        onSnapshot(q, (snapshot) => {
          const driversData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setDrivers(driversData);
        });
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const formatLKR = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle New Delivery Creation
  const handleCreateDelivery = async () => {
    if (!deliveryForm.customer || !deliveryForm.address || !deliveryForm.driverName) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (db) {
        await addDoc(collection(db, 'deliveries'), {
          ...deliveryForm,
          status: 'In Transit',
          vehicle: 'Bike',
          estimatedTime: '15 mins',
          createdAt: new Date(),
          orderId: `ORD-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        });
        
        setDeliveryForm({
          customer: '',
          address: '',
          phone: '',
          driverName: '',
          priority: 'medium',
          value: ''
        });
        setNewDeliveryDialog(false);
        alert('Delivery created successfully!');
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
      alert('Error creating delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle New Driver Creation
  const handleCreateDriver = async () => {
    if (!driverForm.name || !driverForm.phone || !driverForm.licenseNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (db) {
        await addDoc(collection(db, 'drivers'), {
          ...driverForm,
          status: 'Available',
          deliveries: 0,
          rating: 5.0,
          location: 'Colombo',
          createdAt: new Date(),
          driverId: `DRV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        });
        
        setDriverForm({
          name: '',
          phone: '',
          vehicleType: 'Bike',
          licenseNumber: '',
          experience: ''
        });
        setNewDriverDialog(false);
        alert('Driver added successfully!');
      }
    } catch (error) {
      console.error('Error creating driver:', error);
      alert('Error adding driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Refresh Data
  const handleRefreshData = () => {
    setLoading(true);
    loadDeliveries();
    loadDrivers();
    setTimeout(() => setLoading(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'in transit': return 'info';
      case 'out for delivery': return 'warning';
      case 'pickup complete': return 'success';
      case 'delivered': return 'success';
      case 'pending': return 'default';
      case 'active': return 'success';
      case 'available': return 'primary';
      default: return 'default';
    }
  };

  // Google Maps Functions
  const initializeMap = () => {
    if (window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 6.9271, lng: 79.8612 }, // Colombo, Sri Lanka
        zoom: 13,
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
      setMapLoaded(true);
      
      // Load markers after a short delay to ensure map is ready
      setTimeout(() => {
        loadMapData();
      }, 500);
    }
  };

  const loadMapData = () => {
    if (!mapInstanceRef.current) {
      return;
    }

    console.log('Loading map data with deliveries:', deliveries.length, 'drivers:', drivers.length);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Predefined locations around Colombo for better demo
    const demoLocations = [
      { lat: 6.9271, lng: 79.8612, name: "Colombo Fort" },
      { lat: 6.9147, lng: 79.8730, name: "Bambalapitiya" },
      { lat: 6.8649, lng: 79.8797, name: "Dehiwala" },
      { lat: 6.9497, lng: 79.8500, name: "Pettah" },
      { lat: 6.9034, lng: 79.8597, name: "Wellawatta" },
      { lat: 6.8846, lng: 79.8746, name: "Mount Lavinia" },
      { lat: 6.9167, lng: 79.8448, name: "Slave Island" },
      { lat: 6.9271, lng: 79.8612, name: "Galle Face" }
    ];

    // Add delivery markers
    deliveries.forEach((delivery, index) => {
      const location = demoLocations[index % demoLocations.length];
      // Add small random offset
      const lat = location.lat + (Math.random() - 0.5) * 0.01;
      const lng = location.lng + (Math.random() - 0.5) * 0.01;

      const deliveryIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0 C6.7 0 0 6.7 0 15 C0 25 15 40 15 40 S30 25 30 15 C30 6.7 23.3 0 15 0 Z" fill="${delivery.status === 'delivered' ? '#10b981' : '#ef4444'}"/>
            <circle cx="15" cy="15" r="8" fill="white"/>
            <circle cx="15" cy="15" r="4" fill="${delivery.status === 'delivered' ? '#10b981' : '#ef4444'}"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(30, 40),
        anchor: new window.google.maps.Point(15, 40)
      };

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        icon: deliveryIcon,
        title: `${delivery.customer} - ${delivery.status}`,
        animation: window.google.maps.Animation.DROP
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: 'Roboto', Arial, sans-serif; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 16px;">📦 ${delivery.customer}</h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>📍 Address:</strong> ${delivery.address}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>📊 Status:</strong> <span style="color: ${delivery.status === 'delivered' ? '#10b981' : '#ef4444'}; font-weight: bold;">${delivery.status}</span></p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>🚚 Driver:</strong> ${delivery.driverName}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>⚡ Priority:</strong> ${delivery.priority}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Add driver markers
    drivers.forEach((driver, index) => {
      const location = demoLocations[(index + 3) % demoLocations.length];
      // Add small random offset
      const lat = location.lat + (Math.random() - 0.5) * 0.01;
      const lng = location.lng + (Math.random() - 0.5) * 0.01;

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

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        icon: driverIcon,
        title: `${driver.name} - ${driver.vehicleType}`,
        animation: window.google.maps.Animation.DROP
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: 'Roboto', Arial, sans-serif; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #10b981; font-size: 16px;">🚚 ${driver.name}</h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>🚗 Vehicle:</strong> ${driver.vehicleType}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>📱 Phone:</strong> ${driver.phone}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>🆔 License:</strong> ${driver.licenseNumber}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>⭐ Experience:</strong> ${driver.experience} years</p>
            <div style="margin-top: 8px; padding: 4px 8px; background: #f0fdf4; border-radius: 4px; text-align: center;">
              <span style="color: #10b981; font-weight: bold; font-size: 12px;">🟢 ONLINE & AVAILABLE</span>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    console.log('Added', markersRef.current.length, 'markers to map');
  };

  const showAllRoutes = () => {
    if (!mapInstanceRef.current || deliveries.length === 0 || drivers.length === 0) {
      console.log('Cannot show routes: map not ready or no data');
      return;
    }

    console.log('Showing routes for', deliveries.length, 'deliveries and', drivers.length, 'drivers');

    // Predefined locations for demo
    const demoLocations = [
      { lat: 6.9271, lng: 79.8612 },
      { lat: 6.9147, lng: 79.8730 },
      { lat: 6.8649, lng: 79.8797 },
      { lat: 6.9497, lng: 79.8500 },
      { lat: 6.9034, lng: 79.8597 }
    ];

    const routeColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Create routes between drivers and active deliveries
    const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
    
    activeDeliveries.slice(0, Math.min(3, drivers.length)).forEach((delivery, index) => {
      if (drivers[index]) {
        const driverLocation = demoLocations[index % demoLocations.length];
        const deliveryLocation = demoLocations[(index + 2) % demoLocations.length];

        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: routeColors[index % routeColors.length],
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });
        directionsRenderer.setMap(mapInstanceRef.current);

        directionsService.route({
          origin: driverLocation,
          destination: deliveryLocation,
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            console.log(`Route ${index + 1} created successfully`);
          } else {
            console.log(`Route ${index + 1} failed:`, status);
          }
        });
      }
    });
  };

  // Initialize Google Maps when tab is accessed
  useEffect(() => {
    if (currentTab === 3) {
      // Load Google Maps API if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBVWaKrjvy3MaE7SQ74_uJiULgl1JzgjwE&libraries=geometry,places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else if (!mapLoaded) {
        initializeMap();
      }
    }
  }, [currentTab, deliveries, drivers]);

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#f87171';
      case 'medium': return '#fbbf24';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Professional Real-like Delivery Map Component
  const DeliveryMap = () => {
    const [mapMode, setMapMode] = useState('live');
    
    return (
      <Paper sx={{ 
        p: 3, 
        borderRadius: '12px', 
        height: '500px', 
        position: 'relative',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb'
      }}>
        {/* Map Header with Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e40af' }}>
            <MapIcon />
            Live Delivery Tracking
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={mapMode === 'live' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setMapMode('live')}
              sx={{ 
                backgroundColor: mapMode === 'live' ? '#1e40af' : 'transparent',
                color: mapMode === 'live' ? 'white' : '#1e40af',
                borderColor: '#1e40af',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: mapMode === 'live' ? '#1e3a8a' : '#f0f9ff'
                }
              }}
            >
              Live
            </Button>
            <Button
              variant={mapMode === 'routes' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setMapMode('routes')}
              sx={{ 
                backgroundColor: mapMode === 'routes' ? '#1e40af' : 'transparent',
                color: mapMode === 'routes' ? 'white' : '#1e40af',
                borderColor: '#1e40af',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: mapMode === 'routes' ? '#1e3a8a' : '#f0f9ff'
                }
              }}
            >
              Routes
            </Button>
          </Box>
        </Box>

        {/* Real-like Map Interface */}
        <Box 
          sx={{ 
            width: '100%', 
            height: '420px', 
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            position: 'relative',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            backgroundImage: `
              linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
              linear-gradient(180deg, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Map Navigation Controls */}
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton 
              size="small" 
              sx={{ 
                backgroundColor: 'white', 
                boxShadow: 1, 
                width: 32,
                height: 32,
                '&:hover': { backgroundColor: '#f9fafb' } 
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ 
                backgroundColor: 'white', 
                boxShadow: 1, 
                width: 32,
                height: 32,
                '&:hover': { backgroundColor: '#f9fafb' } 
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Delivery Vehicle Markers */}
          {activeDeliveries.slice(0, 6).map((delivery, index) => {
            const positions = [
              { left: '15%', top: '20%' },
              { left: '35%', top: '40%' },
              { left: '60%', top: '25%' },
              { left: '25%', top: '65%' },
              { left: '75%', top: '55%' },
              { left: '45%', top: '75%' }
            ];
            
            return (
              <Box
                key={delivery.id}
                sx={{
                  position: 'absolute',
                  left: positions[index]?.left || '50%',
                  top: positions[index]?.top || '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 50
                }}
              >
                <Tooltip 
                  title={
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">{delivery.customer}</Typography>
                      <Typography variant="body2">Driver: {delivery.driverName}</Typography>
                      <Typography variant="body2">Status: {delivery.status}</Typography>
                      <Typography variant="body2">ETA: {delivery.estimatedTime}</Typography>
                    </Box>
                  } 
                  placement="top"
                >
                  <Box
                    sx={{
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        transition: 'transform 0.2s'
                      }
                    }}
                    onClick={() => setSelectedDelivery(delivery)}
                  >
                    {/* Vehicle Icon */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: delivery.status === 'In Transit' ? '#1e40af' : 
                                       delivery.status === 'Out for Delivery' ? '#f59e0b' : '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '3px solid white'
                      }}
                    >
                      {delivery.vehicle === 'Bike' ? <BikeIcon fontSize="small" /> : 
                       delivery.vehicle === 'Car' ? <CarIcon fontSize="small" /> : <TruckIcon fontSize="small" />}
                    </Box>
                    
                    {/* Pulse Animation for Active Deliveries */}
                    {delivery.status === 'In Transit' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: '#1e40af',
                          opacity: 0.3,
                          '@keyframes pulse': {
                            '0%': {
                              transform: 'scale(1)',
                              opacity: 0.3,
                            },
                            '50%': {
                              transform: 'scale(1.2)',
                              opacity: 0.1,
                            },
                            '100%': {
                              transform: 'scale(1)',
                              opacity: 0.3,
                            },
                          },
                          animation: 'pulse 2s infinite'
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              </Box>
            );
          })}

          {/* Route Lines (when in routes mode) */}
          {mapMode === 'routes' && (
            <svg 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                pointerEvents: 'none' 
              }}
            >
              {activeDeliveries.slice(0, 3).map((_, index) => (
                <path
                  key={index}
                  d={`M ${15 + index * 20}% 20% Q ${30 + index * 15}% 40% ${45 + index * 10}% 75%`}
                  stroke="#1e40af"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="5,5"
                  opacity="0.7"
                />
              ))}
            </svg>
          )}

          {/* Delivery Zones Legend */}
          <Box sx={{ position: 'absolute', bottom: 15, left: 15, backgroundColor: 'white', p: 1.5, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="caption" fontWeight="bold" sx={{ color: '#1e40af', mb: 1, display: 'block' }}>
              Active Zones
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, backgroundColor: '#1e40af', borderRadius: '50%' }} />
                <Typography variant="caption">High Priority ({activeDeliveries.filter(d => d.priority === 'high').length})</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, backgroundColor: '#f59e0b', borderRadius: '50%' }} />
                <Typography variant="caption">Medium Priority ({activeDeliveries.filter(d => d.priority === 'medium').length})</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, backgroundColor: '#10b981', borderRadius: '50%' }} />
                <Typography variant="caption">Low Priority ({activeDeliveries.filter(d => d.priority === 'low').length})</Typography>
              </Box>
            </Box>
          </Box>

          {/* Live Map Statistics */}
          <Box sx={{ position: 'absolute', top: 15, left: 15, backgroundColor: 'white', p: 1.5, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="caption" fontWeight="bold" sx={{ color: '#1e40af', mb: 1, display: 'block' }}>
              Live Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption">Active: {activeDeliveries.length}</Typography>
              <Typography variant="caption">Avg Speed: 45 km/h</Typography>
              <Typography variant="caption">Coverage: 85%</Typography>
            </Box>
          </Box>

          {/* Location Marker */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 15, 
            right: 15, 
            backgroundColor: 'rgba(30, 64, 175, 0.9)', 
            p: 1.5, 
            borderRadius: '8px',
            color: 'white'
          }}>
            <Typography variant="body2" fontWeight="bold">
              📍 Colombo Region
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeDeliveries.length} Active Deliveries
            </Typography>
          </Box>

          {/* Legend */}
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            backgroundColor: 'rgba(255,255,255,0.9)', 
            p: 1.5, 
            borderRadius: '8px',
            backdropFilter: 'blur(4px)'
          }}>
            <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
              Status Legend
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: '50%' }} />
                <Typography variant="caption">In Transit</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#f59e0b', borderRadius: '50%' }} />
                <Typography variant="caption">Out for Delivery</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: '50%' }} />
                <Typography variant="caption">Delivered</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  // Stats Cards Component
  const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card sx={{ 
      borderRadius: '16px',
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: 'white',
      height: '120px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem', fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5, fontSize: '1.5rem' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 28, opacity: 0.8 }} />
        </Box>
      </CardContent>
    </Card>
  );

  const renderDashboard = () => (
    <Container maxWidth="xl" sx={{ py: 4, px: 4 }}>
      {/* Professional Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: '#1e40af', mb: 1 }}>
            Delivery Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Real-time delivery tracking and fleet management
            </Typography>
            <Chip 
              label="Live"
              size="small"
              sx={{
                backgroundColor: '#10b981',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '11px'
              }}
            />
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewDeliveryDialog(true)}
            disabled={loading}
            sx={{ 
              borderRadius: '8px', 
              backgroundColor: '#1e40af', 
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
              '&:hover': { 
                backgroundColor: '#1e3a8a',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(30, 64, 175, 0.4)'
              }
            }}
          >
            New Delivery
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
            disabled={loading}
            sx={{ 
              borderRadius: '8px',
              borderColor: '#1e40af',
              color: '#1e40af',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { 
                borderColor: '#1e3a8a',
                backgroundColor: '#f0f9ff',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </Box>
      </Box>

      {/* Compact Professional Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 2, 
            borderRadius: '8px', 
            backgroundColor: '#1e40af',
            color: 'white',
            minHeight: '100px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <TruckIcon sx={{ fontSize: 24, opacity: 0.9 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5, fontSize: '2rem' }}>
              1247
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>Total Deliveries</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 2, 
            borderRadius: '8px', 
            backgroundColor: '#10b981',
            color: 'white',
            minHeight: '100px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <CheckIcon sx={{ fontSize: 24, opacity: 0.9 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5, fontSize: '2rem' }}>
              89
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>Active Deliveries</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 2, 
            borderRadius: '8px', 
            backgroundColor: '#f59e0b',
            color: 'white',
            minHeight: '100px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <WarningIcon sx={{ fontSize: 24, opacity: 0.9 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5, fontSize: '2rem' }}>
              3
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>Late Deliveries</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 2, 
            borderRadius: '8px', 
            backgroundColor: '#dc2626',
            color: 'white',
            minHeight: '100px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <TimeIcon sx={{ fontSize: 24, opacity: 0.9 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5, fontSize: '2rem' }}>
              2
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>Critical Issues</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 2, 
            borderRadius: '8px', 
            backgroundColor: '#7c3aed',
            color: 'white',
            minHeight: '100px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <TruckIcon sx={{ fontSize: 24, opacity: 0.9 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5, fontSize: '1.5rem' }}>
              LKR 1,248,075
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>Delivery Revenue</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Map and Active Deliveries */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid xs={12} md={8}>
          <DeliveryMap />
        </Grid>
        <Grid xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '12px', 
            height: '500px', 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e40af' }}>
                <AlertIcon />
                Active Deliveries
              </Typography>
              <Chip 
                label={4}
                size="small"
                sx={{
                  backgroundColor: '#1e40af',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <List sx={{ height: '100%', overflow: 'auto', p: 0 }}>
                {activeDeliveries.filter(d => d.status !== 'Delivered').slice(0, 4).map((delivery, index) => (
                  <Box 
                    key={delivery.id} 
                    sx={{ 
                      p: 2,
                      mb: 1.5,
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        backgroundColor: '#f1f5f9',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.1)'
                      }
                    }}
                    onClick={() => setSelectedDelivery(delivery)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ 
                        bgcolor: delivery.status === 'In Transit' ? '#1e40af' : 
                                 delivery.status === 'Out for Delivery' ? '#f59e0b' : '#10b981',
                        width: 36,
                        height: 36
                      }}>
                        {delivery.vehicle === 'Bike' ? <BikeIcon /> : 
                         delivery.vehicle === 'Car' ? <CarIcon /> : <TruckIcon />}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1f2937', fontSize: '14px' }} noWrap>
                            {delivery.customer}
                          </Typography>
                          <Chip 
                            label={delivery.status}
                            size="small"
                            sx={{
                              backgroundColor: delivery.status === 'In Transit' ? '#dbeafe' : 
                                             delivery.status === 'Out for Delivery' ? '#fef3c7' : '#d1fae5',
                              color: delivery.status === 'In Transit' ? '#1e40af' : 
                                     delivery.status === 'Out for Delivery' ? '#92400e' : '#065f46',
                              fontWeight: 600,
                              fontSize: '10px',
                              height: '20px'
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                          {delivery.orderNumber} • {delivery.driverName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                          ETA: {delivery.estimatedTime} • LKR {delivery.value?.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>


    </Container>
  );

  const renderDrivers = () => (
    <Container maxWidth="xl" sx={{ py: 4, px: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">Driver Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewDriverDialog(true)}
          disabled={loading}
          sx={{ 
            borderRadius: '10px', 
            backgroundColor: '#1e40af',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#1e3a8a' }
          }}
        >
          Add Driver
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell fontWeight="bold">Driver</TableCell>
              <TableCell fontWeight="bold">Vehicle</TableCell>
              <TableCell fontWeight="bold">Status</TableCell>
              <TableCell fontWeight="bold">Active Deliveries</TableCell>
              <TableCell fontWeight="bold">Rating</TableCell>
              <TableCell fontWeight="bold">Location</TableCell>
              <TableCell fontWeight="bold">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {driver.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="medium">{driver.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {driver.phone}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{driver.vehicle}</TableCell>
                <TableCell>
                  <Chip label={driver.status} color={getStatusColor(driver.status)} size="small" />
                </TableCell>
                <TableCell>{driver.deliveries}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                    <Typography variant="body2">{driver.rating}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{driver.location}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Driver">
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );

  const tabs = [
    { label: 'Dashboard', icon: DashboardIcon },
    { label: 'Drivers', icon: PersonIcon },
    { label: 'Analytics', icon: SpeedIcon }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Professional Sidebar */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#1e40af',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
          },
        }}
      >
        {/* Logo Section */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
              COREERP
            </Typography>
            <Box sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              px: 2, 
              py: 0.5, 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Typography variant="caption" sx={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>
                DELIVERY MODULE
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation Items - Delivery Focused */}
        <List sx={{ p: 2, flex: 1 }}>
          <ListItemButton 
            selected={currentTab === 0}
            onClick={() => setCurrentTab(0)}
            sx={{ 
              borderRadius: '8px', 
              mb: 1,
              mx: 1,
              backgroundColor: currentTab === 0 ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              '& .MuiListItemIcon-root': { color: 'white', minWidth: 40 },
              '& .MuiListItemText-primary': { 
                color: 'white', 
                fontWeight: currentTab === 0 ? 700 : 500 
              },
              border: currentTab === 0 ? '1px solid rgba(255,255,255,0.3)' : 'none'
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard Overview" 
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItemButton>

          <ListItemButton 
            selected={currentTab === 1}
            onClick={() => setCurrentTab(1)}
            sx={{ 
              borderRadius: '8px', 
              mb: 1,
              mx: 1,
              backgroundColor: currentTab === 1 ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              '& .MuiListItemIcon-root': { color: 'white', minWidth: 40 },
              '& .MuiListItemText-primary': { 
                color: 'white', 
                fontWeight: currentTab === 1 ? 700 : 500 
              },
              border: currentTab === 1 ? '1px solid rgba(255,255,255,0.3)' : 'none'
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Driver Management" 
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItemButton>

          <ListItemButton 
            selected={currentTab === 2}
            onClick={() => setCurrentTab(2)}
            sx={{ 
              borderRadius: '8px', 
              mb: 1,
              mx: 1,
              backgroundColor: currentTab === 3 ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              '& .MuiListItemIcon-root': { color: 'white', minWidth: 40 },
              '& .MuiListItemText-primary': { 
                color: 'white', 
                fontWeight: currentTab === 3 ? 700 : 500 
              },
              border: currentTab === 3 ? '1px solid rgba(255,255,255,0.3)' : 'none'
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SpeedIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Analytics" 
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItemButton>
        </List>

        {/* Date & Time Section */}
        <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)', mt: 'auto' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
            CURRENT DATE & TIME
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold', mt: 1 }}>
            Sep 25, 2025
          </Typography>
          <Typography variant="body2" sx={{ color: 'white' }}>
            10:29 AM
          </Typography>
        </Box>

        {/* Logout Button */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: '8px',
              backgroundColor: '#dc2626',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#b91c1c'
              }
            }}
          >
            LOGOUT
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, backgroundColor: '#f8fafc', width: `calc(100% - ${drawerWidth}px)` }}>
        {/* Remove blank navigation bar completely */}

        {/* Content Area - Dynamic Based on Sidebar Selection */}
        <Box sx={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', overflow: 'auto' }}>
          {currentTab === 0 && renderDashboard()}
          {currentTab === 1 && renderDrivers()}
          {currentTab === 2 && (
            <Container maxWidth="xl" sx={{ py: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#1e40af', mb: 4 }}>
                Delivery Analytics & Performance
              </Typography>
              
              {/* Key Metrics Row */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid xs={12} md={3}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                        1,247
                      </Typography>
                      <TruckIcon sx={{ color: '#1e40af', fontSize: 32 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Deliveries
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#10b981' }}>
                      ↗ +12% from last month
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} md={3}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                        96.8%
                      </Typography>
                      <CheckIcon sx={{ color: '#10b981', fontSize: 32 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#10b981' }}>
                      ↗ +2.3% improvement
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} md={3}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                        2.1h
                      </Typography>
                      <TimeIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Avg Delivery Time
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#10b981' }}>
                      ↗ 0.3h faster
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} md={3}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#7c3aed', fontWeight: 'bold' }}>
                        4.9
                      </Typography>
                      <StarIcon sx={{ color: '#7c3aed', fontSize: 32 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Customer Rating
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#10b981' }}>
                      ↗ +0.1 points
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Charts Row */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Delivery Trends Chart */}
                <Grid xs={12} md={8}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1e40af' }}>
                      Delivery Trends (Last 7 Days)
                    </Typography>
                    <Box sx={{ 
                      height: 300, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '8px',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e5e7eb'
                    }}>
                      {/* Simple Bar Chart Visualization */}
                      <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, height: '80%' }}>
                        {[
                          { label: 'Mon', value: 85, color: '#1e40af' },
                          { label: 'Tue', value: 92, color: '#1e40af' },
                          { label: 'Wed', value: 78, color: '#1e40af' },
                          { label: 'Thu', value: 95, color: '#10b981' },
                          { label: 'Fri', value: 88, color: '#1e40af' },
                          { label: 'Sat', value: 102, color: '#10b981' },
                          { label: 'Sun', value: 76, color: '#f59e0b' }
                        ].map((day, index) => (
                          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 40,
                                height: `${day.value * 2}px`,
                                backgroundColor: day.color,
                                borderRadius: '4px 4px 0 0',
                                position: 'relative'
                              }}
                            >
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  position: 'absolute',
                                  top: -20,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  color: day.color
                                }}
                              >
                                {day.value}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
                              {day.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Status Distribution */}
                <Grid xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1e40af' }}>
                      Delivery Status
                    </Typography>
                    <Box sx={{ 
                      height: 300,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: 3
                    }}>
                      {/* Pie Chart Alternative - Progress Bars */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Delivered</Typography>
                          <Typography variant="body2" fontWeight="bold">89%</Typography>
                        </Box>
                        <Box sx={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: 8 }}>
                          <Box sx={{ width: '89%', backgroundColor: '#10b981', borderRadius: '4px', height: 8 }} />
                        </Box>
                      </Box>
                      
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">In Transit</Typography>
                          <Typography variant="body2" fontWeight="bold">7%</Typography>
                        </Box>
                        <Box sx={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: 8 }}>
                          <Box sx={{ width: '7%', backgroundColor: '#1e40af', borderRadius: '4px', height: 8 }} />
                        </Box>
                      </Box>
                      
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Delayed</Typography>
                          <Typography variant="body2" fontWeight="bold">3%</Typography>
                        </Box>
                        <Box sx={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: 8 }}>
                          <Box sx={{ width: '3%', backgroundColor: '#f59e0b', borderRadius: '4px', height: 8 }} />
                        </Box>
                      </Box>
                      
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Failed</Typography>
                          <Typography variant="body2" fontWeight="bold">1%</Typography>
                        </Box>
                        <Box sx={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: 8 }}>
                          <Box sx={{ width: '1%', backgroundColor: '#dc2626', borderRadius: '4px', height: 8 }} />
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Driver Performance & Fleet Analytics */}
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1e40af' }}>
                      Top Performing Drivers
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { name: 'Kamal Perera', deliveries: 47, rating: 4.9, efficiency: 98 },
                        { name: 'Sunil Fernando', deliveries: 42, rating: 4.8, efficiency: 95 },
                        { name: 'Nimal Silva', deliveries: 38, rating: 4.7, efficiency: 92 },
                        { name: 'Pradeep Kumar', deliveries: 35, rating: 4.6, efficiency: 89 }
                      ].map((driver, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 2,
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ backgroundColor: '#1e40af', width: 32, height: 32 }}>
                              {driver.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{driver.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {driver.deliveries} deliveries
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                              <Typography variant="body2" fontWeight="bold">{driver.rating}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {driver.efficiency}% efficiency
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                <Grid xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1e40af' }}>
                      Fleet Analytics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>Vehicle Utilization</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: '4px', height: 8 }}>
                            <Box sx={{ width: '78%', backgroundColor: '#1e40af', borderRadius: '4px', height: 8 }} />
                          </Box>
                          <Typography variant="body2" fontWeight="bold">78%</Typography>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>Fuel Efficiency</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: '4px', height: 8 }}>
                            <Box sx={{ width: '85%', backgroundColor: '#10b981', borderRadius: '4px', height: 8 }} />
                          </Box>
                          <Typography variant="body2" fontWeight="bold">85%</Typography>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>Maintenance Score</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: '4px', height: 8 }}>
                            <Box sx={{ width: '92%', backgroundColor: '#7c3aed', borderRadius: '4px', height: 8 }} />
                          </Box>
                          <Typography variant="body2" fontWeight="bold">92%</Typography>
                        </Box>
                      </Box>

                      {/* Fleet Breakdown */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 2 }}>Fleet Composition</Typography>
                        <Grid container spacing={1}>
                          <Grid xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                              <BikeIcon sx={{ color: '#1e40af', mb: 0.5 }} />
                              <Typography variant="caption" display="block">Bikes</Typography>
                              <Typography variant="body2" fontWeight="bold">12</Typography>
                            </Box>
                          </Grid>
                          <Grid xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                              <CarIcon sx={{ color: '#10b981', mb: 0.5 }} />
                              <Typography variant="caption" display="block">Cars</Typography>
                              <Typography variant="body2" fontWeight="bold">8</Typography>
                            </Box>
                          </Grid>
                          <Grid xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#fefce8', borderRadius: '8px' }}>
                              <TruckIcon sx={{ color: '#f59e0b', mb: 0.5 }} />
                              <Typography variant="caption" display="block">Vans</Typography>
                              <Typography variant="body2" fontWeight="bold">5</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          )}
          {currentTab === 3 && (
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <Box sx={{ px: 3, py: 2, backgroundColor: '#1e40af', color: 'white' }}>
                <Typography variant="h5" fontWeight="bold">
                  Live Delivery Tracking
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Real-time fleet monitoring and route optimization
                </Typography>
              </Box>

              {/* Map Controls */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                p: 2, 
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
                alignItems: 'center'
              }}>
                <Button
                  variant="contained"
                  startIcon={<MyLocation />}
                  size="small"
                  sx={{ 
                    backgroundColor: '#1e40af',
                    '&:hover': { backgroundColor: '#1e3a8a' }
                  }}
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      const defaultLocation = { lat: 6.9271, lng: 79.8612 };
                      mapInstanceRef.current.setCenter(defaultLocation);
                      mapInstanceRef.current.setZoom(13);
                    }
                  }}
                >
                  Center Map
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  size="small"
                  onClick={() => loadMapData()}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Navigation />}
                  size="small"
                  onClick={() => showAllRoutes()}
                >
                  Show Routes
                </Button>

                {/* Live Status Badge */}
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      mr: 1,
                      animation: mapLoaded ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 }
                      }
                    }}
                  />
                  <Typography variant="body2" color={mapLoaded ? '#10b981' : '#64748b'} fontWeight="600">
                    {mapLoaded ? 'LIVE TRACKING' : 'CONNECTING...'}
                  </Typography>
                </Box>
              </Box>

              {/* Map Container */}
              <Box sx={{ flex: 1, position: 'relative', backgroundColor: '#e2e8f0' }}>
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
                      <Box sx={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%',
                        border: '4px solid #e5e7eb',
                        borderTop: '4px solid #1e40af',
                        animation: 'spin 1s linear infinite',
                        mb: 2,
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} />
                      <Typography variant="h6" color="#1e40af" gutterBottom fontWeight="600">
                        Loading Live Map...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Connecting to GPS tracking system
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Bottom Panel - Active Deliveries */}
              <Box sx={{ 
                height: '200px', 
                backgroundColor: 'white', 
                borderTop: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e5e7eb' }}>
                  <Typography variant="h6" fontWeight="600" color="#1e40af">
                    Active Deliveries ({deliveries.filter(d => d.status !== 'delivered').length})
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  height: 'calc(200px - 60px)', 
                  overflow: 'auto',
                  px: 3,
                  py: 1
                }}>
                  {deliveries.filter(d => d.status !== 'delivered').length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      color: '#64748b'
                    }}>
                      <Typography variant="body2">No active deliveries</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {deliveries.filter(d => d.status !== 'delivered').map((delivery, index) => (
                        <Paper key={index} sx={{ 
                          p: 2,
                          minWidth: 250,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          flex: '0 0 auto'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: delivery.status === 'in-transit' ? '#10b981' : '#f59e0b',
                              borderRadius: '50%'
                            }} />
                            <Typography variant="body2" fontWeight="bold">
                              {delivery.customer}
                            </Typography>
                            <Chip 
                              label={delivery.status} 
                              size="small"
                              color={delivery.status === 'in-transit' ? 'success' : 'warning'}
                              sx={{ ml: 'auto' }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            📍 {delivery.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            🚚 {delivery.driverName} • Priority: {delivery.priority}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* New Delivery Dialog */}
      <Dialog
        open={newDeliveryDialog}
        onClose={() => setNewDeliveryDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1e40af' }}>
          Create New Delivery
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={deliveryForm.customer}
                onChange={(e) => setDeliveryForm({...deliveryForm, customer: e.target.value})}
                required
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={deliveryForm.phone}
                onChange={(e) => setDeliveryForm({...deliveryForm, phone: e.target.value})}
                required
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Delivery Address"
                multiline
                rows={2}
                value={deliveryForm.address}
                onChange={(e) => setDeliveryForm({...deliveryForm, address: e.target.value})}
                required
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver Name"
                value={deliveryForm.driverName}
                onChange={(e) => setDeliveryForm({...deliveryForm, driverName: e.target.value})}
                required
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={deliveryForm.priority}
                  label="Priority"
                  onChange={(e) => setDeliveryForm({...deliveryForm, priority: e.target.value})}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Order Value (LKR)"
                type="number"
                value={deliveryForm.value}
                onChange={(e) => setDeliveryForm({...deliveryForm, value: e.target.value})}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              onClick={() => setNewDeliveryDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateDelivery}
              disabled={loading}
              sx={{ 
                backgroundColor: '#1e40af',
                '&:hover': { backgroundColor: '#1e3a8a' }
              }}
            >
              {loading ? 'Creating...' : 'Create Delivery'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* New Driver Dialog */}
      <Dialog
        open={newDriverDialog}
        onClose={() => setNewDriverDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1e40af' }}>
          Add New Driver
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver Name"
                value={driverForm.name}
                onChange={(e) => setDriverForm({...driverForm, name: e.target.value})}
                required
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={driverForm.phone}
                onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})}
                required
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={driverForm.vehicleType}
                  label="Vehicle Type"
                  onChange={(e) => setDriverForm({...driverForm, vehicleType: e.target.value})}
                >
                  <MenuItem value="Bike">Bike</MenuItem>
                  <MenuItem value="Car">Car</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                  <MenuItem value="Truck">Truck</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="License Number"
                value={driverForm.licenseNumber}
                onChange={(e) => setDriverForm({...driverForm, licenseNumber: e.target.value})}
                required
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                value={driverForm.experience}
                onChange={(e) => setDriverForm({...driverForm, experience: e.target.value})}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              onClick={() => setNewDriverDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateDriver}
              disabled={loading}
              sx={{ 
                backgroundColor: '#1e40af',
                '&:hover': { backgroundColor: '#1e3a8a' }
              }}
            >
              {loading ? 'Adding...' : 'Add Driver'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delivery Details Dialog */}
      <Dialog
        open={!!selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        {selectedDelivery && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', color: '#1e40af' }}>
              Delivery Details - {selectedDelivery.orderId || selectedDelivery.orderNumber}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1e40af' }}>Customer Information</Typography>
                  <Typography><strong>Name:</strong> {selectedDelivery.customer}</Typography>
                  <Typography><strong>Phone:</strong> {selectedDelivery.phone}</Typography>
                  <Typography><strong>Address:</strong> {selectedDelivery.address}</Typography>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1e40af' }}>Driver Information</Typography>
                  <Typography><strong>Driver:</strong> {selectedDelivery.driverName}</Typography>
                  <Typography><strong>Vehicle:</strong> {selectedDelivery.vehicle}</Typography>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1e40af' }}>Order Details</Typography>
                  <Typography><strong>Value:</strong> {selectedDelivery.value ? formatLKR(selectedDelivery.value) : 'Not specified'}</Typography>
                  <Typography><strong>Status:</strong> 
                    <Chip 
                      label={selectedDelivery.status} 
                      color={getStatusColor(selectedDelivery.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>ETA:</strong> {selectedDelivery.estimatedTime}</Typography>
                  <Typography><strong>Priority:</strong> 
                    <Chip 
                      label={selectedDelivery.priority || 'Medium'} 
                      size="small"
                      sx={{ 
                        ml: 1,
                        backgroundColor: selectedDelivery.priority === 'high' ? '#fee2e2' : 
                                        selectedDelivery.priority === 'low' ? '#f0fdf4' : '#fef3c7',
                        color: selectedDelivery.priority === 'high' ? '#dc2626' : 
                               selectedDelivery.priority === 'low' ? '#16a34a' : '#d97706'
                      }}
                    />
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminDeliveryManagement;
