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
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  IconButton
} from '@mui/material';
import { medicineService } from '../services/medicineService';
import { transactionService } from '../services/transactionService';
import { initializeSampleData } from '../services/dataInitServiceNew';

const PharmacyPOSProfessional = () => {
  // State variables
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [patientNIC, setPatientNIC] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [staffType, setStaffType] = useState('employee');
  const [cashReceived, setCashReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [showCashBalance, setShowCashBalance] = useState(false);
  const [cashBalance] = useState(25000);
  const [taxRate, setTaxRate] = useState(12); // 12% default tax
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [invoiceNumber] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `INV-${year}${month}${day}-${time}`;
  });

  // Helper functions
  const formatCurrency = (amount) => `LKR ${Number(amount).toFixed(2)}`;
  const formatWeight = (weight) => `${Number(weight).toFixed(2)}g`;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      let medicineData = await medicineService.getAllMedicines();
      
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
      const localResults = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(term.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(term.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(term.toLowerCase()) ||
        medicine.category.toLowerCase().includes(term.toLowerCase())
      );

      setSearchResults(localResults.slice(0, 50));

      if (localResults.length === 0) {
        console.log('Searching Firebase for medicines...');
        const fbMedicines = await medicineService.searchMedicines(term);
        setSearchResults(fbMedicines.slice(0, 50));
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [medicines]);

  useEffect(() => {
    const timeoutId = setTimeout(() => searchMedicines(searchTerm), 300);
    return () => clearTimeout(timeoutId);
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
      setCart([...cart, { 
        ...medicine, 
        quantity: 1,
        weight: medicine.weight || 0, // Add weight support
        unit: medicine.unit || 'pcs' // Add unit support
      }]);
    }
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.id !== medicineId));
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
    } else {
      setCart(cart.map(item => 
        item.id === medicineId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Calculate totals
  const totals = {
    subtotal: cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0),
    get tax() { return this.subtotal * (taxRate / 100); },
    get total() { return this.subtotal + this.tax; },
    get totalWeight() { return cart.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0); },
    get totalUnits() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
  };

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) return;
    if (!employeeId.trim()) return;
    if (paymentMethod === 'cash' && cashReceived < totals.total) return;

    setLoading(true);
    try {
      const saleData = {
        invoiceNumber,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          total: item.sellingPrice * item.quantity,
          weight: item.weight || 0,
          unit: item.unit || 'pcs'
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        taxRate,
        total: totals.total,
        totalWeight: totals.totalWeight,
        totalUnits: totals.totalUnits,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? cashReceived : totals.total,
        change: paymentMethod === 'cash' ? Math.max(0, cashReceived - totals.total) : 0,
        patientNIC: patientNIC || null,
        employeeId,
        staffType,
        timestamp: currentTime,
        date: currentTime.toLocaleDateString(),
        time: currentTime.toLocaleTimeString()
      };

      await transactionService.addTransaction(saleData);
      
      // Update stock for each item
      for (const item of cart) {
        await medicineService.updateStock(item.id, -item.quantity);
      }

      // Reset form
      setCart([]);
      setCashReceived(0);
      setPatientNIC('');
      setEmployeeId('');
      setStaffType('employee');
      
    } catch (error) {
      console.error('Error processing sale:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🏥 PROFESSIONAL PHARMACY POS
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

      {/* Main Content - Three Panel Layout */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        gap: 2, 
        p: 2, 
        overflow: 'hidden'
      }}>
        
        {/* Left Panel - All Input Fields */}
        <Box sx={{ flex: '0 1 30%', minWidth: '350px' }}>
          <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            
            {/* Search Section */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px 12px 0 0'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 1.5, fontWeight: 'bold' }}>
                🔍 Medicine Search
              </Typography>
              <TextField
                fullWidth
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '30px',
                    '& fieldset': { border: 'none' },
                    '&:hover': { backgroundColor: 'white' },
                    '&.Mui-focused': { backgroundColor: 'white' }
                  }
                }}
              />
            </Box>

            {/* Customer Information */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' 
            }}>
              <Typography variant="h6" fontWeight="bold" color="#495057" sx={{ mb: 1.5 }}>
                👤 Customer Information
              </Typography>
              <TextField
                fullWidth
                label="Patient NIC Number"
                value={patientNIC}
                onChange={(e) => setPatientNIC(e.target.value)}
                size="small"
                sx={{ mb: 1.5 }}
              />
            </Box>
            
            {/* Staff Information */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider', 
              background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' 
            }}>
              <Typography variant="h6" fontWeight="bold" color="#495057" sx={{ mb: 1.5 }}>
                👨‍⚕️ Staff Information
              </Typography>
              
              <RadioGroup
                row
                value={staffType}
                onChange={(e) => setStaffType(e.target.value)}
                sx={{ mb: 1.5 }}
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
              
              <TextField
                fullWidth
                label={`${staffType === 'pharmacist' ? 'Pharmacist' : 'Employee'} ID *`}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                size="small"
                sx={{ mb: 1.5 }}
              />
            </Box>

            {/* Transaction Details */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider', 
              background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)' 
            }}>
              <Typography variant="h6" fontWeight="bold" color="#495057" sx={{ mb: 1.5 }}>
                📋 Transaction Details
              </Typography>
              
              <TextField
                fullWidth
                label="Invoice Number"
                value={invoiceNumber}
                size="small"
                disabled
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 1.5 }}
              />
              
              <TextField
                fullWidth
                label="Date & Time"
                value={`${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString()}`}
                size="small"
                disabled
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 1.5 }}
              />
              
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                size="small"
                sx={{ mb: 1.5 }}
              />
            </Box>

            {/* Cash Balance Button */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' 
            }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowCashBalance(!showCashBalance)}
                sx={{ mb: 1.5 }}
              >
                {showCashBalance ? 'Hide Balance' : 'Show Cash Balance'}
              </Button>
              
              {showCashBalance && (
                <Box sx={{ 
                  p: 1.5, 
                  backgroundColor: 'white', 
                  borderRadius: 2, 
                  textAlign: 'center',
                  border: '2px solid #4caf50'
                }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    Cash Balance: {formatCurrency(cashBalance)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Payment Details */}
            <Box sx={{ 
              flex: 1,
              p: 2, 
              background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)' 
            }}>
              {paymentMethod === 'cash' && (
                <TextField
                  fullWidth
                  type="number"
                  label="Cash Received"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  size="small"
                  sx={{ mb: 1.5 }}
                />
              )}

              {paymentMethod === 'cash' && cashReceived > 0 && (
                <Box sx={{ 
                  p: 1.5, 
                  backgroundColor: '#e8f5e8', 
                  borderRadius: 2, 
                  textAlign: 'center' 
                }}>
                  <Typography variant="h6" fontWeight="bold">
                    Change: {formatCurrency(Math.max(0, cashReceived - totals.total))}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Middle Panel - Search Results Display */}
        <Box sx={{ flex: '0 1 40%' }}>
          <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            
            {/* Search Results Header */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
              borderRadius: '12px 12px 0 0'
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                💊 Available Medicines ({searchResults.length})
              </Typography>
            </Box>

            {/* Search Results List */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
            }}>
              {searchResults.length > 0 ? (
                searchResults.map((medicine) => (
                  <ListItem
                    key={medicine.id}
                    onClick={() => addToCart(medicine)}
                    sx={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      '&:hover': { backgroundColor: '#f5f5f5' }
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
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          label={`Stock: ${medicine.stock || 0}`} 
                          size="small" 
                          color={medicine.stock > 10 ? "success" : medicine.stock > 0 ? "warning" : "error"} 
                          variant="outlined" 
                        />
                        <Chip 
                          label={medicine.manufacturer} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={medicine.category} 
                          size="small" 
                          color="info" 
                          variant="outlined" 
                        />
                      </Box>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {searchTerm ? '🔍 No medicines found' : '💊 Start typing to search medicines'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm ? 'Try searching with different keywords' : 'Enter medicine name, generic name, or manufacturer'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Panel - Shopping Cart */}
        <Box sx={{ flex: '0 1 30%', minWidth: '400px' }}>
          <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            
            {/* Cart Header */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              borderRadius: '12px 12px 0 0'
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                🛒 Shopping Cart ({cart.length} items | {formatWeight(totals.totalWeight)} | {totals.totalUnits} units)
              </Typography>
            </Box>

            {/* Cart Items */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
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
                        <TableCell sx={{ fontWeight: 'bold' }}>Medicine</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
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
                              sx={{ width: '60px' }}
                              inputProps={{ min: 0, style: { textAlign: 'center', fontSize: '0.875rem' } }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{item.unit || 'pcs'}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{formatCurrency(item.sellingPrice)}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{formatCurrency(item.sellingPrice * item.quantity)}</TableCell>
                          <TableCell>
                            <Button 
                              color="error" 
                              size="small" 
                              onClick={() => removeFromCart(item.id)}
                              sx={{ minWidth: '30px', fontSize: '0.75rem' }}
                            >
                              ✕
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
                  <Typography fontWeight="500">Tax ({taxRate}%):</Typography>
                  <Typography fontWeight="500">{formatCurrency(totals.tax)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="500">Total Weight:</Typography>
                  <Typography fontWeight="500">{formatWeight(totals.totalWeight)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight="bold" color="primary">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">{formatCurrency(totals.total)}</Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={processSale}
                disabled={cart.length === 0 || loading || !employeeId.trim() || (paymentMethod === 'cash' && cashReceived < totals.total)}
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

export default PharmacyPOSProfessional;
