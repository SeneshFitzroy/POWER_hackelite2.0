﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  TextField,
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
  Tooltip
} from '@mui/material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Eye, Filter, Users, Mail, Phone, RefreshCw } from 'lucide-react';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [firebaseError, setFirebaseError] = useState(false);
  const navigate = useNavigate();

  // Check if Firebase is configured
  const isFirebaseConfigured = () => {
    return db && process.env.REACT_APP_FIREBASE_API_KEY && 
           process.env.REACT_APP_FIREBASE_API_KEY !== 'your_api_key_here';
  };

  // Fetch employees from Firebase
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setFirebaseError(false);
      
      // Check if Firebase is properly initialized
      if (!isFirebaseConfigured()) {
        console.warn('Firebase not configured. Please set up your .env file with Firebase credentials.');
        setFirebaseError(true);
        setEmployees([]);
        return;
      }

      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Fetched employees:', employeeData);
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setFirebaseError(true);
      toast.error('Failed to fetch employees. Please check Firebase configuration.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = useCallback(async (id, name) => {
    if (!isFirebaseConfigured()) {
      toast.error('Firebase not configured. Cannot delete employee.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        // Remove from UI immediately for better UX
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        toast.success('Deleting employee...');
        
        // Delete from Firebase
        await deleteDoc(doc(db, 'employees', id));
        toast.success('Employee deleted successfully!');
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
        // Refresh to restore accurate state
        fetchEmployees();
      }
    }
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.phone} ${employee.employeeId}`
        .toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      active: '#4caf50',
      inactive: '#f44336',
      probation: '#ff9800'
    };
    
    return (
      <Chip
        label={status?.charAt(0).toUpperCase() + status?.slice(1)}
        sx={{ 
          backgroundColor: statusColors[status] || '#9e9e9e',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          height: 24
        }}
        size="small"
      />
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      'registered_pharmacist': '#1565c0',
      'pharmacy_assistant': '#2e7d32',
      'cashier': '#ed6c02',
      'inventory_manager': '#7b1fa2',
      'store_manager': '#374151',
      'hr_manager': '#0d47a1',
      'accountant': '#455a64',
      'sales_representative': '#5d4037'
    };
    
    return (
      <Chip
        label={role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        sx={{ 
          backgroundColor: roleColors[role] || '#757575',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          height: 24
        }}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3, pl: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Employee Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={20} />}
            sx={{ 
              borderColor: '#1565c0',
              color: '#1565c0',
              '&:hover': { 
                backgroundColor: '#1565c0',
                color: 'white'
              },
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none'
            }}
            onClick={() => {
              console.log('Refreshing employees...');
              if (!isFirebaseConfigured()) {
                toast.error('Firebase not configured. Please set up your .env file.');
                return;
              }
              fetchEmployees();
              toast.success('Employee list refreshed!');
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            sx={{ 
              backgroundColor: '#1565c0',
              '&:hover': { backgroundColor: '#0d47a1' },
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none'
            }}
            onClick={() => {
              navigate('/hr/employees/new');
            }}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#666" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  height: 48
                } 
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
                sx={{ 
                  borderRadius: 2,
                  height: 48
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="probation">Probation</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role Filter"
                sx={{ 
                  borderRadius: 2,
                  height: 48
                }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="registered_pharmacist">Registered Pharmacist</MenuItem>
                <MenuItem value="pharmacy_assistant">Pharmacy Assistant</MenuItem>
                <MenuItem value="cashier">Cashier</MenuItem>
                <MenuItem value="inventory_manager">Inventory Manager</MenuItem>
                <MenuItem value="store_manager">Store Manager</MenuItem>
                <MenuItem value="hr_manager">HR Manager</MenuItem>
                <MenuItem value="accountant">Accountant</MenuItem>
                <MenuItem value="sales_representative">Sales Representative</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <Users size={20} />
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                {filteredEmployees.length} employees
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Employee Cards */}
      {firebaseError ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
          <Typography variant="h6" color="#856404" gutterBottom>
            ⚠️ Firebase Configuration Required
          </Typography>
          <Typography variant="body2" color="#856404" sx={{ mb: 2 }}>
            Please configure your Firebase credentials in the .env file to use the Employee Management system.
          </Typography>
          <Typography variant="body2" color="#856404" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            Update REACT_APP_FIREBASE_* values in your .env file
          </Typography>
        </Paper>
      ) : filteredEmployees.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Users size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {employees.length === 0 
              ? "Get started by adding your first employee" 
              : "Try adjusting your search filters"
            }
          </Typography>
          {employees.length === 0 && (
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              sx={{ 
                mt: 2,
                backgroundColor: '#1565c0',
                '&:hover': { backgroundColor: '#0d47a1' },
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none'
              }}
              onClick={() => {
                navigate('/hr/employees/new');
              }}
            >
              Add Employee
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEmployees.map((employee) => (
            <Grid item xs={12} md={6} lg={4} key={employee.id}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: '#1565c0',
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                      </Avatar>
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {employee.firstName || 'Unknown'} {employee.lastName || 'Employee'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {employee.employeeId || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    {getStatusBadge(employee.status)}
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    {getRoleBadge(employee.role)}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Mail size={16} color="#666" />
                    <Tooltip title={employee.email || 'No email'}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          ml: 1, 
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {employee.email || 'No email'}
                      </Typography>
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone size={16} color="#666" />
                    <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                      {employee.phone || 'No phone'}
                    </Typography>
                  </Box>
                </CardContent>
                
                <Box sx={{ 
                  p: 2, 
                  borderTop: '1px solid #eee',
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 1 
                }}>
                  <IconButton
                    size="small"
                    sx={{ 
                      color: '#1565c0',
                      '&:hover': { backgroundColor: 'rgba(21, 101, 192, 0.1)' }
                    }}
                    onClick={() => {
                      navigate(`/hr/employees/${employee.id}`);
                    }}
                    title="View Employee"
                  >
                    <Eye size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ 
                      color: '#2e7d32',
                      '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' }
                    }}
                    onClick={() => {
                      navigate(`/hr/employees/${employee.id}/edit`);
                    }}
                    title="Edit Employee"
                  >
                    <Edit size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ 
                      color: '#d32f2f',
                      '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                    }}
                    onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                    title="Delete Employee"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default EmployeeList;