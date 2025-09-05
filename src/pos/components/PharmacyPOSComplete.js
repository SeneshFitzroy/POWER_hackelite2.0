import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Card,
  CardContent,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  Search,
  ShoppingCart,
  Person,
  Receipt,
  LocalPharmacy,
  AccountBalance,
  CreditCard,
  Money,
  Clear,
  QrCodeScanner,
  Print,
  Save
} from '@mui/icons-material';

import { medicineService } from '../services/medicineService';
import { patientService } from '../services/patientService';
import { transactionService } from '../services/transactionService';
import { employeeService } from '../services/employeeService';
import { initializeSampleData } from '../services/dataInitService';
import {
  calculateTransactionTotal,
  generateTransactionId,
  generateReceiptNumber,
  formatCurrency
} from '../utils/pharmacyUtils';

const PharmacyPOSComplete = () => {
  // State Management
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState(0);
  const [cashBalance, setCashBalance] = useState(0); // Will be loaded from Firebase
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [isPrescriptionRequired, setIsPrescriptionRequired] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load initial data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load medicines
      let medicineData = await medicineService.getAllMedicines();
      
      // If no medicines found, initialize sample data
      if (medicineData.length === 0) {
        showAlert('No data found. Initializing sample data...', 'info');
        await initializeSampleData();
        medicineData = await medicineService.getAllMedicines();
      }
      
      setMedicines(medicineData);
      setSearchResults(medicineData.slice(0, 20));
      
      // Extract categories from medicines
      const uniqueCategories = [...new Set(medicineData.map(med => med.category))].filter(Boolean);
      setCategories(uniqueCategories);
      
      // Load employees
      const employeeData = await employeeService.getAllEmployees();
      setEmployees(employeeData);
      
      // Load cash balance from local storage or set default
      const savedBalance = localStorage.getItem('pharmacyCashBalance');
      setCashBalance(savedBalance ? parseFloat(savedBalance) : 0);
      
    } catch (error) {
      showAlert('Error loading initial data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Search medicines
  const searchMedicines = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults(medicines.slice(0, 20));
      return;
    }

    try {
      const results = await medicineService.searchMedicines(term);
      setSearchResults(results);
    } catch (error) {
      showAlert('Search error: ' + error.message, 'error');
    }
  }, [medicines]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchMedicines(searchTerm);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, searchMedicines]);

  // Add medicine to cart
  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item.medicineId === medicine.id);
    
    if (existingItem) {
      updateQuantity(medicine.id, existingItem.quantity + 1);
    } else {
      const cartItem = {
        medicineId: medicine.id,
        medicineName: medicine.name,
        unitPrice: medicine.sellingPrice,
        quantity: 1,
        discount: 0,
        taxRate: medicine.taxRate || 0,
        prescriptionRequired: medicine.prescriptionRequired || false,
        stockQuantity: medicine.stockQuantity
      };
      setCart([...cart, cartItem]);
    }

    // Check if any prescription medicine is added
    if (medicine.prescriptionRequired) {
      setIsPrescriptionRequired(true);
    }

    showAlert(`${medicine.name} added to cart`, 'success');
  };

  // Update quantity
  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    setCart(cart.map(item => 
      item.medicineId === medicineId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (medicineId) => {
    const updatedCart = cart.filter(item => item.medicineId !== medicineId);
    setCart(updatedCart);
    
    // Check if any prescription medicines remain
    const hasPrescription = updatedCart.some(item => item.prescriptionRequired);
    setIsPrescriptionRequired(hasPrescription);
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setIsPrescriptionRequired(false);
    setDiscount(0);
    showAlert('Cart cleared', 'info');
  };

  // Calculate totals
  const calculateTotals = () => {
    return calculateTransactionTotal(cart, discount, discountType);
  };

  // Search customer
  const searchCustomer = async () => {
    if (!customerPhone.trim()) {
      setCustomer(null);
      return;
    }

    try {
      const customerData = await patientService.searchPatients(customerPhone);
      if (customerData.length > 0) {
        setCustomer(customerData[0]);
        showAlert(`Customer found: ${customerData[0].name}`, 'success');
      } else {
        setCustomer(null);
        showAlert('Customer not found', 'warning');
      }
    } catch (error) {
      showAlert('Error searching customer: ' + error.message, 'error');
    }
  };

  // Process checkout
  const processCheckout = async () => {
    if (cart.length === 0) {
      showAlert('Cart is empty', 'warning');
      return;
    }

    if (!employeeId.trim()) {
      showAlert('Employee ID is required', 'warning');
      return;
    }

    if (isPrescriptionRequired && !registrationNumber.trim()) {
      showAlert('Pharmacy registration number required for prescription medicines', 'warning');
      return;
    }

    const totals = calculateTotals();

    if (paymentMethod === 'cash') {
      if (cashReceived < totals.total) {
        showAlert(`Insufficient cash. Required: ${formatCurrency(totals.total)}`, 'warning');
        return;
      }
    }

    setLoading(true);

    try {
      // Verify employee
      const employee = await employeeService.verifyEmployee(employeeId);
      if (!employee) {
        showAlert('Invalid employee ID', 'error');
        setLoading(false);
        return;
      }

      // Verify pharmacy registration if needed
      if (isPrescriptionRequired) {
        const registration = await employeeService.verifyPharmacyRegistration(registrationNumber);
        if (!registration) {
          showAlert('Invalid pharmacy registration number', 'error');
          setLoading(false);
          return;
        }
      }

      const transactionData = {
        transactionId: generateTransactionId(),
        receiptNumber: generateReceiptNumber(),
        type: 'sale',
        patientId: customer?.id || null,
        patientPhone: customerPhone || '',
        patientName: customer?.name || '',
        items: cart.map(item => ({
          ...item,
          totalPrice: (item.quantity * item.unitPrice) - (item.discount || 0)
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        discountType,
        taxAmount: totals.tax,
        totalAmount: totals.total,
        paymentMethod,
        paymentDetails: {
          cash: paymentMethod === 'cash' ? cashReceived : 0,
          card: paymentMethod === 'card' ? totals.total : 0,
          change: paymentMethod === 'cash' ? cashReceived - totals.total : 0
        },
        employeeId,
        pharmacyRegistrationNumber: registrationNumber || null,
        prescriptionRequired: isPrescriptionRequired
      };

      const result = await transactionService.processSale(transactionData);
      
      // Update cash balance and save to localStorage
      if (paymentMethod === 'cash') {
        const newBalance = cashBalance + totals.total;
        setCashBalance(newBalance);
        localStorage.setItem('pharmacyCashBalance', newBalance.toString());
      }

      setLastTransaction(result);
      setReceiptDialog(true);
      
      // Clear form
      setCart([]);
      setCustomer(null);
      setCustomerPhone('');
      setDiscount(0);
      setCashReceived(0);
      setIsPrescriptionRequired(false);
      setRegistrationNumber('');
      
      showAlert('Transaction completed successfully!', 'success');

    } catch (error) {
      showAlert('Checkout error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show alert
  const showAlert = (message, severity = 'info') => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 4000);
  };

  // Number pad handler
  const handleNumberPad = (value) => {
    if (value === 'clear') {
      setCashReceived(0);
    } else if (value === 'backspace') {
      setCashReceived(prev => Math.floor(prev / 10));
    } else {
      setCashReceived(prev => prev * 10 + value);
    }
  };

  const totals = calculateTotals();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper sx={{ p: 2, bgcolor: '#1976d2', color: 'white' }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5" fontWeight="bold">
              <LocalPharmacy sx={{ mr: 1, verticalAlign: 'middle' }} />
              PHARMACY POS SYSTEM
            </Typography>
            <Typography variant="caption">
              {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box>
                <Typography variant="h6">
                  Cash Balance: {formatCurrency(cashBalance)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                    onClick={() => {
                      const amount = prompt('Add cash amount:');
                      if (amount && !isNaN(amount)) {
                        const newBalance = cashBalance + parseFloat(amount);
                        setCashBalance(newBalance);
                        localStorage.setItem('pharmacyCashBalance', newBalance.toString());
                        showAlert(`Added ${formatCurrency(parseFloat(amount))} to cash balance`, 'success');
                      }
                    }}
                  >
                    Add Cash
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                    onClick={() => {
                      const amount = prompt('Remove cash amount:');
                      if (amount && !isNaN(amount) && parseFloat(amount) <= cashBalance) {
                        const newBalance = cashBalance - parseFloat(amount);
                        setCashBalance(newBalance);
                        localStorage.setItem('pharmacyCashBalance', newBalance.toString());
                        showAlert(`Removed ${formatCurrency(parseFloat(amount))} from cash balance`, 'info');
                      } else if (parseFloat(amount) > cashBalance) {
                        showAlert('Insufficient cash balance', 'error');
                      }
                    }}
                  >
                    Remove Cash
                  </Button>
                </Box>
              </Box>
              <FormControlLabel
                control={<Switch checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.checked ? 'card' : 'cash')} />}
                label={paymentMethod === 'cash' ? 'CASH' : 'CARD'}
                sx={{ color: 'white' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Alert */}
      {alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)} sx={{ mx: 2, mt: 1 }}>
          {alert.message}
        </Alert>
      )}

      <Grid container sx={{ flex: 1, p: 2, gap: 2 }}>
        {/* Left Panel - Medicine Search & Categories */}
        <Grid xs={12} md={6}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                placeholder="Search medicines by name, generic name, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <QrCodeScanner />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Quick Categories */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>Quick Categories:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      size="small"
                      onClick={() => setSearchTerm(category)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Loading categories...
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Medicine Results */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Loading medicines...</Typography>
                </Box>
              ) : (
                <List dense>
                  {searchResults.length > 0 ? (
                    searchResults.map((medicine) => (
                      <ListItem
                        key={medicine.id}
                        button
                        onClick={() => addToCart(medicine)}
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'primary.light', color: 'white' }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {medicine.name}
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {formatCurrency(medicine.sellingPrice)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {medicine.genericName} | {medicine.strength} | {medicine.dosageForm}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip 
                                  label={medicine.type} 
                                  size="small" 
                                  color={medicine.type === 'Prescription' ? 'error' : 'success'} 
                                />
                                <Chip 
                                  label={`Stock: ${medicine.stockQuantity}`} 
                                  size="small" 
                                  color={medicine.stockQuantity < 10 ? 'warning' : 'default'}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="textSecondary">
                        {searchTerm ? 'No medicines found for your search' : 'No medicines available'}
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Cart & Checkout */}
        <Grid xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            
            {/* Customer Info */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Customer Information</Typography>
              <Grid container spacing={2}>
                <Grid xs={8}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter customer phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid xs={4}>
                  <Button variant="outlined" fullWidth onClick={searchCustomer}>
                    Search
                  </Button>
                </Grid>
              </Grid>
              {customer && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Customer: {customer.name} | Phone: {customer.phoneNumber}
                </Alert>
              )}
            </Paper>

            {/* Cart */}
            <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Shopping Cart ({cart.length} items)</Typography>
                <Button startIcon={<Clear />} onClick={clearCart} color="error">
                  Clear Cart
                </Button>
              </Box>

              <TableContainer sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicine</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.medicineId}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {item.medicineName}
                          </Typography>
                          {item.prescriptionRequired && (
                            <Chip label="Prescription" size="small" color="error" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <ButtonGroup size="small">
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                            >
                              <Remove />
                            </IconButton>
                            <Button disabled>{item.quantity}</Button>
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                            >
                              <Add />
                            </IconButton>
                          </ButtonGroup>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => removeFromCart(item.medicineId)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totals */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography>Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">{formatCurrency(totals.subtotal)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Discount:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right" color="error">-{formatCurrency(totals.discount)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Tax:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">{formatCurrency(totals.tax)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" fontWeight="bold" align="right">
                      {formatCurrency(totals.total)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Payment & Checkout */}
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {/* Employee ID */}
                <Grid xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </Grid>

                {/* Registration Number (if prescription required) */}
                {isPrescriptionRequired && (
                  <Grid xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Pharmacy Registration"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      required
                    />
                  </Grid>
                )}

                {/* Cash Payment */}
                {paymentMethod === 'cash' && (
                  <>
                    <Grid xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Cash Received"
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(Number(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Money /></InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Change"
                        value={formatCurrency(Math.max(0, cashReceived - totals.total))}
                        disabled
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><AccountBalance /></InputAdornment>
                        }}
                      />
                    </Grid>

                    {/* Number Pad */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Quick Amount:</Typography>
                      <Grid container spacing={1}>
                        {[100, 500, 1000, 2000, 5000].map((amount) => (
                          <Grid item key={amount}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setCashReceived(amount)}
                            >
                              {formatCurrency(amount)}
                            </Button>
                          </Grid>
                        ))}
                        <Grid item>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setCashReceived(totals.total)}
                          >
                            Exact
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </>
                )}

                {/* Checkout Button */}
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={processCheckout}
                    disabled={loading || cart.length === 0}
                    startIcon={paymentMethod === 'cash' ? <Money /> : <CreditCard />}
                    sx={{ py: 2 }}
                  >
                    {loading ? 'Processing...' : `Checkout ${formatCurrency(totals.total)}`}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialog} onClose={() => setReceiptDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transaction Complete</DialogTitle>
        <DialogContent>
          {lastTransaction && (
            <Box>
              <Typography variant="h6" gutterBottom>Receipt #{lastTransaction.receiptNumber}</Typography>
              <Typography>Transaction ID: {lastTransaction.transactionId}</Typography>
              <Typography>Date: {new Date().toLocaleString()}</Typography>
              <Typography>Total: {formatCurrency(lastTransaction.totalAmount)}</Typography>
              <Typography>Payment: {lastTransaction.paymentMethod.toUpperCase()}</Typography>
              {lastTransaction.paymentMethod === 'cash' && (
                <>
                  <Typography>Cash Received: {formatCurrency(lastTransaction.paymentDetails.cash)}</Typography>
                  <Typography>Change: {formatCurrency(lastTransaction.paymentDetails.change)}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Print />} onClick={() => window.print()}>
            Print Receipt
          </Button>
          <Button onClick={() => setReceiptDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PharmacyPOSComplete;
