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
  ChildCare
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';

export default function CustomerManagement({ dateFilter }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phoneNumber: '',
    dateOfBirth: '',
    age: '',
    nic: '',
    email: '',
    isChild: false
  });
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm) ||
      customer.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      errors.phoneNumber = 'Please enter a valid 10-digit phone number';
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
    }
    
    // NIC validation for adults (16 years and above)
    const age = calculateAge(newCustomer.dateOfBirth);
    if (age >= 16) {
      if (!newCustomer.nic.trim()) {
        errors.nic = 'NIC is required for customers 16 years and above';
      } else if (!validateNIC(newCustomer.nic)) {
        errors.nic = 'Please enter a valid NIC number';
      }
    }
    
    // Email validation (if provided)
    if (newCustomer.email.trim() && !validateEmail(newCustomer.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
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
        nic: isChild ? '' : newCustomer.nic.trim(),
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
      age: customer.age.toString(),
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

  const handleCreateInvoice = (customer) => {
    // Navigate to invoicing page to create new invoice for this customer
    console.log('Create invoice for customer:', customer);
    
    // Store customer data for invoice creation
    const invoiceCustomer = {
      id: customer.id,
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      email: customer.email,
      nic: customer.nic
    };
    
    // This would typically navigate to the invoicing tab with pre-filled customer data
    // For now, we'll show a confirmation message
    alert(`🧾 Creating new invoice for:\n\nCustomer: ${customer.name}\nPhone: ${customer.phoneNumber}\n\n✅ Ready to proceed to invoice creation!`);
    
    // In a real application, this would:
    // 1. Navigate to the invoicing tab
    // 2. Pre-fill customer information
    // 3. Focus on product selection
    // Example: navigate('/sales/invoicing', { state: { customer: invoiceCustomer } });
  };

  const validateNIC = (nic) => {
    // Enhanced NIC validation for Sri Lanka
    if (!nic) return true; // Allow empty for children
    
    // Remove any spaces and convert to uppercase
    const cleanNIC = nic.replace(/\s+/g, '').toUpperCase();
    
    // Old format: 9 digits + V/X
    const oldFormatPattern = /^[0-9]{9}[VX]$/;
    // New format: 12 digits
    const newFormatPattern = /^[0-9]{12}$/;
    
    return oldFormatPattern.test(cleanNIC) || newFormatPattern.test(cleanNIC);
  };

  const validatePhoneNumber = (phone) => {
    // Enhanced phone validation for Sri Lanka
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
    
    // Should be exactly 10 digits and start with 0
    const phonePattern = /^0[0-9]{9}$/;
    return phonePattern.test(cleanPhone);
  };

  const validateEmail = (email) => {
    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
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
            onClick={() => setShowCustomerDialog(true)}
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
                      onClick={() => handleCreateInvoice(customer)}
                      sx={{ 
                        color: '#1e3a8a', 
                        mr: 1,
                        backgroundColor: 'rgba(30, 58, 138, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(30, 58, 138, 0.2)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                      title="Create Invoice"
                    >
                      <Receipt />
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
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
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
        onClose={() => setShowCustomerDialog(false)}
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
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                error={!newCustomer.name}
                helperText={!newCustomer.name ? 'Name is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={newCustomer.phoneNumber}
                onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                error={!newCustomer.phoneNumber || !validatePhoneNumber(newCustomer.phoneNumber)}
                helperText={
                  !newCustomer.phoneNumber 
                    ? 'Phone number is required' 
                    : !validatePhoneNumber(newCustomer.phoneNumber) 
                    ? 'Please enter a valid 10-digit phone number' 
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={newCustomer.age}
                onChange={(e) => {
                  const age = parseInt(e.target.value);
                  setNewCustomer({ 
                    ...newCustomer, 
                    age: e.target.value,
                    isChild: age < 15
                  });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={newCustomer.isChild ? "NIC (Optional for children)" : "NIC *"}
                value={newCustomer.nic}
                onChange={(e) => setNewCustomer({ ...newCustomer, nic: e.target.value })}
                disabled={newCustomer.isChild}
                error={!newCustomer.isChild && !newCustomer.nic}
                helperText={
                  !newCustomer.isChild && !newCustomer.nic 
                    ? 'NIC is required for customers 15 years and above' 
                    : !validateNIC(newCustomer.nic) && newCustomer.nic
                    ? 'Please enter a valid NIC number' 
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email (Optional)"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newCustomer.isChild}
                    onChange={(e) => setNewCustomer({ ...newCustomer, isChild: e.target.checked })}
                  />
                }
                label="Customer is under 15 years old (NIC not required)"
              />
            </Grid>
            {newCustomer.isChild && (
              <Grid item xs={12}>
                <Alert severity="info">
                  NIC is not required for customers under 15 years old.
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
              setNewCustomer({
                name: '',
                phoneNumber: '',
                age: '',
                nic: '',
                email: '',
                isChild: false
              });
            }}
            sx={{ color: '#666666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCustomer}
            disabled={
              loading || 
              !newCustomer.name || 
              !newCustomer.phoneNumber ||
              !validatePhoneNumber(newCustomer.phoneNumber) ||
              (!newCustomer.isChild && !newCustomer.nic) ||
              (newCustomer.nic && !validateNIC(newCustomer.nic))
            }
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
    </Box>
  );
}
