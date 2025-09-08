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

import { medicineService } from '../services/medicineService';
import { patientService } from '../services/patientService';
import { transactionService } from '../services/transactionService';
import { employeeService } from '../services/employeeService';
import { prescriptionService } from '../services/prescriptionService';

import {
  calculateTransactionTotal,
  generateTransactionId,
  generateReceiptNumber,
  validatePrescriptionSale,
  checkBasicInteractions,
  formatCurrency
} from '../utils/pharmacyUtils';

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
  const [slmcRegNumber, setSlmcRegNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [discountRate, setDiscountRate] = useState(0);
  
  // Transaction calculations
  const [transactionTotals, setTransactionTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    netTotal: 0,
    balance: 0,
    total: 0
  });

  // Load medicines on component mount
  useEffect(() => {
    loadMedicines();
  }, []);

  // Recalculate totals when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const discountAmount = (subtotal * discountRate) / 100;
      const netTotal = subtotal - discountAmount;
      const balance = Math.max(0, (parseFloat(amountPaid) || 0) - netTotal);
      
      setTransactionTotals({
        subtotal,
        discountAmount,
        netTotal,
        balance,
        total: netTotal
      });
    } else {
      setTransactionTotals({ subtotal: 0, discountAmount: 0, netTotal: 0, balance: 0, total: 0 });
    }
  }, [cart, discountRate, amountPaid]);

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

      // For prescription medicines, verify SLMC registration
      const validation = validateSale();
      if (validation.prescriptionRequired && !slmcRegNumber) {
        addAlert('error', 'SLMC Registration Number required for prescription medicines');
        return;
      }

      if (slmcRegNumber && slmcRegNumber.length !== 6) {
        addAlert('error', 'SLMC Registration Number must be 6 digits');
        return;
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
        discountRate: discountRate,
        discountAmount: transactionTotals.discountAmount,
        netTotal: transactionTotals.netTotal,
        totalAmount: transactionTotals.total,
        paymentMethod,
        paymentDetails: {
          [paymentMethod]: parseFloat(amountPaid) || transactionTotals.total,
          balance: transactionTotals.balance
        },
        employeeId: employeeVerification,
        authorizedPersonId: employeeVerification,
        slmcRegistrationNumber: slmcRegNumber || '',
        prescriptionRequired: validation.prescriptionRequired
      };

      // Process the sale
      const transaction = await transactionService.processSale(transactionData);
      
      addAlert('success', `Sale completed! Receipt: ${transaction.receiptNumber}`);
      
      // Reset form
      clearCart();
      setCheckoutDialog(false);
      setEmployeeVerification('');
      setSlmcRegNumber('');
      setAmountPaid('');
      setDiscountRate(0);
      
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
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Alerts */}
      {alerts.map(alert => (
        <Alert 
          key={alert.id} 
          severity={alert.severity} 
          sx={{ mb: 1, borderRadius: 2, boxShadow: 2 }}
          onClose={() => removeAlert(alert.id)}
        >
          {alert.message}
        </Alert>
      ))}

      {/* Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h3" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          <LocalPharmacy sx={{ mr: 2, fontSize: 40 }} />
          Professional Pharmacy POS
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Advanced Point of Sale System for Healthcare
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Panel - Search and Products */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            mb: 2, 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: '#1976d2', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search sx={{ mr: 1 }} />
              Medicine Search & Selection
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
                    <Search sx={{ color: '#1976d2' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton sx={{ color: '#1976d2' }}>
                      <QrCodeScanner />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: 'white',
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {searchResults.map(medicine => (
                  <ListItem
                    key={medicine.id}
                    button
                    onClick={() => addToCart(medicine)}
                    sx={{ 
                      border: '2px solid #e3f2fd', 
                      mb: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#2196f3',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(33, 150, 243, 0.2)'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                            {medicine.name}
                          </Typography>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 'bold',
                            color: '#4caf50',
                            background: 'linear-gradient(45deg, #c8e6c9, #a5d6a7)',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2
                          }}>
                            {formatCurrency(medicine.sellingPrice)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                            {medicine.genericName} • {medicine.strength}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip 
                              label={medicine.type} 
                              size="small"
                              sx={{
                                background: medicine.type === 'Prescription' 
                                  ? 'linear-gradient(45deg, #f44336, #e57373)'
                                  : 'linear-gradient(45deg, #2196f3, #64b5f6)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                            <Chip 
                              label={`Stock: ${medicine.stockQuantity}`} 
                              size="small"
                              sx={{
                                background: medicine.stockQuantity > 10 
                                  ? 'linear-gradient(45deg, #4caf50, #81c784)'
                                  : 'linear-gradient(45deg, #ff9800, #ffb74d)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
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
          <Paper sx={{ 
            p: 3, 
            mb: 2, 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#1976d2',
              fontWeight: 'bold'
            }}>
              <Person sx={{ mr: 1 }} />
              Patient Information
            </Typography>
            
            <TextField
              fullWidth
              label="Patient Phone Number"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="Enter 10-digit phone number"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />
            
            {/* SLMC Registration Number */}
            <TextField
              fullWidth
              label="SLMC REG NUMBER (6 digits)"
              value={slmcRegNumber}
              onChange={(e) => setSlmcRegNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit SLMC number"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />
            
            <Button
              fullWidth
              variant="contained"
              onClick={findPatient}
              disabled={loading}
              sx={{ 
                mb: 2,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2 30%, #1e88e5 90%)',
                  boxShadow: '0 6px 25px rgba(33, 150, 243, 0.4)'
                }
              }}
            >
              Find Patient
            </Button>

            {patient && (
              <Card sx={{ 
                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                border: '2px solid #4caf50',
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.2)'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {patient.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#388e3c', mb: 1 }}>
                    📱 Phone: {patient.phoneNumber}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#388e3c' }}>
                    💰 Total Purchases: {formatCurrency(patient.totalPurchases || 0)}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>

          {/* Shopping Cart */}
          <Paper sx={{ 
            p: 3,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#1976d2',
              fontWeight: 'bold'
            }}>
              <ShoppingCart sx={{ mr: 1 }} />
              Shopping Cart ({cart.length})
            </Typography>

            {cart.length === 0 ? (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                Cart is empty
              </Typography>
            ) : (
              <>
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {cart.map(item => (
                    <ListItem 
                      key={item.medicineId} 
                      sx={{ 
                        px: 0, 
                        py: 1,
                        borderBottom: '1px solid #e0e0e0',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                            {item.medicineName}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                              {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.unitPrice * item.quantity)}
                            </Typography>
                            {item.prescriptionRequired && (
                              <Chip 
                                label="Prescription Required" 
                                size="small" 
                                sx={{
                                  background: 'linear-gradient(45deg, #f44336, #e57373)',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small"
                          onClick={() => updateCartQuantity(item.medicineId, item.quantity - 1)}
                          sx={{ 
                            color: '#f44336',
                            '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.04)' }
                          }}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ 
                          mx: 1, 
                          minWidth: 40, 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          color: '#1976d2'
                        }}>
                          {item.quantity}
                        </Typography>
                        <IconButton 
                          size="small"
                          onClick={() => updateCartQuantity(item.medicineId, item.quantity + 1)}
                          sx={{ 
                            color: '#4caf50',
                            '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.04)' }
                          }}
                        >
                          <Add />
                        </IconButton>
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => removeFromCart(item.medicineId)}
                          sx={{ 
                            ml: 1,
                            '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.04)' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Discount Rate */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Discount Rate (%)"
                    type="number"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#1976d2' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                      }
                    }}
                  />
                </Box>

                {/* Billing Summary - New Order: NET TOTAL, BALANCE, BILL */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '2px solid #1976d2'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">{formatCurrency(transactionTotals.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Discount ({discountRate}%):</Typography>
                    <Typography variant="body2" color="error">-{formatCurrency(transactionTotals.discountAmount)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  
                  {/* NET TOTAL */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>NET TOTAL:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {formatCurrency(transactionTotals.netTotal)}
                    </Typography>
                  </Box>
                  
                  {/* BALANCE */}
                  {amountPaid && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>BALANCE:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                        {formatCurrency(transactionTotals.balance)}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* BILL (Final Amount) */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#c8e6c9', borderRadius: 1, border: '2px solid #4caf50' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>BILL:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                      {formatCurrency(transactionTotals.total)}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={clearCart}
                    sx={{ 
                      flex: 1,
                      borderRadius: 2,
                      borderColor: '#f44336',
                      color: '#f44336',
                      '&:hover': {
                        borderColor: '#d32f2f',
                        backgroundColor: 'rgba(244, 67, 54, 0.04)'
                      }
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setCheckoutDialog(true)}
                    startIcon={<Receipt />}
                    sx={{ 
                      flex: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                      boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                        boxShadow: '0 6px 25px rgba(76, 175, 80, 0.4)'
                      }
                    }}
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          Complete Sale Transaction
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {/* Sale Summary */}
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2, background: 'rgba(255,255,255,0.8)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Sale Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>{formatCurrency(transactionTotals.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Discount ({discountRate}%):</Typography>
              <Typography color="error">-{formatCurrency(transactionTotals.discountAmount)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <Typography variant="h6" color="primary">NET TOTAL:</Typography>
              <Typography variant="h6" color="primary">{formatCurrency(transactionTotals.netTotal)}</Typography>
            </Box>
          </Paper>
          
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
              <TextField 
                {...params} 
                label="Payment Method" 
                margin="normal" 
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
              />
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#1976d2' },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' }
              }
            }}
          />

          {/* Balance Display */}
          {amountPaid && (
            <Paper sx={{ p: 2, mt: 2, borderRadius: 2, background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50' }}>
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                Balance: {formatCurrency(transactionTotals.balance)}
              </Typography>
            </Paper>
          )}

          {/* Authorized Person (Employee) Verification */}
          <TextField
            fullWidth
            label="Authorized Person - Employee ID *"
            value={employeeVerification}
            onChange={(e) => setEmployeeVerification(e.target.value)}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#1976d2' },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' }
              }
            }}
          />

          {/* SLMC Registration (for prescription medicines) */}
          {validateSale().prescriptionRequired && (
            <TextField
              fullWidth
              label="SLMC REG NUMBER (6 digits) *"
              value={slmcRegNumber}
              onChange={(e) => setSlmcRegNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
              margin="normal"
              required
              placeholder="Enter 6-digit SLMC registration number"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, background: 'rgba(255,255,255,0.8)' }}>
          <Button 
            onClick={() => setCheckoutDialog(false)}
            sx={{ 
              borderRadius: 2,
              color: '#f44336',
              '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.04)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={processCheckout}
            variant="contained"
            disabled={loading || !employeeVerification}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                boxShadow: '0 6px 25px rgba(76, 175, 80, 0.4)'
              }
            }}
          >
            Complete Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PharmacyPOS;
