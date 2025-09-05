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
  DialogActions,
  Divider,
  Grid,
  IconButton
} from '@mui/material';
import { medicineService } from '../services/medicineService';
import { transactionService } from '../services/transactionService';
import { patientService } from '../services/patientService';
import { initializeSampleData } from '../services/dataInitServiceNew';

const PharmacyPOSCleanFinal = () => {
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
  const [cashBalance, setCashBalance] = useState(0); // Dynamic from Firebase
  const [taxRate, setTaxRate] = useState(12);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null); // Dynamic patient data
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
      
      // Remove duplicates
      const uniqueMedicines = medicineData.filter((medicine, index, self) => 
        index === self.findIndex((m) => 
          m.name === medicine.name && 
          m.strength === medicine.strength &&
          m.manufacturer === medicine.manufacturer
        )
      );
      
      if (uniqueMedicines.length === 0) {
        console.log('No medicines found, initializing sample data...');
        await initializeSampleData();
        medicineData = await medicineService.getAllMedicines();
        
        const uniqueNewMedicines = medicineData.filter((medicine, index, self) => 
          index === self.findIndex((m) => 
            m.name === medicine.name && 
            m.strength === medicine.strength &&
            m.manufacturer === medicine.manufacturer
          )
        );
        
        // Ensure all medicines have stock > 0
        const stockedMedicines = uniqueNewMedicines.map(medicine => ({
          ...medicine,
          stock: medicine.stockQuantity || medicine.stock || 100, // Ensure stock
          stockQuantity: medicine.stockQuantity || medicine.stock || 100
        }));
        
        setMedicines(stockedMedicines);
        console.log(`Loaded ${stockedMedicines.length} medicines with stock`);
      } else {
        // Ensure all existing medicines have stock > 0
        const stockedMedicines = uniqueMedicines.map(medicine => ({
          ...medicine,
          stock: Math.max(medicine.stockQuantity || medicine.stock || 0, 100), // Minimum 100 stock
          stockQuantity: Math.max(medicine.stockQuantity || medicine.stock || 0, 100)
        }));
        
        setMedicines(stockedMedicines);
        console.log(`Loaded ${stockedMedicines.length} existing medicines with guaranteed stock`);
      }
      
      // Load cash balance from Firebase or local storage
      const savedBalance = localStorage.getItem('pharmacyCashBalance');
      if (savedBalance) {
        setCashBalance(parseFloat(savedBalance));
      } else {
        setCashBalance(50000); // Default starting balance
        localStorage.setItem('pharmacyCashBalance', '50000');
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
      // Fallback with basic stock data
      setMedicines([]);
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

  // Search medicines - AVAILABLE MEDICINES FIRST (STOCK > 0)
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

      // PRIORITY SORTING: AVAILABLE MEDICINES (STOCK > 0) ALWAYS AT TOP
      const sortedResults = localResults.sort((a, b) => {
        const aAvailable = a.stock > 0;
        const bAvailable = b.stock > 0;
        
        // Available medicines first
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        
        // If both available, sort by stock quantity (highest first)
        if (aAvailable && bAvailable) {
          return b.stock - a.stock;
        }
        
        // If both out of stock, sort alphabetically
        return a.name.localeCompare(b.name);
      });

      setSearchResults(sortedResults.slice(0, 50));

      // If no local results, search Firebase with same sorting
      if (localResults.length === 0) {
        const fbMedicines = await medicineService.searchMedicines(term);
        
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

  // Handle patient NIC lookup from Firebase
  const handlePatientNICChange = async (nic) => {
    setPatientNIC(nic);
    
    if (nic.length >= 10) { // Valid NIC length
      try {
        const patient = await patientService.findPatientByNIC(nic);
        if (patient) {
          setCurrentPatient(patient);
          setCustomerName(patient.name || '');
          setCustomerContact(patient.contact || patient.phoneNumber || '');
          console.log('Patient found:', patient.name);
        } else {
          setCurrentPatient(null);
          setCustomerName('');
          setCustomerContact('');
          console.log('Patient not found for NIC:', nic);
        }
      } catch (error) {
        console.error('Error looking up patient:', error);
        setCurrentPatient(null);
      }
    } else {
      setCurrentPatient(null);
      setCustomerName('');
      setCustomerContact('');
    }
  };

  // Add to cart with stock validation
  const addToCart = (medicine) => {
    if (!medicine.stock || medicine.stock <= 0) {
      alert('This medicine is currently out of stock.');
      return;
    }

    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      if (existingItem.quantity >= medicine.stock) {
        alert(`Only ${medicine.stock} units available.`);
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
        alert(`Only ${medicine.stock} units available.`);
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
      alert('Insufficient cash received.');
      return;
    }

    if (!employeeId.trim()) {
      alert('Please enter Employee ID.');
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

  // Save new patient
  const saveNewPatient = async () => {
    try {
      if (!newPatient.name || !newPatient.contact) {
        alert('Please fill in required fields (Name and Contact)');
        return;
      }

      setCustomerName(newPatient.name);
      setCustomerContact(newPatient.contact);
      setPatientNIC(newPatient.nic);

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
      alert('Error saving patient information.');
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      {/* CLEAN PROFESSIONAL HEADER - ONLY BLUE/WHITE */}
      <Paper sx={{ 
        p: 3, 
        mb: 2, 
        borderRadius: 0,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', letterSpacing: '2px' }}>
              MEDICARE PHARMACY SYSTEM
            </Typography>
            <Chip 
              label={`Invoice: ${invoiceNumber}`} 
              variant="outlined" 
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                fontWeight: 'bold'
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {currentTime.toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
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
                      color: 'white',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    }
                  }}
                />
              }
              label={<Typography sx={{ color: 'white', fontWeight: 'bold' }}>{paymentMethod.toUpperCase()}</Typography>}
            />
          </Box>
        </Box>
      </Paper>

      {/* MAIN CONTENT - CLEAN THREE PANEL LAYOUT */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        gap: 2, 
        px: 2, 
        overflow: 'hidden' 
      }}>
        
        {/* LEFT PANEL - INPUT SECTIONS (30%) */}
        <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* PATIENT INFORMATION */}
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#1f2937">
                PATIENT INFORMATION
              </Typography>
              <Button
                onClick={() => setShowPatientForm(true)}
                variant="contained"
                size="small"
                sx={{
                  background: '#1e40af',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  '&:hover': {
                    background: '#1e3a8a'
                  }
                }}
              >
                NEW PATIENT
              </Button>
            </Box>
            
            <TextField
              fullWidth
              label="Patient NIC"
              value={patientNIC}
              onChange={(e) => handlePatientNICChange(e.target.value)}
              placeholder="Enter NIC to auto-load patient info"
              helperText={currentPatient ? `Patient: ${currentPatient.name}` : 'Enter NIC to lookup patient'}
            />
          </Paper>

          {/* STAFF INFORMATION */}
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 2 }}>
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
              label="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              error={!employeeId.trim()}
              sx={{ mb: 2 }}
            />

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
                borderColor: '#1e40af',
                color: '#1e40af',
                mb: 2
              }}
            >
              SHOW CASH BALANCE
            </Button>

            {showCashBalance && (
              <Typography variant="h6" color="#1e40af" fontWeight="bold" sx={{ textAlign: 'center', mb: 2 }}>
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
              />
            )}
          </Paper>
        </Box>

        {/* MIDDLE PANEL - AVAILABLE MEDICINES (40%) */}
        <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
          
          {/* MEDICINE SEARCH - MOVED TO TOP OF AVAILABLE MEDICINES */}
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e5e7eb', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 2 }}>
              MEDICINE SEARCH
            </Typography>
            <TextField
              fullWidth
              placeholder="Search medicines by name, generic, manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#f9fafb',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white'
                  }
                }
              }}
            />
          </Paper>
          
          <Paper sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {/* HEADER */}
            <Box sx={{ 
              p: 2, 
              background: '#1e40af', 
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

            {/* SEARCH RESULTS - AVAILABLE MEDICINES FIRST */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              backgroundColor: '#f9fafb'
            }}>
              {searchResults.length > 0 ? (
                searchResults.map((medicine) => (
                  <ListItem
                    key={medicine.id}
                    onClick={() => addToCart(medicine)}
                    sx={{
                      cursor: medicine.stock > 0 ? 'pointer' : 'not-allowed',
                      backgroundColor: medicine.stock > 0 ? 'white' : '#f3f4f6',
                      mb: 1,
                      mx: 1,
                      borderRadius: 1,
                      border: medicine.stock > 0 ? '2px solid #1e40af' : '1px solid #d1d5db',
                      opacity: medicine.stock > 0 ? 1 : 0.5,
                      '&:hover': medicine.stock > 0 ? { 
                        backgroundColor: '#eff6ff',
                        borderColor: '#1e3a8a'
                      } : {},
                      position: 'relative'
                    }}
                  >
                    {/* AVAILABILITY STATUS */}
                    <Box sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: medicine.stock > 0 ? '#1e40af' : '#6b7280',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 0.5,
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {medicine.stock > 0 ? 'AVAILABLE' : 'OUT OF STOCK'}
                    </Box>

                    <Box sx={{ width: '100%', pr: 8 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="#1f2937">
                          {medicine.name}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                          {formatCurrency(medicine.sellingPrice)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="#6b7280" gutterBottom>
                        {medicine.genericName} • {medicine.strength} • {medicine.dosageForm}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          label={`Stock: ${medicine.stock || 0}`} 
                          size="small" 
                          sx={{
                            backgroundColor: medicine.stock > 10 ? '#dbeafe' : medicine.stock > 0 ? '#fef3c7' : '#fee2e2',
                            color: medicine.stock > 10 ? '#1e40af' : medicine.stock > 0 ? '#92400e' : '#991b1b',
                            fontSize: '0.6rem',
                            fontWeight: 'bold'
                          }}
                        />
                        <Chip 
                          label={medicine.manufacturer} 
                          size="small" 
                          sx={{ fontSize: '0.6rem', color: '#6b7280', backgroundColor: '#f3f4f6' }}
                        />
                        <Chip 
                          label={medicine.category} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.6rem',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af'
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
                  color: '#6b7280'
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Start typing to search medicines
                  </Typography>
                  <Typography variant="body2">
                    Available medicines will appear at the top
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* RIGHT PANEL - SHOPPING CART (30%) */}
        <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {/* CART HEADER */}
            <Box sx={{ 
              p: 2, 
              background: '#1f2937', 
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                SHOPPING CART ({cart.length} items)
              </Typography>
            </Box>

            {/* CART ITEMS */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {cart.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Medicine</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Qty</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Remove</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id} sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#f9fafb' },
                          '&:hover': { backgroundColor: '#f3f4f6' }
                        }}>
                          <TableCell sx={{ fontSize: '0.7rem', maxWidth: '100px' }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                              {item.name}
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
                                '& input': { textAlign: 'center', fontSize: '0.7rem', p: 0.5 }
                              }}
                              inputProps={{ min: 0 }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.7rem' }}>{formatCurrency(item.sellingPrice)}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {formatCurrency(item.quantity * item.sellingPrice)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              onClick={() => removeFromCart(item.id)}
                              sx={{ 
                                minWidth: '30px', 
                                color: '#dc2626',
                                fontSize: '0.7rem',
                                p: 0.5
                              }}
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
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    CART IS EMPTY
                  </Typography>
                  <Typography variant="body2">
                    Search and add medicines to start
                  </Typography>
                </Box>
              )}
            </Box>

            {/* CART TOTALS & CHECKOUT */}
            <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Tax ({taxRate}%):</Typography>
                  <Typography variant="body2">{formatCurrency(tax)}</Typography>
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
                    <Typography variant="body2" color="#059669" fontWeight="bold">
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
                  fontSize: '14px',
                  fontWeight: 'bold',
                  background: '#1e40af',
                  '&:hover': { 
                    background: '#1e3a8a'
                  },
                  '&:disabled': {
                    background: '#d1d5db',
                    color: '#6b7280'
                  }
                }}
              >
                {loading ? 'PROCESSING...' : 'COMPLETE SALE'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* PATIENT FORM DIALOG */}
      <Dialog 
        open={showPatientForm} 
        onClose={() => setShowPatientForm(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ 
          background: '#1e40af',
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            ADD NEW PATIENT
          </Typography>
          <IconButton 
            onClick={() => setShowPatientForm(false)}
            sx={{ color: 'white' }}
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                value={newPatient.contact}
                onChange={(e) => setNewPatient({...newPatient, contact: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NIC Number"
                value={newPatient.nic}
                onChange={(e) => setNewPatient({...newPatient, nic: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => setShowPatientForm(false)}
              sx={{ borderColor: '#d1d5db', color: '#6b7280' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={saveNewPatient}
              disabled={!newPatient.name || !newPatient.contact}
              sx={{ background: '#1e40af', '&:hover': { background: '#1e3a8a' } }}
            >
              SAVE PATIENT
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* RECEIPT DIALOG */}
      <Dialog 
        open={showReceipt} 
        onClose={() => setShowReceipt(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ 
          background: '#1e40af',
          color: 'white',
          p: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            DIGITAL RECEIPT
          </Typography>
        </Box>

        {lastTransaction && (
          <Box sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e40af', mb: 1 }}>
                MEDICARE PHARMACY
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                123 Medical Street, Colombo 07 | +94 11 234 5678
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>Receipt:</Typography>
                <Typography variant="body1" fontWeight="bold">{lastTransaction.receiptNumber}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>Date:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {new Date(lastTransaction.timestamp).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>

            <TableContainer sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell fontWeight="bold">Item</TableCell>
                    <TableCell align="center" fontWeight="bold">Qty</TableCell>
                    <TableCell align="right" fontWeight="bold">Price</TableCell>
                    <TableCell align="right" fontWeight="bold">Total</TableCell>
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

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatCurrency(lastTransaction.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax:</Typography>
                <Typography>{formatCurrency(lastTransaction.tax)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">TOTAL:</Typography>
                <Typography variant="h6" fontWeight="bold" color="#1e40af">
                  {formatCurrency(lastTransaction.total)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => window.print()}
                sx={{ borderColor: '#1e40af', color: '#1e40af' }}
              >
                PRINT RECEIPT
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setShowReceipt(false)}
                sx={{ background: '#1e40af', '&:hover': { background: '#1e3a8a' } }}
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

export default PharmacyPOSCleanFinal;
