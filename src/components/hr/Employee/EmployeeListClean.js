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
  Avatar,
  CircularProgress,
  Container,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Eye, Filter, Users, Mail, Phone } from 'lucide-react';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleDelete = useCallback((id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      toast.success('Employee deleted successfully!');
    }
  }, []);

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
        variant="filled"
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
            console.log('Add Employee button clicked');
            toast('Add Employee feature coming soon!');
          }}
        >
          Add New Employee
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Search employees by name, phone, NIC, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        
        {/* Filters */}
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="probation">Probation</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
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

          <Grid xs={12} md={4}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                backgroundColor: 'grey.50', 
                display: 'flex', 
                alignItems: 'center',
                borderRadius: 2
              }}
            >
              <Filter size={18} />
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                {filteredEmployees.length} of {employees.length} employees
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Employee Cards Grid */}
      <Grid container spacing={3}>
        {filteredEmployees.map((employee) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  borderColor: 'primary.main'
                },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Profile Image and Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ flexShrink: 0 }}>
                    <Avatar
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        bgcolor: 'primary.main',
                        border: '3px solid', 
                        borderColor: 'grey.200',
                        fontSize: '1.125rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                    </Avatar>
                  </Box>
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 1 }}>
                        {getStatusBadge(employee.status)}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Contact Information */}
                <Box sx={{ mb: 3, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Mail size={16} color="#9ca3af" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {employee.email || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Phone size={16} color="#9ca3af" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>
                      {employee.phone || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Users size={16} color="#9ca3af" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>
                      ID: {employee.employeeId || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 'auto' }}>
                  <IconButton
                    size="small"
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.50' }
                    }}
                    onClick={() => {
                      toast('Employee details view coming soon!');
                    }}
                  >
                    <Eye size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { backgroundColor: 'grey.50' }
                    }}
                    onClick={() => {
                      toast('Employee edit coming soon!');
                    }}
                  >
                    <Edit size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ 
                      color: 'error.main',
                      '&:hover': { backgroundColor: 'error.50' }
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
      
      {filteredEmployees.length === 0 && (
        <Paper elevation={3} sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
          <Users size={48} color="#9ca3af" style={{ margin: '0 auto' }} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 'medium', color: 'text.primary' }}>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {employees.length === 0 ? 'Get started by adding a new employee.' : 'Try adjusting your search or filter criteria.'}
          </Typography>
          {employees.length === 0 && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                sx={{ 
                  backgroundColor: '#1565c0',
                  '&:hover': { backgroundColor: '#0d47a1' }
                }}
                onClick={() => {
                  toast('Add Employee feature coming soon!');
                }}
              >
                Add Your First Employee
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default EmployeeList;

