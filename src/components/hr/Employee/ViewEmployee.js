import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Paper,
  Container,
  IconButton,
  Avatar
} from '@mui/material';
import { ArrowBack, Edit, Mail, Phone, MapPin, Calendar, User, Work, FileText } from 'lucide-react';

const ViewEmployee = ({ employee, onBack, onEdit }) => {
  if (!employee) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, pl: 8 }}>
        <Typography variant="h5">Employee not found</Typography>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'error',
      probation: 'warning'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount, currency = 'LKR') => {
    if (!amount) return 'N/A';
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, pl: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={onBack}
            sx={{ mr: 2, color: 'primary.main' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Employee Details
          </Typography>
        </Box>
        
        <IconButton
          onClick={() => onEdit && onEdit(employee)}
          sx={{ 
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          <Edit size={20} />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Employee Profile Header */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {employee.firstName} {employee.lastName}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    {employee.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip 
                      label={employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                      color={getStatusColor(employee.status)}
                      variant="filled"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Employee ID: {employee.employeeId || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <User size={24} color="#1565c0" />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Personal Information
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Mail size={18} color="#9ca3af" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{employee.email || 'N/A'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone size={18} color="#9ca3af" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{employee.phone || 'N/A'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FileText size={18} color="#9ca3af" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">NIC</Typography>
                    <Typography variant="body1">{employee.nic || 'N/A'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Calendar size={18} color="#9ca3af" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1">{formatDate(employee.dateOfBirth)}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <User size={18} color="#9ca3af" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Gender</Typography>
                    <Typography variant="body1">
                      {employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1) || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                
                {employee.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <MapPin size={18} color="#9ca3af" style={{ marginTop: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body1">{employee.address}</Typography>
                      {employee.city && (
                        <Typography variant="body2" color="text.secondary">{employee.city}</Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Employment Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Work size={24} color="#1565c0" />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Employment Information
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">
                    {employee.department?.charAt(0).toUpperCase() + employee.department?.slice(1) || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Employment Type</Typography>
                  <Typography variant="body1">
                    {employee.employmentType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1">{formatDate(employee.startDate)}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Work Schedule</Typography>
                  <Typography variant="body1">
                    {employee.workSchedule?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Reporting Manager</Typography>
                  <Typography variant="body1">{employee.reportingManager || 'N/A'}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Base Salary</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'success.main' }}>
                    {formatCurrency(employee.baseSalary, employee.currency)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Contact & Additional Info */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Emergency Contact
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Contact Name</Typography>
                      <Typography variant="body1">{employee.emergencyContact || 'N/A'}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Contact Phone</Typography>
                      <Typography variant="body1">{employee.emergencyPhone || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                    System Information
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Created At</Typography>
                      <Typography variant="body1">{formatDate(employee.createdAt)}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body1">{formatDate(employee.updatedAt)}</Typography>
                    </Box>
                  </Box>
                </Grid>

                {employee.notes && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Additional Notes
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="body1">{employee.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ViewEmployee;
