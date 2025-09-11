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

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nic, setNic] = useState('');
  const [age, setAge] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [status, setStatus] = useState('Active');

  // Load customers from Firebase
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'customers'));
      const customerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customerList);
      console.log('Loaded customers:', customerList.length);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Load customer transaction history
  const loadCustomerHistory = async (customerId) => {
    try {
      setLoading(true);
      
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
      
      // Query transactions by customer NIC
      const queries = [
        query(
          collection(db, 'transactions'),
          where('customerNIC', '==', customer.nic),
          orderBy('createdAt', 'desc')
        ),
        query(
          collection(db, 'transactions'),
          where('patientNIC', '==', customer.nic),
          orderBy('createdAt', 'desc')
        ),
        query(
          collection(db, 'transactions'),
          where('customerName', '==', customer.name),
          orderBy('createdAt', 'desc')
        )
      ];
      
      let allTransactions = [];
      
      for (const [index, transactionQuery] of queries.entries()) {
        try {
          console.log(`Executing query ${index + 1}...`);
          const snapshot = await getDocs(transactionQuery);
          const transactions = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            querySource: `Query ${index + 1}`
          }));
          allTransactions = [...allTransactions, ...transactions];
          console.log(`Query ${index + 1} returned ${transactions.length} transactions`);
        } catch (queryError) {
          console.warn(`Query ${index + 1} failed:`, queryError.message);
        }
      }
      
      // Remove duplicates based on transaction ID
      const uniqueTransactions = allTransactions.reduce((acc, current) => {
        const exists = acc.find(item => item.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      console.log('Total unique transactions found:', uniqueTransactions.length);
      console.log('Transactions:', uniqueTransactions);
      
      setCustomerOrders(uniqueTransactions);
      setSelectedCustomerHistory(customer);
      setShowHistoryDialog(true);
      
    } catch (error) {
      console.error('Error loading customer history:', error);
      setCustomerOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCustomerName('');
    setPhoneNumber('');
    setEmail('');
    setAddress('');
    setNic('');
    setAge('');
    setDateOfBirth('');
    setStatus('Active');
    setEditingCustomer(null);
  };

  // Save customer
  const handleSaveCustomer = async () => {
    try {
      const customerData = {
        name: customerName,
        phoneNumber,
        email,
        address,
        nic,
        age: age ? parseInt(age) : null,
        dateOfBirth: dateOfBirth || null,
        status,
        totalPurchases: editingCustomer?.totalPurchases || 0,
        createdAt: editingCustomer?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (editingCustomer) {
        await updateDoc(doc(db, 'customers', editingCustomer.id), customerData);
        console.log('Customer updated:', editingCustomer.id);
      } else {
        await addDoc(collection(db, 'customers'), customerData);
        console.log('New customer created');
      }

      setShowCustomerDialog(false);
      resetForm();
      loadCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  // Edit customer
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustomerName(customer.name);
    setPhoneNumber(customer.phoneNumber);
    setEmail(customer.email || '');
    setAddress(customer.address || '');
    setNic(customer.nic);
    setAge(customer.age?.toString() || '');
    setDateOfBirth(customer.dateOfBirth || '');
    setStatus(customer.status);
    setShowCustomerDialog(true);
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
                  Phone
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  <Badge sx={{ mr: 1, verticalAlign: 'middle' }} />
                  NIC
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Total Purchases
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Typography fontWeight="bold">{customer.name}</Typography>
                  </TableCell>
                  <TableCell>{customer.phoneNumber}</TableCell>
                  <TableCell>{customer.nic}</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary">
                      LKR {customer.totalPurchases || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.status}
                      color={customer.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditCustomer(customer)}
                        sx={{ color: '#1976d2' }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => loadCustomerHistory(customer.id)}
                        sx={{ color: '#ff9800' }}
                      >
                        <History />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredCustomers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No customers found matching your search.' : 'No customers yet.'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Customer Dialog */}
      <Dialog open={showCustomerDialog} onClose={() => setShowCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Update Customer' : 'Add Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NIC"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomerDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveCustomer} variant="contained">
            {editingCustomer ? 'Update' : 'Add'} Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onClose={() => setShowHistoryDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Customer Transaction History - {selectedCustomerHistory?.name}
            <IconButton onClick={() => setShowHistoryDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {customerOrders.length > 0 ? (
            customerOrders.map((order, index) => (
              <Paper key={order.id} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                <Grid container spacing={2}>
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

                <Box sx={{ mb: 2, borderBottom: '1px dashed #ccc', pb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    👨‍⚕️ Staff: {order.staffName || 'Staff'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    👤 Customer: {order.customerName || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    📞 Contact: {order.customerContact || 'N/A'}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Items Purchased:
                </Typography>
                {order.items?.map((item, itemIndex) => (
                  <Box key={itemIndex} sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body2">
                      • {item.name} - Qty: {item.quantity} - LKR {item.totalPrice}
                    </Typography>
                  </Box>
                ))}

                <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #eee' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    Total: LKR {order.total}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    Payment: {order.paymentMethod || 'N/A'}
                  </Typography>
                </Box>
              </Paper>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No transaction history found for this customer.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
