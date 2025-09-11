import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Grid,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventoryService';
import { purchaseOrderService } from '../../services/purchaseOrderService';

const LowStockDashboardWidget = ({ onViewAll, onCreateOrder }) => {
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLowStock: 0,
    outOfStock: 0,
    critical: 0,
    reorderNeeded: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    loadLowStockData();
  }, []);

  const loadLowStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all medicines
      const medicines = await inventoryService.getAllMedicines();
      
      // Get pending purchase orders
      const pendingOrders = await purchaseOrderService.getPurchaseOrdersByStatus('pending');

      // Filter low stock medicines
      const lowStock = medicines.filter(medicine => {
        const currentStock = medicine.stockQuantity || 0;
        const reorderPoint = medicine.reorderPoint || (medicine.minStockLevel || 10);
        return currentStock <= reorderPoint;
      });

      // Sort by priority (lowest stock first)
      lowStock.sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0));

      // Calculate statistics
      const outOfStock = lowStock.filter(m => (m.stockQuantity || 0) === 0).length;
      const critical = lowStock.filter(m => {
        const currentStock = m.stockQuantity || 0;
        const minStock = m.minStockLevel || 10;
        return currentStock > 0 && currentStock <= minStock;
      }).length;
      const reorderNeeded = lowStock.filter(m => {
        const currentStock = m.stockQuantity || 0;
        const minStock = m.minStockLevel || 10;
        const reorderPoint = m.reorderPoint || 20;
        return currentStock > minStock && currentStock <= reorderPoint;
      }).length;

      setLowStockMedicines(lowStock.slice(0, 5)); // Show top 5
      setStats({
        totalLowStock: lowStock.length,
        outOfStock,
        critical,
        reorderNeeded,
        pendingOrders: pendingOrders.length
      });

    } catch (err) {
      console.error('Error loading low stock data:', err);
      setError('Failed to load low stock data');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (medicine) => {
    const currentStock = medicine.stockQuantity || 0;
    const minStock = medicine.minStockLevel || 10;
    const reorderPoint = medicine.reorderPoint || 20;

    if (currentStock === 0) {
      return { status: 'out_of_stock', color: 'error', priority: 'critical' };
    } else if (currentStock <= minStock) {
      return { status: 'critical', color: 'error', priority: 'high' };
    } else if (currentStock <= reorderPoint) {
      return { status: 'reorder', color: 'warning', priority: 'medium' };
    } else {
      return { status: 'adequate', color: 'success', priority: 'low' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'out_of_stock':
        return <ErrorIcon sx={{ color: '#dc2626' }} />;
      case 'critical':
        return <WarningIcon sx={{ color: '#dc2626' }} />;
      case 'reorder':
        return <TrendingDownIcon sx={{ color: '#d97706' }} />;
      default:
        return <CheckCircleIcon sx={{ color: '#059669' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleCreateQuickOrder = async (medicine) => {
    try {
      const orderData = {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantityOrdered: medicine.maxStockLevel || (medicine.reorderPoint ? medicine.reorderPoint * 2 : 50),
        supplier: medicine.vendor || 'Unknown Supplier',
        minStockLevel: medicine.minStockLevel || 5,
        reorderPoint: medicine.reorderPoint || (medicine.minStockLevel ? medicine.minStockLevel * 2 : 10),
        currentStock: medicine.stockQuantity || 0,
        unitCost: medicine.costPrice || 0,
        totalCost: (medicine.costPrice || 0) * (medicine.maxStockLevel || (medicine.reorderPoint ? medicine.reorderPoint * 2 : 50)),
        priority: medicine.stockQuantity <= (medicine.minStockLevel || 5) ? 'high' : 'medium',
        notes: `Quick reorder for ${medicine.name} - Current stock: ${medicine.stockQuantity || 0}`
      };

      await purchaseOrderService.createPurchaseOrder(orderData);
      // Refresh data
      loadLowStockData();
    } catch (error) {
      console.error('Error creating quick order:', error);
    }
  };

  if (loading) {
    return (
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: '#1e40af' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={loadLowStockData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#d97706' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
              Low Stock Alerts
            </Typography>
            <Badge badgeContent={stats.totalLowStock} color="error" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={loadLowStockData}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                // Navigate to Stock Management -> Low Stock tab
                if (onViewAll) {
                  onViewAll();
                } else {
                  // Enhanced navigation - try multiple approaches
                  
                  // 1. Direct window reference approach
                  if (window.stockTrackingRef && window.stockTrackingRef.setActiveTab) {
                    window.stockTrackingRef.setActiveTab(1); // Low Stock tab
                  }
                  
                  // 2. Post message to parent for route navigation
                  if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage({ 
                      type: 'navigate', 
                      module: 'stock-tracking',
                      tab: 1 // Low Stock tab
                    }, '*');
                  }
                  
                  // 3. Direct route navigation if we're in the same app
                  if (window.location.pathname.includes('/inventory')) {
                    // We're already in inventory module, just switch tab
                    if (window.inventoryModule && window.inventoryModule.setActiveTab) {
                      window.inventoryModule.setActiveTab(1); // Stock Tracking tab
                      setTimeout(() => {
                        if (window.stockTrackingRef && window.stockTrackingRef.setActiveTab) {
                          window.stockTrackingRef.setActiveTab(1); // Low Stock tab
                        }
                      }, 100);
                    }
                  } else {
                    // Navigate to inventory first, then set tab
                    window.location.hash = '#inventory';
                    setTimeout(() => {
                      if (window.stockTrackingRef && window.stockTrackingRef.setActiveTab) {
                        window.stockTrackingRef.setActiveTab(1); // Low Stock tab
                      }
                    }, 500);
                  }
                }
              }}
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          </Box>
        </Box>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#dc2626', fontWeight: 'bold' }}>
                {stats.outOfStock}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Out of Stock
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#dc2626', fontWeight: 'bold' }}>
                {stats.critical}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Critical
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#d97706', fontWeight: 'bold' }}>
                {stats.reorderNeeded}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Reorder Needed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                {stats.pendingOrders}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending Orders
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Low Stock Items List */}
        {lowStockMedicines.length > 0 ? (
          <List sx={{ p: 0 }}>
            {lowStockMedicines.map((medicine, index) => {
              const stockStatus = getStockStatus(medicine);
              return (
                <React.Fragment key={medicine.id}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon>
                      {getStatusIcon(stockStatus.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {medicine.name}
                          </Typography>
                          <Chip
                            label={stockStatus.priority}
                            color={getPriorityColor(stockStatus.priority)}
                            size="small"
                            sx={{ textTransform: 'capitalize', fontSize: '10px' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Stock: {medicine.stockQuantity || 0} | Min: {medicine.minStockLevel || 10} | Reorder: {medicine.reorderPoint || 20}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(((medicine.stockQuantity || 0) / (medicine.reorderPoint || 20)) * 100, 100)}
                            sx={{
                              mt: 0.5,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: stockStatus.color === 'error' ? '#dc2626' : 
                                               stockStatus.color === 'warning' ? '#d97706' : '#059669'
                              }
                            }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Quick Reorder">
                          <IconButton 
                            size="small" 
                            onClick={() => handleCreateQuickOrder(medicine)}
                            sx={{ color: '#059669' }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => onViewAll && onViewAll()}
                            sx={{ color: '#1e40af' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < lowStockMedicines.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: '#059669', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No low stock items found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All medicines are adequately stocked
            </Typography>
          </Box>
        )}

        {/* Footer Actions */}
        {lowStockMedicines.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e5e7eb' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={onCreateOrder}
              sx={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '8px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Create Bulk Reorder
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockDashboardWidget;
