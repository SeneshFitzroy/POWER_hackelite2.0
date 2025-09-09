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
  Tabs,
  Tab,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { safeFormatDate } from '../../utils/dateUtils';

const PurchaseOrderManagement = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    notes: ''
  });
  const [activeTab, setActiveTab] = useState(0);

  // Load purchase orders with real-time updates
  useEffect(() => {
    const unsubscribe = purchaseOrderService.subscribePurchaseOrders((ordersData) => {
      setPurchaseOrders(ordersData);
      setFilteredOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = purchaseOrders;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.medicineName?.toLowerCase().includes(searchLower) ||
        order.supplier?.toLowerCase().includes(searchLower) ||
        order.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [purchaseOrders, searchTerm, statusFilter]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status,
      notes: order.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      if (selectedOrder) {
        await purchaseOrderService.updatePurchaseOrderStatus(
          selectedOrder.id, 
          editForm.status, 
          editForm.notes
        );
        setEditDialogOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating purchase order:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'info';
      case 'ordered':
        return 'primary';
      case 'shipped':
        return 'secondary';
      case 'received':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <WarningIcon />;
      case 'approved':
        return <CheckCircleIcon />;
      case 'ordered':
        return <ShoppingCartIcon />;
      case 'shipped':
        return <LocalShippingIcon />;
      case 'received':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const statusMap = ['all', 'pending', 'approved', 'ordered', 'shipped', 'received', 'cancelled'];
    setStatusFilter(statusMap[newValue]);
  };

  const getStatusCounts = () => {
    return {
      all: purchaseOrders.length,
      pending: purchaseOrders.filter(o => o.status === 'pending').length,
      approved: purchaseOrders.filter(o => o.status === 'approved').length,
      ordered: purchaseOrders.filter(o => o.status === 'ordered').length,
      shipped: purchaseOrders.filter(o => o.status === 'shipped').length,
      received: purchaseOrders.filter(o => o.status === 'received').length,
      cancelled: purchaseOrders.filter(o => o.status === 'cancelled').length
    };
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

  const statusCounts = getStatusCounts();

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
          Purchase Order Management
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

      {/* Status Tabs */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold'
            }
          }}
        >
          <Tab 
            label={
              <Badge badgeContent={statusCounts.all} color="primary">
                All Orders
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statusCounts.pending} color="warning">
                Pending
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statusCounts.approved} color="info">
                Approved
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statusCounts.ordered} color="primary">
                Ordered
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statusCounts.shipped} color="secondary">
                Shipped
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statusCounts.received} color="success">
                Received
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statusCounts.cancelled} color="error">
                Cancelled
              </Badge>
            } 
          />
        </Tabs>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search orders by medicine, supplier, notes..."
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
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredOrders.length} of {purchaseOrders.length} orders
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Medicine</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Total Cost</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#f8fafc' 
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      #{order.id.slice(-8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {order.medicineName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Current Stock: {order.currentStock}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {order.quantityOrdered}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.supplier}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      LKR {order.totalCost?.toLocaleString() || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.priority}
                      color={getPriorityColor(order.priority)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {safeFormatDate(order.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(order)}
                          sx={{ color: '#1e40af' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Status">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditClick(order)}
                          sx={{ color: '#6b7280' }}
                        >
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
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Purchase Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Order ID</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>#{selectedOrder.id.slice(-8).toUpperCase()}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Medicine Name</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedOrder.medicineName}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Supplier</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedOrder.supplier}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Quantity Ordered</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedOrder.quantityOrdered} units</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedOrder.status} 
                    color={getStatusColor(selectedOrder.status)}
                    icon={getStatusIcon(selectedOrder.status)}
                    sx={{ textTransform: 'capitalize', mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Chip 
                    label={selectedOrder.priority} 
                    color={getPriorityColor(selectedOrder.priority)}
                    sx={{ textTransform: 'capitalize', mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary">Total Cost</Typography>
                  <Typography variant="h6" sx={{ mb: 2, color: '#059669' }}>
                    LKR {selectedOrder.totalCost?.toLocaleString() || 0}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {safeFormatDate(selectedOrder.createdAt, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedOrder.notes || 'No notes available'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>#{selectedOrder.id.slice(-8).toUpperCase()}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedOrder.medicineName} - {selectedOrder.quantityOrdered} units
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="ordered">Ordered</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="received">Received</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Add any additional notes..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Update Status</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderManagement;
