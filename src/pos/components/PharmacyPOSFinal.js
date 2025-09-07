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

const PharmacyPOSFinal = () => {
  // State variables
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [patientNIC, setPatientNIC] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [staffType, setStaffType] = useState('employee');
  const [cashReceived, setCashReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [showCashBalance, setShowCashBalance] = useState(false);
  const [cashBalance] = useState(25000);
  const [taxRate, setTaxRate] = useState(12);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    contact: '',
    nic: '',
    age: '',
    address: '',
    gender: '',
    bloodGroup: '',
    medicalNotes: ''
  });

  // Auto-generate invoice number
  const [invoiceNumber] = useState(`INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 900000) + 100000}`);

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
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchMedicines(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, medicines]);

  // Search medicines - AVAILABLE MEDICINES FIRST
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

      // Sort results: Available medicines (stock > 0) FIRST, then out of stock
      const sortedResults = localResults.sort((a, b) => {
        const aAvailable = a.stock > 0;
        const bAvailable = b.stock > 0;
        
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        
        // If both have same availability, sort by stock quantity (highest first)
        if (aAvailable && bAvailable) {
          return b.stock - a.stock;
        }
        
        return a.name.localeCompare(b.name);
      });

      setSearchResults(sortedResults.slice(0, 50));

      if (localResults.length === 0) {
        const fbMedicines = await medicineService.searchMedicines(term);
        
        // Sort Firebase results the same way
        const sortedFbResults = fbMedicines.sort((a, b) => {
          const aAvailable = a.stock > 0;
          const bAvailable = b.stock > 0;
          
          if (aAvailable && !bAvailable) return -1;
          if (!aAvailable && bAvailable) return 1;
          
          if (aAvailable && bAvailable) {
            return b.stock - a.stock;
          }
          
          return a.name.localeCompare(b.name);
        });
        
        setSearchResults(sortedFbResults.slice(0, 50));
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [medicines]);

  // Add to cart with stock validation
  const addToCart = (medicine) => {
    // Check if medicine is available
    if (!medicine.stock || medicine.stock <= 0) {
      alert('This medicine is currently out of stock and cannot be added to cart.');
      return;
    }

    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      // Check if adding one more would exceed available stock
      if (existingItem.quantity >= medicine.stock) {
        alert(`Cannot add more. Only ${medicine.stock} units available in stock.`);
        return;
      }
      
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...medicine, 
        quantity: 1,
        weight: medicine.weight || 0,
        unit: medicine.unit || 'pcs'
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
      const medicine = medicines.find(m => m.id === medicineId);
      if (medicine && newQuantity > medicine.stock) {
        alert(`Cannot set quantity to ${newQuantity}. Only ${medicine.stock} units available.`);
        return;
      }
      
      setCart(cart.map(item => 
        item.id === medicineId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Calculate totals
  const totals = cart.reduce((acc, item) => {
    const itemTotal = item.quantity * item.sellingPrice;
    return {
      subtotal: acc.subtotal + itemTotal,
      totalWeight: acc.totalWeight + (item.weight * item.quantity),
      totalUnits: acc.totalUnits + item.quantity,
      itemCount: acc.itemCount + 1
    };
  }, { subtotal: 0, totalWeight: 0, totalUnits: 0, itemCount: 0 });

  const tax = totals.subtotal * (taxRate / 100);
  const total = totals.subtotal + tax;
  const change = cashReceived > total ? cashReceived - total : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  // Format weight
  const formatWeight = (weight) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}kg`;
    }
    return `${weight.toFixed(0)}g`;
  };

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add medicines before completing the sale.');
      return;
    }

    if (paymentMethod === 'cash' && cashReceived < total) {
      alert('Insufficient cash received. Please enter the correct amount.');
      return;
    }

    if (!employeeId.trim()) {
      alert('Please enter Employee ID before completing the sale.');
      return;
    }

    try {
      setLoading(true);
      
      const saleData = {
        receiptNumber: `RCP-${invoiceNumber}`,
        items: cart,
        subtotal: totals.subtotal,
        tax: tax,
        total: total,
        paymentMethod: paymentMethod,
        amountPaid: paymentMethod === 'cash' ? cashReceived : total,
        change: change,
        customerName: customerName || 'Walk-in Customer',
        customerContact: customerContact,
        patientNIC: patientNIC,
        staffName: `${staffType.toUpperCase()}: ${employeeId}`,
        staffType: staffType,
        employeeId: employeeId,
        timestamp: new Date().toISOString(),
        invoiceNumber: invoiceNumber
      };

      await transactionService.createTransaction(saleData);
      
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
      setCustomerName('');
      setCustomerContact('');
      
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save new patient function
  const saveNewPatient = async () => {
    try {
      if (!newPatient.name || !newPatient.contact) {
        alert('Please fill in required fields (Name and Contact)');
        return;
      }

      const patientId = `PAT${Date.now()}`;
      const patientData = {
        ...newPatient,
        id: patientId,
        createdAt: new Date().toISOString(),
        createdBy: employeeId || 'system'
      };

      // Update current customer info
      setCustomerName(newPatient.name);
      setCustomerContact(newPatient.contact);
      setPatientNIC(newPatient.nic);

      // Reset form and close dialog
      setNewPatient({
        name: '',
        contact: '',
        nic: '',
        age: '',
        address: '',
        gender: '',
        bloodGroup: '',
        medicalNotes: ''
      });
      setShowPatientForm(false);

      alert('Patient information saved successfully!');
      
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient information. Please try again.');
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* Professional Header - Clean White/Blue Design */}
      <Paper sx={{ 
        p: 3, 
        mb: 2, 
        borderRadius: 0,
<<<<<<< HEAD
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
=======
        background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #60a5fa 100%)',
>>>>>>> SALES
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', letterSpacing: '1px' }}>
              MEDICARE PHARMACY SYSTEM
            </Typography>
            <Chip 
              label={`Invoice: ${invoiceNumber}`} 
              variant="outlined" 
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                TIME & DATE
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                {currentTime.toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {currentTime.toLocaleTimeString()}
              </Typography>
            </Box>
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
              label={<Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{paymentMethod.toUpperCase()}</Typography>}
            />
          </Box>
        </Box>
      </Paper>

      {/* Main Content - Professional Three Panel Layout */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        gap: 2, 
        px: 2, 
        overflow: 'hidden' 
      }}>
        
        {/* LEFT PANEL - Patient & Staff Information (30%) */}
        <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* Medicine Search Section */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
<<<<<<< HEAD
                backgroundColor: '#3b82f6' 
=======
                backgroundColor: '#1e3a8a' 
>>>>>>> SALES
              }} />
              <Typography variant="h6" fontWeight="bold" color="#1e293b">
                MEDICINE SEARCH
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Search medicines by name, generic, manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  '&:hover': {
                    backgroundColor: '#f1f5f9'
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white'
                  }
                }
              }}
            />
          </Paper>

          {/* Patient Information */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b">
                PATIENT INFORMATION
              </Typography>
              <Button
                onClick={() => setShowPatientForm(true)}
                variant="contained"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontSize: '0.8rem',
                  boxShadow: '0 3px 10px rgba(220, 38, 38, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                + NEW PATIENT
              </Button>
            </Box>
            
            <TextField
              fullWidth
              label="Patient Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Patient NIC Number"
              value={patientNIC}
              onChange={(e) => setPatientNIC(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contact Number"
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
            />
          </Paper>

          {/* Staff Information */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>
              STAFF INFORMATION
            </Typography>
            
            <RadioGroup
              value={staffType}
              onChange={(e) => setStaffType(e.target.value)}
              row
              sx={{ mb: 2 }}
            >
              <FormControlLabel 
                value="employee" 
                control={<Radio sx={{ color: '#1e40af' }} />} 
                label="Employee" 
              />
              <FormControlLabel 
                value="pharmacist" 
                control={<Radio sx={{ color: '#1e40af' }} />} 
                label="Pharmacist" 
              />
            </RadioGroup>
            
            <TextField
              fullWidth
              label="Employee ID *"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              error={!employeeId.trim()}
              helperText={!employeeId.trim() ? "Required field" : ""}
            />
          </Paper>

          {/* Transaction Details */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>
              TRANSACTION DETAILS
            </Typography>
            
            <TextField
              fullWidth
              label="Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="outlined"
              fullWidth
              onClick={() => setShowCashBalance(!showCashBalance)}
              sx={{ 
                mb: 2,
<<<<<<< HEAD
                borderColor: '#3b82f6',
                color: '#3b82f6',
=======
                borderColor: '#1e3a8a',
                color: '#1e3a8a',
>>>>>>> SALES
                '&:hover': {
                  borderColor: '#1e40af',
                  backgroundColor: 'rgba(59, 130, 246, 0.04)'
                }
              }}
            >
              SHOW CASH BALANCE
            </Button>

            {showCashBalance && (
              <Typography variant="h6" color="#10b981" fontWeight="bold" sx={{ textAlign: 'center' }}>
                {formatCurrency(cashBalance)}
              </Typography>
            )}

            {paymentMethod === 'cash' && (
              <TextField
                fullWidth
                label="Cash Received"
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                sx={{ mt: 2 }}
              />
            )}
          </Paper>
        </Box>

        {/* MIDDLE PANEL - Available Medicines Search Results (40%) */}
        <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Search Header */}
            <Box sx={{ 
              p: 2, 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                AVAILABLE MEDICINES
              </Typography>
              <Chip 
                label={`${searchResults.length} found`} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </Box>

            {/* Search Results - Available Medicines First */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              backgroundColor: '#f8fafc'
            }}>
              {searchResults.length > 0 ? (
                searchResults.map((medicine) => (
                  <ListItem
                    key={medicine.id}
                    onClick={() => addToCart(medicine)}
                    sx={{
                      cursor: medicine.stock > 0 ? 'pointer' : 'not-allowed',
                      backgroundColor: medicine.stock > 0 ? 'white' : '#f8f9fa',
                      mb: 1,
                      mx: 1,
                      borderRadius: 2,
                      border: medicine.stock > 0 ? '2px solid #10b981' : '1px solid #e2e8f0',
                      opacity: medicine.stock > 0 ? 1 : 0.5,
                      '&:hover': medicine.stock > 0 ? { 
                        backgroundColor: '#f0fdf4',
                        borderColor: '#059669',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)'
                      } : {},
                      transition: 'all 0.2s ease-in-out',
                      position: 'relative'
                    }}
                  >
                    {/* Availability Badge */}
                    <Box sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: medicine.stock > 0 ? '#10b981' : '#ef4444',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {medicine.stock > 0 ? 'AVAILABLE' : 'OUT OF STOCK'}
                    </Box>

                    <Box sx={{ width: '100%', pr: 8 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">
                          {medicine.name}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                          {formatCurrency(medicine.sellingPrice)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="#64748b" gutterBottom>
                        {medicine.genericName} • {medicine.strength} • {medicine.dosageForm}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          label={`Stock: ${medicine.stock || 0} units`} 
                          size="small" 
                          sx={{
                            backgroundColor: medicine.stock > 10 ? '#dcfce7' : medicine.stock > 0 ? '#fef3c7' : '#fee2e2',
                            color: medicine.stock > 10 ? '#166534' : medicine.stock > 0 ? '#92400e' : '#991b1b',
                            fontSize: '0.65rem',
                            fontWeight: 'bold'
                          }}
                        />
                        <Chip 
                          label={medicine.manufacturer} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', color: '#64748b', borderColor: '#cbd5e1' }}
                        />
                        <Chip 
                          label={medicine.category} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.65rem',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '60%',
                  color: '#64748b'
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Start typing to search medicines
                  </Typography>
                  <Typography variant="body2">
                    Enter medicine name, generic name, or manufacturer
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* RIGHT PANEL - Shopping Cart (30%) */}
        <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Cart Header */}
            <Box sx={{ 
              p: 2, 
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                SHOPPING CART ({cart.length} items | {formatWeight(totals.totalWeight)} | {totals.totalUnits} units)
              </Typography>
            </Box>

            {/* Cart Items */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {cart.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Medicine</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Qty</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Unit</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={`${item.id}-cart`} sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                          '&:hover': { backgroundColor: '#f0f0f0' }
                        }}>
                          <TableCell sx={{ fontSize: '0.75rem', maxWidth: '120px' }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                              {item.strength}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                              size="small"
                              sx={{ 
                                width: '50px',
                                '& input': { textAlign: 'center', fontSize: '0.75rem', p: 0.5 }
                              }}
                              inputProps={{ min: 0 }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.75rem' }}>{item.unit || 'pcs'}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{formatCurrency(item.sellingPrice)}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {formatCurrency(item.quantity * item.sellingPrice)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              onClick={() => removeFromCart(item.id)}
                              sx={{ 
                                minWidth: '30px', 
                                color: '#ef4444',
                                fontSize: '0.7rem',
                                p: 0.5,
                                '&:hover': { backgroundColor: '#fee2e2' }
                              }}
                            >
                              ×
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  textAlign: 'center',
                  color: '#64748b'
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    CART IS EMPTY
                  </Typography>
                  <Typography variant="body2">
                    Search and add medicines to start shopping
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Cart Totals & Checkout */}
            <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Tax ({taxRate}%):</Typography>
                  <Typography variant="body2">{formatCurrency(tax)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Weight:</Typography>
                  <Typography variant="body2">{formatWeight(totals.totalWeight)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="#1e40af">
                    {formatCurrency(total)}
                  </Typography>
                </Box>
                
                {paymentMethod === 'cash' && cashReceived > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Change:</Typography>
                    <Typography variant="body2" color="#10b981" fontWeight="bold">
                      {formatCurrency(change)}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={processSale}
                disabled={cart.length === 0 || loading || !employeeId.trim() || (paymentMethod === 'cash' && cashReceived < total)}
                sx={{
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: 3,
<<<<<<< HEAD
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
=======
                  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e3a8a 100%)',
>>>>>>> SALES
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e'
                  }
                }}
              >
                {loading ? 'PROCESSING TRANSACTION...' : 'COMPLETE SALE'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Patient Form Dialog */}
      <Dialog 
        open={showPatientForm} 
        onClose={() => setShowPatientForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }
        }}
      >
        <Box sx={{ 
<<<<<<< HEAD
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
=======
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
>>>>>>> SALES
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40
            }}>
              <Typography sx={{ color: 'white', fontWeight: 'bold' }}>P</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              ADD NEW PATIENT
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setShowPatientForm(false)}
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            ×
          </IconButton>
        </Box>

        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient Name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                value={newPatient.contact}
                onChange={(e) => setNewPatient({...newPatient, contact: e.target.value})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NIC Number"
                value={newPatient.nic}
                onChange={(e) => setNewPatient({...newPatient, nic: e.target.value})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={newPatient.address}
                onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={newPatient.gender}
                onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                SelectProps={{ native: true }}
                sx={{ mb: 2 }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Blood Group"
                value={newPatient.bloodGroup}
                onChange={(e) => setNewPatient({...newPatient, bloodGroup: e.target.value})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Notes"
                multiline
                rows={3}
                value={newPatient.medicalNotes}
                onChange={(e) => setNewPatient({...newPatient, medicalNotes: e.target.value})}
                placeholder="Any allergies, chronic conditions, or special notes..."
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => setShowPatientForm(false)}
              sx={{ 
                borderColor: '#e0e0e0',
                color: '#666',
                '&:hover': { borderColor: '#ccc', backgroundColor: '#f9f9f9' }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={saveNewPatient}
              disabled={!newPatient.name || !newPatient.contact}
              sx={{ 
<<<<<<< HEAD
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
=======
                background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e3a8a 100%)',
>>>>>>> SALES
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }
              }}
            >
              SAVE PATIENT
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog 
        open={showReceipt} 
        onClose={() => setShowReceipt(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }
        }}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40
            }}>
              <Typography sx={{ color: 'white', fontWeight: 'bold' }}>R</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              DIGITAL RECEIPT
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setShowReceipt(false)}
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            ×
          </IconButton>
        </Box>

        {lastTransaction && (
          <Box sx={{ p: 4, backgroundColor: '#f8fafc' }}>
            {/* Receipt Header */}
            <Box sx={{ textAlign: 'center', mb: 4, pb: 3, borderBottom: '2px solid #e2e8f0' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e40af', mb: 1 }}>
                MEDICARE PHARMACY
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Professional Healthcare Solutions
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                123 Medical Street, Colombo 07 | +94 11 234 5678
              </Typography>
            </Box>

            {/* Transaction Details */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Receipt #:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {lastTransaction.receiptNumber}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Date & Time:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {new Date(lastTransaction.timestamp).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Customer:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {lastTransaction.customerName || 'Walk-in Customer'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Cashier:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {lastTransaction.staffName}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Items */}
            <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lastTransaction.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.sellingPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.quantity * item.sellingPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Totals */}
            <Box sx={{ 
              backgroundColor: 'white', 
              p: 3, 
              borderRadius: 2, 
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">{formatCurrency(lastTransaction.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax ({taxRate}%):</Typography>
                <Typography variant="body1">{formatCurrency(lastTransaction.tax)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>TOTAL:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#059669' }}>
                  {formatCurrency(lastTransaction.total)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Payment Method:</Typography>
                <Typography variant="body1">{lastTransaction.paymentMethod || 'Cash'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Amount Paid:</Typography>
                <Typography variant="body1">{formatCurrency(lastTransaction.amountPaid)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Change:</Typography>
                <Typography variant="body1" sx={{ color: '#059669', fontWeight: 'bold' }}>
                  {formatCurrency(lastTransaction.change)}
                </Typography>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                Thank you for choosing Medicare Pharmacy!
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                For any queries, please contact us at info@medicare.lk
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => window.print()}
                sx={{ 
<<<<<<< HEAD
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
=======
                  borderColor: '#1e3a8a',
                  color: '#1e3a8a',
>>>>>>> SALES
                  '&:hover': { 
                    borderColor: '#1e40af', 
                    backgroundColor: 'rgba(59, 130, 246, 0.04)' 
                  }
                }}
              >
                PRINT RECEIPT
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setShowReceipt(false)}
                sx={{ 
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }
                }}
              >
                DONE
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default PharmacyPOSFinal;
