import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Container,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  VerifiedUser as LicenseIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon,
  OpenInNew as ExternalIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { db } from '../../../firebase/config';
import { format, differenceInDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const LicenseTracking = () => {
  const [licenses, setLicenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    employeeId: '',
    licenseType: '',
    licenseNumber: '',
    issuedDate: '',
    expiryDate: '',
    issuingAuthority: '',
    verificationUrl: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);

      // Fetch licenses
      const licensesSnapshot = await getDocs(collection(db, 'licenses'));
      const licenseData = licensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLicenses(licenseData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch license data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLicense) {
        await updateDoc(doc(db, 'licenses', editingLicense.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('License updated successfully');
      } else {
        await addDoc(collection(db, 'licenses'), {
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast.success('License added successfully');
      }
      
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving license:', error);
      toast.error('Failed to save license');
    }
  };

  const handleEdit = (license) => {
    setEditingLicense(license);
    setFormData(license);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this license?')) {
      try {
        await deleteDoc(doc(db, 'licenses', id));
        toast.success('License deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting license:', error);
        toast.error('Failed to delete license');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      licenseType: '',
      licenseNumber: '',
      issuedDate: '',
      expiryDate: '',
      issuingAuthority: '',
      verificationUrl: '',
      status: 'active'
    });
    setEditingLicense(null);
    setShowForm(false);
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', color: 'default', daysLeft: null };
    
    const days = differenceInDays(parseISO(expiryDate), new Date());
    
    if (days < 0) return { status: 'expired', color: 'error', daysLeft: days };
    if (days <= 30) return { status: 'expiring', color: 'warning', daysLeft: days };
    return { status: 'valid', color: 'success', daysLeft: days };
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = 
      license.licenseType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEmployeeName(license.employeeId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeLicenses = licenses.filter(l => l.status === 'active').length;
  const expiredLicenses = licenses.filter(l => {
    const { status } = getExpiryStatus(l.expiryDate);
    return status === 'expired';
  }).length;
  const expiringLicenses = licenses.filter(l => {
    const { status } = getExpiryStatus(l.expiryDate);
    return status === 'expiring';
  }).length;

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress size={60} sx={{ color: '#1e3a8a' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LicenseIcon sx={{ fontSize: 32, color: '#1e3a8a', mr: 2 }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#1e3a8a',
              letterSpacing: '0.5px'
            }}
          >
            License Tracking
          </Typography>
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b7280', 
            mb: 3,
            fontSize: '1.1rem'
          }}
        >
          Track and manage employee licenses, certifications, and expiry dates
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BadgeIcon sx={{ mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {activeLicenses}
                  </Typography>
                </Box>
                <Typography variant="body2">Active Licenses</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon sx={{ mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {expiringLicenses}
                  </Typography>
                </Box>
                <Typography variant="body2">Expiring Soon</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon sx={{ mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {expiredLicenses}
                  </Typography>
                </Box>
                <Typography variant="body2">Expired</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LicenseIcon sx={{ mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {licenses.length}
                  </Typography>
                </Box>
                <Typography variant="body2">Total Licenses</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alerts for expiring licenses */}
        {expiringLicenses > 0 && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              {expiringLicenses} license(s) are expiring within 30 days. Please review and renew as needed.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Controls Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search licenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#1e3a8a',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e3a8a',
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1e3a8a',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1e3a8a',
                  }
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                }
              }}
            >
              Add New License
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Licenses Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
            License Directory ({filteredLicenses.length} licenses)
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>License Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>License Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Issued Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Expiry Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Authority</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLicenses.map((license) => {
                const expiryInfo = getExpiryStatus(license.expiryDate);
                return (
                  <TableRow 
                    key={license.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: '#1e3a8a',
                            width: 40,
                            height: 40
                          }}
                        >
                          {getEmployeeName(license.employeeId).split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {getEmployeeName(license.employeeId)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {license.licenseType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {license.licenseNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {license.issuedDate ? new Date(license.issuedDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          expiryInfo.status === 'expired' ? 'Expired' :
                          expiryInfo.status === 'expiring' ? `${expiryInfo.daysLeft} days left` :
                          expiryInfo.status === 'valid' ? 'Valid' : 'Unknown'
                        }
                        color={expiryInfo.color}
                        variant="filled"
                        size="small"
                        icon={expiryInfo.status === 'expiring' || expiryInfo.status === 'expired' ? <WarningIcon /> : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {license.issuingAuthority}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {license.verificationUrl && (
                          <IconButton 
                            size="small"
                            onClick={() => window.open(license.verificationUrl, '_blank')}
                            sx={{ 
                              color: '#1e3a8a',
                              '&:hover': { backgroundColor: '#eff6ff' }
                            }}
                          >
                            <ExternalIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small"
                          onClick={() => handleEdit(license)}
                          sx={{ 
                            color: '#059669',
                            '&:hover': { backgroundColor: '#ecfdf5' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleDelete(license.id)}
                          sx={{ 
                            color: '#dc2626',
                            '&:hover': { backgroundColor: '#fef2f2' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredLicenses.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <LicenseIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
              No licenses found
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Add your first license to get started'
              }
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit License Dialog */}
      <Dialog open={showForm} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLicense ? 'Edit License' : 'Add New License'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={formData.employeeId}
                    label="Employee"
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  >
                    {employees.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="License Type"
                  value={formData.licenseType}
                  onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Issuing Authority"
                  value={formData.issuingAuthority}
                  onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Issued Date"
                  value={formData.issuedDate}
                  onChange={(e) => setFormData({...formData, issuedDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expiry Date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Verification URL"
                  value={formData.verificationUrl}
                  onChange={(e) => setFormData({...formData, verificationUrl: e.target.value})}
                  placeholder="https://..."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                }
              }}
            >
              {editingLicense ? 'Update License' : 'Add License'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default LicenseTracking;

const LicenseTracking = () => {
  const [licenses, setLicenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    licenseType: '',
    licenseNumber: '',
    issuedDate: '',
    expiryDate: '',
    issuingAuthority: '',
    verificationUrl: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch employees
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);

      // Fetch licenses
      const licensesSnapshot = await getDocs(collection(db, 'licenses'));
      const licenseData = licensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLicenses(licenseData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch license data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employee = employees.find(emp => emp.id === formData.employeeId);
      const licenseData = {
        ...formData,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        updatedAt: new Date().toISOString()
      };

      if (editingLicense) {
        await updateDoc(doc(db, 'licenses', editingLicense.id), licenseData);
        toast.success('License updated successfully');
      } else {
        licenseData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'licenses'), licenseData);
        toast.success('License added successfully');
      }

      setShowForm(false);
      setEditingLicense(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving license:', error);
      toast.error('Failed to save license');
    }
  };

  const handleEdit = (license) => {
    setEditingLicense(license);
    setFormData({
      employeeId: license.employeeId,
      licenseType: license.licenseType,
      licenseNumber: license.licenseNumber,
      issuedDate: license.issuedDate,
      expiryDate: license.expiryDate,
      issuingAuthority: license.issuingAuthority,
      verificationUrl: license.verificationUrl || '',
      status: license.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id, licenseType) => {
    if (window.confirm(`Are you sure you want to delete this ${licenseType} license?`)) {
      try {
        await deleteDoc(doc(db, 'licenses', id));
        setLicenses(licenses.filter(license => license.id !== id));
        toast.success('License deleted successfully');
      } catch (error) {
        console.error('Error deleting license:', error);
        toast.error('Failed to delete license');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      licenseType: '',
      licenseNumber: '',
      issuedDate: '',
      expiryDate: '',
      issuingAuthority: '',
      verificationUrl: '',
      status: 'active'
    });
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (daysUntilExpiry < 0) {
      return { status: 'expired', days: Math.abs(daysUntilExpiry), color: 'text-red-600' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', days: daysUntilExpiry, color: 'text-yellow-600' };
    } else {
      return { status: 'valid', days: daysUntilExpiry, color: 'text-green-600' };
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const licenseTypes = [
    'Pharmacist License',
    'Assistant Pharmacist License',
    'Driving License',
    'Professional Certification',
    'Safety Certification',
    'Other'
  ];

  const authorities = [
    'NMRA (National Medicines Regulatory Authority)',
    'Department of Motor Traffic',
    'Ministry of Health',
    'Professional Board',
    'Other'
  ];

  // Group licenses by expiry status
  const expiredLicenses = licenses.filter(license => {
    const expiry = getExpiryStatus(license.expiryDate);
    return expiry.status === 'expired';
  });

  const expiringLicenses = licenses.filter(license => {
    const expiry = getExpiryStatus(license.expiryDate);
    return expiry.status === 'expiring';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 ml-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">License Tracking</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingLicense(null);
            resetForm();
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add License
        </button>
      </div>

      {/* Alert Cards */}
      {(expiredLicenses.length > 0 || expiringLicenses.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expiredLicenses.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-sm font-medium text-red-800">Expired Licenses</h3>
              </div>
              <p className="mt-1 text-sm text-red-700">
                {expiredLicenses.length} license(s) have expired and need immediate attention.
              </p>
            </div>
          )}

          {expiringLicenses.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-sm font-medium text-yellow-800">Expiring Soon</h3>
              </div>
              <p className="mt-1 text-sm text-yellow-700">
                {expiringLicenses.length} license(s) will expire within 30 days.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Licenses</p>
              <p className="text-2xl font-bold text-gray-900">{licenses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {licenses.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{expiringLicenses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{expiredLicenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* License Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingLicense ? 'Edit License' : 'Add New License'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="input mt-1"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">License Type</label>
                  <select
                    value={formData.licenseType}
                    onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
                    className="input mt-1"
                    required
                  >
                    <option value="">Select Type</option>
                    {licenseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    className="input mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Issued Date</label>
                    <input
                      type="date"
                      value={formData.issuedDate}
                      onChange={(e) => setFormData({...formData, issuedDate: e.target.value})}
                      className="input mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="input mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Issuing Authority</label>
                  <select
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                    className="input mt-1"
                    required
                  >
                    <option value="">Select Authority</option>
                    {authorities.map(auth => (
                      <option key={auth} value={auth}>{auth}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.verificationUrl}
                    onChange={(e) => setFormData({...formData, verificationUrl: e.target.value})}
                    className="input mt-1"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input mt-1"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingLicense(null);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingLicense ? 'Update' : 'Add'} License
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Licenses Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Licenses</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {licenses.map((license) => {
                const expiryInfo = getExpiryStatus(license.expiryDate);
                
                return (
                  <tr key={license.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{license.employeeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{license.licenseType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{license.licenseNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(parseISO(license.expiryDate), 'MMM dd, yyyy')}
                      </div>
                      <div className={`text-xs ${expiryInfo.color}`}>
                        {expiryInfo.status === 'expired' 
                          ? `Expired ${expiryInfo.days} days ago`
                          : expiryInfo.status === 'expiring'
                          ? `Expires in ${expiryInfo.days} days`
                          : `Valid for ${expiryInfo.days} days`
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(license.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {license.verificationUrl && (
                          <a
                            href={license.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(license)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(license.id, license.licenseType)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {licenses.length === 0 && (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No licenses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a license for an employee.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseTracking;