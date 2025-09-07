import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
  Chip
} from '@mui/material';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeList = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

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
            toast.info('Add Employee feature coming soon!');
          }}
        >
          Add New Employee
        </Button>
      </Box>

      <Typography variant="body1">
        Employee management system is loading...
      </Typography>
      
      {/* Test the status badge */}
      {getStatusBadge('active')}
    </Container>
  );
};

export default EmployeeList;
