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
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  Search,
  ShoppingCart,
  Person,
  Receipt,
  Warning,
  QrCodeScanner,
  LocalPharmacy
} from '@mui/icons-material';

import { medicineService } from '../../pos/services/medicineService';
import { patientService } from '../../pos/services/patientService';
import { transactionService } from '../../pos/services/transactionService';
import { employeeService } from '../../pos/services/employeeService';
import { prescriptionService } from '../../pos/services/prescriptionService';

import {
  calculateTransactionTotal,
  generateTransactionId,
  generateReceiptNumber,
  validatePrescriptionSale,
  checkBasicInteractions,
  formatCurrency
} from '../../pos/utils/pharmacyUtils';

const PharmacyPOS = () => {
  // State management
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [patient, setPatient] = useState(null);
  const [patientPhone, setPatientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  
  // Dialog states
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [employeeVerification, setEmployeeVerification] = useState('');
  const [pharmacyRegistration, setPharmacyRegistration] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  
  // Transaction calculations
  const [transactionTotals, setTransactionTotals] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });

  // Load medicines on component mount
  useEffect(() => {
    loadMedicines();
  }, []);

  // Recalculate totals when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      const totals = calculateTransactionTotal(cart);
      setTransactionTotals(totals);
    } else {
      setTransactionTotals({ subtotal: 0, discount: 0, tax: 0, total: 0 });
    }
  }, [cart]);

  // Load all medicines
  const loadMedicines = async () => {
    try {
      setLoading(true);
      const medicineList = await medicineService.getAllMedicines();
      setMedicines(medicineList);
    } catch (error) {
      addAlert('error', 'Failed to load medicines: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Search medicines
  const searchMedicines = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await medicineService.searchMedicines(term);
      setSearchResults(results);
    } catch (error) {
      addAlert('error', 'Search failed: ' + error.message);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMedicines(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchMedicines]);

  // Find patient by phone
  const findPatient = async () => {
    if (!patientPhone || patientPhone.length < 10) {
      addAlert('warning', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      const foundPatient = await patientService.findPatientByPhone(patientPhone);
      
      if (foundPatient) {
        setPatient(foundPatient);
        addAlert('success', `Patient found: ${foundPatient.name}`);
      } else {
        // Offer to create new patient
        const newPatient = {
          phoneNumber: patientPhone,
          name: 'New Customer' // This would typically be filled in a form
        };
        const createdPatient = await patientService.addPatient(newPatient);
        setPatient(createdPatient);
        addAlert('info', 'New patient record created');
      }
    } catch (error) {
      addAlert('error', 'Error finding patient: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add medicine to cart
  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item.medicineId === medicine.id);
    
    if (existingItem) {
      updateCartQuantity(medicine.id, existingItem.quantity + 1);
    } else {
      const cartItem = {
        medicineId: medicine.id,
        medicineName: medicine.name,
        unitPrice: medicine.sellingPrice,
        quantity: 1,
        discount: 0,
        taxRate: medicine.taxRate || 18,
        prescriptionRequired: medicine.prescriptionRequired,
        stockQuantity: medicine.stockQuantity,
        batchNumber: medicine.batchNumber,
        expiryDate: medicine.expiryDate
      };
      
      setCart(prev => [...prev, cartItem]);
    }
    
    // Clear search
    setSearchTerm('');
    setSearchResults([]);
  };

  // Update cart item quantity
  const updateCartQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const item = cart.find(item => item.medicineId === medicineId);
    if (item && newQuantity > item.stockQuantity) {
      addAlert('warning', `Only ${item.stockQuantity} units available in stock`);
      return;
    }

    setCart(prev => 
      prev.map(item => 
        item.medicineId === medicineId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (medicineId) => {
    setCart(prev => prev.filter(item => item.medicineId !== medicineId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setPatient(null);
    setPatientPhone('');
  };

  // Check for prescription requirements and interactions
  const validateSale = () => {
    const validation = validatePrescriptionSale(cart, patient?.age);
    const interactions = checkBasicInteractions(cart);
    
    const allAlerts = [...validation.warnings];
    
    if (interactions.length > 0) {
      interactions.forEach(interaction => {
        allAlerts.push(`Drug Interaction Warning: ${interaction.description}`);
      });
    }
    
    return {
      prescriptionRequired: validation.prescriptionRequired,
      alerts: allAlerts
    };
  };

  // Process checkout
  const processCheckout = async () => {
    if (cart.length === 0) {
      addAlert('warning', 'Cart is empty');
      return;
    }

    if (!employeeVerification) {
      addAlert('error', 'Employee verification is required');
      return;
    }

    try {
      setLoading(true);

      // Verify employee
      const employee = await employeeService.verifyEmployee(employeeVerification);
      if (!employee) {
        addAlert('error', 'Invalid employee ID');
        return;
      }

      // For prescription medicines, verify pharmacy registration
      const validation = validateSale();
      if (validation.prescriptionRequired && !pharmacyRegistration) {
        addAlert('error', 'Pharmacy registration number required for prescription medicines');
        return;
      }

      if (pharmacyRegistration) {
        const pharmacyReg = await employeeService.verifyPharmacyRegistration(pharmacyRegistration);
        if (!pharmacyReg) {
          addAlert('error', 'Invalid pharmacy registration number');
          return;
        }
      }

      // Create transaction
      const transactionData = {
        transactionId: generateTransactionId(),
        receiptNumber: generateReceiptNumber(),
        type: 'sale',
        patientId: patient?.id || null,
        patientPhone: patientPhone || '',
        patientName: patient?.name || 'Walk-in Customer',
        items: cart,
        subtotal: transactionTotals.subtotal,
        discount: transactionTotals.discount,
        taxAmount: transactionTotals.tax,
        totalAmount: transactionTotals.total,
        paymentMethod,
        paymentDetails: {
          [paymentMethod]: parseFloat(amountPaid) || transactionTotals.total,
          change: Math.max(0, (parseFloat(amountPaid) || 0) - transactionTotals.total)
        },
        employeeId: employeeVerification,
        pharmacistId: validation.prescriptionRequired ? employeeVerification : null,
        pharmacyRegistrationNumber: pharmacyRegistration || '',
        prescriptionRequired: validation.prescriptionRequired
      };

      // Process the sale
      const transaction = await transactionService.processSale(transactionData);
      
      addAlert('success', `Sale completed! Receipt: ${transaction.receiptNumber}`);
      
      // Reset form
      clearCart();
      setCheckoutDialog(false);
      setEmployeeVerification('');
      setPharmacyRegistration('');
      setAmountPaid('');
      
    } catch (error) {
      addAlert('error', 'Checkout failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add alert
  const addAlert = (severity, message) => {
    const alert = { id: Date.now(), severity, message };
    setAlerts(prev => [...prev, alert]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 5000);
  };

  // Remove alert
  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Alerts */}
      {alerts.map(alert => (
        <Alert 
          key={alert.id} 
          severity={alert.severity} 
          sx={{ mb: 1 }}
          onClose={() => removeAlert(alert.id)}
        >
          {alert.message}
        </Alert>
      ))}

      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <LocalPharmacy sx={{ mr: 1 }} />
        Pharmacy POS System
      </Typography>

      <Grid container spacing={3}>
        {/* Left Panel - Search and Products */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Medicine Search
            </Typography>
            
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search medicines by name or scan barcode..."
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
              sx={{ mb: 2 }}
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <List>
                {searchResults.map(medicine => (
                  <ListItem
                    key={medicine.id}
                    button
                    onClick={() => addToCart(medicine)}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      mb: 1,
                      borderRadius: 1 
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
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
                            {medicine.genericName} • {medicine.strength}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip 
                              label={medicine.type} 
                              size="small"
                              color={medicine.type === 'Prescription' ? 'error' : 'default'}
                            />
                            <Chip 
                              label={`Stock: ${medicine.stockQuantity}`} 
                              size="small"
                              color={medicine.stockQuantity > 10 ? 'success' : 'warning'}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right Panel - Cart and Checkout */}
        <Grid item xs={12} md={4}>
          {/* Patient Information */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1 }} />
              Patient Information
            </Typography>
            
            <TextField
              fullWidth
              label="Patient Phone Number"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="Enter 10-digit phone number"
              sx={{ mb: 1 }}
            />
            
            <Button
              fullWidth
              variant="outlined"
              onClick={findPatient}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Find Patient
            </Button>

            {patient && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">
                    {patient.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Phone: {patient.phoneNumber}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Purchases: {formatCurrency(patient.totalPurchases || 0)}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>

          {/* Shopping Cart */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCart sx={{ mr: 1 }} />
              Shopping Cart ({cart.length})
            </Typography>

            {cart.length === 0 ? (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                Cart is empty
              </Typography>
            ) : (
              <>
                <List>
                  {cart.map(item => (
                    <ListItem key={item.medicineId} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.medicineName}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.unitPrice * item.quantity)}
                            </Typography>
                            {item.prescriptionRequired && (
                              <Chip 
                                label="Prescription Required" 
                                size="small" 
                                color="error" 
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small"
                          onClick={() => updateCartQuantity(item.medicineId, item.quantity - 1)}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ mx: 1, minWidth: 30, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton 
                          size="small"
                          onClick={() => updateCartQuantity(item.medicineId, item.quantity + 1)}
                        >
                          <Add />
                        </IconButton>
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => removeFromCart(item.medicineId)}
                          sx={{ ml: 1 }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Totals */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCurrency(transactionTotals.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Discount:</Typography>
                    <Typography>-{formatCurrency(transactionTotals.discount)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax:</Typography>
                    <Typography>{formatCurrency(transactionTotals.tax)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(transactionTotals.total)}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={clearCart}
                    sx={{ flex: 1 }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setCheckoutDialog(true)}
                    startIcon={<Receipt />}
                    sx={{ flex: 2 }}
                  >
                    Checkout
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Checkout Dialog */}
      <Dialog 
        open={checkoutDialog} 
        onClose={() => setCheckoutDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Sale</DialogTitle>
        <DialogContent>
          {/* Sale Summary */}
          <Typography variant="h6" gutterBottom>
            Sale Summary
          </Typography>
          <Typography>
            Total Amount: {formatCurrency(transactionTotals.total)}
          </Typography>
          
          {/* Validation Alerts */}
          {(() => {
            const validation = validateSale();
            if (validation.alerts.length > 0) {
              return (
                <Alert severity="warning" sx={{ my: 2 }}>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {validation.alerts.map((alert, index) => (
                      <li key={index}>{alert}</li>
                    ))}
                  </ul>
                </Alert>
              );
            }
            return null;
          })()}

          {/* Payment Method */}
          <Autocomplete
            options={['cash', 'card', 'insurance']}
            value={paymentMethod}
            onChange={(e, newValue) => setPaymentMethod(newValue || 'cash')}
            renderInput={(params) => (
              <TextField {...params} label="Payment Method" margin="normal" fullWidth />
            )}
          />

          {/* Amount Paid */}
          <TextField
            fullWidth
            label="Amount Paid"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            margin="normal"
          />

          {/* Change */}
          {amountPaid && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Change: {formatCurrency(Math.max(0, parseFloat(amountPaid) - transactionTotals.total))}
            </Typography>
          )}

          {/* Employee Verification */}
          <TextField
            fullWidth
            label="Employee ID *"
            value={employeeVerification}
            onChange={(e) => setEmployeeVerification(e.target.value)}
            margin="normal"
            required
          />

          {/* Pharmacy Registration (for prescription medicines) */}
          {validateSale().prescriptionRequired && (
            <TextField
              fullWidth
              label="Pharmacy Registration Number *"
              value={pharmacyRegistration}
              onChange={(e) => setPharmacyRegistration(e.target.value)}
              margin="normal"
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={processCheckout}
            variant="contained"
            disabled={loading || !employeeVerification}
          >
            Complete Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PharmacyPOS;
