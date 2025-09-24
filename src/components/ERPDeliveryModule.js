import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Switch,
  FormControlLabel,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
// Material-UI Icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MapIcon from '@mui/icons-material/Map';
import RouteIcon from '@mui/icons-material/Route';
import SpeedIcon from '@mui/icons-material/Speed';
import StarIcon from '@mui/icons-material/Star';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const ERPDeliveryModule = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Real-time delivery data - in production this would come from WebSocket/API
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 245,
    activeDeliveries: 23,
    completedToday: 189,
    pendingAssignment: 12,
    avgDeliveryTime: 42, // minutes
    onTimeDeliveryRate: 94.2, // percentage
    customerSatisfaction: 4.7, // rating
    totalRevenue: 125450 // LKR
  });

  const [liveDeliveries, setLiveDeliveries] = useState([
    {
      id: 'DLV-2025-001234',
      orderId: 'NPK-2025-001234',
      customer: {
        name: 'John Silva',
        phone: '+94 77 987 6543',
        address: '123 Galle Road, Colombo 03',
        location: { lat: 6.9271, lng: 79.8612 }
      },
      items: [
        { name: 'Panadol Extra 500mg', quantity: 2 },
        { name: 'Vitamin C 1000mg', quantity: 1 }
      ],
      value: 2550,
      status: 'in_transit',
      priority: 'high',
      assignedAt: '2:15 PM',
      estimatedDelivery: '3:45 PM',
      actualProgress: 75,
      driver: {
        id: 1,
        name: 'Kasun Perera',
        phone: '+94 77 123 4567',
        vehicle: 'Motorcycle',
        vehicleNumber: 'CAB-1234',
        currentLocation: { lat: 6.9147, lng: 79.8730 },
        rating: 4.8,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      timeline: [
        { status: 'Order Received', time: '1:15 PM', completed: true },
        { status: 'Driver Assigned', time: '2:15 PM', completed: true },
        { status: 'Out for Delivery', time: '2:30 PM', completed: true },
        { status: 'Delivered', time: '3:45 PM (Est.)', completed: false }
      ]
    },
    {
      id: 'DLV-2025-001235',
      orderId: 'NPK-2025-001235',
      customer: {
        name: 'Maria Fernando',
        phone: '+94 77 555 1234',
        address: '456 Kandy Road, Colombo 07',
        location: { lat: 6.9147, lng: 79.8730 }
      },
      items: [
        { name: 'Blood Pressure Monitor', quantity: 1 },
        { name: 'Diabetics Test Strips', quantity: 2 }
      ],
      value: 4800,
      status: 'pending',
      priority: 'medium',
      assignedAt: null,
      estimatedDelivery: '4:30 PM',
      actualProgress: 0,
      driver: null,
      timeline: [
        { status: 'Order Received', time: '2:30 PM', completed: true },
        { status: 'Driver Assignment', time: 'Pending', completed: false },
        { status: 'Out for Delivery', time: 'Pending', completed: false },
        { status: 'Delivered', time: 'Pending', completed: false }
      ]
    },
    {
      id: 'DLV-2025-001236',
      orderId: 'NPK-2025-001236',
      customer: {
        name: 'David Perera',
        phone: '+94 77 999 5678',
        address: '789 Baseline Road, Colombo 09',
        location: { lat: 6.8955, lng: 79.8563 }
      },
      items: [
        { name: 'Insulin Pens', quantity: 3 },
        { name: 'Glucose Meter', quantity: 1 },
        { name: 'Medical Supplies', quantity: 5 }
      ],
      value: 8900,
      status: 'delivered',
      priority: 'high',
      assignedAt: '11:30 AM',
      estimatedDelivery: '1:30 PM',
      actualDelivery: '1:25 PM',
      actualProgress: 100,
      driver: {
        id: 2,
        name: 'Nimal Rajapaksa',
        phone: '+94 77 888 9999',
        vehicle: 'Car',
        vehicleNumber: 'CAR-5678',
        rating: 4.9,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      timeline: [
        { status: 'Order Received', time: '10:30 AM', completed: true },
        { status: 'Driver Assigned', time: '11:30 AM', completed: true },
        { status: 'Out for Delivery', time: '11:45 AM', completed: true },
        { status: 'Delivered', time: '1:25 PM', completed: true }
      ]
    }
  ]);

  const [availableDrivers, setAvailableDrivers] = useState([
    {
      id: 3,
      name: 'Priya Wickramasinghe',
      phone: '+94 77 777 1111',
      vehicle: 'Motorcycle',
      vehicleNumber: 'BIKE-9012',
      status: 'available',
      currentLocation: { lat: 6.9147, lng: 79.8730 },
      rating: 4.7,
      totalDeliveries: 856,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Chaminda Silva',
      phone: '+94 77 444 2222',
      vehicle: 'Car',
      vehicleNumber: 'CAR-3456',
      status: 'available',
      currentLocation: { lat: 6.8955, lng: 79.8563 },
      rating: 4.6,
      totalDeliveries: 523,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    }
  ]);

  // Real-time updates simulation
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      setLiveDeliveries(prev => prev.map(delivery => {
        if (delivery.status === 'in_transit' && delivery.actualProgress < 100) {
          return {
            ...delivery,
            actualProgress: Math.min(delivery.actualProgress + Math.random() * 5, 100)
          };
        }
        return delivery;
      }));

      // Update stats randomly
      setDeliveryStats(prev => ({
        ...prev,
        activeDeliveries: prev.activeDeliveries + Math.floor(Math.random() * 3) - 1,
        completedToday: prev.completedToday + Math.floor(Math.random() * 2),
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 1000)
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircleOutlineIcon color="success" />;
      case 'in_transit': return <LocalShippingIcon color="info" />;
      case 'pending': return <HourglassEmptyIcon color="warning" />;
      case 'cancelled': return <CancelIcon color="error" />;
      default: return <HourglassEmptyIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in_transit': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const filteredDeliveries = liveDeliveries.filter(delivery => {
    const matchesSearch = delivery.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (currentTab) {
      case 0: return matchesSearch; // All
      case 1: return matchesSearch && delivery.status === 'pending';
      case 2: return matchesSearch && delivery.status === 'in_transit';
      case 3: return matchesSearch && delivery.status === 'delivered';
      default: return matchesSearch;
    }
  });

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea 0%, #764ba2 100%' : color === 'success' ? '#4ade80 0%, #22c55e 100%' : color === 'warning' ? '#fbbf24 0%, #f59e0b 100%' : '#ef4444 0%, #dc2626 100%'})`, color: 'white' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {trend}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const DeliveryCard = ({ delivery }) => (
    <Card sx={{ mb: 2, border: delivery.priority === 'high' ? '2px solid #ef4444' : '1px solid #e5e7eb' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Box display="flex" alignItems="center" mb={1}>
              {getStatusIcon(delivery.status)}
              <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                {delivery.id}
              </Typography>
              <Chip 
                label={delivery.priority.toUpperCase()} 
                color={getPriorityColor(delivery.priority)}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            <Typography variant="body1" fontWeight="bold">
              {delivery.customer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {delivery.customer.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {delivery.customer.phone}
            </Typography>
          </Box>
          <Chip 
            label={delivery.status.replace('_', ' ').toUpperCase()} 
            color={getStatusColor(delivery.status)}
            variant="filled"
          />
        </Box>

        {delivery.status === 'in_transit' && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Delivery Progress
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {Math.round(delivery.actualProgress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={delivery.actualProgress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: delivery.priority === 'high' ? '#ef4444' : '#22c55e'
                }
              }}
            />
          </Box>
        )}

        <Grid container spacing={2} mb={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Items</Typography>
            <Typography fontWeight="bold">{delivery.items.length} items</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Value</Typography>
            <Typography fontWeight="bold">LKR {delivery.value.toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {delivery.status === 'delivered' ? 'Delivered' : 'Est. Delivery'}
            </Typography>
            <Typography fontWeight="bold">
              {delivery.actualDelivery || delivery.estimatedDelivery}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Driver</Typography>
            <Typography fontWeight="bold">
              {delivery.driver ? delivery.driver.name : 'Not Assigned'}
            </Typography>
          </Grid>
        </Grid>

        {delivery.driver && (
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar src={delivery.driver.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {delivery.driver.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {delivery.driver.vehicle} • {delivery.driver.rating}/5
              </Typography>
            </Box>
          </Box>
        )}

        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewIcon />}
            onClick={() => {}}
          >
            Track Live
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhoneIcon />}
            onClick={() => window.open(`tel:${delivery.customer.phone}`)}
          >
            Call Customer
          </Button>
          {delivery.driver && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PhoneIcon />}
              onClick={() => window.open(`tel:${delivery.driver.phone}`)}
            >
              Call Driver
            </Button>
          )}
          {delivery.status === 'pending' && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AssignmentIcon />}
              sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              Assign Driver
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Real-Time Delivery Management
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={realTimeUpdates}
                  onChange={(e) => setRealTimeUpdates(e.target.checked)}
                  color="primary"
                />
              }
              label="Real-Time Updates"
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<ReportIcon />}
              sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              Generate Report
            </Button>
          </Box>
        </Box>

        {/* Real-Time Status Alert */}
        {realTimeUpdates && (
          <Alert 
            severity="info" 
            sx={{ mb: 3, background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)' }}
            icon={<NotificationIcon />}
          >
            <Typography fontWeight="bold">
              Real-time tracking is active • Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Deliveries"
              value={deliveryStats.totalDeliveries}
              subtitle="All time"
              icon={<LocalShippingIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Deliveries"
              value={deliveryStats.activeDeliveries}
              subtitle="In progress"
              icon={<LocalShippingIcon sx={{ fontSize: 40 }} />}
              color="warning"
              trend="🔄 Live tracking"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Today"
              value={deliveryStats.completedToday}
              subtitle={`${deliveryStats.onTimeDeliveryRate}% on time`}
              icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Revenue Today"
              value={`LKR ${(deliveryStats.totalRevenue / 1000).toFixed(0)}K`}
              subtitle={`Avg: ${deliveryStats.avgDeliveryTime} mins`}
              icon={<AnalyticsIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search by customer, order ID, or delivery ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Delivery Tabs and Table */}
        <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 'bold' }
            }}
          >
            <Tab 
              label={
                <Badge badgeContent={liveDeliveries.length} color="primary">
                  All Deliveries
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={liveDeliveries.filter(d => d.status === 'pending').length} color="warning">
                  Pending Assignment
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={liveDeliveries.filter(d => d.status === 'in_transit').length} color="info">
                  In Transit
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={liveDeliveries.filter(d => d.status === 'delivered').length} color="success">
                  Delivered
                </Badge>
              } 
            />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {filteredDeliveries.length === 0 ? (
              <Alert severity="info">
                No deliveries found matching your search criteria
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredDeliveries
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(delivery => (
                    <Grid item xs={12} md={6} lg={4} key={delivery.id}>
                      <DeliveryCard delivery={delivery} />
                    </Grid>
                  ))}
              </Grid>
            )}

            <TablePagination
              component="div"
              count={filteredDeliveries.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[6, 12, 24]}
            />
          </Box>
        </Paper>

        {/* Floating Action Button */}
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<MapIcon />}
            tooltipTitle="Live Map View"
            onClick={() => {}}
          />
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="Manual Delivery"
            onClick={() => {}}
          />
          <SpeedDialAction
            icon={<ReportIcon />}
            tooltipTitle="Analytics"
            onClick={() => {}}
          />
          <SpeedDialAction
            icon={<ExportIcon />}
            tooltipTitle="Export Data"
            onClick={() => {}}
          />
        </SpeedDial>
      </Container>
    </Box>
  );
};

export default ERPDeliveryModule;
