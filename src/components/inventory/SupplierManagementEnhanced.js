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
  Tabs,
  Tab,
  Badge,
  Divider,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  ShoppingCart as ShoppingCartIcon,
  History as HistoryIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { supplierService } from '../../services/supplierService';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { safeFormatDate } from '../../utils/dateUtils';

const SupplierManagementEnhanced = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [suppliersData, ordersData, historyData] = await Promise.all([
        supplierService.getAllSuppliers(),
        purchaseOrderService.getAllPurchaseOrders(),
        purchaseOrderService.getPurchaseHistory()
      ]);
      setSuppliers(suppliersData);
      setPurchaseOrders(ordersData);
      setPurchaseHistory(historyData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on active tab and filters
  useEffect(() => {
    let data = [];
    
    switch (activeTab) {
      case 0: // Suppliers
        data = suppliers;
        break;
      case 1: // Purchase Orders
        data = purchaseOrders;
        break;
      case 2: // Purchase History
        data = purchaseHistory;
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter(item => {
        if (activeTab === 0) { // Suppliers
          return item.name?.toLowerCase().includes(searchLower) ||
                 item.contactPerson?.toLowerCase().includes(searchLower) ||
                 item.email?.toLowerCase().includes(searchLower) ||
                 item.phone?.toLowerCase().includes(searchLower);
        } else { // Purchase Orders/History
          return item.orderNumber?.toLowerCase().includes(searchLower) ||
                 item.supplierName?.toLowerCase().includes(searchLower) ||
                 item.status?.toLowerCase().includes(searchLower);
        }
      });
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      data = data.filter(item => item.status === filterStatus);
    }

    setFilteredData(data);
  }, [suppliers, purchaseOrders, purchaseHistory, activeTab, searchTerm, filterStatus]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm('');
    setFilterStatus('all');
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      'active': { color: 'success', label: 'Active' },
      'inactive': { color: 'default', label: 'Inactive' },
      'pending': { color: 'warning', label: 'Pending' },
      'approved': { color: 'info', label: 'Approved' },
      'shipped': { color: 'primary', label: 'Shipped' },
      'delivered': { color: 'success', label: 'Delivered' },
      'cancelled': { color: 'error', label: 'Cancelled' },
      'completed': { color: 'success', label: 'Completed' }
    };
    
    const config = statusMap[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getPurchaseOrderCounts = () => {
    const pending = purchaseOrders.filter(po => po.status === 'pending').length;
    const approved = purchaseOrders.filter(po => po.status === 'approved').length;
    const shipped = purchaseOrders.filter(po => po.status === 'shipped').length;
    const delivered = purchaseOrders.filter(po => po.status === 'delivered').length;
    
    return { pending, approved, shipped, delivered, total: purchaseOrders.length };
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

  const orderCounts = getPurchaseOrderCounts();

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
          Supplier & Orders Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => {
            setLoading(true);
            loadAllData();
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

      {/* Tabs */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            '& .MuiTab-root': { 
              textTransform: 'none', 
              fontWeight: 'bold',
              minWidth: 120 
            } 
          }}
        >
          <Tab 
            label={
              <Badge badgeContent={suppliers.length} color="primary" max={999}>
                Suppliers
              </Badge>
            } 
            icon={<BusinessIcon />}
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={orderCounts.total} color="warning" max={999}>
                Purchase Orders
              </Badge>
            } 
            icon={<ShoppingCartIcon />}
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={purchaseHistory.length} color="info" max={999}>
                Purchase History
              </Badge>
            } 
            icon={<HistoryIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Quick Stats for Purchase Orders */}
      {activeTab === 1 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#fff7ed' }}>
              <CardContent>
                <PendingIcon sx={{ fontSize: 40, color: '#ea580c', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ea580c' }}>
                  {orderCounts.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#f0f9ff' }}>
              <CardContent>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#0284c7', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                  {orderCounts.approved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#f7fee7' }}>
              <CardContent>
                <ShippingIcon sx={{ fontSize: 40, color: '#65a30d', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#65a30d' }}>
                  {orderCounts.shipped}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Shipped Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#f0fdf4' }}>
              <CardContent>
                <ReceiptIcon sx={{ fontSize: 40, color: '#16a34a', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                  {orderCounts.delivered}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Delivered Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={`Search ${activeTab === 0 ? 'suppliers' : activeTab === 1 ? 'purchase orders' : 'purchase history'}...`}
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status Filter"
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {activeTab === 0 ? (
                    <>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Chip 
                  label={`${filteredData.length} Items`}
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddDialogOpen(true)}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  Add New
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 1000, md: 'auto' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                {activeTab === 0 ? (
                  // Suppliers columns
                  <>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Actions</TableCell>
                  </>
                ) : (
                  // Purchase Orders/History columns
                  <>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Order #</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Items</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Actions</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow 
                  key={item.id}
                  sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}
                >
                  {activeTab === 0 ? (
                    // Suppliers row
                    <>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <BusinessIcon sx={{ color: '#6b7280' }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {item.id || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        {item.contactPerson || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          {item.email || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          {item.phone || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.address || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        {getStatusChip(item.status || 'active')}
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(item);
                              }}
                              sx={{ color: '#1e40af' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Edit functionality
                              }}
                              sx={{ color: '#6b7280' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Delete functionality
                              }}
                              sx={{ color: '#dc2626' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </>
                  ) : (
                    // Purchase Orders/History row
                    <>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {item.orderNumber || item.id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        {item.supplierName || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        {safeFormatDate(item.orderDate || item.createdAt)}
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Chip 
                          label={`${item.items?.length || 0} items`} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ${item.totalAmount || '0.00'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        {getStatusChip(item.status || 'pending')}
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(item);
                              }}
                              sx={{ color: '#1e40af' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {activeTab === 1 && (
                            <Tooltip title="Edit Order">
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Edit functionality
                                }}
                                sx={{ color: '#6b7280' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredData.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            {activeTab === 0 ? (
              <BusinessIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
            ) : (
              <ShoppingCartIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
            )}
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No {activeTab === 0 ? 'Suppliers' : activeTab === 1 ? 'Purchase Orders' : 'Purchase History'} Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No items match your current filters
            </Typography>
          </Box>
        )}
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {activeTab === 0 ? 'Supplier Details' : activeTab === 1 ? 'Purchase Order Details' : 'Purchase History Details'}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2 }}>
              {activeTab === 0 ? (
                // Supplier details
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Supplier Name</Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>{selectedItem.name}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.contactPerson || 'N/A'}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.phone || 'N/A'}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.address || 'N/A'}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Box sx={{ mb: 2 }}>
                      {getStatusChip(selectedItem.status || 'active')}
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                // Purchase order/history details
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Order Number</Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>{selectedItem.orderNumber || selectedItem.id}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Supplier</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.supplierName || 'N/A'}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{safeFormatDate(selectedItem.orderDate || selectedItem.createdAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h6" sx={{ mb: 2, color: '#059669' }}>
                      ${selectedItem.totalAmount || '0.00'}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Box sx={{ mb: 2 }}>
                      {getStatusChip(selectedItem.status || 'pending')}
                    </Box>
                    
                    <Typography variant="subtitle2" color="text.secondary">Items Count</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.items?.length || 0} items</Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New {activeTab === 0 ? 'Supplier' : activeTab === 1 ? 'Purchase Order' : 'Record'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Add new {activeTab === 0 ? 'supplier' : activeTab === 1 ? 'purchase order' : 'record'} functionality will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              // Handle add action
              setAddDialogOpen(false);
            }} 
            variant="contained"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierManagementEnhanced;
