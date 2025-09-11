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
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventoryService';
import { quarantineService } from '../../services/quarantineService';
import { safeFormatDate, getExpiryStatus, getDaysUntilExpiry } from '../../utils/dateUtils';

const StockTrackingEnhanced = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [quarantinedMedicines, setQuarantinedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [medicinesData, quarantinedData] = await Promise.all([
        inventoryService.getAllMedicines(),
        quarantineService.getQuarantinedMedicines()
      ]);
      setMedicines(medicinesData);
      setQuarantinedMedicines(quarantinedData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter medicines based on active tab and filters
  useEffect(() => {
    let filtered = medicines;

    // Apply tab-specific filtering
    switch (activeTab) {
      case 0: // All Stock
        break;
      case 1: // Low Stock
        filtered = filtered.filter(medicine => {
          const currentStock = medicine.stockQuantity || 0;
          const minStock = medicine.minStockLevel || lowStockThreshold;
          return currentStock <= minStock;
        });
        break;
      case 2: // Expiring Soon
        filtered = filtered.filter(medicine => {
          if (!medicine.expiryDate) return false;
          const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);
          return daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
        });
        break;
      case 3: // Expired
        filtered = filtered.filter(medicine => {
          if (!medicine.expiryDate) return medicine.status === 'expired';
          const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);
          return daysUntilExpiry !== null && daysUntilExpiry < 0;
        });
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(medicine =>
        medicine.name?.toLowerCase().includes(searchLower) ||
        medicine.batchNumber?.toLowerCase().includes(searchLower) ||
        medicine.manufacturer?.toLowerCase().includes(searchLower) ||
        medicine.rackLocation?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(medicine => medicine.status === filterStatus);
    }

    setFilteredMedicines(filtered);
  }, [medicines, activeTab, searchTerm, filterStatus, lowStockThreshold]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setDetailsDialogOpen(true);
  };

  const handleQuarantineAction = (medicine) => {
    setSelectedMedicine(medicine);
    setActionDialogOpen(true);
  };

  const getStockStatus = (medicine) => {
    const currentStock = medicine.stockQuantity || 0;
    const minStock = medicine.minStockLevel || lowStockThreshold;

    if (currentStock === 0) {
      return { status: 'out_of_stock', color: 'error', label: 'Out of Stock' };
    } else if (currentStock <= 5) {
      return { status: 'critical', color: 'error', label: 'Critical' };
    } else if (currentStock <= minStock) {
      return { status: 'low', color: 'warning', label: 'Low Stock' };
    } else {
      return { status: 'normal', color: 'success', label: 'Normal' };
    }
  };

  const getExpiryStatusChip = (medicine) => {
    if (!medicine.expiryDate) return null;
    
    const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);
    if (daysUntilExpiry === null) return null;

    if (daysUntilExpiry < 0) {
      return <Chip label="Expired" color="error" size="small" icon={<ErrorIcon />} />;
    } else if (daysUntilExpiry <= 7) {
      return <Chip label={`Expires in ${daysUntilExpiry}d`} color="error" size="small" icon={<WarningIcon />} />;
    } else if (daysUntilExpiry <= 30) {
      return <Chip label={`Expires in ${daysUntilExpiry}d`} color="warning" size="small" icon={<ScheduleIcon />} />;
    }
    return null;
  };

  const getStockCounts = () => {
    const lowStock = medicines.filter(m => {
      const currentStock = m.stockQuantity || 0;
      const minStock = m.minStockLevel || lowStockThreshold;
      return currentStock <= minStock;
    }).length;

    const expiringSoon = medicines.filter(m => {
      if (!m.expiryDate) return false;
      const days = getDaysUntilExpiry(m.expiryDate);
      return days !== null && days >= 0 && days <= 30;
    }).length;

    const expired = medicines.filter(m => {
      if (!m.expiryDate) return m.status === 'expired';
      const days = getDaysUntilExpiry(m.expiryDate);
      return days !== null && days < 0;
    }).length;

    return { lowStock, expiringSoon, expired, total: medicines.length };
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

  const counts = getStockCounts();

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
          Stock Management
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
              <Badge badgeContent={counts.total} color="primary" max={999}>
                All Stock
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={counts.lowStock} color="warning" max={999}>
                Low Stock
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={counts.expiringSoon} color="warning" max={999}>
                Expiring Soon
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={counts.expired} color="error" max={999}>
                Expired
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={quarantinedMedicines.length} color="error" max={999}>
                Quarantined
              </Badge>
            } 
          />
        </Tabs>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid item xs={12} md={6}>
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Chip 
                  icon={<FilterListIcon />}
                  label={`${filteredMedicines.length} Items`}
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table */}
      {activeTab === 4 ? (
        // Quarantined Stock View
        <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#dc2626' }}>
              Quarantined Stock
            </Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: 800, md: 'auto' } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#fef2f2' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#dc2626', p: { xs: 1, md: 2 } }}>Medicine</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#dc2626', p: { xs: 1, md: 2 } }}>Batch</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#dc2626', p: { xs: 1, md: 2 } }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#dc2626', p: { xs: 1, md: 2 } }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#dc2626', p: { xs: 1, md: 2 } }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#dc2626', p: { xs: 1, md: 2 } }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quarantinedMedicines.map((medicine) => (
                    <TableRow 
                      key={medicine.id}
                      sx={{ '&:hover': { backgroundColor: '#fef2f2' } }}
                    >
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {medicine.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {medicine.manufacturer}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        {medicine.batchNumber || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                          {medicine.stockQuantity || 0}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Chip 
                          label={medicine.quarantineReason || 'Quality Issue'} 
                          color="error" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        {safeFormatDate(medicine.quarantineDate)}
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Tooltip title="Release">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuarantineAction(medicine);
                              }}
                              sx={{ color: '#059669' }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(medicine);
                              }}
                              sx={{ color: '#1e40af' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {quarantinedMedicines.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No Quarantined Stock
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All medicines are currently cleared for use
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        // Regular Stock View
        <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: { xs: 1000, md: 'auto' } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Medicine</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Batch</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Expiry</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a', p: { xs: 1, md: 2 } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMedicines.map((medicine) => {
                  const stockStatus = getStockStatus(medicine);
                  const expiryChip = getExpiryStatusChip(medicine);
                  
                  return (
                    <TableRow 
                      key={medicine.id}
                      sx={{ 
                        '&:hover': { backgroundColor: '#f8fafc' },
                        backgroundColor: stockStatus.status === 'out_of_stock' ? '#fef2f2' : 
                                       stockStatus.status === 'critical' ? '#fef2f2' : 
                                       stockStatus.status === 'low' ? '#fffbeb' : 'transparent'
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
                        {medicine.batchNumber || 'N/A'}
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
                          <Chip
                            label={stockStatus.label}
                            color={stockStatus.color}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Chip
                          label={medicine.status || 'active'}
                          color={medicine.status === 'active' ? 'success' : 'default'}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Box>
                          <Typography variant="body2">
                            {safeFormatDate(medicine.expiryDate)}
                          </Typography>
                          {expiryChip}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        {medicine.rackLocation || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ p: { xs: 1, md: 2 } }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(medicine);
                              }}
                              sx={{ color: '#1e40af' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Quarantine">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuarantineAction(medicine);
                              }}
                              sx={{ color: '#dc2626' }}
                            >
                              <BlockIcon />
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
              <TrendingDownIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No Items Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No medicines match your current filters
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* Details Dialog */}
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
                  
                  <Typography variant="subtitle2" color="text.secondary">Batch Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.batchNumber || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Current Stock</Typography>
                  <Typography variant="h6" sx={{ mb: 2, color: getStockStatus(selectedMedicine).color === 'error' ? '#dc2626' : '#059669' }}>
                    {selectedMedicine.stockQuantity || 0} units
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{safeFormatDate(selectedMedicine.expiryDate)}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Rack Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.rackLocation || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quarantine Action</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to quarantine this medicine?
          </Typography>
          {selectedMedicine && (
            <Alert severity="warning">
              <Typography variant="subtitle2">{selectedMedicine.name}</Typography>
              <Typography variant="body2">Batch: {selectedMedicine.batchNumber || 'N/A'}</Typography>
              <Typography variant="body2">Stock: {selectedMedicine.stockQuantity || 0} units</Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              // Handle quarantine action
              setActionDialogOpen(false);
            }} 
            variant="contained" 
            color="error"
          >
            Quarantine
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockTrackingEnhanced;
