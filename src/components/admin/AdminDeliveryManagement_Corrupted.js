import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
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
  const [mapLoaded, setMapLoaded] = useState(true);
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Colombo, Sri Lanka
  const [mapZoom, setMapZoom] = useState(13);
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [driverLocations, setDriverLocations] = useState([]);
  const [routeLines, setRouteLines] = useState([]);
  
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
    console.log('Admin Delivery Corrupted Logout initiated - Enhanced logout system');
    
    // Clear only delivery management-specific data, not main authentication
    localStorage.removeItem('deliverySession');
    localStorage.removeItem('currentDeliveryView');
    sessionStorage.removeItem('deliveryData');
    
    // Set multiple dashboard access flags for maximum reliability
    localStorage.setItem('dashboardAccess', 'true');
    localStorage.setItem('forceDashboard', 'true');
    localStorage.setItem('skipAuth', 'true');
    localStorage.setItem('directToDashboard', 'true');
    
    console.log('Admin Delivery Corrupted logout: All dashboard flags set');
    
    // Force immediate redirect to prevent any routing glitches
    setTimeout(() => {
      window.location.replace('/?screen=dashboard');
    }, 100);
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

  // Leaflet Map Functions
  const generateMapData = () => {
    // Generate realistic delivery locations around Colombo
    const deliveryLocs = deliveries.map((delivery, index) => ({
      id: index,
      position: [
        6.9271 + (Math.random() - 0.5) * 0.05, // Smaller spread for more realistic locations
        79.8612 + (Math.random() - 0.5) * 0.05
      ],
      delivery: delivery
    }));

    // Generate driver locations
    const driverLocs = drivers.map((driver, index) => ({
      id: index,
      position: [
        6.9271 + (Math.random() - 0.5) * 0.05,
        79.8612 + (Math.random() - 0.5) * 0.05
      ],
      driver: driver
    }));

    setDeliveryLocations(deliveryLocs);
    setDriverLocations(driverLocs);

    // Generate routes between drivers and deliveries
    const routes = [];
    for (let i = 0; i < Math.min(deliveryLocs.length, driverLocs.length, 3); i++) {
      routes.push({
        id: i,
        positions: [driverLocs[i].position, deliveryLocs[i].position],
        color: '#3b82f6',
        driver: driverLocs[i].driver,
        delivery: deliveryLocs[i].delivery
      });
    }
    setRouteLines(routes);
  };

  const loadMapData = () => {
    generateMapData();
  };

  const showAllRoutes = () => {
    generateMapData();
  };

  const centerMap = () => {
    setMapCenter([6.9271, 79.8612]);
    setMapZoom(13);
  };

  // Create custom icons for Leaflet
  const createDriverIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          background: #10b981;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
          </svg>
        </div>
      `,
      className: 'custom-driver-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const createDeliveryIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          background: #ef4444;
          width: 25px;
          height: 35px;
          border-radius: 50% 50% 50% 0;
          border: 2px solid white;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          <div style="
            background: white;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: 'custom-delivery-icon',
      iconSize: [25, 35],
      iconAnchor: [12, 35]
    });
  };

  // Initialize map data when tab is accessed
  useEffect(() => {
    if (currentTab === 3 && (deliveries.length > 0 || drivers.length > 0)) {
      generateMapData();
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

  // Uber-style Live Delivery Map Component
  const DeliveryMap = () => {
    const [mapMode, setMapMode] = useState('live');
    
    // Sample delivery locations around Colombo
    const deliveryLocations = deliveries.slice(0, 8).map((delivery, index) => ({
      id: delivery.id,
      customer: delivery.customer,
      driver: delivery.driverName,
      status: delivery.status,
      vehicle: delivery.vehicle || 'Car'
    }));

    // Sample driver locations
    const driverLocations = drivers.slice(0, 5).map((driver) => ({
      id: driver.id,
      name: driver.name,
      vehicle: driver.vehicleType,
      status: 'Active'
    }));

    return (
      <Paper sx={{ 
        borderRadius: '12px', 
        height: '500px', 
        overflow: 'hidden',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb'
      }}>
        {/* Map Header with Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 2, 
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
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
                minWidth: '60px'
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
                minWidth: '70px'
              }}
            >
              Routes
            </Button>
          </Box>
        </Box>

        {/* Uber-style Live Map Interface */}
        <Box sx={{ height: '438px', position: 'relative' }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
          }}>
            {/* Map Background with Overlay */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `
                radial-gradient(circle at 30% 20%, rgba(30, 64, 175, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 90%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)
              `
            }}>
              {/* Animated Delivery Points */}
              {deliveryLocations.map((location, index) => (
                <Box
                  key={location.id}
                  sx={{
                    position: 'absolute',
                    left: `${20 + (index % 4) * 20}%`,
                    top: `${15 + Math.floor(index / 4) * 25}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                >
                  <Tooltip 
                    title={
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{location.customer}</Typography>
                        <Typography variant="body2">Driver: {location.driver}</Typography>
                        <Typography variant="body2">Status: {location.status}</Typography>
                        <Typography variant="body2">Vehicle: {location.vehicle}</Typography>
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
                    >
                      {/* Delivery Location Pin */}
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: location.status === 'In Transit' ? '#ef4444' : 
                                         location.status === 'Out for Delivery' ? '#f59e0b' : '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                          border: '3px solid white',
                          fontSize: '16px'
                        }}
                      >
                        📍
                      </Box>
                      
                      {/* Pulse Animation for Active Deliveries */}
                      {location.status === 'In Transit' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            opacity: 0.3,
                            '@keyframes pulse': {
                              '0%': { transform: 'scale(1)', opacity: 0.3 },
                              '50%': { transform: 'scale(1.3)', opacity: 0.1 },
                              '100%': { transform: 'scale(1)', opacity: 0.3 }
                            },
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              ))}

              {/* Driver Locations */}
              {driverLocations.map((driver, index) => (
                <Box
                  key={driver.id}
                  sx={{
                    position: 'absolute',
                    left: `${25 + (index % 3) * 25}%`,
                    top: `${30 + Math.floor(index / 3) * 30}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 15
                  }}
                >
                  <Tooltip 
                    title={
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{driver.name}</Typography>
                        <Typography variant="body2">Vehicle: {driver.vehicle}</Typography>
                        <Typography variant="body2">Status: {driver.status}</Typography>
                      </Box>
                    } 
                    placement="top"
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 6px 16px rgba(30, 64, 175, 0.4)',
                        border: '3px solid white',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.2s'
                        }
                      }}
                    >
                      {driver.vehicle === 'Bike' ? '🏍️' : driver.vehicle === 'Car' ? '🚗' : '🚛'}
                    </Box>
                  </Tooltip>
                </Box>
              ))}

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
                  {deliveryLocations.slice(0, 3).map((location, index) => (
                    <line
                      key={index}
                      x1={`${25 + (index % 3) * 25}%`}
                      y1={`${30 + Math.floor(index / 3) * 30}%`}
                      x2={`${20 + (index % 4) * 20}%`}
                      y2={`${15 + Math.floor(index / 4) * 25}%`}
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      opacity="0.7"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;10"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </line>
                  ))}
                </svg>
              )}

              {/* Live Stats Overlay */}
              <Box sx={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                p: 1.5,
                minWidth: '150px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: '#1e40af', display: 'block' }}>
                  Live Stats
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                  Active: {driverLocations.length} drivers
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                  Coverage: 85%
                </Typography>
              </Box>
            </Box>
          </div>
        </Box>
      </Paper>
    );
  };
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
            border: '1px solid #e5e7eb' 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e40af' }}>
                <AlertIcon />
                Active Deliveries
              </Typography>
              <Chip 
                label={activeDeliveries.length}
                size="small"
                sx={{
                  backgroundColor: '#1e40af',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            <List sx={{ maxHeight: '400px', overflow: 'auto', p: 0 }}>
              {deliveries.slice(0, 6).map((delivery, index) => (
                <Box 
                  key={delivery.id} 
                  sx={{ 
                    p: 2.5,
                    mb: 2,
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
                      width: 42,
                      height: 42
                    }}>
                      {delivery.vehicle === 'Bike' ? <BikeIcon /> : 
                       delivery.vehicle === 'Car' ? <CarIcon /> : <TruckIcon />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1f2937' }}>
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
                            fontSize: '11px'
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {delivery.orderNumber} • {delivery.driverName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ETA: {delivery.estimatedTime} • {formatLKR(delivery.value)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </List>
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
    { label: 'Analytics', icon: SpeedIcon },
    { label: 'Live Map', icon: MapIcon }
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                <img 
                  src="/images/npk-logo.png" 
                  alt="NPK Logo" 
                  style={{ 
                    height: '40px', 
                    width: 'auto',
                    marginRight: '8px',
                    filter: 'brightness(0) invert(1)' // Make logo white for dark sidebar
                  }} 
                />
                <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                  NPK Pharmacy
                </Typography>
              </Box>
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
              backgroundColor: currentTab === 2 ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              '& .MuiListItemIcon-root': { color: 'white', minWidth: 40 },
              '& .MuiListItemText-primary': { 
                color: 'white', 
                fontWeight: currentTab === 2 ? 700 : 500 
              },
              border: currentTab === 2 ? '1px solid rgba(255,255,255,0.3)' : 'none'
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

          <ListItemButton 
            selected={currentTab === 3}
            onClick={() => setCurrentTab(3)}
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
              <MapIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Live Map" 
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
            <Container maxWidth="xl" sx={{ py: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#1e40af', mb: 4 }}>
                Real-time Delivery Map
              </Typography>
              
              {/* Map Controls */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<MyLocation />}
                  sx={{ 
                    backgroundColor: '#1e40af',
                    '&:hover': { backgroundColor: '#1e3a8a' }
                  }}
                  onClick={centerMap}
                >
                  Center Map
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadMapData}
                >
                  Refresh Locations
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Navigation />}
                  onClick={showAllRoutes}
                >
                  Show All Routes
                </Button>
              </Box>

              {/* Map Container */}
              <Paper sx={{ 
                height: '600px', 
                borderRadius: '12px', 
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                  zoomControl={true}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Driver Markers */}
                  {driverLocations.map((driverLoc) => (
                    <Marker
                      key={`driver-${driverLoc.id}`}
                      position={driverLoc.position}
                      icon={createDriverIcon()}
                    >
                      <Popup>
                        <div style={{ padding: '8px', fontFamily: 'Arial, sans-serif' }}>
                          <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>
                            🚗 {driverLoc.driver.name}
                          </h3>
                          <p style={{ margin: '4px 0', color: '#666' }}>
                            <strong>Vehicle:</strong> {driverLoc.driver.vehicleType}
                          </p>
                          <p style={{ margin: '4px 0', color: '#666' }}>
                            <strong>Phone:</strong> {driverLoc.driver.phone}
                          </p>
                          <p style={{ margin: '4px 0', color: '#666' }}>
                            <strong>License:</strong> {driverLoc.driver.licenseNumber}
                          </p>
                          <p style={{ margin: '4px 0', color: '#666' }}>
                            <strong>Experience:</strong> {driverLoc.driver.experience} years
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Delivery Markers */}
                  {deliveryLocations.map((deliveryLoc) => (
                    <Marker
                      key={`delivery-${deliveryLoc.id}`}
                      position={deliveryLoc.position}
                      icon={createDeliveryIcon()}
                    >
                      <Popup>
                        <div style={{ padding: '8px', fontFamily: 'Arial, sans-serif' }}>
                          <h3 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>
                            📦 {deliveryLoc.delivery.customer}
                          </h3>
                          <p style={{ margin: '4px 0', color: '#666' }}>
                            <strong>Address:</strong> {deliveryLoc.delivery.address}
                          </p>
                          <p style={{ margin: '4px 0', color: '#666' }}>
                            <strong>Status:</strong> {deliveryLoc.delivery.status}
                          </p>
                          <p style={{ margin: '4px 0', color: '#666' }}>
                            <strong>Driver:</strong> {deliveryLoc.delivery.driverName}
                          </p>
                          <p style={{ margin: '4px 0', color: '#666' }}>
                            <strong>Priority:</strong> {deliveryLoc.delivery.priority}
                          </p>
                          {deliveryLoc.delivery.value && (
                            <p style={{ margin: '4px 0', color: '#666' }}>
                              <strong>Value:</strong> LKR {deliveryLoc.delivery.value}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Route Lines */}
                  {routeLines.map((route) => (
                    <Polyline
                      key={`route-${route.id}`}
                      positions={route.positions}
                      color={route.color}
                      weight={4}
                      opacity={0.8}
                      dashArray="10, 10"
                    />
                  ))}
                </MapContainer>
              </Paper>

              {/* Map Legend */}
              <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid xs={12} md={8}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e40af' }}>
                      Active Deliveries
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {deliveries.slice(0, 5).map((delivery, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 2,
                          mb: 1,
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LocationIcon sx={{ color: delivery.status === 'delivered' ? '#10b981' : '#1e40af' }} />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{delivery.customer}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {delivery.address}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={delivery.status} 
                            size="small"
                            color={
                              delivery.status === 'delivered' ? 'success' :
                              delivery.status === 'in-transit' ? 'primary' : 'warning'
                            }
                          />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e40af' }}>
                      Map Legend
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: '#10b981', 
                          borderRadius: '50%' 
                        }} />
                        <Typography variant="body2">Active Drivers</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: '#ef4444', 
                          borderRadius: '50%' 
                        }} />
                        <Typography variant="body2">Delivery Locations</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 20, 
                          height: 3, 
                          backgroundColor: '#3b82f6' 
                        }} />
                        <Typography variant="body2">Delivery Routes</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
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
