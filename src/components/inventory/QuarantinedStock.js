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
  Tabs,
  Tab,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { quarantineService } from '../../services/quarantineService';
import { safeFormatDate, getExpiryStatus } from '../../utils/dateUtils';

const QuarantinedStock = () => {
  const [quarantinedMedicines, setQuarantinedMedicines] = useState([]);
  const [expiredMedicines, setExpiredMedicines] = useState([]);
  const [quarantineLogs, setQuarantineLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [actionForm, setActionForm] = useState({
    action: '',
    reason: '',
    notes: ''
  });
  const [stats, setStats] = useState({
    quarantinedCount: 0,
    expiredCount: 0,
    totalLogs: 0,
    recentQuarantines: 0
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data with real-time updates
  useEffect(() => {
    loadQuarantinedData();
    loadStats();
  }, []);

  const loadQuarantinedData = async () => {
    try {
      setLoading(true);
      const [quarantined, expired, logs] = await Promise.all([
        quarantineService.getQuarantinedMedicines(),
        quarantineService.getExpiredMedicines(),
        quarantineService.getQuarantineLogs()
      ]);
      setQuarantinedMedicines(quarantined);
      setExpiredMedicines(expired);
      setQuarantineLogs(logs);
    } catch (error) {
      console.error('Error loading quarantined data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await quarantineService.getQuarantineStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading quarantine stats:', error);
    }
  };

  // Filter medicines based on search term
  const getFilteredMedicines = () => {
    const medicines = activeTab === 0 ? quarantinedMedicines : expiredMedicines;
    
    if (!searchTerm) return medicines;
    
    const searchLower = searchTerm.toLowerCase();
    return medicines.filter(medicine =>
      medicine.name?.toLowerCase().includes(searchLower) ||
      medicine.batchNumber?.toLowerCase().includes(searchLower) ||
      medicine.manufacturer?.toLowerCase().includes(searchLower) ||
      medicine.rackLocation?.toLowerCase().includes(searchLower)
    );
  };

  const filteredMedicines = getFilteredMedicines();
  const paginatedMedicines = filteredMedicines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (medicine, action) => {
    setSelectedMedicine(medicine);
    setActionForm({
      action,
      reason: '',
      notes: ''
    });
    setActionDialogOpen(true);
  };

  const handleActionSubmit = async () => {
    try {
      if (!selectedMedicine) return;

      switch (actionForm.action) {
        case 'release':
          await quarantineService.releaseFromQuarantine(
            selectedMedicine.id,
            actionForm.reason,
            'released'
          );
          break;
        case 'expire':
          await quarantineService.markAsExpired(
            selectedMedicine.id,
            actionForm.reason,
            'expired'
          );
          break;
        default:
          return;
      }

      setActionDialogOpen(false);
      setSelectedMedicine(null);
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const handleViewLogs = (medicine) => {
    setSelectedMedicine(medicine);
    setLogsDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'quarantined':
        return 'warning';
      case 'expired':
        return 'error';
      case 'active':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'quarantined':
        return <WarningIcon />;
      case 'expired':
        return <CancelIcon />;
      case 'active':
        return <CheckCircleIcon />;
      default:
        return <WarningIcon />;
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
          Quarantined Stock
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => {
            setLoading(true);
            loadQuarantinedData();
            loadStats();
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.quarantinedCount}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Quarantined
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
                <CancelIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.expiredCount}
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
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalLogs}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Logs
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
                <WarningIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.recentQuarantines}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    This Week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
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
              <Badge badgeContent={quarantinedMedicines.length} color="warning">
                Quarantined Medicines
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={expiredMedicines.length} color="error">
                Expired Medicines
              </Badge>
            } 
          />
        </Tabs>
      </Card>

      {/* Search Bar */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
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
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Medicine Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Batch Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                {activeTab === 0 && <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>}
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {activeTab === 0 ? 'Quarantined' : 'Marked Expired'}
                </TableCell>
                {activeTab === 0 && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMedicines.map((medicine) => (
                <TableRow key={medicine.id} hover>
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
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {medicine.stockQuantity || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {safeFormatDate(medicine.expiryDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {medicine.rackLocation || 'N/A'}
                    </Typography>
                  </TableCell>
                  {activeTab === 0 && (
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(medicine.status)}
                        label={medicine.status}
                        color={getStatusColor(medicine.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body2">
                      {safeFormatDate(medicine.updatedAt)}
                    </Typography>
                  </TableCell>
                  {activeTab === 0 && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Tooltip title="Release">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(medicine, 'release');
                            }}
                            sx={{ color: '#059669' }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark Expired">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(medicine, 'expire');
                            }}
                            sx={{ color: '#dc2626' }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Logs">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewLogs(medicine);
                            }}
                            sx={{ color: '#3b82f6' }}
                          >
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMedicines.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionForm.action === 'release' ? 'Release from Quarantine' : 'Mark as Expired'}
        </DialogTitle>
        <DialogContent>
          {selectedMedicine && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{selectedMedicine.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedMedicine.manufacturer} - Batch: {selectedMedicine.batchNumber || 'N/A'}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Reason</InputLabel>
                <Select
                  value={actionForm.reason}
                  onChange={(e) => setActionForm({...actionForm, reason: e.target.value})}
                >
                  <MenuItem value="quality_issue">Quality Issue</MenuItem>
                  <MenuItem value="damaged_packaging">Damaged Packaging</MenuItem>
                  <MenuItem value="temperature_exposure">Temperature Exposure</MenuItem>
                  <MenuItem value="contamination">Contamination</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="recall">Recall</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                value={actionForm.notes}
                onChange={(e) => setActionForm({...actionForm, notes: e.target.value})}
                placeholder="Add any additional details..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleActionSubmit} variant="contained">
            {actionForm.action === 'release' ? 'Release' : 'Mark Expired'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={logsDialogOpen} onClose={() => setLogsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Quarantine History</DialogTitle>
        <DialogContent>
          {selectedMedicine && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{selectedMedicine.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Complete quarantine history for this medicine
              </Typography>
              
              <List>
                {quarantineLogs
                  .filter(log => log.medicineId === selectedMedicine.id)
                  .map((log, index) => (
                    <React.Fragment key={log.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={log.actionTaken}
                                color={log.status === 'quarantined' ? 'warning' : 
                                       log.status === 'expired' ? 'error' : 'success'}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {safeFormatDate(log.createdAt, 'MMM dd, yyyy HH:mm')}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                <strong>Reason:</strong> {log.reason}
                              </Typography>
                              {log.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Notes:</strong> {log.notes}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < quarantineLogs.filter(l => l.medicineId === selectedMedicine.id).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuarantinedStock;
