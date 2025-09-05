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

      // Sort results: Available medicines (stock > 0) first, then out of stock
      const sortedResults = localResults.sort((a, b) => {
        const aAvailable = a.stock > 0;
        const bAvailable = b.stock > 0;
        
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        
        // If both have same availability, sort by name
        return a.name.localeCompare(b.name);
      });

      setSearchResults(sortedResults.slice(0, 50));

      if (localResults.length === 0) {
        console.log('Searching Firebase for medicines...');
        const fbMedicines = await medicineService.searchMedicines(term);
        
        // Sort Firebase results the same way
        const sortedFbResults = fbMedicines.sort((a, b) => {
          const aAvailable = a.stock > 0;
          const bAvailable = b.stock > 0;
          
          if (aAvailable && !bAvailable) return -1;
          if (!aAvailable && bAvailable) return 1;
          
          return a.name.localeCompare(b.name);
        });
        
        setSearchResults(sortedFbResults.slice(0, 50));
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

  // Save new patient function
  const saveNewPatient = async () => {
    try {
      if (!newPatient.name || !newPatient.contact) {
        alert('Please fill in required fields (Name and Contact)');
        return;
      }

      // Generate patient ID
      const patientId = `PAT${Date.now()}`;
      const patientData = {
        ...newPatient,
        id: patientId,
        createdAt: new Date().toISOString(),
        createdBy: employeeId || 'system'
      };

      // Here you would typically save to your patient database
      // For now, we'll just update the current customer info
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

      // Show success message
      alert('Patient information saved successfully!');
      
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient information. Please try again.');
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
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', letterSpacing: '0.5px' }}>
              *** TEST CHANGE *** MEDICARE PHARMACY SYSTEM *** NO EMOJIS ***
            </Typography>
            <Chip 
              label={`Invoice: ${invoiceNumber}`} 
              variant="outlined" 
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                fontWeight: 'bold'
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                TIME & DATE
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {currentTime.toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {currentTime.toLocaleTimeString()}
                </Typography>
              </Box>
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
                  PATIENT INFORMATION
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
                STAFF INFORMATION
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
                      cursor: medicine.stock > 0 ? 'pointer' : 'not-allowed',
                      backgroundColor: medicine.stock > 0 ? 'white' : '#f8f9fa',
                      mb: 1,
                      mx: 1,
                      borderRadius: 2,
                      border: medicine.stock > 0 ? '2px solid #10b981' : '1px solid #e2e8f0',
                      opacity: medicine.stock > 0 ? 1 : 0.6,
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
                      fontSize: '0.75rem',
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
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}
                        />
                        <Chip 
                          label={medicine.manufacturer} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', color: '#64748b', borderColor: '#cbd5e1' }}
                        />
                        <Chip 
                          label={medicine.category} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem',
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
                SHOPPING CART ({cart.length} items | {formatWeight(totals.totalWeight)} | {totals.totalUnits} units)
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
                    CART IS EMPTY
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
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
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
            ✕
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
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
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
            ✕
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
                <Typography variant="body1">Discount:</Typography>
                <Typography variant="body1">-{formatCurrency(lastTransaction.discount || 0)}</Typography>
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
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
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

export default PharmacyPOSProfessional;
