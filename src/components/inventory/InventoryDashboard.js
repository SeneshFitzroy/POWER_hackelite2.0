import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Paper
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventoryService';
import { dataInitializationService } from '../../services/dataInitializationService';
import { safeFormatDate, getExpiryStatus } from '../../utils/dateUtils';
import LowStockDashboardWidget from './LowStockDashboardWidget';

const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    activeMedicines: 0,
    lowStockMedicines: 0,
    expiringMedicines: 0,
    expiredMedicines: 0,
    totalStockValue: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize data if needed
      const dataExists = await dataInitializationService.checkIfDataExists();
      if (!dataExists) {
        console.log('Initializing database with real medicine data...');
        await dataInitializationService.initializeAllData();
        console.log('Database initialized successfully!');
      }

      // Get all medicines
      const allMedicines = await inventoryService.getAllMedicines();
      
      // Get low stock medicines
      const lowStock = await inventoryService.getLowStockMedicines(10);
      
      // Get expiring medicines (within 30 days)
      const expiring = await inventoryService.getExpiringMedicines(30);
      
      // Get expired medicines
      const expired = await inventoryService.getExpiredMedicines();

      // Calculate statistics
      const totalMedicines = allMedicines.length;
      const activeMedicines = allMedicines.filter(m => m.status === 'active').length;
      const lowStockCount = lowStock.length;
      const expiringCount = expiring.length;
      const expiredCount = expired.length;

      // Calculate total stock value
      const totalStockValue = allMedicines.reduce((total, medicine) => {
        const quantity = medicine.stockQuantity || 0;
        const costPrice = medicine.costPrice || 0;
        return total + (quantity * costPrice);
      }, 0);

      setStats({
        totalMedicines,
        activeMedicines,
        lowStockMedicines: lowStockCount,
        expiringMedicines: expiringCount,
        expiredMedicines: expiredCount,
        totalStockValue
      });

      setLowStockItems(lowStock.slice(0, 5)); // Show top 5
      setExpiringItems(expiring.slice(0, 5)); // Show top 5

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // getExpiryStatus is now imported from dateUtils

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <CircularProgress size={60} sx={{ color: '#1e40af' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={loadDashboardData}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      height: '100%',
      overflow: 'auto',
      flex: 1
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#1e3a8a',
            letterSpacing: '0.5px'
          }}
        >
          Inventory Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadDashboardData}
          sx={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            px: 3,
            py: 1.5,
            fontWeight: 'bold',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              boxShadow: '0 6px 16px rgba(30, 64, 175, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Stats Overview */}
      <Paper elevation={3} sx={{ mb: 4, borderRadius: '12px', overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1e3a8a' }}>
            Inventory Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: 'white',
                borderRadius: '10px',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.totalMedicines}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Medicines
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: 'white',
                borderRadius: '10px',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.activeMedicines}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Stock
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: 'white',
                borderRadius: '10px',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        LKR {stats.totalStockValue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Stock Value
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                color: 'white',
                borderRadius: '10px',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingDownIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.lowStockMedicines}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Low Stock Items
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                color: 'white',
                borderRadius: '10px',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.expiringMedicines}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Expiring Soon
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
                color: 'white',
                borderRadius: '10px',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.expiredMedicines}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Expired Items
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>

      {/* Alerts Section */}
      <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1e3a8a' }}>
            Critical Alerts
          </Typography>
          <Grid container spacing={3}>
            {/* Low Stock Alerts */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '10px', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WarningIcon sx={{ color: '#d97706', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                      Low Stock Alerts
                    </Typography>
                  </Box>
                  {lowStockItems.length > 0 ? (
                    <List>
                      {lowStockItems.map((medicine, index) => (
                        <React.Fragment key={medicine.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <TrendingDownIcon sx={{ color: '#d97706' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={medicine.name}
                              secondary={`Stock: ${medicine.stockQuantity} | Min: ${medicine.minStockLevel || 10}`}
                            />
                            <Chip 
                              label={`${medicine.stockQuantity}`} 
                              color="warning" 
                              size="small" 
                            />
                          </ListItem>
                          {index < lowStockItems.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: '#059669', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No low stock items found
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Expiring Soon */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '10px', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon sx={{ color: '#dc2626', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                      Expiring Soon
                    </Typography>
                  </Box>
                  {expiringItems.length > 0 ? (
                    <List>
                      {expiringItems.map((medicine, index) => {
                        const expiryStatus = getExpiryStatus(medicine.expiryDate);
                        return (
                          <React.Fragment key={medicine.id}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <ScheduleIcon sx={{ color: expiryStatus.color === 'error' ? '#dc2626' : '#d97706' }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={medicine.name}
                                secondary={`Expires: ${safeFormatDate(medicine.expiryDate)}`}
                              />
                              <Chip 
                                label={expiryStatus.status} 
                                color={expiryStatus.color} 
                                size="small" 
                              />
                            </ListItem>
                            {index < expiringItems.length - 1 && <Divider />}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: '#059669', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No medicines expiring soon
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>

      {/* Low Stock Dashboard Widget */}
      <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <LowStockDashboardWidget 
            onViewAll={() => {
              // Navigate to Stock Management Low Stock tab
              if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({ 
                  type: 'navigate', 
                  module: 'stock-tracking',
                  tab: 1 // Low Stock tab
                }, '*');
              }
              // Also try direct navigation
              if (window.location.hash) {
                window.location.hash = '#stock-management';
              }
            }}
            onCreateOrder={() => {
              // Navigate to Purchase Orders
              if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({ 
                  type: 'navigate', 
                  module: 'supplier-management',
                  tab: 1 // Purchase Orders tab
                }, '*');
              }
            }}
          />
        </CardContent>
      </Paper>
    </Box>
  );
};

export default InventoryDashboard;