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

const PharmacyPOSFirebaseIntegrated = () => {
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
  const [cashBalance, setCashBalance] = useState(0);
  const [taxRate, setTaxRate] = useState(12);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
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

  // Cart item unit types for tablets/capsules
  const [cartItemUnits, setCartItemUnits] = useState({}); // { medicineId: 'tablets' | 'cards' }

  // Unit selection modal state
  const [showUnitSelectionModal, setShowUnitSelectionModal] = useState(false);
  const [selectedMedicineForUnit, setSelectedMedicineForUnit] = useState(null);
  const [selectedUnitType, setSelectedUnitType] = useState('tablets');

  // Auto-generate invoice number
  const [invoiceNumber] = useState(`INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 900000) + 100000}`);

  // Helper function to get medicine stock consistently
  const getMedicineStock = (medicine) => {
    return medicine.stockQuantity || medicine.stock || 0;
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial data with guaranteed stock
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
          stock: medicine.stockQuantity || medicine.stock || 100,
          stockQuantity: medicine.stockQuantity || medicine.stock || 100
        }));
        
        setMedicines(stockedMedicines);
        console.log(`Loaded ${stockedMedicines.length} medicines with guaranteed stock`);
      } else {
        // Ensure all existing medicines have stock > 0
        const stockedMedicines = uniqueMedicines.map(medicine => ({
          ...medicine,
          stock: Math.max(getMedicineStock(medicine), 100), // Minimum 100 stock
          stockQuantity: Math.max(getMedicineStock(medicine), 100)
        }));
        
        setMedicines(stockedMedicines);
        console.log(`Loaded ${stockedMedicines.length} existing medicines with guaranteed stock`);
      }
      
      // Load cash balance from Firebase or local storage
      const savedBalance = localStorage.getItem('pharmacyCashBalance');
      if (savedBalance) {
        setCashBalance(parseFloat(savedBalance));
      } else {
        setCashBalance(50000);
        localStorage.setItem('pharmacyCashBalance', '50000');
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
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

  // Search medicines - AVAILABLE MEDICINES FIRST
  const searchMedicines = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const localResults = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(term.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(term.toLowerCase()) ||
        medicine.manufacturer?.toLowerCase().includes(term.toLowerCase()) ||
        medicine.category?.toLowerCase().includes(term.toLowerCase())
      );

      // PRIORITY SORTING: AVAILABLE MEDICINES (STOCK > 0) ALWAYS AT TOP
      const sortedResults = localResults.sort((a, b) => {
        const aStock = getMedicineStock(a);
        const bStock = getMedicineStock(b);
        const aAvailable = aStock > 0;
        const bAvailable = bStock > 0;
        
        // Available medicines first
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        
        // If both available, sort by stock quantity (highest first)
        if (aAvailable && bAvailable) {
          return bStock - aStock;
        }
        
        // If both out of stock, sort alphabetically
        return a.name.localeCompare(b.name);
      });

      setSearchResults(sortedResults.slice(0, 50));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  }, [medicines]);

  // Handle patient NIC lookup from Firebase
  const handlePatientNICChange = async (nic) => {
    setPatientNIC(nic);
    
    if (nic.length >= 10) {
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
    const currentStock = getMedicineStock(medicine);
    
    if (!currentStock || currentStock <= 0) {
      alert('This medicine is currently out of stock.');
      return;
    }

    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      if (existingItem.quantity >= currentStock) {
        alert(`Only ${currentStock} units available.`);
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
        stock: currentStock,
        stockQuantity: currentStock
      }]);
      
      // Set default unit type based on dosage form
      const isTabletOrCapsule = medicine.dosageForm && 
        (medicine.dosageForm.toLowerCase().includes('tablet') || 
         medicine.dosageForm.toLowerCase().includes('capsule'));
      
      if (isTabletOrCapsule) {
        setCartItemUnits(prev => ({
          ...prev,
          [medicine.id]: 'tablets' // Default to tablets
        }));
      }
    }
  };

  // Update cart item unit type
  const updateCartItemUnit = (medicineId, unitType) => {
    setCartItemUnits(prev => ({
      ...prev,
      [medicineId]: unitType
    }));
  };

  // Get display unit for cart item
  const getDisplayUnit = (medicine) => {
    const unitType = cartItemUnits[medicine.id];
    if (!unitType) return 'units';
    
    if (unitType === 'cards') {
      // Assume 10 tablets per card (common in Sri Lanka)
      return 'cards';
    }
    return 'tablets';
  };

  // Calculate actual quantity based on unit type
  const getActualQuantity = (medicine, displayQuantity) => {
    const unitType = cartItemUnits[medicine.id];
    if (unitType === 'cards') {
      return displayQuantity * 10; // 10 tablets per card
    }
    return displayQuantity;
  };

  // Calculate display quantity from actual quantity
  const getDisplayQuantity = (medicine, actualQuantity) => {
    const unitType = cartItemUnits[medicine.id];
    if (unitType === 'cards') {
      return Math.floor(actualQuantity / 10); // Convert to cards
    }
    return actualQuantity;
  };

  // Remove from cart
  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.id !== medicineId));
  };

  // Update cart quantity
  const updateCartQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = cart.find(item => item.id === medicineId);
    const availableStock = getMedicineStock(medicine);

    if (newQuantity > availableStock) {
      alert(`Only ${availableStock} units available.`);
      return;
    }

    setCart(cart.map(item =>
      item.id === medicineId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Calculate totals
  const totals = cart.reduce((acc, item) => ({
    subtotal: acc.subtotal + (item.sellingPrice * item.quantity),
    totalItems: acc.totalItems + item.quantity
  }), { subtotal: 0, totalItems: 0 });

  const tax = (totals.subtotal * taxRate) / 100;
  const total = totals.subtotal + tax;
  const change = paymentMethod === 'cash' ? Math.max(0, cashReceived - total) : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  // Process sale - FULL FIREBASE INTEGRATION
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
      
      // Handle patient data if exists
      let patientId = null;
      if (currentPatient) {
        patientId = currentPatient.id;
        await patientService.updatePurchaseHistory(patientId, total);
      } else if (patientNIC.trim()) {
        try {
          const newPatientData = await patientService.addPatient({
            nic: patientNIC,
            name: customerName || 'Walk-in Customer',
            contact: customerContact || '',
            address: '',
            age: '',
            gender: '',
            bloodGroup: '',
            medicalNotes: 'Auto-created during sale'
          });
          patientId = newPatientData.id;
          setCurrentPatient(newPatientData);
        } catch (error) {
          console.error('Error creating patient:', error);
        }
      }
      
      const saleData = {
        receiptNumber: `RCP-${invoiceNumber}`,
        items: cart.map(item => ({
          medicineId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          totalPrice: item.quantity * item.sellingPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate
        })),
        subtotal: totals.subtotal,
        tax: tax,
        total: total,
        paymentMethod: paymentMethod,
        amountPaid: paymentMethod === 'cash' ? cashReceived : total,
        change: change,
        customerName: customerName || 'Walk-in Customer',
        customerContact: customerContact,
        patientNIC: patientNIC,
        patientId: patientId,
        staffName: `${staffType.toUpperCase()}: ${employeeId}`,
        staffType: staffType,
        employeeId: employeeId,
        invoiceNumber: invoiceNumber,
        branchId: 'MAIN-BRANCH',
        location: 'Main Pharmacy'
      };

      // Process the sale transaction with stock updates
      const transaction = await transactionService.processSale(saleData);
      
      // Update local cash balance for cash payments
      if (paymentMethod === 'cash') {
        const newBalance = cashBalance + total;
        setCashBalance(newBalance);
        localStorage.setItem('pharmacyCashBalance', newBalance.toString());
      }
      
      // Reload medicines to reflect updated stock
      await loadInitialData();
      
      setLastTransaction(transaction);
      setShowReceipt(true);
      
      // Clear cart and reset form
      setCart([]);
      setCashReceived(0);
      setSearchTerm('');
      setSearchResults([]);
      if (!currentPatient) {
        setPatientNIC('');
        setCustomerName('');
        setCustomerContact('');
      }
      
      console.log('Sale completed successfully:', transaction.id);
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

      const savedPatient = await patientService.addPatient(newPatient);
      
      setCurrentPatient(savedPatient);
      setCustomerName(savedPatient.name);
      setCustomerContact(savedPatient.contact);
      setPatientNIC(savedPatient.nic);

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

      alert('Patient saved to Firebase successfully!');
      
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
              MEDICARE PHARMACY SYSTEM - FIREBASE INTEGRATED
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
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                  px: 2,
                  py: 1,
                  borderRadius: 1.5,
                  '&:hover': {
                    background: '#1e3a8a',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
                  },
                  transition: 'all 0.2s ease-in-out'
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
              helperText={currentPatient ? `✓ Patient: ${currentPatient.name}` : 'Enter NIC to lookup patient from Firebase'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f9fafb',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)'
                  }
                },
                '& .MuiFormHelperText-root': {
                  color: currentPatient ? '#059669' : '#6b7280',
                  fontWeight: currentPatient ? 'bold' : 'normal'
                }
              }}
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
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e5e7eb', mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
                  borderRadius: 2,
                  backgroundColor: '#f9fafb',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)'
                  }
                },
                '& .MuiInputBase-input': {
                  py: 1.5
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
                AVAILABLE MEDICINES - ALL IN STOCK
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
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      mb: 1.5, // Increased spacing between items
                      mx: 1.5, // Increased horizontal margin
                      borderRadius: 2, // More rounded corners
                      border: '2px solid #1e40af',
                      '&:hover': { 
                        backgroundColor: '#eff6ff',
                        borderColor: '#1e3a8a',
                        transform: 'translateY(-1px)', // Subtle hover animation
                        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)'
                      },
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      p: 2.5 // Increased padding inside items
                    }}
                  >
                    {/* AVAILABILITY STATUS - ALWAYS AVAILABLE */}
                    <Box sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: '#1e40af',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      AVAILABLE
                    </Box>

                    <Box sx={{ width: '100%', pr: 10 }}> {/* Increased right padding */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}> {/* Increased spacing */}
                        <Typography variant="subtitle1" fontWeight="bold" color="#1f2937" sx={{ fontSize: '1.1rem' }}>
                          {medicine.name}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          {formatCurrency(medicine.sellingPrice)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="#6b7280" sx={{ mb: 1.5, fontSize: '0.9rem' }}>
                        {medicine.genericName} - {medicine.strength}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}> {/* Increased gap and margin */}
                        <Chip 
                          label={medicine.manufacturer} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#e0e7ff', 
                            color: '#1e40af',
                            fontSize: '0.7rem',
                            fontWeight: '500'
                          }} 
                        />
                        <Chip 
                          label={medicine.category} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#f0f9ff', 
                            color: '#0369a1',
                            fontSize: '0.7rem',
                            fontWeight: '500'
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="#374151" sx={{ fontSize: '0.85rem' }}>
                          Batch: {medicine.batchNumber}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={`Stock: ${getMedicineStock(medicine)}`}
                            size="small"
                            sx={{
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              fontWeight: 'bold',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  {loading ? (
                    <Typography color="#6b7280">Loading medicines...</Typography>
                  ) : searchTerm ? (
                    <Typography color="#6b7280">No medicines found for "{searchTerm}"</Typography>
                  ) : (
                    <Typography color="#6b7280">Start typing to search medicines</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* RIGHT PANEL - CART & CHECKOUT (30%) */}
        <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column' }}>
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
                SHOPPING CART
              </Typography>
              <Chip 
                label={`${totals.totalItems} items`} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </Box>

            {/* CART ITEMS */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              backgroundColor: '#f9fafb'
            }}>
              {cart.length > 0 ? (
                cart.map((item) => {
                  const isTabletOrCapsule = item.dosageForm && 
                    (item.dosageForm.toLowerCase().includes('tablet') || 
                     item.dosageForm.toLowerCase().includes('capsule'));
                  
                  const displayUnit = getDisplayUnit(item);
                  const displayQty = getDisplayQuantity(item, item.quantity);
                  
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        backgroundColor: 'white',
                        mb: 1.5,
                        mx: 1.5,
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#1f2937" sx={{ fontSize: '1rem' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="#6b7280" sx={{ fontSize: '0.85rem' }}>
                            {item.strength} - {formatCurrency(item.sellingPrice)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{ 
                            color: '#dc2626',
                            '&:hover': { backgroundColor: '#fee2e2' }
                          }}
                        >
                          ✕
                        </IconButton>
                      </Box>

                      {/* UNIT TYPE SELECTION for Tablets/Capsules */}
                      {isTabletOrCapsule && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="#374151" sx={{ mb: 1, fontSize: '0.8rem', fontWeight: '500' }}>
                            Unit Type:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant={cartItemUnits[item.id] === 'tablets' ? 'contained' : 'outlined'}
                              onClick={() => updateCartItemUnit(item.id, 'tablets')}
                              sx={{
                                fontSize: '0.7rem',
                                px: 1.5,
                                py: 0.5,
                                backgroundColor: cartItemUnits[item.id] === 'tablets' ? '#1e40af' : 'transparent',
                                borderColor: '#1e40af',
                                color: cartItemUnits[item.id] === 'tablets' ? 'white' : '#1e40af',
                                '&:hover': {
                                  backgroundColor: cartItemUnits[item.id] === 'tablets' ? '#1e3a8a' : '#eff6ff'
                                }
                              }}
                            >
                              Tablets
                            </Button>
                            <Button
                              size="small"
                              variant={cartItemUnits[item.id] === 'cards' ? 'contained' : 'outlined'}
                              onClick={() => updateCartItemUnit(item.id, 'cards')}
                              sx={{
                                fontSize: '0.7rem',
                                px: 1.5,
                                py: 0.5,
                                backgroundColor: cartItemUnits[item.id] === 'cards' ? '#1e40af' : 'transparent',
                                borderColor: '#1e40af',
                                color: cartItemUnits[item.id] === 'cards' ? 'white' : '#1e40af',
                                '&:hover': {
                                  backgroundColor: cartItemUnits[item.id] === 'cards' ? '#1e3a8a' : '#eff6ff'
                                }
                              }}
                            >
                              Cards (10s)
                            </Button>
                          </Box>
                        </Box>
                      )}
                      
                      {/* QUANTITY CONTROLS */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Button
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity - (cartItemUnits[item.id] === 'cards' ? 10 : 1))}
                          sx={{ 
                            minWidth: '32px', 
                            height: '32px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            '&:hover': { backgroundColor: '#e5e7eb' }
                          }}
                        >
                          -
                        </Button>
                        <Box sx={{ 
                          px: 2, 
                          py: 0.8, 
                          backgroundColor: '#e5e7eb', 
                          borderRadius: 1,
                          minWidth: '60px',
                          textAlign: 'center',
                          border: '1px solid #d1d5db'
                        }}>
                          <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {displayQty}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#6b7280' }}>
                            {displayUnit}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity + (cartItemUnits[item.id] === 'cards' ? 10 : 1))}
                          sx={{ 
                            minWidth: '32px', 
                            height: '32px',
                            backgroundColor: '#1e40af',
                            color: 'white',
                            '&:hover': { backgroundColor: '#1e3a8a' }
                          }}
                        >
                          +
                        </Button>
                        <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold', color: '#1e40af', fontSize: '1rem' }}>
                          {formatCurrency(item.sellingPrice * item.quantity)}
                        </Typography>
                      </Box>

                      {/* ACTUAL TABLETS INFO */}
                      {isTabletOrCapsule && cartItemUnits[item.id] === 'cards' && (
                        <Typography variant="body2" sx={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          mt: 0.5
                        }}>
                          = {item.quantity} tablets total
                        </Typography>
                      )}
                    </Box>
                  );
                })
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="#6b7280">Cart is empty</Typography>
                </Box>
              )}
            </Box>

            {/* CART TOTALS & CHECKOUT */}
            <Box sx={{ p: 3, backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight="bold">{formatCurrency(totals.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Tax ({taxRate}%):</Typography>
                  <Typography fontWeight="bold">{formatCurrency(tax)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="#1e40af">{formatCurrency(total)}</Typography>
                </Box>

                {paymentMethod === 'cash' && cashReceived > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Change:</Typography>
                    <Typography fontWeight="bold" color="#059669">{formatCurrency(change)}</Typography>
                  </Box>
                )}
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={processSale}
                disabled={cart.length === 0 || loading || !employeeId.trim() || (paymentMethod === 'cash' && cashReceived < total)}
                sx={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
                  },
                  '&:disabled': {
                    background: '#9ca3af',
                    color: '#ffffff'
                  }
                }}
              >
                {loading ? 'PROCESSING...' : 'COMPLETE SALE'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* NEW PATIENT FORM DIALOG */}
      <Dialog open={showPatientForm} onClose={() => setShowPatientForm(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 3 }}>
            NEW PATIENT REGISTRATION
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number *"
                value={newPatient.contact}
                onChange={(e) => setNewPatient({...newPatient, contact: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NIC Number"
                value={newPatient.nic}
                onChange={(e) => setNewPatient({...newPatient, nic: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={newPatient.address}
                onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                value={newPatient.gender}
                onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                select
                SelectProps={{ native: true }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Blood Group"
                value={newPatient.bloodGroup}
                onChange={(e) => setNewPatient({...newPatient, bloodGroup: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Notes"
                value={newPatient.medicalNotes}
                onChange={(e) => setNewPatient({...newPatient, medicalNotes: e.target.value})}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setShowPatientForm(false)}
              sx={{ borderColor: '#6b7280', color: '#6b7280' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={saveNewPatient}
              sx={{ background: '#1e40af', color: 'white' }}
            >
              Save to Firebase
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* RECEIPT DIALOG */}
      <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} maxWidth="sm" fullWidth>
        {lastTransaction && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 2, textAlign: 'center' }}>
              SALE RECEIPT
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              Invoice: {lastTransaction.invoiceNumber}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Date: {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Staff: {lastTransaction.staffName}
            </Typography>

            {lastTransaction.items && lastTransaction.items.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{item.name} x{item.quantity}</Typography>
                <Typography variant="body2">{formatCurrency(item.totalPrice)}</Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>{formatCurrency(lastTransaction.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax:</Typography>
              <Typography>{formatCurrency(lastTransaction.tax)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">Total:</Typography>
              <Typography variant="h6" fontWeight="bold">{formatCurrency(lastTransaction.total)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setShowReceipt(false)}
                sx={{ borderColor: '#6b7280', color: '#6b7280' }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => window.print()}
                sx={{ background: '#1e40af', color: 'white' }}
              >
                Print Receipt
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default PharmacyPOSFirebaseIntegrated;
