import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
  InputAdornment,
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  History,
  Search,
  Person,
  Phone,
  Email,
  Badge,
  Receipt,
  CheckCircle,
  Cancel,
  ChildCare,
  Close
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';

export default function CustomerManagement({ dateFilter }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phoneNumber: '',
    dateOfBirth: '',
    age: '',
    nic: '',
    email: '',
    isChild: false
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm) ||
      (customer.nic && customer.nic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Enhanced NIC validation for Sri Lanka
  const validateNIC = (nic) => {
    if (!nic) return true; // Allow empty for children
    
    // Remove any spaces and convert to uppercase
    const cleanNIC = nic.replace(/\s+/g, '').toUpperCase();
    
    // Old format: 9 digits + V/X
    const oldFormatPattern = /^[0-9]{9}[VX]$/;
    // New format: 12 digits
    const newFormatPattern = /^[0-9]{12}$/;
    
    return oldFormatPattern.test(cleanNIC) || newFormatPattern.test(cleanNIC);
  };

  // Enhanced phone validation for Sri Lanka
  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
    
    // Should be exactly 10 digits and start with 0
    const phonePattern = /^0[0-9]{9}$/;
    return phonePattern.test(cleanPhone);
  };

  // Basic email validation
  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!newCustomer.name.trim()) {
      errors.name = 'Name is required';
    } else if (newCustomer.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Phone validation
    if (!newCustomer.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(newCustomer.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number starting with 0';
    }
    
    // Date of birth validation
    if (!newCustomer.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(newCustomer.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
      
      // Check if older than 120 years
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 120);
      if (birthDate < maxAge) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    
    // NIC validation for adults (16 years and above)
    const age = calculateAge(newCustomer.dateOfBirth);
    if (age >= 16) {
      if (!newCustomer.nic.trim()) {
        errors.nic = 'NIC is required for customers 16 years and above';
      } else if (!validateNIC(newCustomer.nic)) {
        errors.nic = 'Please enter a valid NIC number (9 digits + V/X or 12 digits)';
      }
    }
    
    // Email validation (if provided)
    if (newCustomer.email.trim() && !validateEmail(newCustomer.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customersQuery = query(
        collection(db, 'customers'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(customersQuery);
      const customerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCustomers(customerData);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load customer order history
  const loadCustomerHistory = async (customerId) => {
    try {
      setLoading(true);
      const ordersQuery = query(
        collection(db, 'salesOrders'),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(ordersQuery);
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCustomerOrders(orderData);
    } catch (error) {
      console.error('Error loading customer history:', error);
      setCustomerOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    try {
      // Validate form before proceeding
      if (!validateForm()) {
        return;
      }

      setLoading(true);

      const age = calculateAge(newCustomer.dateOfBirth);
      const isChild = age < 16;

      const customerData = {
        name: newCustomer.name.trim(),
        phoneNumber: newCustomer.phoneNumber.trim(),
        dateOfBirth: newCustomer.dateOfBirth,
        age: age,
        nic: isChild ? '' : newCustomer.nic.trim().toUpperCase(),
        email: newCustomer.email.trim(),
        isChild: isChild,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        totalOrders: 0,
        totalSpent: 0
      };

      if (editingCustomer) {
        // Update existing customer
        await updateDoc(doc(db, 'customers', editingCustomer.id), {
          ...customerData,
          updatedAt: Timestamp.now()
        });
      } else {
        // Add new customer
        await addDoc(collection(db, 'customers'), customerData);
      }

      setShowCustomerDialog(false);
      setEditingCustomer(null);
      resetForm();
      
      loadCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer information!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      dateOfBirth: customer.dateOfBirth || '',
      age: customer.age ? customer.age.toString() : '',
      nic: customer.nic || '',
      email: customer.email || '',
      isChild: customer.isChild || false
    });
    setValidationErrors({});
    setShowCustomerDialog(true);
  };

  const handleViewHistory = async (customer) => {
    setSelectedCustomerHistory(customer);
    await loadCustomerHistory(customer.id);
    setShowHistoryDialog(true);
  };

  const resetForm = () => {
    setNewCustomer({
      name: '',
      phoneNumber: '',
      dateOfBirth: '',
      age: '',
      nic: '',
      email: '',
      isChild: false
    });
    setValidationErrors({});
  };

  const handleDateOfBirthChange = (date) => {
    const age = calculateAge(date);
    const isChild = age < 16;
    
    setNewCustomer({
      ...newCustomer,
      dateOfBirth: date,
      age: age.toString(),
      isChild: isChild,
      // Clear NIC if it's a child
      nic: isChild ? '' : newCustomer.nic
    });
    
    // Clear validation errors for date and NIC when date changes
    setValidationErrors({
      ...validationErrors,
      dateOfBirth: '',
      nic: ''
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toLocaleString() || '0.00'}`;
  };

  return (
    <Box>
      {/* Header with Search and Add Button */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="#000000">
            Customer Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetForm();
              setShowCustomerDialog(true);
            }}
            sx={{
              backgroundColor: '#000000',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            Add New Customer
          </Button>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Search customers by name, phone, NIC, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Paper>

      {/* Customers Table */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#000000' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Customer Name
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Phone Number
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date of Birth</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Age</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  <Badge sx={{ mr: 1, verticalAlign: 'middle' }} />
                  NIC
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Email
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer, index) => (
                <TableRow 
                  key={customer.id} 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                  }}
                >
                  <TableCell>
                    <Typography fontWeight="bold">{customer.name}</Typography>
                  </TableCell>
                  <TableCell>{customer.phoneNumber}</TableCell>
                  <TableCell>
                    {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{customer.age}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {customer.isChild ? (
                        <>
                          <ChildCare sx={{ color: '#ff9800', fontSize: '20px' }} />
                          <Box>
                            <Chip 
                              label="Child" 
                              color="warning" 
                              size="small" 
                              sx={{ fontWeight: 'bold' }}
                            />
                            <Typography variant="caption" display="block" color="textSecondary">
                              No NIC Required
                            </Typography>
                          </Box>
                        </>
                      ) : customer.nic ? (
                        <>
                          <CheckCircle sx={{ color: '#4caf50', fontSize: '20px' }} />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {customer.nic}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              ✓ NIC Verified
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Cancel sx={{ color: '#f44336', fontSize: '20px' }} />
                          <Box>
                            <Chip 
                              label="No NIC" 
                              color="error" 
                              size="small" 
                              variant="outlined"
                            />
                            <Typography variant="caption" display="block" color="error">
                              NIC Missing
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{customer.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={customer.isChild ? "Child" : "Adult"} 
                      color={customer.isChild ? "warning" : "success"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      onClick={() => handleEditCustomer(customer)}
                      sx={{ color: '#000000', mr: 1 }}
                      title="Edit Customer"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleViewHistory(customer)}
                      sx={{ color: '#000000' }}
                      title="View Order History"
                    >
                      <History />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm ? 'No customers found matching your search.' : 'No customers found. Add your first customer!'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Customer Dialog */}
      <Dialog 
        open={showCustomerDialog} 
        onClose={() => {
          setShowCustomerDialog(false);
          setEditingCustomer(null);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#000000', color: 'white', fontWeight: 'bold' }}>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name *"
                value={newCustomer.name}
                onChange={(e) => {
                  setNewCustomer({ ...newCustomer, name: e.target.value });
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: '' });
                  }
                }}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={newCustomer.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  setNewCustomer({ ...newCustomer, phoneNumber: value });
                  if (validationErrors.phoneNumber) {
                    setValidationErrors({ ...validationErrors, phoneNumber: '' });
                  }
                }}
                error={!!validationErrors.phoneNumber}
                helperText={validationErrors.phoneNumber || 'Enter 10-digit phone number starting with 0'}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth *"
                type="date"
                value={newCustomer.dateOfBirth}
                onChange={(e) => handleDateOfBirthChange(e.target.value)}
                error={!!validationErrors.dateOfBirth}
                helperText={validationErrors.dateOfBirth}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                value={newCustomer.age}
                disabled
                helperText="Automatically calculated from date of birth"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={newCustomer.isChild ? "NIC (Not required for children)" : "NIC *"}
                value={newCustomer.nic}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setNewCustomer({ ...newCustomer, nic: value });
                  if (validationErrors.nic) {
                    setValidationErrors({ ...validationErrors, nic: '' });
                  }
                }}
                disabled={newCustomer.isChild}
                error={!!validationErrors.nic}
                helperText={validationErrors.nic || (newCustomer.isChild ? 'NIC not required for children under 16' : '9 digits + V/X or 12 digits')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email (Optional)"
                type="email"
                value={newCustomer.email}
                onChange={(e) => {
                  setNewCustomer({ ...newCustomer, email: e.target.value });
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: '' });
                  }
                }}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
            </Grid>
            {newCustomer.isChild && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
                  <ChildCare sx={{ mr: 1 }} />
                  This customer is under 16 years old. NIC is not required for children.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setShowCustomerDialog(false);
              setEditingCustomer(null);
              resetForm();
            }}
            sx={{ color: '#666666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCustomer}
            disabled={loading}
            sx={{
              backgroundColor: '#000000',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            {editingCustomer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer History Dialog */}
      <Dialog 
        open={showHistoryDialog} 
        onClose={() => setShowHistoryDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#000000', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <History sx={{ mr: 1 }} />
            Order History - {selectedCustomerHistory?.name}
          </Box>
          <IconButton
            onClick={() => setShowHistoryDialog(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {customerOrders.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Order #</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>
                        {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status} 
                          color={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'info'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{order.paymentMethod || 'Cash'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <History sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No order history found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This customer hasn't placed any orders yet.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
