import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel
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
  const [customerPhone, setCustomerPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [cashReceived, setCashReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  // Helper functions
  const formatCurrency = (amount) => `LKR ${Number(amount).toFixed(2)}`;
  
  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
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
        showAlert('Loading medicines database...', 'info');
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
      showAlert('Error loading data: ' + error.message, 'error');
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
      showAlert('Search error: ' + error.message, 'error');
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
    showAlert(`${medicine.name} added to cart`, 'success');
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
    const tax = 0; // No tax for now
    const discount = 0; // No discount for now
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  };

  const totals = calculateTotals();

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      showAlert('Cart is empty', 'warning');
      return;
    }

    if (!employeeId.trim()) {
      showAlert('Employee ID is required', 'warning');
      return;
    }

    if (paymentMethod === 'cash' && cashReceived < totals.total) {
      showAlert('Insufficient cash received', 'warning');
      return;
    }

    try {
      const saleData = {
        items: cart.map(item => ({
          medicineId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          total: item.sellingPrice * item.quantity
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        discount: totals.discount,
        total: totals.total,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? cashReceived : totals.total,
        change: paymentMethod === 'cash' ? Math.max(0, cashReceived - totals.total) : 0,
        customerPhone: customerPhone || null,
        employeeId,
        timestamp: new Date()
      };

      await transactionService.addTransaction(saleData);
      
      // Update stock for each item
      for (const item of cart) {
        await medicineService.updateStock(item.id, -item.quantity);
      }

      showAlert('Sale completed successfully!', 'success');
      
      // Reset form
      setCart([]);
      setCashReceived(0);
      setCustomerPhone('');
      setEmployeeId('');
      
    } catch (error) {
      showAlert('Error processing sale: ' + error.message, 'error');
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
            <Typography variant="h6">Cash Balance: LKR 1,000.00</Typography>
            <FormControlLabel
              control={<Switch checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.checked ? 'card' : 'cash')} />}
              label={paymentMethod === 'cash' ? 'CASH' : 'CARD'}
            />
          </Box>
        </Box>
      </Paper>

      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.severity} sx={{ m: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, p: 2, overflow: 'hidden' }}>
        
        {/* Left Panel - Search */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {/* Floating Search Bar */}
          <Paper sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <TextField
              fullWidth
              placeholder="🔍 Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '25px',
                  fontSize: '16px',
                  '& fieldset': { border: 'none' }
                }
              }}
            />

            {/* Categories */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  size="small"
                  onClick={() => setSearchTerm(category)}
                  sx={{ 
                    fontSize: '12px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '&:hover': { backgroundColor: 'white', transform: 'scale(1.05)' }
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Search Results */}
          {searchTerm && (
            <Paper sx={{ 
              mt: 2,
              maxHeight: '60vh',
              overflow: 'auto',
              borderRadius: 2
            }}>
              <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
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

          {!searchTerm && (
            <Box sx={{ 
              mt: 4,
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              color: 'white'
            }}>
              <Typography variant="h4" gutterBottom>💊 Search Medicines</Typography>
              <Typography variant="h6">Use the search bar above to find medicines</Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                Try: "Panadol", "Antibiotics", or click a category
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Panel - Cart */}
        <Box sx={{ width: '400px' }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Customer Info */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>Customer Information</Typography>
              <TextField
                fullWidth
                placeholder="Enter customer phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                size="small"
              />
            </Box>

            {/* Shopping Cart */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                Shopping Cart ({cart.length} items)
              </Typography>
              
              <Box sx={{ flex: 1, overflow: 'auto', maxHeight: '300px' }}>
                {cart.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Medicine</TableCell>
                          <TableCell>Qty</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={`${item.id}-cart`}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                size="small"
                                sx={{ width: '60px' }}
                                inputProps={{ min: 0 }}
                              />
                            </TableCell>
                            <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                            <TableCell>{formatCurrency(item.sellingPrice * item.quantity)}</TableCell>
                            <TableCell>
                              <Button 
                                color="error" 
                                size="small"
                                onClick={() => removeFromCart(item.id)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      Cart is empty
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Totals & Checkout */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatCurrency(totals.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax:</Typography>
                  <Typography>{formatCurrency(totals.tax)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">{formatCurrency(totals.total)}</Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Employee ID *"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              />

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
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default PharmacyPOSClean;
