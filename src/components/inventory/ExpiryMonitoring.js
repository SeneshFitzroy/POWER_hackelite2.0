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
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventoryService';
import { safeFormatDate, getExpiryStatus, getDaysUntilExpiry } from '../../utils/dateUtils';
import { differenceInDays } from 'date-fns';

const ExpiryMonitoring = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Load medicines with real-time updates
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const medicinesData = await inventoryService.getAllMedicines();
      setMedicines(medicinesData);
      setFilteredMedicines(medicinesData);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter medicines based on search and expiry status
  useEffect(() => {
    let filtered = medicines;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(medicine =>
        medicine.name?.toLowerCase().includes(searchLower) ||
        medicine.batchNumber?.toLowerCase().includes(searchLower) ||
        medicine.manufacturer?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by expiry status
    filtered = filtered.filter(medicine => {
      // If medicine has status 'expired', include it in expired filter
      if (medicine.status === 'expired' && expiryFilter === 'expired') {
        return true;
      }
      
      // If no expiry date, only include if it's not an expiry-based filter
      if (!medicine.expiryDate) {
        return expiryFilter === 'all';
      }
      
      const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);
      if (daysUntilExpiry === null) {
        return expiryFilter === 'all';
      }
      
      switch (expiryFilter) {
        case 'expired':
          return daysUntilExpiry < 0 || medicine.status === 'expired';
        case 'expiring_7':
          return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
        case 'expiring_30':
          return daysUntilExpiry > 7 && daysUntilExpiry <= 30;
        case 'expiring_90':
          return daysUntilExpiry > 30 && daysUntilExpiry <= 90;
        case 'all':
        default:
          return true;
      }
    });

    // Sort by expiry date (expired first, then by days until expiry)
    filtered.sort((a, b) => {
      // Handle medicines with status 'expired' first
      if (a.status === 'expired' && b.status !== 'expired') return -1;
      if (a.status !== 'expired' && b.status === 'expired') return 1;
      
      // If both have status 'expired', sort by name
      if (a.status === 'expired' && b.status === 'expired') {
        return (a.name || '').localeCompare(b.name || '');
      }
      
      // If no expiry date for either, sort by name
      if (!a.expiryDate || !b.expiryDate) {
        return (a.name || '').localeCompare(b.name || '');
      }
      
      const aDays = getDaysUntilExpiry(a.expiryDate);
      const bDays = getDaysUntilExpiry(b.expiryDate);
      
      if (aDays === null || bDays === null) {
        return (a.name || '').localeCompare(b.name || '');
      }
      
      // Expired items first
      if (aDays < 0 && bDays >= 0) return -1;
      if (aDays >= 0 && bDays < 0) return 1;
      
      // Then by days until expiry
      return aDays - bDays;
    });

    setFilteredMedicines(filtered);
  }, [medicines, searchTerm, expiryFilter]);

  // getExpiryStatus is now imported from dateUtils

  const getExpiryIcon = (status) => {
    switch (status) {
      case 'expired':
        return <ErrorIcon />;
      case 'critical':
        return <ErrorIcon />;
      case 'expiring':
        return <WarningIcon />;
      case 'approaching':
        return <ScheduleIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setDetailsDialogOpen(true);
  };

  const getExpiryMessage = (status, days) => {
    switch (status) {
      case 'expired':
        return `Expired ${days} day${days !== 1 ? 's' : ''} ago`;
      case 'critical':
        return `Expires in ${days} day${days !== 1 ? 's' : ''} - URGENT!`;
      case 'expiring':
        return `Expires in ${days} day${days !== 1 ? 's' : ''}`;
      case 'approaching':
        return `Expires in ${days} day${days !== 1 ? 's' : ''}`;
      default:
        return `Expires in ${days} day${days !== 1 ? 's' : ''}`;
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
          Expiry Monitoring
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => {
            setLoading(true);
            loadMedicines();
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
                <ErrorIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {medicines.filter(m => {
                      // Include medicines with status 'expired'
                      if (m.status === 'expired') return true;
                      // Include medicines with expired expiry date
                      if (!m.expiryDate) return false;
                      const expiryDate = m.expiryDate && typeof m.expiryDate === 'object' && m.expiryDate.toDate 
                        ? m.expiryDate.toDate() 
                        : new Date(m.expiryDate);
                      const days = differenceInDays(expiryDate, new Date());
                      return days < 0;
                    }).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Expired
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
                    {medicines.filter(m => {
                      if (!m.expiryDate) return false;
                      const expiryDate = m.expiryDate && typeof m.expiryDate === 'object' && m.expiryDate.toDate 
                        ? m.expiryDate.toDate() 
                        : new Date(m.expiryDate);
                      const days = differenceInDays(expiryDate, new Date());
                      return days >= 0 && days <= 7;
                    }).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Critical (≤7 days)
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
                <ScheduleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {medicines.filter(m => {
                      if (!m.expiryDate) return false;
                      const expiryDate = m.expiryDate && typeof m.expiryDate === 'object' && m.expiryDate.toDate 
                        ? m.expiryDate.toDate() 
                        : new Date(m.expiryDate);
                      const days = differenceInDays(expiryDate, new Date());
                      return days > 7 && days <= 30;
                    }).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Expiring (≤30 days)
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
                <ScheduleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {medicines.filter(m => {
                      if (!m.expiryDate) return false;
                      const expiryDate = m.expiryDate && typeof m.expiryDate === 'object' && m.expiryDate.toDate 
                        ? m.expiryDate.toDate() 
                        : new Date(m.expiryDate);
                      const days = differenceInDays(expiryDate, new Date());
                      return days > 30 && days <= 90;
                    }).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Approaching (≤90 days)
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search medicines by name, batch, manufacturer..."
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
                <InputLabel>Expiry Filter</InputLabel>
                <Select
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value)}
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="all">All Medicines</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="expiring_7">Critical (≤7 days)</MenuItem>
                  <MenuItem value="expiring_30">Expiring (≤30 days)</MenuItem>
                  <MenuItem value="expiring_90">Approaching (≤90 days)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredMedicines.length} medicines
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Expiry Table */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Medicine Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Batch Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Stock Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Rack Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMedicines.map((medicine) => {
                const expiryStatus = getExpiryStatus(medicine.expiryDate);
                const isExpiredByStatus = medicine.status === 'expired';
                const isExpiredByDate = expiryStatus.status === 'expired';
                const isExpired = isExpiredByStatus || isExpiredByDate;
                
                return (
                  <TableRow 
                    key={medicine.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f8fafc' 
                      },
                      backgroundColor: isExpired ? '#fef2f2' : 
                                     expiryStatus.status === 'critical' ? '#fef2f2' : 
                                     expiryStatus.status === 'expiring' ? '#fffbeb' : 'transparent'
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
                      <Typography variant="body2">
                        {medicine.batchNumber || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            color: expiryStatus.color === 'error' ? '#dc2626' : 
                                  expiryStatus.color === 'warning' ? '#d97706' : '#059669',
                            fontWeight: 'bold'
                          }}
                        >
                          {safeFormatDate(medicine.expiryDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={isExpired ? <ErrorIcon /> : getExpiryIcon(expiryStatus.status)}
                          label={isExpired ? 'expired' : expiryStatus.status}
                          color={isExpired ? 'error' : expiryStatus.color}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {isExpired ? 'Marked as expired' : getExpiryMessage(expiryStatus.status, expiryStatus.days)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {medicine.stockQuantity || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {medicine.rackLocation || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
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
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add edit functionality here
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
                  
                  <Typography variant="subtitle2" color="text.secondary">Batch Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.batchNumber || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Lot Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.lotNumber || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                  <Typography variant="h6" sx={{ mb: 2, color: getExpiryStatus(selectedMedicine.expiryDate).color === 'error' ? '#dc2626' : '#059669' }}>
                    {safeFormatDate(selectedMedicine.expiryDate)}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Stock Quantity</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.stockQuantity || 0}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Rack Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMedicine.rackLocation || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedMedicine.status || 'active'} 
                    color={getExpiryStatus(selectedMedicine.expiryDate).color}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Grid>
              </Grid>
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

export default ExpiryMonitoring;
