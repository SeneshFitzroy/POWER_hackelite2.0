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
  FilterList as FilterListIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventoryService';
import { quarantineService } from '../../services/quarantineService';
import { safeFormatDate, getExpiryStatus, getDaysUntilExpiry } from '../../utils/dateUtils';

const StockTrackingEnhanced = ({ onNotification }) => {
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    stockQuantity: 0,
    minStockLevel: 0,
    reorderPoint: 0,
    maxStockLevel: 0,
    costPrice: 0,
    sellingPrice: 0
  });
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Load data
  useEffect(() => {
    loadAllData();
    
    // Expose setActiveTab function globally for navigation
    window.stockTrackingRef = {
      setActiveTab: (tab) => {
        setActiveTab(tab);
      }
    };
    
    return () => {
      // Cleanup
      delete window.stockTrackingRef;
    };
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

    // Apply search filter (enhanced search)
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(medicine =>
        medicine.name?.toLowerCase().includes(searchLower) ||
        medicine.batchNumber?.toLowerCase().includes(searchLower) ||
        medicine.manufacturer?.toLowerCase().includes(searchLower) ||
        medicine.rackLocation?.toLowerCase().includes(searchLower) ||
        medicine.vendor?.toLowerCase().includes(searchLower) ||
        medicine.category?.toLowerCase().includes(searchLower) ||
        medicine.genericName?.toLowerCase().includes(searchLower)
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

  const handleQuarantineAction = async (medicine) => {
    try {
      if (activeTab === 4) {
        // Release from quarantine
        await quarantineService.releaseFromQuarantine(medicine.id, 'Manual release');
        setActionDialogOpen(false);
        await loadAllData();
        alert('Medicine released from quarantine successfully');
      } else {
        // Quarantine medicine
        await quarantineService.quarantineMedicine(medicine.id, 'Manual quarantine');
        setActionDialogOpen(false);
        await loadAllData();
        alert('Medicine quarantined successfully');
      }
    } catch (error) {
      console.error('Error handling quarantine action:', error);
      alert('Failed to update quarantine status: ' + error.message);
    }
  };

  const handleDeleteMedicine = async (medicine) => {
    try {
      if (window.confirm(`Are you sure you want to delete ${medicine.name}? This action cannot be undone.`)) {
        await inventoryService.deleteMedicine(medicine.id);
        await loadAllData();
        alert('Medicine deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      alert('Failed to delete medicine: ' + error.message);
    }
  };

  const handleEditMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setEditForm({
      stockQuantity: medicine.stockQuantity || 0,
      minStockLevel: medicine.minStockLevel || 10,
      reorderPoint: medicine.reorderPoint || 20,
      maxStockLevel: medicine.maxStockLevel || 100,
      costPrice: medicine.costPrice || 0,
      sellingPrice: medicine.sellingPrice || 0
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await inventoryService.updateMedicine(selectedMedicine.id, editForm);
      setEditDialogOpen(false);
      setSelectedMedicine(null);
      await loadAllData();
      alert('Medicine updated successfully');
    } catch (error) {
      console.error('Error updating medicine:', error);
      alert('Failed to update medicine: ' + error.message);
    }
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
      {activeTab !== 4 && (
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
      )}

      {/* Main Table */}
      {activeTab === 4 ? (
        // Quarantined Stock View
        <Box>
          {/* Simple search for quarantined items */}
          <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    placeholder="Search quarantined medicines..."
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
                      icon={<FilterListIcon />}
                      label={`${quarantinedMedicines.filter(q => {
                        if (!searchTerm) return true;
                        const searchLower = searchTerm.toLowerCase();
                        return q.name?.toLowerCase().includes(searchLower) ||
                               q.batchNumber?.toLowerCase().includes(searchLower) ||
                               q.manufacturer?.toLowerCase().includes(searchLower);
                      }).length} Items`}
                      color="error"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
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
                  {quarantinedMedicines.filter(q => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    return q.name?.toLowerCase().includes(searchLower) ||
                           q.batchNumber?.toLowerCase().includes(searchLower) ||
                           q.manufacturer?.toLowerCase().includes(searchLower);
                  }).map((medicine) => (
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
            {quarantinedMedicines.filter(q => {
              if (!searchTerm) return true;
              const searchLower = searchTerm.toLowerCase();
              return q.name?.toLowerCase().includes(searchLower) ||
                     q.batchNumber?.toLowerCase().includes(searchLower) ||
                     q.manufacturer?.toLowerCase().includes(searchLower);
            }).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No Quarantined Stock Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'No items match your search criteria' : 'All medicines are currently cleared for use'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
        </Box>
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
                          <Tooltip title={activeTab === 4 ? "Release from Quarantine" : "Quarantine"}>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMedicine(medicine);
                                setActionDialogOpen(true);
                              }}
                              sx={{ color: activeTab === 4 ? '#059669' : '#dc2626' }}
                            >
                              {activeTab === 4 ? <CheckCircleIcon /> : <BlockIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedicine(medicine);
                              }}
                              sx={{ color: '#dc2626' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMedicine(medicine);
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
        <DialogTitle>
          {activeTab === 4 ? 'Release from Quarantine' : 'Quarantine Medicine'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {activeTab === 4 
              ? 'Are you sure you want to release this medicine from quarantine?'
              : 'Are you sure you want to quarantine this medicine?'
            }
          </Typography>
          {selectedMedicine && (
            <Alert severity={activeTab === 4 ? "info" : "warning"}>
              <Typography variant="subtitle2">{selectedMedicine.name}</Typography>
              <Typography variant="body2">Batch: {selectedMedicine.batchNumber || 'N/A'}</Typography>
              <Typography variant="body2">Stock: {selectedMedicine.stockQuantity || 0} units</Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleQuarantineAction(selectedMedicine)} 
            variant="contained" 
            color={activeTab === 4 ? "success" : "error"}
          >
            {activeTab === 4 ? 'Release' : 'Quarantine'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Medicine</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedMedicine && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1e3a8a' }}>
                {selectedMedicine.name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stock Quantity"
                    type="number"
                    value={editForm.stockQuantity}
                    onChange={(e) => setEditForm({...editForm, stockQuantity: parseInt(e.target.value) || 0})}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Min Stock Level"
                    type="number"
                    value={editForm.minStockLevel}
                    onChange={(e) => setEditForm({...editForm, minStockLevel: parseInt(e.target.value) || 0})}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Reorder Point"
                    type="number"
                    value={editForm.reorderPoint}
                    onChange={(e) => setEditForm({...editForm, reorderPoint: parseInt(e.target.value) || 0})}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Stock Level"
                    type="number"
                    value={editForm.maxStockLevel}
                    onChange={(e) => setEditForm({...editForm, maxStockLevel: parseInt(e.target.value) || 0})}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cost Price (LKR)"
                    type="number"
                    value={editForm.costPrice}
                    onChange={(e) => setEditForm({...editForm, costPrice: parseFloat(e.target.value) || 0})}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Selling Price (LKR)"
                    type="number"
                    value={editForm.sellingPrice}
                    onChange={(e) => setEditForm({...editForm, sellingPrice: parseFloat(e.target.value) || 0})}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockTrackingEnhanced;
