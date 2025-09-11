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

  // Debug function to list all transactions
  const debugAllTransactions = async () => {
    try {
      console.log('=== DEBUG: LISTING ALL TRANSACTIONS ===');
      const allTransactionsQuery = query(
        collection(db, 'transactions'),
        orderBy('createdAt', 'desc'),
        limit(10) // Limit to last 10 for debugging
      );
      
      const snapshot = await getDocs(allTransactionsQuery);
      console.log(`Found ${snapshot.docs.length} transactions in database:`);
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. Transaction ${doc.id}:`, {
          customerName: data.customerName,
          customerNIC: data.customerNIC,
          patientNIC: data.patientNIC,
          total: data.total,
          receiptNumber: data.receiptNumber,
          createdAt: data.createdAt?.toDate?.() || data.createdAt
        });
      });
    } catch (error) {
      console.error('Error listing transactions:', error);
    }
  };

  // Load customer order history
  const loadCustomerHistory = async (customerId) => {
    try {
      setLoading(true);
      
      // Get the customer details first
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        console.log('Customer not found for ID:', customerId);
        setCustomerOrders([]);
        return;
      }
      
      console.log('=== CUSTOMER HISTORY DEBUG ===');
      console.log('Loading history for customer:', customer);
      console.log('Customer NIC:', customer.nic);
      console.log('Customer Name:', customer.name);
      
      // Query transactions by customer NIC and also by patientNIC as backup
      const queries = [
        // Primary query by customerNIC
        query(
          collection(db, 'transactions'),
          where('customerNIC', '==', customer.nic),
          orderBy('createdAt', 'desc')
        ),
        // Backup query by patientNIC
        query(
          collection(db, 'transactions'),
          where('patientNIC', '==', customer.nic),
          orderBy('createdAt', 'desc')
        ),
        // Additional query by customerName (less reliable but helpful)
        query(
          collection(db, 'transactions'),
          where('customerName', '==', customer.name),
          orderBy('createdAt', 'desc')
        )
      ];
      
      let allTransactions = [];
      
      console.log('Executing queries for NIC:', customer.nic, 'and Name:', customer.name);
      
      // Execute all queries and combine results
      for (const [index, transactionQuery] of queries.entries()) {
        try {
          console.log(`Executing query ${index + 1}...`);
          const snapshot = await getDocs(transactionQuery);
          console.log(`Query ${index + 1} returned ${snapshot.docs.length} transactions`);
          
          snapshot.docs.forEach(doc => {
            const transactionData = { id: doc.id, ...doc.data() };
            console.log(`Transaction ${doc.id}:`, {
              customerName: transactionData.customerName,
              customerNIC: transactionData.customerNIC,
              patientNIC: transactionData.patientNIC,
              total: transactionData.total
            });
            allTransactions.push(transactionData);
          });
        } catch (queryError) {
          console.error(`Error in query ${index + 1}:`, queryError);
        }
      }
      
      // Remove duplicates based on transaction ID
      const uniqueTransactions = allTransactions.filter((transaction, index, self) =>
        index === self.findIndex(t => t.id === transaction.id)
      );
      
      console.log('=== FINAL RESULTS ===');
      console.log('Found', uniqueTransactions.length, 'unique transactions for customer:', customer.name);
      uniqueTransactions.forEach(t => {
        console.log(`Transaction: ${t.receiptNumber || t.id} - ${t.total} - ${t.customerName}`);
      });
      
      const orderData = uniqueTransactions.map(data => {
        console.log('Processing transaction data:', data);
        return {
          id: data.id,
          ...data,
          // Transform transaction data to order format for compatibility
          orderId: data.invoiceNumber || data.receiptNumber || data.id,
          orderDate: data.createdAt,
          totalAmount: data.total || data.netTotal,
          status: data.status || 'completed',
          items: data.items || [],
          paymentMethod: data.paymentMethod || 'cash'
        };
      });
      
      console.log('Setting customer orders:', orderData.length, 'orders');
      setCustomerOrders(orderData);
      
    } catch (error) {
      console.error('Error loading customer history:', error);
      setCustomerOrders([]);
    } finally {
      setLoading(false);
    }
  };  const handleAddCustomer = async () => {
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
    return `LKR ${amount?.toLocaleString() || '0.00'}`;
  };

  return (
    <Box>
      {/* Header with Search and Add Button */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="#000000">
            Customer Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={loadCustomers}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  borderColor: '#1976d2'
                }
              }}
            >
              Refresh
            </Button>
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
          
          {/* Debug Button */}
          <Button
            variant="outlined"
            onClick={debugAllTransactions}
            sx={{
              ml: 2,
              color: '#ff9800',
              borderColor: '#ff9800',
              '&:hover': {
                backgroundColor: '#fff3e0',
                borderColor: '#f57c00'
              }
            }}
          >
            Debug Transactions
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
        <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <History sx={{ mr: 1 }} />
            Purchase History - {selectedCustomerHistory?.name}
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
            <Box>
              {customerOrders.map((order, index) => (
                <Paper key={order.id} sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0' }}>
                  {/* PHARMACY HEADER FOR EACH RECEIPT */}
                  <Box sx={{ textAlign: 'center', mb: 2, borderBottom: '2px solid #1976d2', pb: 2 }}>
                    <img 
                      src="/images/npk-logo.png" 
                      alt="NPK Logo" 
                      style={{ height: '40px', marginBottom: '8px' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2', letterSpacing: '1px' }}>
                      MEDICARE PHARMACY SYSTEM
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      📍 123 Main Street, Colombo 01, Sri Lanka | 📞 +94 11 234 5678
                    </Typography>
                  </Box>

                  {/* RECEIPT HEADER */}
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ 
                      backgroundColor: '#1976d2', 
                      color: 'white', 
                      p: 1, 
                      borderRadius: 1 
                    }}>
                      SALES RECEIPT #{order.orderId}
                    </Typography>
                  </Box>

                  {/* TRANSACTION DETAILS */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Receipt No: {order.receiptNumber || order.orderId}
                      </Typography>
                      <Typography variant="body2">
                        Invoice No: {order.invoiceNumber || order.orderId}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">
                        Date: {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString('en-GB') : 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Time: {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleTimeString('en-GB') : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* STAFF AND CUSTOMER INFO */}
                  <Box sx={{ mb: 2, borderBottom: '1px dashed #ccc', pb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                      👨‍⚕️ Staff: {order.staffName || 'Staff'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      👤 Customer: {selectedCustomerHistory?.name} (NIC: {selectedCustomerHistory?.nic})
                    </Typography>
                    {selectedCustomerHistory?.phoneNumber && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        📞 Contact: {selectedCustomerHistory.phoneNumber}
                      </Typography>
                    )}
                  </Box>

                  {/* ITEMS SECTION */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ 
                      backgroundColor: '#f5f5f5', 
                      p: 1, 
                      borderRadius: 1,
                      mb: 1 
                    }}>
                      ITEMS PURCHASED
                    </Typography>
                    
                    {/* Items Header */}
                    <Box sx={{ display: 'flex', fontWeight: 'bold', borderBottom: '1px solid #ccc', pb: 0.5, mb: 1 }}>
                      <Typography variant="body2" sx={{ flex: 3, fontSize: '0.8rem' }}>MEDICINE</Typography>
                      <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>QTY</Typography>
                      <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>RATE</Typography>
                      <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', fontSize: '0.8rem' }}>TOTAL</Typography>
                    </Box>

                    {/* Items List */}
                    {order.items && order.items.map((item, itemIndex) => (
                      <Box key={itemIndex} sx={{ display: 'flex', mb: 0.5, fontSize: '0.85rem' }}>
                        <Typography variant="body2" sx={{ flex: 3, fontSize: '0.8rem' }}>
                          {item.name}
                          {item.batchNumber && <><br /><span style={{ color: '#666', fontSize: '0.7rem' }}>Batch: {item.batchNumber}</span></>}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>
                          {item.quantity}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>
                          {formatCurrency(item.unitPrice || (item.totalPrice / item.quantity))}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', fontSize: '0.8rem' }}>
                          {formatCurrency(item.totalPrice)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* TOTALS SECTION */}
                  <Box sx={{ borderTop: '2px solid #1976d2', pt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">{formatCurrency(order.subtotal || order.totalAmount)}</Typography>
                    </Box>
                    {order.discountAmount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="error">Discount ({order.discountRate || 0}%):</Typography>
                        <Typography variant="body2" color="error">-{formatCurrency(order.discountAmount || 0)}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, borderTop: '1px dashed #ccc', pt: 1 }}>
                      <Typography variant="h6" fontWeight="bold">NET TOTAL:</Typography>
                      <Typography variant="h6" fontWeight="bold">{formatCurrency(order.totalAmount)}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold">Payment:</Typography>
                      <Chip 
                        label={order.paymentMethod?.toUpperCase() || 'CASH'} 
                        color={order.status === 'completed' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    {order.balance > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight="bold" color="success.main">Balance:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(order.balance)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px dashed #ccc' }}>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                      Thank you for choosing Medicare Pharmacy!
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <History sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No purchase history found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This customer hasn't made any purchases yet.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
