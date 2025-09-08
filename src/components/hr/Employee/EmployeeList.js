import React, { useState, useEffect, useCallback } from 'react';
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
  InputLabel
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

  // Fetch employees from Firebase
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if Firebase is properly initialized
      if (!db) {
        console.warn('Firebase not initialized. Using empty employee list.');
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
    if (!db) {
      toast.error('Firebase not configured. Cannot delete employee.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        // Remove from UI immediately for better UX
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        toast.info('Deleting employee...');
        
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
      active: 'success',
      inactive: 'error',
      probation: 'warning'
    };
    
    return (
      <Chip
        label={status?.charAt(0).toUpperCase() + status?.slice(1)}
        color={statusColors[status] || 'default'}
        size="small"
        sx={{ fontWeight: 'medium' }}
      />
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      'registered_pharmacist': '#1565c0',
      'assistant_pharmacist': '#2e7d32',
      'cashier': '#ed6c02',
      'manager': '#7b1fa2'
    };
    
    return (
      <Chip
        label={role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        sx={{ 
          backgroundColor: roleColors[role] || '#757575',
          color: 'white',
          fontWeight: 'medium'
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
              borderColor: '#dc2626',
              color: '#dc2626',
              '&:hover': { 
                backgroundColor: '#dc2626',
                color: 'white'
              },
              px: 3,
              py: 1.5,
              borderRadius: 2
            }}
            onClick={() => {
              console.log('Refreshing employees...');
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
              borderRadius: 2
            }}
            onClick={() => {
              toast('Add Employee feature coming soon!');
            }}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="registered_pharmacist">Registered Pharmacist</MenuItem>
                <MenuItem value="assistant_pharmacist">Assistant Pharmacist</MenuItem>
                <MenuItem value="cashier">Cashier</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <Users size={20} />
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                {filteredEmployees.length} employees
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Employee Cards */}
      {filteredEmployees.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Users size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employees.length === 0 
              ? "Get started by adding your first employee" 
              : "Try adjusting your search filters"
            }
          </Typography>
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
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
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
                    <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                      {employee.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone size={16} color="#666" />
                    <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                      {employee.phone}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton
                      size="small"
                      sx={{ 
                        color: '#1565c0',
                        '&:hover': { backgroundColor: 'rgba(21, 101, 192, 0.1)' }
                      }}
                      onClick={() => toast('View employee details coming soon!')}
                    >
                      <Eye size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ 
                        color: '#2e7d32',
                        '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' }
                      }}
                      onClick={() => toast('Edit employee coming soon!')}
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
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default EmployeeList;
