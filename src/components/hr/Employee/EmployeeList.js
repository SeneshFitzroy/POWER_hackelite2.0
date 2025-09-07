import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { db } from '../../../firebase/config';
import toast from 'react-hot-toast';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchEmployees = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(emp => emp.role === roleFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, statusFilter, roleFilter]);

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'on leave': return 'warning';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager': return '#1976d2';
      case 'developer': return '#2e7d32';
      case 'designer': return '#ed6c02';
      case 'analyst': return '#9c27b0';
      default: return '#757575';
    }
  };

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
          <PeopleIcon sx={{ fontSize: 32, color: '#1e3a8a', mr: 2 }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#1e3a8a',
              letterSpacing: '0.5px'
            }}
          >
            Employee Management
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
          Manage employee records, roles, and information
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2)'
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {employees.length}
                </Typography>
                <Typography variant="body2">Total Employees</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {employees.filter(emp => emp.status === 'active').length}
                </Typography>
                <Typography variant="body2">Active Employees</Typography>
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {employees.filter(emp => emp.status === 'on leave').length}
                </Typography>
                <Typography variant="body2">On Leave</Typography>
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {new Set(employees.map(emp => emp.role)).size}
                </Typography>
                <Typography variant="body2">Different Roles</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Controls Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
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
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="on leave">On Leave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={roleFilter}
                label="Role Filter"
                onChange={(e) => setRoleFilter(e.target.value)}
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
                <MenuItem value="all">All Roles</MenuItem>
                {[...new Set(employees.map(emp => emp.role))].map(role => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                }
              }}
            >
              Add Employee
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Employees Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
            Employee Directory ({filteredEmployees.length} employees)
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Join Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow 
                  key={employee.id}
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
                        {`${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {`${employee.firstName || ''} ${employee.lastName || ''}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          ID: {employee.employeeId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{employee.email}</Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {employee.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.role}
                      size="small"
                      sx={{
                        backgroundColor: getRoleColor(employee.role),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status}
                      size="small"
                      color={getStatusColor(employee.status)}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: '#1e3a8a',
                          '&:hover': { backgroundColor: '#eff6ff' }
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        sx={{ 
                          color: '#059669',
                          '&:hover': { backgroundColor: '#ecfdf5' }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleDeleteEmployee(employee.id)}
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredEmployees.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
              No employees found
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Add your first employee to get started'
              }
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default EmployeeList;

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchEmployees = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterEmployees = useCallback(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(emp => emp.role === roleFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, statusFilter, roleFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    filterEmployees();
  }, [filterEmployees]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        setEmployees(employees.filter(emp => emp.id !== id));
        toast.success('Employee deleted successfully');
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

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
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <CircularProgress size={60} sx={{ color: '#1e3a8a' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          sx={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              boxShadow: '0 6px 16px rgba(30, 58, 138, 0.4)',
            }
          }}
        >
          Add New Employee
        </Button>
      </Box>

      {/* Search and Filters Card */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search employees by name, phone, NIC, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} style={{ color: '#1e3a8a' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
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
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1e3a8a',
                    }
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="probation">Probation</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Role Filter</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role Filter"
                  onChange={(e) => setRoleFilter(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1e3a8a',
                    }
                  }}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="owner">Owner</MenuItem>
                  <MenuItem value="registered_pharmacist">Registered Pharmacist</MenuItem>
                  <MenuItem value="assistant_pharmacist">Assistant Pharmacist</MenuItem>
                  <MenuItem value="cashier">Cashier</MenuItem>
                  <MenuItem value="delivery_driver">Delivery Driver</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '56px',
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                px: 2
              }}>
                <Filter size={16} style={{ marginRight: '8px', color: '#6b7280' }} />
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 'medium' }}>
                  {filteredEmployees.length} of {employees.length} employees
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Employee Cards Grid */}
      <Grid container spacing={3}>
        {filteredEmployees.map((employee) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(30, 58, 138, 0.2)',
                  borderColor: '#1e3a8a'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Profile Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {employee.profileImage ? (
                    <Avatar
                      src={employee.profileImage}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      sx={{ width: 64, height: 64, mr: 2, border: '3px solid #e5e7eb' }}
                    />
                  ) : (
                    <Avatar
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        bgcolor: '#1e3a8a',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                    </Avatar>
                  )}
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                      {employee.firstName} {employee.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      {employee.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    {getStatusBadge(employee.status)}
                  </Box>
                </Box>

                {/* Contact Information */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#374151', mb: 0.5 }}>
                    📞 {employee.phone || 'No phone'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#374151', mb: 0.5 }}>
                    📧 {employee.email || 'No email'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    🆔 {employee.nic || 'No NIC'}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: '1px solid #e5e7eb' }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: '#1e3a8a',
                      '&:hover': { backgroundColor: '#eff6ff' }
                    }}
                  >
                    <Eye size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      color: '#059669',
                      '&:hover': { backgroundColor: '#ecfdf5' }
                    }}
                  >
                    <Edit size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    sx={{
                      color: '#dc2626',
                      '&:hover': { backgroundColor: '#fef2f2' }
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{employee.email || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{employee.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <span>ID: {employee.employeeId || 'N/A'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Link
                to={`/employees/${employee.id}`}
                className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                to={`/employees/${employee.id}/edit`}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Edit Employee"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <button
                onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Employee"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredEmployees.length === 0 && (
        <div className="col-span-full">
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {employees.length === 0 ? 'Get started by adding a new employee.' : 'Try adjusting your search or filter criteria.'}
            </p>
            {employees.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/employees/new"
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;