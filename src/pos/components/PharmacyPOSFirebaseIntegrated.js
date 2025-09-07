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
  const [discountRate, setDiscountRate] = useState(0);
  const [slmcRegNumber, setSlmcRegNumber] = useState('');
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

  // Open unit selection modal for medicine
  const openUnitSelectionModal = (medicine) => {
    setSelectedMedicineForUnit(medicine);
    setSelectedUnitType('tablets'); // Default selection
    setShowUnitSelectionModal(true);
  };

  // Handle unit selection and add to cart
  const handleUnitSelectionAndAddToCart = () => {
    if (!selectedMedicineForUnit) return;

    const currentStock = getMedicineStock(selectedMedicineForUnit);
    
    if (!currentStock || currentStock <= 0) {
      alert('This medicine is currently out of stock.');
      setShowUnitSelectionModal(false);
      return;
    }

    const existingItem = cart.find(item => item.id === selectedMedicineForUnit.id);
    if (existingItem) {
      const incrementValue = selectedUnitType === 'cards' ? 10 : 1;
      if (existingItem.quantity + incrementValue > currentStock) {
        alert(`Only ${currentStock} units available.`);
        setShowUnitSelectionModal(false);
        return;
      }

      setCart(cart.map(item =>
        item.id === selectedMedicineForUnit.id
          ? { ...item, quantity: item.quantity + incrementValue }
          : item
      ));
      
      // Update unit type
      setCartItemUnits(prev => ({
        ...prev,
        [selectedMedicineForUnit.id]: selectedUnitType
      }));
    } else {
      const initialQuantity = selectedUnitType === 'cards' ? 10 : 1;
      if (initialQuantity > currentStock) {
        alert(`Only ${currentStock} units available.`);
        setShowUnitSelectionModal(false);
        return;
      }

      setCart([...cart, { 
        ...selectedMedicineForUnit, 
        quantity: initialQuantity, 
        stock: currentStock,
        stockQuantity: currentStock
      }]);
      
      // Set unit type
      setCartItemUnits(prev => ({
        ...prev,
        [selectedMedicineForUnit.id]: selectedUnitType
      }));
    }

    setShowUnitSelectionModal(false);
    setSelectedMedicineForUnit(null);
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

  // Calculate totals with discount
  const totals = cart.reduce((acc, item) => ({
    subtotal: acc.subtotal + (item.sellingPrice * item.quantity),
    totalItems: acc.totalItems + item.quantity
  }), { subtotal: 0, totalItems: 0 });

  const discountAmount = (totals.subtotal * discountRate) / 100;
  const netTotal = totals.subtotal - discountAmount;
  const balance = Math.max(0, (parseFloat(cashReceived) || 0) - netTotal);
  const total = netTotal;

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
        discountRate: discountRate,
        discountAmount: discountAmount,
        netTotal: netTotal,
        total: total,
        paymentMethod: paymentMethod,
        amountPaid: paymentMethod === 'cash' ? cashReceived : total,
        balance: balance,
        customerName: customerName || 'Walk-in Customer',
        customerContact: customerContact,
        patientNIC: patientNIC,
        patientId: patientId,
        staffName: `${staffType.toUpperCase()}: ${employeeId}`,
        staffType: staffType,
        employeeId: employeeId,
        slmcRegNumber: slmcRegNumber,
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
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#ffffff'
    }}>
      {/* PROFESSIONAL HEADER - BLUE AND WHITE ONLY */}
      <Paper sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 0,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ 
              color: 'white', 
              letterSpacing: '1px'
            }}>
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
            <Chip
              label={paymentMethod.toUpperCase()}
              sx={{
                backgroundColor: paymentMethod === 'cash' ? '#16a34a' : '#3b82f6',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                px: 2,
                py: 0.5
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* MAIN CONTENT - CLEAN WHITE LAYOUT */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        gap: 2, 
        px: 2, 
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}>
        
        {/* LEFT PANEL - INPUT SECTIONS (30%) */}
        <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* PATIENT INFORMATION - COMPACT */}
          <Paper sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2' }}>
                PATIENT INFORMATION
              </Typography>
              <Button
                onClick={() => setShowPatientForm(true)}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#1565c0'
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
              size="small"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />

            {/* SLMC REG NUMBER - COMPACT */}
            <TextField
              fullWidth
              label="SLMC REG NUMBER (6 digits)"
              value={slmcRegNumber}
              onChange={(e) => setSlmcRegNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit SLMC number"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />
          </Paper>

          {/* STAFF INFORMATION - COMPACT */}
          <Paper sx={{ 
            p: 2, 
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2', mb: 2 }}>
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
                control={<Radio sx={{ color: '#1976d2' }} />} 
                label={<Typography sx={{ fontWeight: 'bold' }}>Employee</Typography>}
              />
              <FormControlLabel 
                value="pharmacist" 
                control={<Radio sx={{ color: '#1976d2' }} />} 
                label={<Typography sx={{ fontWeight: 'bold' }}>Pharmacist</Typography>}
              />
            </RadioGroup>
            
            <TextField
              fullWidth
              label="Authorized Person - Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              error={!employeeId.trim()}
              size="small"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />

            <TextField
              fullWidth
              label="DISCOUNT RATE (%)"
              type="number"
              value={discountRate}
              onChange={(e) => setDiscountRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              size="small"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />

            {/* Payment Method Selection - COMPACT */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1, color: '#1976d2' }}>
                Payment Method:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentMethod('cash')}
                  size="small"
                  sx={{
                    flex: 1,
                    borderRadius: 1,
                    backgroundColor: paymentMethod === 'cash' ? '#4caf50' : 'transparent',
                    borderColor: '#4caf50',
                    color: paymentMethod === 'cash' ? 'white' : '#4caf50',
                    '&:hover': {
                      backgroundColor: paymentMethod === 'cash' ? '#388e3c' : '#e8f5e8'
                    }
                  }}
                >
                  CASH
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentMethod('card')}
                  size="small"
                  sx={{
                    flex: 1,
                    borderRadius: 1,
                    backgroundColor: paymentMethod === 'card' ? '#2196f3' : 'transparent',
                    borderColor: '#2196f3',
                    color: paymentMethod === 'card' ? 'white' : '#2196f3',
                    '&:hover': {
                      backgroundColor: paymentMethod === 'card' ? '#1976d2' : '#e3f2fd'
                    }
                  }}
                >
                  CARD
                </Button>
              </Box>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={() => setShowCashBalance(!showCashBalance)}
              sx={{ 
                mb: 2,
                borderRadius: 1,
                borderColor: '#1976d2',
                color: '#1976d2'
              }}
            >
              SHOW CASH BALANCE
            </Button>

            {showCashBalance && (
              <Typography variant="h6" sx={{ 
                textAlign: 'center', 
                mb: 2,
                color: '#4caf50',
                fontWeight: 'bold',
                p: 1,
                borderRadius: 1,
                backgroundColor: '#f1f8e9',
                border: '1px solid #4caf50'
              }}>
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
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
              />
            )}
          </Paper>
        </Box>

        {/* MIDDLE PANEL - AVAILABLE MEDICINES (40%) */}
        <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
          
          {/* MEDICINE SEARCH - COMPACT */}
          <Paper sx={{ 
            p: 2, 
            borderRadius: 2, 
            mb: 2,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2', mb: 2 }}>
              MEDICINE SEARCH
            </Typography>
            <TextField
              fullWidth
              placeholder="Search medicines by name, generic, manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />
          </Paper>
          
          <Paper sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* HEADER */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#1976d2', 
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

            {/* SEARCH RESULTS - COMPACT */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              backgroundColor: '#f8f9fa'
            }}>
              {searchResults.length > 0 ? (
                searchResults.map((medicine) => (
                  <ListItem
                    key={medicine.id}
                    onClick={() => openUnitSelectionModal(medicine)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      mb: 1,
                      mx: 1,
                      borderRadius: 1,
                      border: '1px solid #e5e7eb',
                      '&:hover': { 
                        borderColor: '#1976d2',
                        backgroundColor: '#f8f9fa'
                      },
                      transition: 'all 0.2s ease',
                      p: 1.5
                    }}
                  >
                    {/* AVAILABILITY STATUS */}
                    <Box sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: '#4caf50',
                      color: 'white',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.6rem',
                      fontWeight: 'bold'
                    }}>
                      AVAILABLE
                    </Box>

                    <Box sx={{ width: '100%', pr: 8 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1976d2', fontSize: '0.9rem' }}>
                          {medicine.name}
                        </Typography>
                        <Typography variant="h6" sx={{ 
                          color: '#4caf50', 
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          backgroundColor: '#e8f5e8',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1
                        }}>
                          {formatCurrency(medicine.sellingPrice)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="#666" sx={{ mb: 1, fontSize: '0.8rem' }}>
                        {medicine.genericName} - {medicine.strength}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          label={medicine.manufacturer} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            fontSize: '0.65rem',
                            height: '20px'
                          }} 
                        />
                        <Chip 
                          label={medicine.category} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#f3e5f5',
                            color: '#7b1fa2',
                            fontSize: '0.65rem',
                            height: '20px'
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="#666" sx={{ fontSize: '0.75rem' }}>
                          Batch: {medicine.batchNumber}
                        </Typography>
                        <Chip 
                          label={`Stock: ${getMedicineStock(medicine)}`}
                          size="small"
                          sx={{
                            backgroundColor: '#e8f5e8',
                            color: '#4caf50',
                            fontWeight: 'bold',
                            fontSize: '0.65rem',
                            height: '20px'
                          }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  {loading ? (
                    <Typography color="#666">Loading medicines...</Typography>
                  ) : searchTerm ? (
                    <Typography color="#666">No medicines found for "{searchTerm}"</Typography>
                  ) : (
                    <Typography color="#666">Start typing to search medicines</Typography>
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
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* HEADER */}
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', 
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
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
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
                        mb: 2,
                        mx: 2,
                        p: 3,
                        borderRadius: 3,
                        border: '2px solid #e3f2fd',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        '&:hover': {
                          borderColor: '#2196f3',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 20px rgba(33, 150, 243, 0.15)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body1" color="#666" sx={{ mb: 1 }}>
                            {item.strength} - {formatCurrency(item.sellingPrice)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{ 
                            color: '#f44336',
                            '&:hover': { 
                              backgroundColor: 'rgba(244, 67, 54, 0.04)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          ✕
                        </IconButton>
                      </Box>

                      {/* UNIT TYPE SELECTION for Tablets/Capsules */}
                      {isTabletOrCapsule && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: '#666' }}>
                            Unit Type:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant={cartItemUnits[item.id] === 'tablets' ? 'contained' : 'outlined'}
                              onClick={() => updateCartItemUnit(item.id, 'tablets')}
                              sx={{
                                fontSize: '0.8rem',
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                backgroundColor: cartItemUnits[item.id] === 'tablets' ? '#2196f3' : 'transparent',
                                borderColor: '#2196f3',
                                color: cartItemUnits[item.id] === 'tablets' ? 'white' : '#2196f3',
                                '&:hover': {
                                  backgroundColor: cartItemUnits[item.id] === 'tablets' ? '#1976d2' : '#e3f2fd'
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
                                fontSize: '0.8rem',
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                backgroundColor: cartItemUnits[item.id] === 'cards' ? '#2196f3' : 'transparent',
                                borderColor: '#2196f3',
                                color: cartItemUnits[item.id] === 'cards' ? 'white' : '#2196f3',
                                '&:hover': {
                                  backgroundColor: cartItemUnits[item.id] === 'cards' ? '#1976d2' : '#e3f2fd'
                                }
                              }}
                            >
                              Cards (10s)
                            </Button>
                          </Box>
                        </Box>
                      )}
                      
                      {/* QUANTITY CONTROLS */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Button
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity - (cartItemUnits[item.id] === 'cards' ? 10 : 1))}
                          sx={{ 
                            minWidth: '36px', 
                            height: '36px',
                            borderRadius: 2,
                            backgroundColor: '#f44336',
                            color: 'white',
                            '&:hover': { 
                              backgroundColor: '#d32f2f',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          -
                        </Button>
                        <Box sx={{ 
                          px: 3, 
                          py: 1.5, 
                          backgroundColor: '#e3f2fd', 
                          borderRadius: 2,
                          minWidth: '80px',
                          textAlign: 'center',
                          border: '2px solid #2196f3'
                        }}>
                          <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1976d2' }}>
                            {displayQty}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>
                            {displayUnit}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity + (cartItemUnits[item.id] === 'cards' ? 10 : 1))}
                          sx={{ 
                            minWidth: '36px', 
                            height: '36px',
                            borderRadius: 2,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            '&:hover': { 
                              backgroundColor: '#388e3c',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          +
                        </Button>
                        <Typography variant="h6" sx={{ 
                          ml: 'auto', 
                          fontWeight: 'bold', 
                          color: '#4caf50',
                          background: 'linear-gradient(45deg, #c8e6c9, #a5d6a7)',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2
                        }}>
                          {formatCurrency(item.sellingPrice * item.quantity)}
                        </Typography>
                      </Box>

                      {/* ACTUAL TABLETS INFO */}
                      {isTabletOrCapsule && cartItemUnits[item.id] === 'cards' && (
                        <Typography variant="body2" sx={{ 
                          fontSize: '0.8rem', 
                          color: '#666',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          mt: 1,
                          p: 1,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1
                        }}>
                          = {item.quantity} tablets total
                        </Typography>
                      )}
                    </Box>
                  );
                })
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="#666" sx={{ fontSize: '1.1rem' }}>Cart is empty</Typography>
                </Box>
              )}
            </Box>

            {/* BILLING SUMMARY - NEW ORDER: NET TOTAL, BALANCE, BILL */}
            <Box sx={{ p: 3, backgroundColor: 'white', borderTop: '3px solid #2196f3' }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1" fontWeight="bold">{formatCurrency(totals.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Discount ({discountRate}%):</Typography>
                  <Typography variant="body1" fontWeight="bold" color="error">-{formatCurrency(discountAmount)}</Typography>
                </Box>
                
                {/* NET TOTAL */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 2, 
                  p: 2, 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: 2,
                  border: '2px solid #2196f3'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>NET TOTAL:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {formatCurrency(netTotal)}
                  </Typography>
                </Box>

                {/* BALANCE */}
                {paymentMethod === 'cash' && cashReceived > 0 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 2, 
                    p: 2, 
                    backgroundColor: '#f3e5f5', 
                    borderRadius: 2,
                    border: '2px solid #9c27b0'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>BALANCE:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                      {formatCurrency(balance)}
                    </Typography>
                  </Box>
                )}

                {/* BILL (Final Amount) */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 3, 
                  backgroundColor: '#c8e6c9', 
                  borderRadius: 2, 
                  border: '3px solid #4caf50',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>BILL:</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={processSale}
                disabled={cart.length === 0 || loading || !employeeId.trim() || (paymentMethod === 'cash' && cashReceived < total)}
                sx={{
                  background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  py: 2,
                  borderRadius: 3,
                  boxShadow: '0 6px 25px rgba(76, 175, 80, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(76, 175, 80, 0.5)'
                  },
                  '&:disabled': {
                    background: '#9ca3af',
                    color: '#ffffff'
                  },
                  transition: 'all 0.3s ease'
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
              <Typography>Discount ({lastTransaction.discountRate || 0}%):</Typography>
              <Typography color="error">-{formatCurrency(lastTransaction.discountAmount || 0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" fontWeight="bold">NET TOTAL:</Typography>
              <Typography variant="h6" fontWeight="bold">{formatCurrency(lastTransaction.netTotal || lastTransaction.total)}</Typography>
            </Box>
            {lastTransaction.balance > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight="bold">BALANCE:</Typography>
                <Typography fontWeight="bold">{formatCurrency(lastTransaction.balance)}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">BILL:</Typography>
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

      {/* UNIT SELECTION MODAL */}
      <Dialog 
        open={showUnitSelectionModal} 
        onClose={() => setShowUnitSelectionModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          color: 'white',
          p: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            Select Unit Type
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Choose how you want to add this medicine to cart
          </Typography>
        </Box>

        {selectedMedicineForUnit && (
          <Box sx={{ p: 4 }}>
            {/* Medicine Information */}
            <Box sx={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: 2, 
              p: 3, 
              mb: 4,
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 1 }}>
                {selectedMedicineForUnit.name}
              </Typography>
              <Typography variant="body2" color="#6b7280" sx={{ mb: 2 }}>
                {selectedMedicineForUnit.genericName} - {selectedMedicineForUnit.strength}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                  {formatCurrency(selectedMedicineForUnit.sellingPrice)} per unit
                </Typography>
                <Chip 
                  label={`Stock: ${getMedicineStock(selectedMedicineForUnit)}`}
                  size="small"
                  sx={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>

            {/* Unit Selection */}
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 3 }}>
              Select Unit Type:
            </Typography>

            <RadioGroup
              value={selectedUnitType}
              onChange={(e) => setSelectedUnitType(e.target.value)}
              sx={{ mb: 4 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper
                  sx={{
                    p: 3,
                    border: selectedUnitType === 'tablets' ? '2px solid #1e40af' : '2px solid #e5e7eb',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#1e40af',
                      backgroundColor: '#f8fafc'
                    }
                  }}
                  onClick={() => setSelectedUnitType('tablets')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Radio
                        value="tablets"
                        checked={selectedUnitType === 'tablets'}
                        sx={{ 
                          color: '#1e40af',
                          '&.Mui-checked': { color: '#1e40af' }
                        }}
                      />
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" fontWeight="bold" color="#1f2937">
                          Individual Tablets/Capsules
                        </Typography>
                        <Typography variant="body2" color="#6b7280">
                          Add one tablet/capsule at a time
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" fontWeight="bold" color="#1e40af">
                        +1 unit
                      </Typography>
                      <Typography variant="body2" color="#6b7280">
                        {formatCurrency(selectedMedicineForUnit.sellingPrice)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 3,
                    border: selectedUnitType === 'cards' ? '2px solid #1e40af' : '2px solid #e5e7eb',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#1e40af',
                      backgroundColor: '#f8fafc'
                    }
                  }}
                  onClick={() => setSelectedUnitType('cards')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Radio
                        value="cards"
                        checked={selectedUnitType === 'cards'}
                        sx={{ 
                          color: '#1e40af',
                          '&.Mui-checked': { color: '#1e40af' }
                        }}
                      />
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" fontWeight="bold" color="#1f2937">
                          Full Card/Strip
                        </Typography>
                        <Typography variant="body2" color="#6b7280">
                          Add a complete card (10 tablets/capsules)
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" fontWeight="bold" color="#1e40af">
                        +10 units
                      </Typography>
                      <Typography variant="body2" color="#6b7280">
                        {formatCurrency(selectedMedicineForUnit.sellingPrice * 10)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </RadioGroup>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setShowUnitSelectionModal(false)}
                sx={{ 
                  borderColor: '#6b7280', 
                  color: '#6b7280',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUnitSelectionAndAddToCart}
                sx={{ 
                  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
                  }
                }}
              >
                Add to Cart
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default PharmacyPOSFirebaseIntegrated;
