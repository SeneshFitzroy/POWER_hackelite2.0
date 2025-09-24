import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Container,
  IconButton,
  Avatar,
  CircularProgress,
  Button
} from '@mui/material';
import { ArrowLeft, Edit, MailIcon, PhoneIcon, MapPinIcon, CalendarIcon, User, Briefcase, FileTextIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ViewEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'employees', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setEmployee({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error('Employee not found');
          navigate('/hr/employees');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        toast.error('Failed to fetch employee details');
        navigate('/hr/employees');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, navigate]);

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, pl: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!employee) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, pl: 8 }}>
        <Typography variant="h5">Employee not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3, pl: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/hr/employees')}
            sx={{ mr: 2, color: 'primary.main' }}
          >
            <ArrowLeft />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Employee Details
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Edit size={20} />}
          onClick={() => navigate(`/hr/employees/${employee.id}/edit`)}
          sx={{ 
            px: 3, 
            py: 1.5, 
            borderRadius: 2,
            backgroundColor: '#1565c0',
            fontWeight: 'bold',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#0d47a1' }
          }}
        >
          Edit Employee
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Employee Profile Header */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 3, mb: 3, border: '1px solid #e0e0e0' }}>
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
                      sx={{ fontWeight: 'bold' }}
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
          <Card elevation={3} sx={{ height: '100%', borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                pb: 2,
                borderBottom: '2px solid #f0f0f0'
              }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  backgroundColor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <User size={20} color="#1565c0" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  Personal Information
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MailIcon size={18} color="#9ca3af" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{employee.email || 'N/A'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PhoneIcon size={18} color="#9ca3af" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{employee.phone || 'N/A'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FileTextIcon size={18} color="#9ca3af" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">NIC</Typography>
                    <Typography variant="body1">{employee.nic || 'N/A'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarIcon size={18} color="#9ca3af" />
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
                    <MapPinIcon size={18} color="#9ca3af" style={{ marginTop: 2 }} />
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
          <Card elevation={3} sx={{ height: '100%', borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                pb: 2,
                borderBottom: '2px solid #f0f0f0'
              }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  backgroundColor: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Briefcase size={20} color="#2e7d32" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
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
                  <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                  <Typography variant="body1">{employee.employeeId || 'N/A'}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1">{formatDate(employee.startDate)}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Employment Type</Typography>
                  <Typography variant="body1">
                    {employee.employmentType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Work Schedule</Typography>
                  <Typography variant="body1">{employee.workSchedule || 'N/A'}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Reporting Manager</Typography>
                  <Typography variant="body1">{employee.reportingManager || 'N/A'}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Base Salary</Typography>
                  <Typography variant="body1">{formatCurrency(employee.baseSalary, employee.currency)}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                    color={getStatusColor(employee.status)}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Contact */}
        {(employee.emergencyContact || employee.emergencyPhone) && (
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '50%', 
                    backgroundColor: '#fce4ec',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <PhoneIcon size={20} color="#c2185b" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#c2185b' }}>
                    Emergency Contact
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {employee.emergencyContact && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Contact Name</Typography>
                      <Typography variant="body1">{employee.emergencyContact}</Typography>
                    </Box>
                  )}
                  
                  {employee.emergencyPhone && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                      <Typography variant="body1">{employee.emergencyPhone}</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Additional Information */}
        {employee.notes && (
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '50%', 
                    backgroundColor: '#f3e5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <FileTextIcon size={20} color="#7b1fa2" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    Additional Notes
                  </Typography>
                </Box>
                
                <Typography variant="body1">{employee.notes}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ViewEmployee;