import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Select
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as BikeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import DeliveryTracker from './DeliveryTracker';

const DeliveryManagement = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTracker, setShowTracker] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);

  // Mock data - in real app this would come from API
  const [orders, setOrders] = useState([
    {
      id: 'NPK-2025-001234',
      customer: 'John Silva',
      address: '123 Galle Road, Colombo 03',
      phone: '+94 77 987 6543',
      items: 3,
      value: 2550,
      status: 'in_transit',
      priority: 'high',
      orderTime: '1:15 PM',
      estimatedDelivery: '3:45 PM',
      driver: {
        id: 1,
        name: 'Kasun Perera',
        phone: '+94 77 123 4567'
      }
    },
    {
      id: 'NPK-2025-001235',
      customer: 'Maria Fernando',
      address: '456 Kandy Road, Colombo 07',
      phone: '+94 77 555 1234',
      items: 2,
      value: 1800,
      status: 'pending',
      priority: 'medium',
      orderTime: '2:30 PM',
      estimatedDelivery: '4:30 PM',
      driver: null
    },
    {
      id: 'NPK-2025-001236',
      customer: 'David Perera',
      address: '789 Baseline Road, Colombo 09',
      phone: '+94 77 999 5678',
      items: 5,
      value: 4200,
      status: 'delivered',
      priority: 'low',
      orderTime: '11:30 AM',
      estimatedDelivery: '1:30 PM',
      deliveredTime: '1:25 PM',
      driver: {
        id: 2,
        name: 'Nimal Rajapaksa',
        phone: '+94 77 888 9999'
      }
    }
  ]);

  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'Kasun Perera',
      phone: '+94 77 123 4567',
      vehicle: 'Motorcycle',
      vehicleNumber: 'CAB-1234',
      status: 'busy',
      currentLocation: 'Colombo 03',
      rating: 4.8,
      totalDeliveries: 1247,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Nimal Rajapaksa',
      phone: '+94 77 888 9999',
      vehicle: 'Car',
      vehicleNumber: 'CAR-5678',
      status: 'available',
      currentLocation: 'Colombo 07',
      rating: 4.9,
      totalDeliveries: 2156,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Priya Wickramasinghe',
      phone: '+94 77 777 1111',
      vehicle: 'Motorcycle',
      vehicleNumber: 'BIKE-9012',
      status: 'available',
      currentLocation: 'Colombo 05',
      rating: 4.7,
      totalDeliveries: 856,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  ]);

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

  const handleAssignDriver = (orderId) => {
    setAssigningOrder(orderId);
    setShowAssignDialog(true);
  };

  const confirmAssignment = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    setOrders(prev => prev.map(order => 
      order.id === assigningOrder 
        ? { ...order, status: 'in_transit', driver }
        : order
    ));
    setDrivers(prev => prev.map(d => 
      d.id === driverId 
        ? { ...d, status: 'busy' }
        : d
    ));
    setShowAssignDialog(false);
    setAssigningOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    switch (currentTab) {
      case 0: return order.status === 'pending';
      case 1: return order.status === 'in_transit';
      case 2: return order.status === 'delivered';
      default: return true;
    }
  });

  const OrderCard = ({ order }) => (
    <Card sx={{ mb: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Order #{order.id}
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {order.customer}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {order.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.phone}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Chip 
              label={order.status.replace('_', ' ').toUpperCase()} 
              color={getStatusColor(order.status)}
              size="small"
              sx={{ mb: 1 }}
            />
            <Chip 
              label={`${order.priority.toUpperCase()} PRIORITY`} 
              color={getPriorityColor(order.priority)}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} mb={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Items
            </Typography>
            <Typography fontWeight="bold">
              {order.items} items
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Value
            </Typography>
            <Typography fontWeight="bold">
              Rs. {order.value.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Order Time
            </Typography>
            <Typography fontWeight="bold">
              {order.orderTime}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Est. Delivery
            </Typography>
            <Typography fontWeight="bold">
              {order.estimatedDelivery}
            </Typography>
          </Grid>
        </Grid>

        {order.driver && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Assigned Driver
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar src={drivers.find(d => d.id === order.driver.id)?.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
              <Typography fontWeight="bold">
                {order.driver.name}
              </Typography>
            </Box>
          </Box>
        )}

        <Box display="flex" gap={1}>
          {order.status === 'pending' && (
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={() => handleAssignDriver(order.id)}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              Assign Driver
            </Button>
          )}
          {order.status === 'in_transit' && (
            <Button
              variant="contained"
              startIcon={<ViewIcon />}
              onClick={() => {
                setSelectedOrder(order);
                setShowTracker(true);
              }}
              sx={{ 
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
              }}
            >
              Track Live
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<PhoneIcon />}
            onClick={() => window.open(`tel:${order.phone}`)}
          >
            Call Customer
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const DriverCard = ({ driver }) => (
    <Card sx={{ mb: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar src={driver.avatar} sx={{ width: 50, height: 50, mr: 2 }} />
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {driver.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {driver.phone}
            </Typography>
          </Box>
          <Chip 
            label={driver.status.toUpperCase()} 
            color={driver.status === 'available' ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Vehicle
            </Typography>
            <Box display="flex" alignItems="center">
              {driver.vehicle === 'Motorcycle' ? <BikeIcon sx={{ mr: 1, fontSize: 20 }} /> : <CarIcon sx={{ mr: 1, fontSize: 20 }} />}
              <Typography fontWeight="bold">
                {driver.vehicle}
              </Typography>
            </Box>
            <Typography variant="body2">
              {driver.vehicleNumber}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Location
            </Typography>
            <Box display="flex" alignItems="center">
              <LocationIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography fontWeight="bold">
                {driver.currentLocation}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Rating
            </Typography>
            <Typography fontWeight="bold">
              {driver.rating} / 5 ({driver.totalDeliveries} deliveries)
            </Typography>
          </Grid>
        </Grid>

        <Button
          variant="outlined"
          startIcon={<PhoneIcon />}
          onClick={() => window.open(`tel:${driver.phone}`)}
          fullWidth
        >
          Call Driver
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Delivery Management System
      </Typography>

      <Grid container spacing={3}>
        {/* Orders Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              Orders
            </Typography>

            <Tabs 
              value={currentTab} 
              onChange={(e, newValue) => setCurrentTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab 
                label={
                  <Badge badgeContent={orders.filter(o => o.status === 'pending').length} color="warning">
                    Pending
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={orders.filter(o => o.status === 'in_transit').length} color="info">
                    In Transit
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={orders.filter(o => o.status === 'delivered').length} color="success">
                    Delivered
                  </Badge>
                } 
              />
            </Tabs>

            {filteredOrders.length === 0 ? (
              <Alert severity="info">
                No orders in this category
              </Alert>
            ) : (
              filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </Paper>
        </Grid>

        {/* Drivers Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              Delivery Partners
            </Typography>

            {drivers.map(driver => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Driver Assignment Dialog */}
      <Dialog open={showAssignDialog} onClose={() => setShowAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Driver</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Select an available driver for order #{assigningOrder}
          </Typography>
          
          {drivers.filter(d => d.status === 'available').map(driver => (
            <Card 
              key={driver.id} 
              sx={{ 
                mb: 2, 
                cursor: 'pointer',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
              }}
              onClick={() => confirmAssignment(driver.id)}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar src={driver.avatar} sx={{ width: 40, height: 40, mr: 2 }} />
                  <Box flex={1}>
                    <Typography fontWeight="bold">
                      {driver.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {driver.vehicle} • {driver.rating}/5
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {driver.currentLocation}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
      </Dialog>

      {/* Delivery Tracker */}
      {showTracker && (
        <DeliveryTracker 
          orderId={selectedOrder?.id}
          onClose={() => setShowTracker(false)}
        />
      )}
    </Box>
  );
};

export default DeliveryManagement;
