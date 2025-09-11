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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventoryService';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { format } from 'date-fns';

const ReorderManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [purchaseOrderDialogOpen, setPurchaseOrderDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    minStockLevel: 0,
    reorderPoint: 0,
    maxStockLevel: 0
  });
  const [purchaseOrderForm, setPurchaseOrderForm] = useState({
    quantityOrdered: 0,
    supplier: '',
    notes: ''
  });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Load medicines and purchase orders with real-time updates
  useEffect(() => {
    const unsubscribeMedicines = inventoryService.subscribeMedicines((medicinesData) => {
      setMedicines(medicinesData);
      setLoading(false);
    });

    const unsubscribeOrders = purchaseOrderService.subscribePurchaseOrders((ordersData) => {
      setPurchaseOrders(ordersData);
    });

    return () => {
      unsubscribeMedicines();
      unsubscribeOrders();
    };
  }, []);

  // Filter low stock medicines based on reorder point
  useEffect(() => {
    const lowStock = medicines.filter(medicine => {
      const currentStock = medicine.stockQuantity || 0;
      const reorderPoint = medicine.reorderPoint || (medicine.minStockLevel || 10);
      return currentStock <= reorderPoint;
    });

    // Sort by priority (lowest stock first)
    lowStock.sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0));

    setLowStockMedicines(lowStock);
    setFilteredMedicines(lowStock);
  }, [medicines]);

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
      medicine.vendor?.toLowerCase().includes(searchLower)
    );

    setFilteredMedicines(filtered);
  }, [lowStockMedicines, searchTerm]);

  const handleEditClick = (medicine) => {
    setSelectedMedicine(medicine);
    setEditForm({
      minStockLevel: medicine.minStockLevel || 10,
      reorderPoint: medicine.reorderPoint || 20,
      maxStockLevel: medicine.maxStockLevel || 100
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      if (selectedMedicine) {
        await inventoryService.updateMedicine(selectedMedicine.id, editForm);
        setEditDialogOpen(false);
        setSelectedMedicine(null);
      }
    } catch (error) {
      console.error('Error updating medicine:', error);
    }
  };

  const handleCreatePurchaseOrder = (medicine) => {
    setSelectedMedicine(medicine);
    setPurchaseOrderForm({
      quantityOrdered: medicine.maxStockLevel || 100,
      supplier: medicine.vendor || '',
      notes: `Reorder for ${medicine.name} - Current stock: ${medicine.stockQuantity || 0}`
    });
    setPurchaseOrderDialogOpen(true);
  };

  const handlePurchaseOrderSubmit = async () => {
    try {
      if (selectedMedicine) {
        const orderData = {
          medicineId: selectedMedicine.id,
          medicineName: selectedMedicine.name,
          quantityOrdered: purchaseOrderForm.quantityOrdered,
          supplier: purchaseOrderForm.supplier,
          minStockLevel: selectedMedicine.minStockLevel || 10,
          reorderPoint: selectedMedicine.reorderPoint || 20,
          currentStock: selectedMedicine.stockQuantity || 0,
          unitCost: selectedMedicine.costPrice || 0,
          totalCost: (selectedMedicine.costPrice || 0) * purchaseOrderForm.quantityOrdered,
          priority: selectedMedicine.stockQuantity <= (selectedMedicine.minStockLevel || 10) ? 'high' : 'medium',
          notes: purchaseOrderForm.notes
        };

        await purchaseOrderService.createPurchaseOrder(orderData);
        setPurchaseOrderDialogOpen(false);
        setSelectedMedicine(null);
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
    }
  };

  const handleBulkReorder = async () => {
    try {
      const highPriorityItems = lowStockMedicines.filter(medicine => {
        const currentStock = medicine.stockQuantity || 0;
        const minStock = medicine.minStockLevel || 10;
        return currentStock <= minStock;
      });

      if (highPriorityItems.length > 0) {
        await purchaseOrderService.createBulkPurchaseOrders(highPriorityItems);
        alert(`Created ${highPriorityItems.length} purchase orders for high priority items`);
      } else {
        alert('No high priority items found for bulk reorder');
      }
    } catch (error) {
      console.error('Error creating bulk purchase orders:', error);
    }
  };

  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setDetailsDialogOpen(true);
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
        return <WarningIcon sx={{ color: '#dc2626' }} />;
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
          Reorder Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ShoppingCartIcon />}
            onClick={handleBulkReorder}
            sx={{
              borderColor: '#1e40af',
              color: '#1e40af',
              '&:hover': {
                backgroundColor: '#eff6ff',
                borderColor: '#1d4ed8'
              }
            }}
          >
            Bulk Reorder
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setLoading(true);
              // Force reload of data
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }}
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
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {lowStockMedicines.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Need Reorder
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
                <ShoppingCartIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {purchaseOrders.filter(o => o.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {purchaseOrders.filter(o => o.status === 'received').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Received Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
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
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Chip 
                  icon={<WarningIcon />}
                  label={`${filteredMedicines.length} Need Reorder`}
                  color="warning"
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip 
                  icon={<TrendingDownIcon />}
                  label={`${filteredMedicines.filter(m => (m.stockQuantity || 0) === 0).length} Out of Stock`}
                  color="error"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Low Stock Table */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 800, md: 'auto' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Medicine Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Current Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Min Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Reorder Point</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Actions</TableCell>
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
                                     stockStatus.status === 'reorder' ? '#fffbeb' : 'transparent'
                    }}
                  >
                    <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {medicine.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {medicine.manufacturer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, md: 2 } }}>
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
                        {getStatusIcon(stockStatus.status)}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                      <Typography variant="body2">
                        {medicine.minStockLevel || 10}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                      <Typography variant="body2">
                        {medicine.reorderPoint || 20}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                      <Box>
                        <Chip
                          label={stockStatus.status.replace('_', ' ')}
                          color={stockStatus.color}
                          size="small"
                          sx={{ textTransform: 'capitalize', mb: 0.5 }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                          Priority: {stockStatus.priority}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                      <Typography variant="body2">
                        {medicine.vendor || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Tooltip title="Edit Stock Levels">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(medicine);
                            }}
                            sx={{ color: '#1e40af' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Create Purchase Order">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreatePurchaseOrder(medicine);
                            }}
                            sx={{ color: '#059669' }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(medicine);
                            }}
                            sx={{ color: '#6b7280' }}
                          >
                            <ViewIcon />
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

        {filteredMedicines.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <WarningIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No Low Stock Items Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All medicines are adequately stocked or check your search filters
            </Typography>
          </Box>
        )}
      </Card>

      {/* Edit Stock Levels Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Stock Levels</DialogTitle>
        <DialogContent>
          {selectedMedicine && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{selectedMedicine.name}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Min Stock Level"
                    type="number"
                    value={editForm.minStockLevel}
                    onChange={(e) => setEditForm({...editForm, minStockLevel: parseInt(e.target.value) || 0})}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Reorder Point"
                    type="number"
                    value={editForm.reorderPoint}
                    onChange={(e) => setEditForm({...editForm, reorderPoint: parseInt(e.target.value) || 0})}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Max Stock Level"
                    type="number"
                    value={editForm.maxStockLevel}
                    onChange={(e) => setEditForm({...editForm, maxStockLevel: parseInt(e.target.value) || 0})}
                  />
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Current Stock:</strong> {selectedMedicine.stockQuantity || 0} units<br/>
                  <strong>Recommended:</strong> Min Stock ≤ Reorder Point ≤ Max Stock
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Create Purchase Order Dialog */}
      <Dialog open={purchaseOrderDialogOpen} onClose={() => setPurchaseOrderDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Purchase Order</DialogTitle>
        <DialogContent>
          {selectedMedicine && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{selectedMedicine.name}</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity to Order"
                    type="number"
                    value={purchaseOrderForm.quantityOrdered}
                    onChange={(e) => setPurchaseOrderForm({...purchaseOrderForm, quantityOrdered: parseInt(e.target.value) || 0})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Supplier/Vendor"
                    value={purchaseOrderForm.supplier}
                    onChange={(e) => setPurchaseOrderForm({...purchaseOrderForm, supplier: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={purchaseOrderForm.notes}
                    onChange={(e) => setPurchaseOrderForm({...purchaseOrderForm, notes: e.target.value})}
                  />
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Current Stock:</strong> {selectedMedicine.stockQuantity || 0} units<br/>
                  <strong>Min Stock Level:</strong> {selectedMedicine.minStockLevel || 10} units<br/>
                  <strong>Max Stock Level:</strong> {selectedMedicine.maxStockLevel || 100} units<br/>
                  <strong>Unit Cost:</strong> LKR {selectedMedicine.costPrice || 0}<br/>
                  <strong>Total Cost:</strong> LKR {(selectedMedicine.costPrice || 0) * purchaseOrderForm.quantityOrdered}
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseOrderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePurchaseOrderSubmit} variant="contained">Create Order</Button>
        </DialogActions>
      </Dialog>

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
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.manufacturer || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Generic Name</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.genericName || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Batch Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.batchNumber || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.category || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Current Stock</Typography>
                  <Typography variant="h6" sx={{ mb: 2, color: getStockStatus(selectedMedicine).color === 'error' ? '#dc2626' : '#059669' }}>
                    {selectedMedicine.stockQuantity || 0}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Min Stock Level</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.minStockLevel || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Reorder Point</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.reorderPoint || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Max Stock Level</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.maxStockLevel || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Vendor</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.vendor || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Rack Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.rackLocation || 'N/A'}</Typography>
                </Grid>
              </Grid>
              
              {/* Stock Status */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Stock Status</Typography>
                <Chip 
                  label={getStockStatus(selectedMedicine).status}
                  color={getStockStatus(selectedMedicine).color}
                  sx={{ textTransform: 'capitalize', mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getStockStatus(selectedMedicine).message}
                </Typography>
              </Box>
              
              {/* Additional Details */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Additional Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Cost Price</Typography>
                    <Typography variant="body1">₹{selectedMedicine.costPrice || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Selling Price</Typography>
                    <Typography variant="body1">₹{selectedMedicine.sellingPrice || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body1">{selectedMedicine.expiryDate ? format(new Date(selectedMedicine.expiryDate), 'MMM dd, yyyy') : 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                    <Typography variant="body1">{selectedMedicine.type || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReorderManagement;
