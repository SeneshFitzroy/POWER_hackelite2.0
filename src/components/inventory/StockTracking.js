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
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventoryService';
import { safeFormatDate, getExpiryStatus } from '../../utils/dateUtils';
import QuarantineActions from './QuarantineActions';

const StockTracking = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [quarantineDialogOpen, setQuarantineDialogOpen] = useState(false);
  const [quarantineAction, setQuarantineAction] = useState('quarantine');
  const [editForm, setEditForm] = useState({
    lotNumber: '',
    stockQuantity: 0,
    status: 'active'
  });

  // Load medicines with real-time updates
  useEffect(() => {
    const unsubscribe = inventoryService.subscribeMedicines((medicinesData) => {
      setMedicines(medicinesData);
      setFilteredMedicines(medicinesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter medicines based on search and status
  useEffect(() => {
    let filtered = medicines;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(medicine =>
        medicine.name?.toLowerCase().includes(searchLower) ||
        medicine.batchNumber?.toLowerCase().includes(searchLower) ||
        medicine.rackLocation?.toLowerCase().includes(searchLower) ||
        medicine.manufacturer?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(medicine => medicine.status === statusFilter);
    }

    // Exclude quarantined and expired medicines from normal stock view
    filtered = filtered.filter(medicine => 
      medicine.status !== 'quarantined' && medicine.status !== 'expired'
    );

    setFilteredMedicines(filtered);
  }, [medicines, searchTerm, statusFilter]);

  const handleEditClick = (medicine) => {
    setSelectedMedicine(medicine);
    setEditForm({
      lotNumber: medicine.lotNumber || '',
      stockQuantity: medicine.stockQuantity || 0,
      status: medicine.status || 'active'
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

  const handleQuarantineClick = (medicine, action = 'quarantine') => {
    setSelectedMedicine(medicine);
    setQuarantineAction(action);
    setQuarantineDialogOpen(true);
  };

  const handleQuarantineSuccess = (message) => {
    console.log(message);
    // Optionally show a success notification
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'quarantined':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'quarantined':
        return <CancelIcon />;
      case 'inactive':
        return <CancelIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
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
          Stock Tracking
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

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search medicines by name, batch, rack location..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="quarantined">Quarantined</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredMedicines.length} of {medicines.length} medicines
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Medicine Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Batch/Lot Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Stock Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Rack Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMedicines.map((medicine) => {
                const expiryStatus = getExpiryStatus(medicine.expiryDate);
                return (
                  <TableRow 
                    key={medicine.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f8fafc' 
                      },
                      backgroundColor: isExpired(medicine.expiryDate) ? '#fef2f2' : 
                                     isExpiringSoon(medicine.expiryDate) ? '#fffbeb' : 'transparent'
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
                      <Box>
                        <Typography variant="body2">
                          {medicine.batchNumber || 'N/A'}
                        </Typography>
                        {medicine.lotNumber && (
                          <Typography variant="caption" color="text.secondary">
                            Lot: {medicine.lotNumber}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: medicine.stockQuantity <= (medicine.minStockLevel || 10) ? '#dc2626' : '#059669'
                          }}
                        >
                          {medicine.stockQuantity || 0}
                        </Typography>
                        {medicine.stockQuantity <= (medicine.minStockLevel || 10) && (
                          <WarningIcon sx={{ color: '#dc2626', fontSize: 16 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            color: expiryStatus.color === 'error' ? '#dc2626' : 
                                  expiryStatus.color === 'warning' ? '#d97706' : '#059669'
                          }}
                        >
                          {safeFormatDate(medicine.expiryDate)}
                        </Typography>
                        {expiryStatus.status === 'expired' && (
                          <Chip 
                            label="Expired" 
                            size="small" 
                            color="error" 
                            sx={{ fontSize: '10px' }}
                          />
                        )}
                        {expiryStatus.status === 'expiring' && (
                          <Chip 
                            label="Expiring Soon" 
                            size="small" 
                            color="warning" 
                            sx={{ fontSize: '10px' }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(medicine.status)}
                        label={medicine.status || 'active'}
                        color={getStatusColor(medicine.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {medicine.rackLocation || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Stock">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(medicine)}
                            sx={{ color: '#1e40af' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Quarantine">
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuarantineClick(medicine, 'quarantine')}
                            sx={{ color: '#d97706' }}
                          >
                            <WarningIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark Expired">
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuarantineClick(medicine, 'expire')}
                            sx={{ color: '#dc2626' }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
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
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Stock Information</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedMedicine?.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Lot Number"
                  value={editForm.lotNumber}
                  onChange={(e) => setEditForm({...editForm, lotNumber: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  type="number"
                  value={editForm.stockQuantity}
                  onChange={(e) => setEditForm({...editForm, stockQuantity: parseInt(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="quarantined">Quarantined</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Quarantine Actions Dialog */}
      <QuarantineActions
        medicine={selectedMedicine}
        open={quarantineDialogOpen}
        onClose={() => setQuarantineDialogOpen(false)}
        action={quarantineAction}
        onSuccess={handleQuarantineSuccess}
      />
    </Box>
  );
};

export default StockTracking;
