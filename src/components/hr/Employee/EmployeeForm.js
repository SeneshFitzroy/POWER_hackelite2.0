import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Container,
  IconButton,
  CircularProgress,
  Chip
} from '@mui/material';
import { ArrowLeft, Save, User, Briefcase, PhoneIcon, MailIcon, MapPinIcon, CalendarIcon, FileTextIcon } from 'lucide-react';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user, demoMode } = useAuth(); // Move this to the top level
  
  console.log('Auth context - User:', user, 'Demo mode:', demoMode);
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nic: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    
    // Employment Information
    employeeId: '',
    role: '',
    department: '',
    startDate: '',
    employmentType: '',
    workSchedule: '',
    reportingManager: '',
    status: 'active',
    
    // Compensation
    baseSalary: '',
    currency: 'LKR',
    
    // Additional Information
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const roles = [
    { value: 'registered_pharmacist', label: 'Registered Pharmacist' },
    { value: 'pharmacy_assistant', label: 'Pharmacy Assistant' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'store_manager', label: 'Store Manager' },
    { value: 'hr_manager', label: 'HR Manager' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'sales_representative', label: 'Sales Representative' }
  ];

  const departments = [
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'sales', label: 'Sales' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'administration', label: 'Administration' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' }
  ];

  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  const workSchedules = [
    { value: 'morning', label: 'Morning Shift (6:00 AM - 2:00 PM)' },
    { value: 'day', label: 'Day Shift (8:00 AM - 5:00 PM)' },
    { value: 'evening', label: 'Evening Shift (2:00 PM - 10:00 PM)' },
    { value: 'night', label: 'Night Shift (10:00 PM - 6:00 AM)' },
    { value: 'flexible', label: 'Flexible Hours' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'probation', label: 'Probation' }
  ];

  // Fetch employee data if editing
  useEffect(() => {
    if (isEdit && id) {
      const fetchEmployee = async () => {
        try {
          setFetching(true);
          const docRef = doc(db, 'employees', id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setFormData(prev => ({
              ...prev,
              ...docSnap.data()
            }));
          } else {
            toast.error('Employee not found');
            navigate('/hr/employees');
          }
        } catch (error) {
          console.error('Error fetching employee:', error);
          toast.error('Failed to fetch employee details');
          navigate('/hr/employees');
        } finally {
          setFetching(false);
        }
      };

      fetchEmployee();
    }
  }, [id, isEdit, navigate]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.nic.trim()) newErrors.nic = 'NIC is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^\+?[\d\s\-\(\)]{7,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // NIC validation (basic Sri Lankan NIC format)
    if (formData.nic && !/^(\d{9}[vVxX]|\d{12})$/.test(formData.nic)) {
      newErrors.nic = 'Please enter a valid NIC number';
    }

    // Salary validation
    if (formData.baseSalary && (isNaN(formData.baseSalary) || parseFloat(formData.baseSalary) <= 0)) {
      newErrors.baseSalary = 'Please enter a valid salary amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    // Check authentication using the already declared variables
    console.log('Submit - User:', user, 'Demo mode:', demoMode);
    
    if (demoMode) {
      console.log('App is in demo mode, cannot save to Firestore');
      toast.error('App is in demo mode. Cannot save employee data to Firestore.');
      return;
    }
    
    if (!user) {
      console.log('No user authenticated');
      toast.error('You must be logged in to save employee data');
      return;
    }

    setLoading(true);
    try {
      // Generate employee ID if not provided and not editing
      let employeeId = formData.employeeId;
      if (!isEdit && !employeeId) {
        employeeId = `EMP${Date.now().toString().slice(-6)}`;
      }
      
      const employeeData = {
        ...formData,
        employeeId,
        baseSalary: parseFloat(formData.baseSalary) || 0,
        updatedAt: new Date().toISOString()
      };

      console.log('Saving employee data:', employeeData);
      console.log('Database reference:', db);
      console.log('Collection reference:', collection(db, 'employees'));

      if (isEdit) {
        // Update existing employee
        const docRef = doc(db, 'employees', id);
        console.log('Updating employee with ID:', id);
        console.log('Document reference:', docRef);
        await updateDoc(docRef, employeeData);
        toast.success('Employee updated successfully!');
        navigate('/hr/employees');
      } else {
        // Add new employee
        employeeData.createdAt = new Date().toISOString();
        employeeData.status = employeeData.status || 'active';
        console.log('Adding new employee with data:', employeeData);
        const docRef = await addDoc(collection(db, 'employees'), employeeData);
        console.log('Employee added with ID:', docRef.id);
        console.log('Document reference:', docRef);
        toast.success('Employee added successfully!');
        navigate('/hr/employees');
      }

      navigate('/hr/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      console.error('Error details:', error.code, error.message);
      toast.error(`Failed to ${isEdit ? 'update' : 'save'} employee. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, pl: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3, pl: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => navigate('/hr/employees')}
          sx={{ mr: 2, color: 'primary.main' }}
        >
          <ArrowLeft />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </Typography>
      </Box>

      {/* Employee Form */}
      <Card elevation={3} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Personal Information Section */}
            <Grid item xs={12}>
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
                <Chip 
                  label="Required" 
                  size="small" 
                  sx={{ 
                    ml: 2, 
                    backgroundColor: '#1565c0', 
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="NIC Number"
                    variant="outlined"
                    value={formData.nic}
                    onChange={(e) => handleInputChange('nic', e.target.value)}
                    error={!!errors.nic}
                    helperText={errors.nic}
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    variant="outlined"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      label="Gender"
                      sx={{ 
                        borderRadius: '8px'
                      }}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    variant="outlined"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    variant="outlined"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
            </Grid>

            {/* Employment Information Section */}
            <Grid item xs={12}>
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
                <Chip 
                  label="Required" 
                  size="small" 
                  sx={{ 
                    ml: 2, 
                    backgroundColor: '#2e7d32', 
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    variant="outlined"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    placeholder={isEdit ? "" : "Leave blank to auto-generate"}
                    disabled={isEdit}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" error={!!errors.role}>
                    <InputLabel>Role *</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      label="Role *"
                      sx={{ 
                        borderRadius: '8px'
                      }}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.role}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" error={!!errors.department}>
                    <InputLabel>Department *</InputLabel>
                    <Select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      label="Department *"
                      sx={{ 
                        borderRadius: '8px'
                      }}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.department && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.department}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    variant="outlined"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" error={!!errors.employmentType}>
                    <InputLabel>Employment Type *</InputLabel>
                    <Select
                      value={formData.employmentType}
                      onChange={(e) => handleInputChange('employmentType', e.target.value)}
                      label="Employment Type *"
                      sx={{ 
                        borderRadius: '8px'
                      }}
                    >
                      {employmentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.employmentType && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.employmentType}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Work Schedule</InputLabel>
                    <Select
                      value={formData.workSchedule}
                      onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                      label="Work Schedule"
                      sx={{ 
                        borderRadius: '8px'
                      }}
                    >
                      {workSchedules.map((schedule) => (
                        <MenuItem key={schedule.value} value={schedule.value}>
                          {schedule.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Reporting Manager"
                    variant="outlined"
                    value={formData.reportingManager}
                    onChange={(e) => handleInputChange('reportingManager', e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Status"
                      sx={{ 
                        borderRadius: '8px'
                      }}
                    >
                      {statuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
            </Grid>

            {/* Compensation Section */}
            <Grid item xs={12}>
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
                  backgroundColor: '#fff3e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Briefcase size={20} color="#ef6c00" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ef6c00' }}>
                  Compensation
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Base Salary"
                    variant="outlined"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => handleInputChange('baseSalary', e.target.value)}
                    error={!!errors.baseSalary}
                    helperText={errors.baseSalary}
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ mr: 1, color: '#666' }}>{formData.currency}</Typography>
                      )
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      label="Currency"
                      sx={{ 
                        borderRadius: '8px'
                      }}
                    >
                      <MenuItem value="LKR">LKR (Sri Lankan Rupee)</MenuItem>
                      <MenuItem value="USD">USD (US Dollar)</MenuItem>
                      <MenuItem value="EUR">EUR (Euro)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
            </Grid>

            {/* Emergency Contact Section */}
            <Grid item xs={12}>
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
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    variant="outlined"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    variant="outlined"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
            </Grid>

            {/* Additional Information Section */}
            <Grid item xs={12}>
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
                  Additional Information
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Form Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    navigate('/hr/employees');
                  }}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save size={20} />}
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    backgroundColor: '#1565c0',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#0d47a1' },
                    '&.Mui-disabled': { backgroundColor: '#1565c0' }
                  }}
                >
                  {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Employee' : 'Save Employee')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EmployeeForm;