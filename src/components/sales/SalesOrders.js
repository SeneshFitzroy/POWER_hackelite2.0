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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  Autocomplete,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  ShoppingCart,
  Person,
  Receipt,
  Visibility
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';

export default function SalesOrders({ dateFilter }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrder, setNewOrder] = useState({
    employeeId: '',
    customerId: '',
    customerName: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    status: 'pending',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    loadOrders();
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter orders based on search term
    const filtered = orders.filter(order =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersQuery = query(
        collection(db, 'salesOrders'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(ordersQuery);
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(orderData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersQuery = query(collection(db, 'customers'));
      const snapshot = await getDocs(customersQuery);
      const customerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customerData);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleAddOrder = async () => {
    try {
      setLoading(true);

      // Validation
      if (!newOrder.employeeId || !newOrder.customerId) {
        alert('Employee ID and Customer are required!');
        return;
      }

      const orderData = {
        ...newOrder,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        orderNumber: `ORD-${Date.now()}`
      };

      if (editingOrder) {
        // Update existing order
        await updateDoc(doc(db, 'salesOrders', editingOrder.id), {
          ...orderData,
          updatedAt: Timestamp.now()
        });
      } else {
        // Add new order
        await addDoc(collection(db, 'salesOrders'), orderData);
      }

      setShowOrderDialog(false);
      setEditingOrder(null);
      resetNewOrder();
      loadOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setNewOrder({
      employeeId: order.employeeId,
      customerId: order.customerId,
      customerName: order.customerName,
      items: order.items || [],
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      total: order.total || 0,
      status: order.status,
      paymentMethod: order.paymentMethod || 'cash',
      notes: order.notes || ''
    });
    setShowOrderDialog(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'salesOrders', orderId));
        loadOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order!');
      }
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'salesOrders', orderId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePaymentMethodChange = async (orderId, paymentMethod) => {
    try {
      await updateDoc(doc(db, 'salesOrders', orderId), {
        paymentMethod: paymentMethod,
        updatedAt: Timestamp.now()
      });
      loadOrders();
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  };

  const resetNewOrder = () => {
    setNewOrder({
      employeeId: '',
      customerId: '',
      customerName: '',
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      status: 'pending',
      paymentMethod: 'cash',
      notes: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
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
            Sales Orders Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowOrderDialog(true)}
            sx={{
              backgroundColor: '#000000',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            Create New Sales Order
          </Button>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Search sales orders by customer name, employee ID, or status..."
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

      {/* Orders Table */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#000000' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order #</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Customer
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Payment Method</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order, index) => (
                <TableRow 
                  key={order.id} 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                  }}
                >
                  <TableCell>
                    <Typography fontWeight="bold">{order.orderNumber}</Typography>
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.employeeId}</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="#000000">
                      {formatCurrency(order.total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Button
                        size="small"
                        variant={order.paymentMethod === 'card' ? 'contained' : 'outlined'}
                        onClick={() => handlePaymentMethodChange(order.id, 'card')}
                        sx={{ 
                          minWidth: '50px',
                          fontSize: '10px',
                          backgroundColor: order.paymentMethod === 'card' ? '#1e3a8a' : 'transparent',
                          color: order.paymentMethod === 'card' ? 'white' : '#1e3a8a',
                          borderColor: '#1e3a8a',
                          '&:hover': {
                            backgroundColor: order.paymentMethod === 'card' ? '#1e40af' : 'rgba(30, 58, 138, 0.1)'
                          }
                        }}
                      >
                        Card
                      </Button>
                      <Button
                        size="small"
                        variant={order.paymentMethod === 'cash' ? 'contained' : 'outlined'}
                        onClick={() => handlePaymentMethodChange(order.id, 'cash')}
                        sx={{ 
                          minWidth: '50px',
                          fontSize: '10px',
                          backgroundColor: order.paymentMethod === 'cash' ? '#1e3a8a' : 'transparent',
                          color: order.paymentMethod === 'cash' ? 'white' : '#1e3a8a',
                          borderColor: '#1e3a8a',
                          '&:hover': {
                            backgroundColor: order.paymentMethod === 'cash' ? '#1e40af' : 'rgba(30, 58, 138, 0.1)'
                          }
                        }}
                      >
                        Cash
                      </Button>
                      <Button
                        size="small"
                        variant={order.paymentMethod === 'other' ? 'contained' : 'outlined'}
                        onClick={() => handlePaymentMethodChange(order.id, 'other')}
                        sx={{ 
                          minWidth: '50px',
                          fontSize: '10px',
                          backgroundColor: order.paymentMethod === 'other' ? '#1e3a8a' : 'transparent',
                          color: order.paymentMethod === 'other' ? 'white' : '#1e3a8a',
                          borderColor: '#1e3a8a',
                          '&:hover': {
                            backgroundColor: order.paymentMethod === 'other' ? '#1e40af' : 'rgba(30, 58, 138, 0.1)'
                          }
                        }}
                      >
                        Other
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm ? 'No sales orders found matching your search.' : 'No sales orders found. Create your first sales order!'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Order Dialog */}
      <Dialog 
        open={showOrderDialog} 
        onClose={() => setShowOrderDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#000000', color: 'white', fontWeight: 'bold' }}>
          {editingOrder ? 'Edit Sales Order' : 'Create New Sales Order'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID *"
                value={newOrder.employeeId}
                onChange={(e) => setNewOrder({ ...newOrder, employeeId: e.target.value })}
                error={!newOrder.employeeId}
                helperText={!newOrder.employeeId ? 'Employee ID is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={newOrder.paymentMethod}
                  onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.name} - ${option.phoneNumber}`}
                value={customers.find(c => c.id === newOrder.customerId) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setNewOrder({
                      ...newOrder,
                      customerId: newValue.id,
                      customerName: newValue.name
                    });
                  } else {
                    setNewOrder({
                      ...newOrder,
                      customerId: '',
                      customerName: ''
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer *"
                    error={!newOrder.customerId}
                    helperText={!newOrder.customerId ? 'Customer selection is required' : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount"
                type="number"
                value={newOrder.total}
                onChange={(e) => setNewOrder({ ...newOrder, total: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Order Notes"
                multiline
                rows={3}
                value={newOrder.notes}
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                placeholder="Additional notes or special instructions..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setShowOrderDialog(false);
              setEditingOrder(null);
              resetNewOrder();
            }}
            sx={{ color: '#666666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddOrder}
            disabled={loading || !newOrder.employeeId || !newOrder.customerId}
            sx={{
              backgroundColor: '#000000',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            {editingOrder ? 'Update Sales Order' : 'Create Sales Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#000000', color: 'white', fontWeight: 'bold' }}>
          Sales Order Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Sales Order Information
                    </Typography>
                    <Typography><strong>Order Number:</strong> {selectedOrder.orderNumber}</Typography>
                    <Typography><strong>Status:</strong> 
                      <Chip 
                        label={selectedOrder.status} 
                        color={getStatusColor(selectedOrder.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography><strong>Date:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt.toDate()).toLocaleDateString() : 'N/A'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Customer & Staff
                    </Typography>
                    <Typography><strong>Customer:</strong> {selectedOrder.customerName}</Typography>
                    <Typography><strong>Employee ID:</strong> {selectedOrder.employeeId}</Typography>
                    <Typography><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Cash'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Sales Order Summary
                    </Typography>
                    <Typography><strong>Total Amount:</strong> {formatCurrency(selectedOrder.total)}</Typography>
                    {selectedOrder.notes && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Notes:</Typography>
                        <Typography>{selectedOrder.notes}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowDetailsDialog(false)}
            sx={{ color: '#666666' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
