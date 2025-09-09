import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventoryService';
import { safeFormatDate } from '../../utils/dateUtils';

const LowStockAlerts = () => {
  const [medicines, setMedicines] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [threshold, setThreshold] = useState(10);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [reorderQuantity, setReorderQuantity] = useState(0);

  // Load medicines with real-time updates
  useEffect(() => {
    const unsubscribe = inventoryService.subscribeMedicines((medicinesData) => {
      setMedicines(medicinesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter low stock medicines based on threshold
  useEffect(() => {
    const lowStock = medicines.filter(medicine => {
      const currentStock = medicine.stockQuantity || 0;
      const minStock = medicine.minStockLevel || threshold;
      return currentStock <= minStock;
    });

    // Sort by stock quantity (lowest first)
    lowStock.sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0));

    setLowStockMedicines(lowStock);
    setFilteredMedicines(lowStock);
  }, [medicines, threshold]);

  // Filter by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMedicines(lowStockMedicines);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = lowStockMedicines.filter(medicine =>
      medicine.name?.toLowerCase().includes(searchLower) ||
      medicine.batchNumber?.toLowerCase().includes(searchLower) ||
      medicine.manufacturer?.toLowerCase().includes(searchLower) ||
      medicine.rackLocation?.toLowerCase().includes(searchLower)
    );

    setFilteredMedicines(filtered);
  }, [lowStockMedicines, searchTerm]);

  const getStockStatus = (medicine) => {
    const currentStock = medicine.stockQuantity || 0;
    const minStock = medicine.minStockLevel || threshold;
    const reorderPoint = medicine.reorderPoint || (minStock * 1.5);

    if (currentStock === 0) {
      return { status: 'out_of_stock', color: 'error', priority: 'critical' };
    } else if (currentStock <= minStock * 0.5) {
      return { status: 'critical', color: 'error', priority: 'high' };
    } else if (currentStock <= minStock) {
      return { status: 'low', color: 'warning', priority: 'medium' };
    } else if (currentStock <= reorderPoint) {
      return { status: 'reorder', color: 'info', priority: 'low' };
    } else {
      return { status: 'adequate', color: 'success', priority: 'none' };
    }
  };

  const getStockIcon = (status) => {
    switch (status) {
      case 'out_of_stock':
        return <WarningIcon sx={{ color: '#dc2626' }} />;
      case 'critical':
        return <WarningIcon sx={{ color: '#dc2626' }} />;
      case 'low':
        return <TrendingDownIcon sx={{ color: '#d97706' }} />;
      case 'reorder':
        return <TrendingDownIcon sx={{ color: '#3b82f6' }} />;
      default:
        return <TrendingDownIcon />;
    }
  };

  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setDetailsDialogOpen(true);
  };

  const handleReorder = (medicine) => {
    setSelectedMedicine(medicine);
    setReorderQuantity(medicine.minStockLevel || threshold);
    setReorderDialogOpen(true);
  };

  const handleReorderSubmit = async () => {
    try {
      // Here you would typically create a reorder request or update stock
      console.log(`Reordering ${reorderQuantity} units of ${selectedMedicine.name}`);
      setReorderDialogOpen(false);
      setSelectedMedicine(null);
    } catch (error) {
      console.error('Error creating reorder:', error);
    }
  };

  const getStockMessage = (medicine) => {
    const currentStock = medicine.stockQuantity || 0;
    const minStock = medicine.minStockLevel || threshold;
    const reorderPoint = medicine.reorderPoint || (minStock * 1.5);

    if (currentStock === 0) {
      return 'Out of Stock - Immediate reorder required';
    } else if (currentStock <= minStock * 0.5) {
      return `Critical - Only ${currentStock} units left (Min: ${minStock})`;
    } else if (currentStock <= minStock) {
      return `Low Stock - ${currentStock} units left (Min: ${minStock})`;
    } else if (currentStock <= reorderPoint) {
      return `Approaching reorder point - ${currentStock} units left`;
    } else {
      return 'Stock adequate';
    }
  };

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
          Low Stock Alerts
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
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
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {lowStockMedicines.filter(m => (m.stockQuantity || 0) === 0).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Out of Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {lowStockMedicines.filter(m => {
                      const currentStock = m.stockQuantity || 0;
                      const minStock = m.minStockLevel || threshold;
                      return currentStock > 0 && currentStock <= minStock * 0.5;
                    }).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Critical Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {lowStockMedicines.filter(m => {
                      const currentStock = m.stockQuantity || 0;
                      const minStock = m.minStockLevel || threshold;
                      return currentStock > minStock * 0.5 && currentStock <= minStock;
                    }).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Low Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {lowStockMedicines.filter(m => {
                      const currentStock = m.stockQuantity || 0;
                      const minStock = m.minStockLevel || threshold;
                      const reorderPoint = m.reorderPoint || (minStock * 1.5);
                      return currentStock > minStock && currentStock <= reorderPoint;
                    }).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Reorder Point
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Alert Threshold: {threshold} units
                </Typography>
                <Slider
                  value={threshold}
                  onChange={(e, newValue) => setThreshold(newValue)}
                  min={1}
                  max={50}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#1e40af' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredMedicines.length} low stock items
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Low Stock Table */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Medicine Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Current Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Min Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Last Updated</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Rack Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMedicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine);
                return (
                  <TableRow 
                    key={medicine.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f8fafc' 
                      },
                      backgroundColor: stockStatus.status === 'out_of_stock' ? '#fef2f2' : 
                                     stockStatus.status === 'critical' ? '#fef2f2' : 
                                     stockStatus.status === 'low' ? '#fffbeb' : 'transparent'
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {medicine.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {medicine.manufacturer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: stockStatus.color === 'error' ? '#dc2626' : 
                                  stockStatus.color === 'warning' ? '#d97706' : '#059669'
                          }}
                        >
                          {medicine.stockQuantity || 0}
                        </Typography>
                        {getStockIcon(stockStatus.status)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {medicine.minStockLevel || threshold}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={stockStatus.status.replace('_', ' ')}
                          color={stockStatus.color}
                          size="small"
                          sx={{ textTransform: 'capitalize', mb: 0.5 }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                          {getStockMessage(medicine)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {safeFormatDate(medicine.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {medicine.rackLocation || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(medicine)}
                            sx={{ color: '#1e40af' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reorder">
                          <IconButton 
                            size="small" 
                            onClick={() => handleReorder(medicine)}
                            sx={{ color: '#059669' }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            sx={{ color: '#6b7280' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Medicine Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Medicine Details</DialogTitle>
        <DialogContent>
          {selectedMedicine && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Medicine Name</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedMedicine.name}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Manufacturer</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.manufacturer}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Current Stock</Typography>
                  <Typography variant="h6" sx={{ mb: 2, color: '#dc2626' }}>
                    {selectedMedicine.stockQuantity || 0} units
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Minimum Stock Level</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMedicine.minStockLevel || threshold} units
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Reorder Point</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMedicine.reorderPoint || (selectedMedicine.minStockLevel || threshold) * 1.5} units
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Rack Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.rackLocation || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={getStockStatus(selectedMedicine).status.replace('_', ' ')} 
                    color={getStockStatus(selectedMedicine).color}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button onClick={() => handleReorder(selectedMedicine)} variant="contained">
            Create Reorder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reorder Dialog */}
      <Dialog open={reorderDialogOpen} onClose={() => setReorderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Reorder Request</DialogTitle>
        <DialogContent>
          {selectedMedicine && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{selectedMedicine.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Current Stock: {selectedMedicine.stockQuantity || 0} units | 
                Min Required: {selectedMedicine.minStockLevel || threshold} units
              </Typography>
              
              <TextField
                fullWidth
                label="Reorder Quantity"
                type="number"
                value={reorderQuantity}
                onChange={(e) => setReorderQuantity(parseInt(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                Suggested reorder quantity: {Math.max(selectedMedicine.minStockLevel || threshold, 50)} units
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReorderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReorderSubmit} variant="contained">
            Create Reorder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LowStockAlerts;
