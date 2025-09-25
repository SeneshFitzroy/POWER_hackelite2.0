import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const drawerWidth = 280;

  // Logout handler
  const handleLogout = () => {
    navigate('/');
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

  // Mock data for delivery drivers
  const drivers = [
    {
      id: 'DRV-001',
      name: 'Kamal Perera',
      phone: '+94 71 987 6543',
      vehicle: 'Bike - ABC-1234',
      status: 'Active',
      deliveries: 5,
      rating: 4.9,
      location: 'Colombo 03'
    },
    {
      id: 'DRV-002',
      name: 'Sunil Jayawardena',
      phone: '+94 70 876 5432',
      vehicle: 'Van - XYZ-5678',
      status: 'Active',
      deliveries: 3,
      rating: 4.7,
      location: 'Maharagama'
    },
    {
      id: 'DRV-003',
      name: 'Nimal Costa',
      phone: '+94 72 765 4321',
      vehicle: 'Car - LMN-9012',
      status: 'Available',
      deliveries: 0,
      rating: 4.8,
      location: 'Colombo 09'
    }
  ];

  const formatLKR = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
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

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#f87171';
      case 'medium': return '#fbbf24';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Professional Delivery Map Component (Simplified to avoid script errors)
  const DeliveryMap = () => {
    return (
      <Paper sx={{ 
        p: 3, 
        borderRadius: '12px', 
        height: '500px', 
        position: 'relative',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e40af' }}>
            <MapIcon />
            Live Delivery Tracking
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            size="small"
            sx={{ 
              backgroundColor: '#1e40af',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1e3a8a'
              }
            }}
          >
            Refresh Map
          </Button>
        </Box>
        
        {/* Interactive Map Visualization */}
        <Box 
          sx={{ 
            width: '100%', 
            height: '400px', 
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            position: 'relative',
            border: '2px dashed #d1d5db',
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #e0e7ff 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, #dbeafe 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {activeDeliveries.length === 0 ? (
            <>
              <MapIcon sx={{ fontSize: 64, color: '#1e40af' }} />
              <Typography variant="h6" color="#1e40af" fontWeight="bold">
                Interactive Delivery Map
              </Typography>
              <Typography variant="body2" color="#6b7280" textAlign="center" sx={{ maxWidth: 300 }}>
                Real-time tracking of delivery vehicles, routes, and customer locations
              </Typography>
              <Button 
                variant="contained" 
                sx={{ 
                  mt: 2,
                  backgroundColor: '#1e40af',
                  '&:hover': {
                    backgroundColor: '#1e3a8a'
                  }
                }}
              >
                Load Map View
              </Button>
            </>
          ) : null}
        </Box>
        
        {/* Map markers for active deliveries */}
        <Box sx={{ position: 'absolute', top: '120px', left: 0, right: 0, bottom: 0 }}>
        
          {/* Map markers for active deliveries */}
          {activeDeliveries.map((delivery, index) => (
            <Box
              key={delivery.id}
              sx={{
                position: 'absolute',
                left: `${20 + index * 20}%`,
                top: `${25 + index * 15}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              <Tooltip title={`${delivery.customer} - ${delivery.status}`} placement="top">
                <Paper
                  elevation={3}
                  sx={{
                    p: 1,
                    backgroundColor: delivery.status === 'In Transit' ? '#3b82f6' : 
                                   delivery.status === 'Out for Delivery' ? '#f59e0b' : '#10b981',
                    color: 'white',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    minWidth: 60,
                    textAlign: 'center',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s'
                    }
                  }}
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  {delivery.vehicle === 'Bike' ? <BikeIcon fontSize="small" /> : 
                   delivery.vehicle === 'Car' ? <CarIcon fontSize="small" /> : <TruckIcon fontSize="small" />}
                  <Typography variant="caption" display="block" sx={{ fontSize: '10px', mt: 0.5 }}>
                    {delivery.driverName.split(' ')[0]}
                  </Typography>
                </Paper>
              </Tooltip>
            </Box>
          ))}
          
          {/* Map center info */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 16, 
            backgroundColor: 'rgba(255,255,255,0.9)', 
            p: 2, 
            borderRadius: '8px',
            backdropFilter: 'blur(4px)'
          }}>
            <Typography variant="body2" fontWeight="bold" color="primary">
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
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e40af' }}>
            Delivery Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
            Real-time delivery tracking and management system
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: '8px', 
              backgroundColor: '#1e40af', 
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { backgroundColor: '#1e3a8a' }
            }}
          >
            New Delivery
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ 
              borderRadius: '8px',
              borderColor: '#1e40af',
              color: '#1e40af',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { 
                borderColor: '#1e3a8a',
                backgroundColor: '#f0f9ff'
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards - Matching Image Design */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 3, 
            borderRadius: '12px', 
            backgroundColor: '#1e40af',
            color: 'white',
            position: 'relative',
            overflow: 'visible'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <TruckIcon sx={{ fontSize: 32, opacity: 0.9 }} />
            </Box>
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              1247
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Deliveries</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 3, 
            borderRadius: '12px', 
            backgroundColor: '#10b981',
            color: 'white',
            position: 'relative',
            overflow: 'visible'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <CheckIcon sx={{ fontSize: 32, opacity: 0.9 }} />
            </Box>
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              89
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Deliveries</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 3, 
            borderRadius: '12px', 
            backgroundColor: '#f59e0b',
            color: 'white',
            position: 'relative',
            overflow: 'visible'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <WarningIcon sx={{ fontSize: 32, opacity: 0.9 }} />
            </Box>
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              3
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Late Deliveries</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 3, 
            borderRadius: '12px', 
            backgroundColor: '#dc2626',
            color: 'white',
            position: 'relative',
            overflow: 'visible'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <TimeIcon sx={{ fontSize: 32, opacity: 0.9 }} />
            </Box>
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              2
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Critical Issues</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            p: 3, 
            borderRadius: '12px', 
            backgroundColor: '#7c3aed',
            color: 'white',
            position: 'relative',
            overflow: 'visible'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <TruckIcon sx={{ fontSize: 32, opacity: 0.9 }} />
            </Box>
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              LKR 1,248,075
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Delivery Revenue</Typography>
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
              {activeDeliveries.map((delivery, index) => (
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

      {/* Performance Metrics - Bottom Row */}
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <SpeedIcon sx={{ fontSize: 28, color: '#6b7280' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1f2937', mb: 1 }}>
              2.4h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Delivery Time
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <TimeIcon sx={{ fontSize: 28, color: '#6b7280' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1f2937', mb: 1 }}>
              94.2%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              On-Time Delivery Rate
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <StarIcon sx={{ fontSize: 28, color: '#6b7280' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1f2937', mb: 1 }}>
              4.8/5
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer Satisfaction
            </Typography>
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
          sx={{ borderRadius: '10px', backgroundColor: '#1e3a8a' }}
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
    { label: 'Routes', icon: RouteIcon },
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
              <RouteIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Route Planning" 
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
        {/* Header */}
        <AppBar 
          position="static" 
          sx={{ 
            backgroundColor: 'white',
            boxShadow: 'none',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <Toolbar sx={{ py: 2, px: 4 }}>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: '#1e40af', fontWeight: 'bold' }}>
              Delivery Dashboard
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              sx={{
                backgroundColor: '#1e40af',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Refresh Data
            </Button>
          </Toolbar>
        </AppBar>

        {/* Content Area - Dynamic Based on Sidebar Selection */}
        <Box sx={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', overflow: 'auto' }}>
          {currentTab === 0 && renderDashboard()}
          {currentTab === 1 && renderDrivers()}
          {currentTab === 2 && (
            <Container maxWidth="xl" sx={{ py: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#1f2937', mb: 3 }}>
                Route Planning & Optimization
              </Typography>
              <Paper sx={{ p: 4, borderRadius: '12px', textAlign: 'center' }}>
                <RouteIcon sx={{ fontSize: 60, color: '#3b82f6', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: '#1f2937' }}>
                  Advanced Route Optimization Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  We're developing intelligent route planning features to optimize delivery efficiency and reduce costs.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: '#3b82f6',
                    '&:hover': { backgroundColor: '#2563eb' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Notify Me When Available
                </Button>
              </Paper>
            </Container>
          )}
          {currentTab === 3 && (
            <Container maxWidth="xl" sx={{ py: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#1f2937', mb: 3 }}>
                Delivery Analytics & Insights
              </Typography>
              <Paper sx={{ p: 4, borderRadius: '12px', textAlign: 'center' }}>
                <SpeedIcon sx={{ fontSize: 60, color: '#3b82f6', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: '#1f2937' }}>
                  Advanced Analytics Dashboard Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Get detailed insights on delivery performance, driver efficiency, and customer satisfaction metrics.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: '#3b82f6',
                    '&:hover': { backgroundColor: '#2563eb' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Request Early Access
                </Button>
              </Paper>
            </Container>
          )}
        </Box>
      </Box>

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
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              Delivery Details - {selectedDelivery.orderNumber}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Typography variant="h6" gutterBottom>Customer Information</Typography>
                  <Typography><strong>Name:</strong> {selectedDelivery.customer}</Typography>
                  <Typography><strong>Phone:</strong> {selectedDelivery.phone}</Typography>
                  <Typography><strong>Address:</strong> {selectedDelivery.address}</Typography>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="h6" gutterBottom>Driver Information</Typography>
                  <Typography><strong>Driver:</strong> {selectedDelivery.driverName}</Typography>
                  <Typography><strong>Phone:</strong> {selectedDelivery.driverPhone}</Typography>
                  <Typography><strong>Vehicle:</strong> {selectedDelivery.vehicle}</Typography>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="h6" gutterBottom>Order Details</Typography>
                  <Typography><strong>Items:</strong> {selectedDelivery.items}</Typography>
                  <Typography><strong>Value:</strong> {formatLKR(selectedDelivery.value)}</Typography>
                  <Typography><strong>Status:</strong> 
                    <Chip 
                      label={selectedDelivery.status} 
                      color={getStatusColor(selectedDelivery.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>ETA:</strong> {selectedDelivery.estimatedTime}</Typography>
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
