import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import { medicineService } from '../services/medicineService';
import { transactionService } from '../services/transactionService';
import { initializeSampleData } from '../services/dataInitService';

const PharmacyPOSClean = () => {
  // State variables
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerNIC, setCustomerNIC] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [staffType, setStaffType] = useState('employee'); // 'employee' or 'pharmacist'
  const [cashReceived, setCashReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [showCashBalance, setShowCashBalance] = useState(false);
  const [taxRate, setTaxRate] = useState(0.05); // 5% default tax
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Helper functions
  const formatCurrency = (amount) => `LKR ${Number(amount).toFixed(2)}`;
  
  // Generate invoice number
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `INV-${year}${month}${day}-${time}-${random}`;
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Get unique medicines only
      let medicineData = await medicineService.getAllMedicines();
      
      // Remove duplicates based on name and strength
      const uniqueMedicines = medicineData.filter((medicine, index, self) => 
        index === self.findIndex((m) => 
          m.name === medicine.name && 
          m.strength === medicine.strength &&
          m.manufacturer === medicine.manufacturer
        )
      );
      
      if (uniqueMedicines.length === 0) {
        await initializeSampleData();
        medicineData = await medicineService.getAllMedicines();
        
        // Remove duplicates again
        const uniqueNewMedicines = medicineData.filter((medicine, index, self) => 
          index === self.findIndex((m) => 
            m.name === medicine.name && 
            m.strength === medicine.strength &&
            m.manufacturer === medicine.manufacturer
          )
        );
        setMedicines(uniqueNewMedicines);
      } else {
        setMedicines(uniqueMedicines);
      }
      
      // Extract categories
      const uniqueCategories = [...new Set(uniqueMedicines.map(med => med.category))].filter(Boolean);
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search medicines
  const searchMedicines = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await medicineService.searchMedicines(term);
      // Remove duplicates from search results
      const uniqueResults = results.filter((medicine, index, self) => 
        index === self.findIndex((m) => 
          m.name === medicine.name && 
          m.strength === medicine.strength &&
          m.manufacturer === medicine.manufacturer
        )
      );
      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchMedicines(searchTerm);
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchTerm, searchMedicines]);

  // Cart functions
  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.id !== medicineId));
  };

  const updateQuantity = (medicineId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
    } else {
      setCart(cart.map(item => 
        item.id === medicineId ? { ...item, quantity } : item
      ));
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const tax = subtotal * taxRate;
    const discount = 0; // No discount for now
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  };

  const totals = calculateTotals();

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      return;
    }

    if (!employeeId.trim()) {
      return;
    }

    if (paymentMethod === 'cash' && cashReceived < totals.total) {
      return;
    }

    try {
      const invoiceNo = generateInvoiceNumber();
      const currentDateTime = new Date();
      
      const saleData = {
        invoiceNumber: invoiceNo,
        items: cart.map(item => ({
          medicineId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          total: item.sellingPrice * item.quantity
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        taxRate: taxRate,
        discount: totals.discount,
        total: totals.total,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? cashReceived : totals.total,
        change: paymentMethod === 'cash' ? Math.max(0, cashReceived - totals.total) : 0,
        customerNIC: customerNIC || null,
        employeeId,
        staffType,
        date: currentDateTime.toLocaleDateString('en-CA'), // YYYY-MM-DD format
        time: currentDateTime.toLocaleTimeString('en-GB', { hour12: false }), // HH:MM:SS format
        timestamp: currentDateTime
      };

      await transactionService.addTransaction(saleData);
      
      // Update stock for each item
      for (const item of cart) {
        await medicineService.updateStock(item.id, -item.quantity);
      }

      // Reset form
      setCart([]);
      setCashReceived(0);
      setCustomerNIC('');
      setEmployeeId('');
      setStaffType('employee');
      setInvoiceNumber('');
      
    } catch (error) {
      console.error('Error processing sale:', error);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 0
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            🏥 PHARMACY POS SYSTEM
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" color="textSecondary">
              Invoice: {invoiceNumber} | {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </Typography>
            <FormControlLabel
              control={<Switch checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.checked ? 'card' : 'cash')} />}
              label={paymentMethod === 'cash' ? 'CASH' : 'CARD'}
            />
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        gap: 2, 
        p: 2, 
        overflow: 'hidden',
        '@media (max-width: 1200px)': {
          flexDirection: 'column',
          gap: 1,
        }
      }}>
        
        {/* Left Panel - Search */}
        <Box sx={{ flex: '0 1 55%', maxWidth: '55%', position: 'relative' }}>
          {/* Floating Search Bar */}
          <Paper sx={{ 
            p: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            mb: 1
          }}>
            <TextField
              fullWidth
              placeholder="🔍 Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                mb: 0.5,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '30px',
                  fontSize: '16px',
                  padding: '4px 16px',
                  '& fieldset': { border: 'none' },
                  '&:hover': { backgroundColor: 'white' },
                  '&.Mui-focused': { 
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(255,255,255,0.3)'
                  }
                }
              }}
            />
          </Paper>

          {/* Search Results */}
          {searchTerm && (
            <Paper sx={{ 
              mt: 2,
              maxHeight: '65vh',
              overflow: 'auto',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                p: 1.5, 
                borderBottom: 1, 
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                fontWeight: 'bold',
                color: '#495057',
                fontSize: '1.1rem'
              }}>
                Search Results for "{searchTerm}"
              </Typography>
              {searchResults.length > 0 ? (
                <List dense>
                  {searchResults.map((medicine) => (
                    <ListItem
                      key={`${medicine.id}-${medicine.name}-${medicine.strength}`}
                      onClick={() => addToCart(medicine)}
                      sx={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {medicine.name}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {formatCurrency(medicine.sellingPrice)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {medicine.genericName} | {medicine.strength} | {medicine.dosageForm}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
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
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary">
                    No medicines found for "{searchTerm}"
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Box>

        {/* Right Panel - Cart */}
        <Box sx={{ flex: '0 1 45%', minWidth: '500px', maxWidth: '45%' }}>
          <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            
            {/* Customer Info - Fixed Top */}
            <Box sx={{ 
              flexShrink: 0,
              p: 1.5, 
              borderBottom: 1, 
              borderColor: 'divider', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' 
            }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="#495057" sx={{ mb: 1, fontSize: '1.1rem' }}>Customer & Transaction Details</Typography>
              
              {/* Invoice Number Display */}
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  label="Invoice Number"
                  value={invoiceNumber || generateInvoiceNumber()}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Date"
                  value={currentTime.toLocaleDateString('en-CA')}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ flex: 0.7 }}
                />
                <TextField
                  label="Time"
                  value={currentTime.toLocaleTimeString('en-GB', { hour12: false })}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ flex: 0.7 }}
                />
              </Box>
              
              {/* Customer NIC */}
              <TextField
                fullWidth
                label="Patient NIC Number"
                placeholder="Enter patient NIC number"
                value={customerNIC}
                onChange={(e) => setCustomerNIC(e.target.value)}
                size="small"
                sx={{ mb: 1.5 }}
              />
              
              {/* Tax Configuration */}
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  label="Tax Rate (%)"
                  type="number"
                  value={taxRate * 100}
                  onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant={showCashBalance ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setShowCashBalance(!showCashBalance)}
                  sx={{ minWidth: '140px' }}
                >
                  {showCashBalance ? 'Hide Balance' : 'Show Cash Balance'}
                </Button>
              </Box>
              
              {/* Cash Balance Display */}
              {showCashBalance && (
                <Box sx={{ 
                  p: 1.5, 
                  mb: 1.5, 
                  backgroundColor: 'white', 
                  borderRadius: 2, 
                  border: '1px solid #e0e0e0',
                  textAlign: 'center'
                }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    Cash Balance: {formatCurrency(cashReceived > 0 ? cashReceived - totals.total : 0)}
                  </Typography>
                </Box>
              )}
              
              {/* Staff Information */}
              <Typography variant="subtitle2" fontWeight="bold" color="#495057" sx={{ mb: 1 }}>Staff Information</Typography>
              
              {/* Staff Type Selection */}
              <RadioGroup
                row
                value={staffType}
                onChange={(e) => setStaffType(e.target.value)}
                sx={{ mb: 1 }}
              >
                <FormControlLabel 
                  value="employee" 
                  control={<Radio size="small" />} 
                  label="Employee" 
                  sx={{ mr: 3 }}
                />
                <FormControlLabel 
                  value="pharmacist" 
                  control={<Radio size="small" />} 
                  label="Pharmacist" 
                />
              </RadioGroup>
              
              {/* Staff ID Input */}
              <TextField
                fullWidth
                label={`${staffType === 'pharmacist' ? 'Pharmacist' : 'Employee'} ID *`}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                size="small"
                placeholder={`Enter ${staffType === 'pharmacist' ? 'pharmacist' : 'employee'} ID number`}
              />
            </Box>

            {/* Shopping Cart - Scrollable Middle */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography variant="h6" sx={{ 
                flexShrink: 0,
                p: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                Shopping Cart ({cart.length} items)
              </Typography>
              
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#fafafa',
                '&::-webkit-scrollbar': {
                  width: '12px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#555',
                  }
                },
              }}>
                {cart.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: '40%', fontSize: '0.875rem', fontWeight: 'bold' }}>Medicine</TableCell>
                          <TableCell sx={{ width: '12%', fontSize: '0.875rem', fontWeight: 'bold' }}>Qty</TableCell>
                          <TableCell sx={{ width: '22%', fontSize: '0.875rem', fontWeight: 'bold' }}>Price</TableCell>
                          <TableCell sx={{ width: '22%', fontSize: '0.875rem', fontWeight: 'bold' }}>Total</TableCell>
                          <TableCell sx={{ width: '4%', fontSize: '0.875rem', fontWeight: 'bold' }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={`${item.id}-cart`} sx={{ 
                            '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                            '&:hover': { backgroundColor: '#f0f0f0' }
                          }}>
                            <TableCell sx={{ fontSize: '0.875rem' }}>{item.name}</TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                size="small"
                                sx={{ width: '45px' }}
                                inputProps={{ min: 0, style: { textAlign: 'center', fontSize: '0.875rem' } }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.875rem' }}>{formatCurrency(item.sellingPrice)}</TableCell>
                            <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{formatCurrency(item.sellingPrice * item.quantity)}</TableCell>
                            <TableCell>
                              <Button 
                                color="error" 
                                size="small"
                                variant="text"
                                onClick={() => removeFromCart(item.id)}
                                sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}
                              >
                                ❌
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: 'white',
                    border: '2px dashed #ddd',
                    borderRadius: 2,
                    m: 2
                  }}>
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                      🛒 Cart is empty
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Search and add medicines to start shopping
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Totals & Checkout - Fixed Bottom */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider', 
              background: '#fafafa' 
            }}>
              <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="500">Subtotal:</Typography>
                  <Typography fontWeight="500">{formatCurrency(totals.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="500">Tax:</Typography>
                  <Typography fontWeight="500">{formatCurrency(totals.tax)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight="bold" color="primary">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">{formatCurrency(totals.total)}</Typography>
                </Box>
              </Box>

              {paymentMethod === 'cash' && (
                <TextField
                  fullWidth
                  type="number"
                  label="Cash Received"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}

              {paymentMethod === 'cash' && cashReceived > 0 && (
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Change: {formatCurrency(Math.max(0, cashReceived - totals.total))}
                </Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={processSale}
                disabled={cart.length === 0 || loading}
                sx={{ 
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e'
                  }
                }}
              >
                {loading ? '💫 Processing...' : '🛒 COMPLETE SALE'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default PharmacyPOSClean;
