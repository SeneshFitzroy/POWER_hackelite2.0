import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Rating,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { supplierService } from '../../services/supplierService';
import { safeFormatDate } from '../../utils/dateUtils';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [performanceDialogOpen, setPerformanceDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      contactPerson: ''
    },
    rating: 0,
    status: 'active',
    notes: ''
  });
  const [supplierPerformance, setSupplierPerformance] = useState(null);
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0,
    recentSuppliers: 0
  });

  // Load suppliers with real-time updates
  useEffect(() => {
    loadSuppliers();
    loadStats();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const suppliersData = await supplierService.getAllSuppliers();
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter suppliers based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSuppliers(suppliers);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchLower) ||
        supplier.contactInfo?.email?.toLowerCase().includes(searchLower) ||
        supplier.contactInfo?.phone?.toLowerCase().includes(searchLower) ||
        supplier.contactInfo?.address?.toLowerCase().includes(searchLower) ||
        supplier.contactInfo?.contactPerson?.toLowerCase().includes(searchLower)
      );
      setFilteredSuppliers(filtered);
    }
  }, [suppliers, searchTerm]);

  const loadStats = async () => {
    try {
      const statsData = await supplierService.getSupplierStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading supplier stats:', error);
    }
  };

  const handleAddSupplier = () => {
    setSupplierForm({
      name: '',
      contactInfo: {
        email: '',
        phone: '',
        address: '',
        contactPerson: ''
      },
      rating: 0,
      status: 'active',
      notes: ''
    });
    setSelectedSupplier(null);
    setDialogOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierForm({
      name: supplier.name || '',
      contactInfo: {
        email: supplier.contactInfo?.email || '',
        phone: supplier.contactInfo?.phone || '',
        address: supplier.contactInfo?.address || '',
        contactPerson: supplier.contactInfo?.contactPerson || ''
      },
      rating: supplier.rating || 0,
      status: supplier.status || 'active',
      notes: supplier.notes || ''
    });
    setDialogOpen(true);
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setViewDialogOpen(true);
  };

  const handleViewPerformance = async (supplier) => {
    try {
      setSelectedSupplier(supplier);
      const performance = await supplierService.getSupplierPerformance(supplier.id);
      setSupplierPerformance(performance);
      setPerformanceDialogOpen(true);
    } catch (error) {
      console.error('Error loading supplier performance:', error);
    }
  };

  const handleSaveSupplier = async () => {
    try {
      if (selectedSupplier) {
        await supplierService.updateSupplier(selectedSupplier.id, supplierForm);
      } else {
        await supplierService.createSupplier(supplierForm);
      }
      setDialogOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleDeleteSupplier = async (supplier) => {
    if (window.confirm(`Are you sure you want to deactivate ${supplier.name}?`)) {
      try {
        await supplierService.deleteSupplier(supplier.id);
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  const paginatedSuppliers = filteredSuppliers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          Supplier Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setLoading(true);
              loadSuppliers();
              loadStats();
            }}
            sx={{
              borderColor: '#1e40af',
              color: '#1e40af',
              '&:hover': {
                borderColor: '#1d4ed8',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSupplier}
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
            Add Supplier
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalSuppliers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Suppliers
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
                <BusinessIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.activeSuppliers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Suppliers
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
                <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.recentSuppliers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.inactiveSuppliers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Inactive
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 900, md: 'auto' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Supplier Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSuppliers.map((supplier) => (
                <TableRow key={supplier.id} hover>
                  <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {supplier.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {supplier.contactInfo?.contactPerson || 'No contact person'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {supplier.contactInfo?.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {supplier.contactInfo.email}
                          </Typography>
                        </Box>
                      )}
                      {supplier.contactInfo?.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {supplier.contactInfo.phone}
                          </Typography>
                        </Box>
                      )}
                      {supplier.contactInfo?.address && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {supplier.contactInfo.address}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating
                        value={supplier.rating || 0}
                        readOnly
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {supplier.rating || 0}/5
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={supplier.status}
                      color={getStatusColor(supplier.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {safeFormatDate(supplier.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewSupplier(supplier);
                          }}
                          sx={{ color: '#3b82f6' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Performance">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPerformance(supplier);
                          }}
                          sx={{ color: '#059669' }}
                        >
                          <TrendingUpIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSupplier(supplier);
                          }}
                          sx={{ color: '#d97706' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSupplier(supplier);
                          }}
                          sx={{ color: '#dc2626' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSuppliers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Supplier Name *"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={supplierForm.status}
                    onChange={(e) => setSupplierForm({...supplierForm, status: e.target.value})}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={supplierForm.contactInfo.email}
                  onChange={(e) => setSupplierForm({
                    ...supplierForm, 
                    contactInfo: {...supplierForm.contactInfo, email: e.target.value}
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={supplierForm.contactInfo.phone}
                  onChange={(e) => setSupplierForm({
                    ...supplierForm, 
                    contactInfo: {...supplierForm.contactInfo, phone: e.target.value}
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={supplierForm.contactInfo.address}
                  onChange={(e) => setSupplierForm({
                    ...supplierForm, 
                    contactInfo: {...supplierForm.contactInfo, address: e.target.value}
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={supplierForm.contactInfo.contactPerson}
                  onChange={(e) => setSupplierForm({
                    ...supplierForm, 
                    contactInfo: {...supplierForm.contactInfo, contactPerson: e.target.value}
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>Rating</Typography>
                  <Rating
                    value={supplierForm.rating}
                    onChange={(event, newValue) => {
                      setSupplierForm({...supplierForm, rating: newValue});
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={supplierForm.notes}
                  onChange={(e) => setSupplierForm({...supplierForm, notes: e.target.value})}
                  placeholder="Additional notes about this supplier..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSupplier} variant="contained">
            {selectedSupplier ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Supplier Details</DialogTitle>
        <DialogContent>
          {selectedSupplier && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedSupplier.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={selectedSupplier.rating || 0} readOnly sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedSupplier.rating || 0}/5
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedSupplier.status}
                    color={getStatusColor(selectedSupplier.status)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Contact Information</Typography>
                  {selectedSupplier.contactInfo?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                      <Typography variant="body2">{selectedSupplier.contactInfo.email}</Typography>
                    </Box>
                  )}
                  {selectedSupplier.contactInfo?.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                      <Typography variant="body2">{selectedSupplier.contactInfo.phone}</Typography>
                    </Box>
                  )}
                  {selectedSupplier.contactInfo?.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                      <Typography variant="body2">{selectedSupplier.contactInfo.address}</Typography>
                    </Box>
                  )}
                  {selectedSupplier.contactInfo?.contactPerson && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Contact Person:</strong> {selectedSupplier.contactInfo.contactPerson}
                    </Typography>
                  )}
                </Grid>
                {selectedSupplier.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Notes</Typography>
                    <Typography variant="body2">{selectedSupplier.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog open={performanceDialogOpen} onClose={() => setPerformanceDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Supplier Performance</DialogTitle>
        <DialogContent>
          {selectedSupplier && supplierPerformance && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>{selectedSupplier.name} Performance</Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
                      {supplierPerformance.totalOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#059669' }}>
                      {supplierPerformance.fulfilledOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Fulfilled</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d97706' }}>
                      {supplierPerformance.fulfillmentRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Fulfillment Rate</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                      {supplierPerformance.avgDeliveryTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Avg. Delivery (Days)</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Recent Orders</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplierPerformance.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{order.medicineName}</TableCell>
                        <TableCell>{order.quantityOrdered}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={order.status === 'delivered' ? 'success' : 
                                   order.status === 'pending' ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{safeFormatDate(order.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPerformanceDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierManagement;
