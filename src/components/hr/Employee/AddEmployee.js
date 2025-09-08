import React, { useState } from 'react';
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
  Paper,
  Container,
  IconButton
} from '@mui/material';
import { ArrowBack, Save, Person, Work, Phone, Mail, MapPin, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const AddEmployee = ({ onBack, onSave }) => {
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

  const handleInputChange = (field, value) => {
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
  };

  const validateForm = () => {
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
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      // Generate employee ID if not provided
      const employeeId = formData.employeeId || `EMP${Date.now().toString().slice(-6)}`;
      
      const employeeData = {
        ...formData,
        employeeId,
        id: Date.now().toString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Here you would typically save to your database
      console.log('Saving employee:', employeeData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Employee added successfully!');
      
      if (onSave) {
        onSave(employeeData);
      }
      
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, pl: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={onBack}
          sx={{ mr: 2, color: 'primary.main' }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Add New Employee
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person size={24} color="#1565c0" />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Personal Information
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                    InputProps={{
                      startAdornment: <Mail size={20} color="#9ca3af" style={{ marginRight: 8 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                    InputProps={{
                      startAdornment: <Phone size={20} color="#9ca3af" style={{ marginRight: 8 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="NIC Number"
                    value={formData.nic}
                    onChange={(e) => handleInputChange('nic', e.target.value)}
                    error={!!errors.nic}
                    helperText={errors.nic}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Gender"
                      onChange={(e) => handleInputChange('gender', e.target.value)}
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
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    InputProps={{
                      startAdornment: <MapPin size={20} color="#9ca3af" style={{ marginRight: 8, marginTop: 8 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </Grid>
              </Grid>
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
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!!errors.role}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="Role"
                      onChange={(e) => handleInputChange('role', e.target.value)}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.department}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={formData.department}
                      label="Department"
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.employmentType}>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      value={formData.employmentType}
                      label="Employment Type"
                      onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    >
                      {employmentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Work Schedule</InputLabel>
                    <Select
                      value={formData.workSchedule}
                      label="Work Schedule"
                      onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                    >
                      {workSchedules.map((schedule) => (
                        <MenuItem key={schedule.value} value={schedule.value}>
                          {schedule.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reporting Manager"
                    value={formData.reportingManager}
                    onChange={(e) => handleInputChange('reportingManager', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Compensation & Additional Info */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Compensation */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FileText size={24} color="#1565c0" />
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                      Compensation
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        label="Base Salary"
                        type="number"
                        value={formData.baseSalary}
                        onChange={(e) => handleInputChange('baseSalary', e.target.value)}
                        error={!!errors.baseSalary}
                        helperText={errors.baseSalary}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={formData.currency}
                          label="Currency"
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                        >
                          <MenuItem value="LKR">LKR</MenuItem>
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="EUR">EUR</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Emergency Contact */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Emergency Contact
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Emergency Contact Name"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Emergency Contact Phone"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information about the employee..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={onBack}
                sx={{ 
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<Save size={20} />}
                sx={{ 
                  px: 4,
                  backgroundColor: '#1565c0',
                  '&:hover': { backgroundColor: '#0d47a1' },
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                {loading ? 'Saving...' : 'Save Employee'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddEmployee;
