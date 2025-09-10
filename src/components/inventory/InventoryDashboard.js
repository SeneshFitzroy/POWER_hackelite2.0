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
  Button
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

      // Get all medicines
      const allMedicines = await inventoryService.getAllMedicines();
      
      // Get low stock medicines
      const lowStock = await inventoryService.getLowStockMedicines(10);
      
      // Get expiring medicines
      const expiring = await inventoryService.getExpiringMedicines(30);

      // Calculate statistics
      const totalMedicines = allMedicines.length;
      const activeMedicines = allMedicines.filter(m => m.status === 'active').length;
      const lowStockCount = lowStock.length;
      const expiringCount = expiring.length;
      
      // Calculate expired medicines
      const today = new Date();
      const expiredMedicines = allMedicines.filter(medicine => {
        if (!medicine.expiryDate) return false;
        const expiryDate = medicine.expiryDate && typeof medicine.expiryDate === 'object' && medicine.expiryDate.toDate 
          ? medicine.expiryDate.toDate() 
          : new Date(medicine.expiryDate);
        return expiryDate < today;
      });

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
        expiredMedicines: expiredMedicines.length,
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

  const quickActions = [
    { title: 'View All Stock', link: '/stock', icon: InventoryIcon },
    { title: 'Check Expiry', link: '/expiry', icon: ScheduleIcon },
    { title: 'Low Stock Alert', link: '/low-stock', icon: WarningIcon }
  ];

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
    <Box>
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

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDownIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.lowStockMedicines}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Low Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(124, 45, 18, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ErrorIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.expiredMedicines}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Expired
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
      </Grid>

      {/* Alerts and Quick Actions */}
      <Grid container spacing={3}>
        {/* Low Stock Alerts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
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
                <Typography variant="body2" color="text.secondary">
                  No low stock items found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Expiring Medicines */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
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
                <Typography variant="body2" color="text.secondary">
                  No medicines expiring soon
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock Dashboard Widget */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <LowStockDashboardWidget 
            onViewAll={() => {
              // This would navigate to the reorder management tab
              console.log('Navigate to reorder management');
            }}
            onCreateOrder={() => {
              // This would navigate to create purchase orders
              console.log('Navigate to create purchase orders');
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryDashboard;
