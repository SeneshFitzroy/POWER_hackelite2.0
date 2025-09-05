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
  const [newPatient, setNewPatient] = useState({
    nic: '',
    name: '',
    phone: '',
    address: '',
    age: '',
    gender: ''
  });
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

  // Patient management functions
  const handleAddNewPatient = async () => {
    try {
      // Here you would typically save to a patients collection in Firebase
      console.log('Adding new patient:', newPatient);
      
      // Set the NIC in the main form
      setPatientNIC(newPatient.nic);
      
      // Reset form and close dialog
      setNewPatient({
        nic: '',
        name: '',
        phone: '',
        address: '',
        age: '',
        gender: ''
      });
      setShowPatientForm(false);
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  // Print receipt function
  const printReceipt = () => {
    window.print();
  };

  // Download PDF function
  const downloadPDF = () => {
    // In a real application, you would use a library like jsPDF
    const printContent = document.getElementById('receipt-content');
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

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

      // Store transaction for receipt and show receipt
      setLastTransaction(saleData);
      setShowReceipt(true);

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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Paper sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 0,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              🏥 MEDICARE PHARMACY POS
            </Typography>
            <Chip 
              label={`Invoice: ${invoiceNumber}`} 
              variant="outlined" 
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ color: 'white' }}>
              {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
            </Typography>
            <FormControlLabel
              control={
                <Switch 
                  checked={paymentMethod === 'card'} 
                  onChange={(e) => setPaymentMethod(e.target.checked ? 'card' : 'cash')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#ef4444',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#ef4444',
                    }
                  }}
                />
              }
              label={<Typography sx={{ color: 'white', fontWeight: 'bold' }}>{paymentMethod.toUpperCase()}</Typography>}
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
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            
            {/* Search Section */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2,
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              borderRadius: '8px 8px 0 0'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 1.5, fontWeight: 'bold' }}>
                🔍 Medicine Search
              </Typography>
              <TextField
                fullWidth
                placeholder="Search medicines by name, generic, manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#1e40af' }
                  }
                }}
              />
            </Box>

            {/* Customer Information */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              borderBottom: '1px solid #e2e8f0', 
              background: '#f8fafc' 
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b">
                  👤 Patient Information
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setShowPatientForm(true)}
                  sx={{ 
                    backgroundColor: '#ef4444',
                    '&:hover': { backgroundColor: '#dc2626' },
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    px: 2
                  }}
                >
                  + NEW PATIENT
                </Button>
              </Box>
              <TextField
                fullWidth
                label="Patient NIC Number"
                value={patientNIC}
                onChange={(e) => setPatientNIC(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#1e40af' }
                  }
                }}
              />
            </Box>
            
            {/* Staff Information */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              borderBottom: '1px solid #e2e8f0', 
              background: 'white' 
            }}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 1.5 }}>
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
                  control={<Radio size="small" sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#1e40af' } }} />} 
                  label="Employee" 
                  sx={{ mr: 3 }}
                />
                <FormControlLabel 
                  value="pharmacist" 
                  control={<Radio size="small" sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#1e40af' } }} />} 
                  label="Pharmacist" 
                />
              </RadioGroup>
              
              <TextField
                fullWidth
                label={`${staffType === 'pharmacist' ? 'Pharmacist' : 'Employee'} ID *`}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#1e40af' }
                  }
                }}
              />
            </Box>

            {/* Transaction Details */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              borderBottom: '1px solid #e2e8f0', 
              background: '#f8fafc' 
            }}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 1.5 }}>
                📋 Transaction Details
              </Typography>
              
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#1e40af' }
                  }
                }}
              />
            </Box>

            {/* Cash Balance Button */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              background: 'white' 
            }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowCashBalance(!showCashBalance)}
                sx={{ 
                  mb: 1.5,
                  borderColor: '#3b82f6',
                  color: '#1e40af',
                  '&:hover': {
                    borderColor: '#1e40af',
                    backgroundColor: '#f1f5f9'
                  }
                }}
              >
                {showCashBalance ? 'Hide Balance' : 'Show Cash Balance'}
              </Button>
              
              {showCashBalance && (
                <Box sx={{ 
                  p: 1.5, 
                  backgroundColor: '#dbeafe', 
                  borderRadius: 2, 
                  textAlign: 'center',
                  border: '2px solid #3b82f6'
                }}>
                  <Typography variant="h6" color="#1e40af" fontWeight="bold">
                    Cash Balance: {formatCurrency(cashBalance)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Payment Details */}
            <Box sx={{ 
              flex: 1,
              p: 2, 
              background: '#f8fafc' 
            }}>
              {paymentMethod === 'cash' && (
                <TextField
                  fullWidth
                  type="number"
                  label="Cash Received"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  size="small"
                  sx={{ 
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#1e40af' }
                    }
                  }}
                />
              )}

              {paymentMethod === 'cash' && cashReceived > 0 && (
                <Box sx={{ 
                  p: 1.5, 
                  backgroundColor: '#dcfce7', 
                  borderRadius: 2, 
                  textAlign: 'center',
                  border: '2px solid #22c55e'
                }}>
                  <Typography variant="h6" fontWeight="bold" color="#16a34a">
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
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            
            {/* Search Results Header */}
            <Box sx={{ 
              flexShrink: 0,
              p: 2, 
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: '8px 8px 0 0'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  💊 Available Medicines
                </Typography>
                <Chip 
                  label={`${searchResults.length} found`} 
                  variant="outlined"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }}
                />
              </Box>
              {searchTerm && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                  Search: "{searchTerm}"
                </Typography>
              )}
            </Box>

            {/* Search Results List */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              backgroundColor: '#f8fafc',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f5f9',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e1',
                borderRadius: '4px',
                '&:hover': {
                  background: '#94a3b8',
                }
              },
            }}>
              {searchResults.length > 0 ? (
                searchResults.map((medicine) => (
                  <ListItem
                    key={medicine.id}
                    onClick={() => addToCart(medicine)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      mb: 1,
                      mx: 1,
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      '&:hover': { 
                        backgroundColor: '#f1f5f9',
                        borderColor: '#3b82f6',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">
                          {medicine.name}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                          {formatCurrency(medicine.sellingPrice)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="#64748b" gutterBottom>
                        {medicine.genericName} | {medicine.strength} | {medicine.dosageForm}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          label={`Stock: ${medicine.stock || 0}`} 
                          size="small" 
                          color={medicine.stock > 10 ? "success" : medicine.stock > 0 ? "warning" : "error"} 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        <Chip 
                          label={medicine.manufacturer} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', color: '#64748b' }}
                        />
                        <Chip 
                          label={medicine.category} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af'
                          }}
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
