import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Checkbox,
  RadioGroup,
  Radio,
  Dialog,
  DialogActions,
  Divider,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { medicineService } from '../services/medicineService';
import { transactionService } from '../services/transactionService';
import { patientService } from '../services/patientService';
import { employeeService } from '../../services/employeeService';
import { initializeSampleData } from '../services/dataInitServiceNew';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, query, where, doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

const PharmacyPOSFirebaseIntegrated = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Logout function
  const handleLogout = () => {
    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate immediately to login screen
    window.location.href = '/?screen=login';
  };

  // State variables
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [patientNIC, setPatientNIC] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [staffType, setStaffType] = useState('employee');
  const [cashReceived, setCashReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [showCashBalance, setShowCashBalance] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [slmcRegNumber, setSlmcRegNumber] = useState('');
  const [prescriptionType, setPrescriptionType] = useState('OTC'); // 'SLMC' or 'OTC'
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
    medicalNotes: '',
    isUnder15: false
  });

  // Patient dropdown search functionality
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

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

  // Close patient dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.patient-search-container')) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  // Handle employee ID change and fetch employee name
  const handleEmployeeIdChange = async (id) => {
    setEmployeeId(id);
    setEmployeeName(''); // Clear previous name
    
    if (id.trim().length >= 3) { // Start searching after 3 characters
      try {
        const employee = await employeeService.verifyEmployee(id.trim());
        if (employee) {
          setEmployeeName(employee.name);
        } else {
          setEmployeeName('');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        setEmployeeName('');
      }
    }
  };

  // Debounced patient search function - Enhanced with smart identification
  const debouncedPatientSearch = async (searchTerm) => {
    if (searchTerm.length >= 3) {
      try {
        setSearchingPatients(true);
        
        console.log('🔍 SMART PATIENT/CUSTOMER SEARCH - Term:', searchTerm);
        
        // Search for patients from patients collection
        const allPatients = await patientService.getAllPatients();
        
        // Search for customers from customers collection with enhanced query
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const allCustomers = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Map customer fields to patient fields for consistency
          name: doc.data().name,
          contact: doc.data().phoneNumber,
          phoneNumber: doc.data().phoneNumber,
          nic: doc.data().nic,
          age: doc.data().age,
          address: doc.data().address,
          isCustomer: true, // Flag to identify customers
          totalPurchases: doc.data().totalPurchases || 0,
          lastVisit: doc.data().lastVisit,
          primaryIdentifier: doc.data().primaryIdentifier || 'Unknown'
        }));
        
        // Combine patients and customers
        const allPeople = [...allPatients, ...allCustomers];
        const searchTermLower = searchTerm.toLowerCase();
        
        console.log(`📊 Searching in ${allPatients.length} patients + ${allCustomers.length} customers = ${allPeople.length} total records`);
        
        const suggestions = allPeople.filter(person => {
          let matches = false;
          let matchType = '';
          
          // 🎯 Priority 1: Exact NIC match (most reliable)
          if (person.nic && person.nic.toLowerCase() === searchTermLower) {
            matches = true;
            matchType = 'Exact NIC';
            person.matchPriority = 1;
            person.matchType = matchType;
            return true;
          }
          
          // 🎯 Priority 2: Exact phone number match
          if ((person.contact && person.contact === searchTerm) || 
              (person.phoneNumber && person.phoneNumber === searchTerm)) {
            matches = true;
            matchType = 'Exact Phone';
            person.matchPriority = 2;
            person.matchType = matchType;
            return true;
          }
          
          // 🎯 Priority 3: Partial NIC match (for progressive typing)
          if (person.nic && searchTerm.length >= 6 && person.nic.toLowerCase().includes(searchTermLower)) {
            matches = true;
            matchType = 'Partial NIC';
            person.matchPriority = 3;
            person.matchType = matchType;
            return true;
          }
          
          // 🎯 Priority 4: Partial phone number match
          if (searchTerm.length >= 6 && 
              ((person.contact && person.contact.includes(searchTerm)) || 
               (person.phoneNumber && person.phoneNumber.includes(searchTerm)))) {
            matches = true;
            matchType = 'Partial Phone';
            person.matchPriority = 4;
            person.matchType = matchType;
            return true;
          }
          
          // 🎯 Priority 5: Name match (least reliable due to duplicates)
          if (person.name && person.name.toLowerCase().includes(searchTermLower)) {
            matches = true;
            matchType = 'Name';
            person.matchPriority = 5;
            person.matchType = matchType;
            return true;
          }
          
          return false;
        });
        
        // Sort by match priority and reliability
        suggestions.sort((a, b) => {
          // First by match priority (lower number = higher priority)
          if (a.matchPriority !== b.matchPriority) {
            return a.matchPriority - b.matchPriority;
          }
          
          // Then by customer status (existing customers first)
          if (a.isCustomer && !b.isCustomer) return -1;
          if (!a.isCustomer && b.isCustomer) return 1;
          
          // Then by recent visits (if available)
          if (a.lastVisit && b.lastVisit) {
            return new Date(b.lastVisit) - new Date(a.lastVisit);
          }
          if (a.lastVisit && !b.lastVisit) return -1;
          if (!a.lastVisit && b.lastVisit) return 1;
          
          // Finally by name
          return (a.name || '').localeCompare(b.name || '');
        });
        
        // Limit results and add match information
        const limitedSuggestions = suggestions.slice(0, 8);
        
        console.log('🎯 SEARCH RESULTS:');
        limitedSuggestions.forEach((person, index) => {
          console.log(`  ${index + 1}. ${person.name} - ${person.matchType} - Priority ${person.matchPriority}`);
        });
        
        setPatientSuggestions(limitedSuggestions);
        setShowPatientDropdown(limitedSuggestions.length > 0);
        
        // Auto-select for high-confidence exact matches
        if (searchTerm.length >= 10) {
          const exactMatch = limitedSuggestions.find(p => 
            p.matchPriority <= 2 // Exact NIC or Phone match
          );
          
          if (exactMatch) {
            console.log('🎯 Auto-selecting high-confidence match:', exactMatch.name);
            selectPatientFromDropdown(exactMatch);
            return; // Exit early for exact match
          }
        }
        
        // Clear current patient if no high-confidence match and search is too short
        if (searchTerm.length < 6 && limitedSuggestions.length === 0) {
          setCurrentPatient(null);
          setCustomerName('');
          setCustomerContact('');
        }
        
      } catch (error) {
        console.error('❌ Error in enhanced patient/customer search:', error);
        setPatientSuggestions([]);
        setShowPatientDropdown(false);
        setCurrentPatient(null);
        setCustomerName('');
        setCustomerContact('');
      } finally {
        setSearchingPatients(false);
      }
    } else {
      // Clear everything if search term is too short
      setPatientSuggestions([]);
      setShowPatientDropdown(false);
      setCurrentPatient(null);
      setCustomerName('');
      setCustomerContact('');
    }
  };

  // Handle patient NIC lookup from Firebase with dropdown suggestions
  const handlePatientNICChange = async (nicOrPhone) => {
    setPatientNIC(nicOrPhone);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      debouncedPatientSearch(nicOrPhone);
    }, 300); // 300ms debounce
    
    setSearchTimeout(newTimeout);
  };

  // Select patient from dropdown
  const selectPatientFromDropdown = (patient) => {
    console.log('Selecting patient:', patient);
    
    // Set current patient
    setCurrentPatient(patient);
    
    // Set customer name and contact
    const name = patient.name || '';
    const contact = patient.contact || patient.phoneNumber || '';
    const nic = patient.nic || '';
    
    setCustomerName(name);
    setCustomerContact(contact);
    setPatientNIC(nic || contact || patientNIC); // Keep original search term if no NIC
    
    // Close dropdown
    setShowPatientDropdown(false);
    setPatientSuggestions([]);
    
    console.log('Patient selected successfully:', {
      name: name,
      contact: contact,
      nic: nic,
      age: patient.age
    });
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
    return `LKR ${amount.toFixed(2)}`;
  };

  // Print receipt function
  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    const receiptContent = document.getElementById('receipt-content');
    
    if (receiptContent && printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pharmacy Receipt - ${lastTransaction?.receiptNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                margin: 20px; 
                background: white;
                color: black;
              }
              .receipt-container { 
                max-width: 400px; 
                margin: 0 auto; 
              }
              .prescription-info {
                margin: 15px 0;
                padding: 10px;
                border: 2px solid;
                border-radius: 5px;
                text-align: center;
                font-weight: bold;
              }
              .slmc-prescription {
                background: #ffebee;
                border-color: #d32f2f;
                color: #d32f2f;
              }
              .otc-prescription {
                background: #e8f5e8;
                border-color: #4caf50;
                color: #2e7d32;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              ${receiptContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      // Fallback to regular print
      window.print();
    }
  };
  const processSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add medicines before completing the sale.');
      return;
    }

    if (!employeeId.trim()) {
      alert('Please enter Employee ID.');
      return;
    }

    // Validate SLMC requirements
    if (prescriptionType === 'SLMC') {
      if (!slmcRegNumber.trim() || slmcRegNumber.length !== 6) {
        alert('SLMC prescription requires a valid 6-digit SLMC registration number.');
        return;
      }
    }

      try {
        setLoading(true);
        
        console.log('Processing sale with', cart.length, 'items, total:', total);
        
        // Handle patient/customer creation and linking
        let patientId = null;
        let customerId = null;
        
        if (currentPatient) {
          // First validate that the current patient actually exists in the database
          try {
            const patientRef = doc(db, 'patients', currentPatient.id);
            const patientDoc = await getDoc(patientRef);
            
            if (patientDoc.exists()) {
              patientId = currentPatient.id;
              customerId = currentPatient.isCustomer ? currentPatient.id : null;
              console.log('✅ Validated existing patient:', patientId);
            } else {
              console.warn('⚠️ Current patient document does not exist in database, clearing selection');
              setCurrentPatient(null);
              setPatientNIC('');
              setCustomerName('');
              alert('The selected patient no longer exists in the system. Please select a different patient or create a new one.');
              return; // Exit the sale process
            }
          } catch (error) {
            console.warn('❌ Error validating patient, clearing selection:', error.message);
            setCurrentPatient(null);
            setPatientNIC('');
            setCustomerName('');
            alert('Error validating patient data. Please select a different patient or create a new one.');
            return; // Exit the sale process
          }
        } else if (patientNIC.trim() || customerName.trim() || customerContact.trim()) {
        console.log('🔍 SMART CUSTOMER IDENTIFICATION - Starting customer lookup...');
        
        try {
          let existingCustomer = null;
          let customerFound = false;
          let searchMethod = '';
          
          // 🎯 STRATEGY 1: Search by NIC (Primary unique identifier)
          if (patientNIC.trim() && patientNIC.length >= 9) {
            console.log('🆔 Searching by NIC (Primary):', patientNIC);
            try {
              const nicQuery = query(
                collection(db, 'customers'),
                where('nic', '==', patientNIC.trim())
              );
              const nicSnapshot = await getDocs(nicQuery);
              
              if (!nicSnapshot.empty) {
                existingCustomer = { id: nicSnapshot.docs[0].id, ...nicSnapshot.docs[0].data() };
                customerId = existingCustomer.id;
                customerFound = true;
                searchMethod = 'NIC';
                console.log('✅ Found existing customer by NIC:', customerId, existingCustomer);
                
                // Update customer info if name or phone has changed
                if (customerName.trim() && customerName.trim() !== existingCustomer.name) {
                  console.log('📝 Updating customer name from:', existingCustomer.name, 'to:', customerName);
                  await updateDoc(doc(db, 'customers', customerId), {
                    name: customerName.trim(),
                    updatedAt: new Date(),
                    lastUpdatedBy: 'POS_SYSTEM'
                  });
                }
                if (customerContact.trim() && customerContact.trim() !== existingCustomer.phoneNumber) {
                  console.log('📞 Updating customer phone from:', existingCustomer.phoneNumber, 'to:', customerContact);
                  await updateDoc(doc(db, 'customers', customerId), {
                    phoneNumber: customerContact.trim(),
                    updatedAt: new Date(),
                    lastUpdatedBy: 'POS_SYSTEM'
                  });
                }
              }
            } catch (nicError) {
              console.warn('⚠️ NIC search failed:', nicError.message);
            }
          }
          
          // 🎯 STRATEGY 2: Search by Phone Number (Secondary unique identifier)
          if (!customerFound && customerContact.trim() && customerContact.length >= 9) {
            console.log('📱 Searching by Phone (Secondary):', customerContact);
            try {
              const phoneQuery = query(
                collection(db, 'customers'),
                where('phoneNumber', '==', customerContact.trim())
              );
              const phoneSnapshot = await getDocs(phoneQuery);
              
              if (!phoneSnapshot.empty) {
                existingCustomer = { id: phoneSnapshot.docs[0].id, ...phoneSnapshot.docs[0].data() };
                customerId = existingCustomer.id;
                customerFound = true;
                searchMethod = 'Phone';
                console.log('✅ Found existing customer by Phone:', customerId, existingCustomer);
                
                // Update NIC if provided and different
                if (patientNIC.trim() && patientNIC.trim() !== existingCustomer.nic) {
                  console.log('🆔 Updating customer NIC from:', existingCustomer.nic, 'to:', patientNIC);
                  
                  // Check if this NIC is already used by another customer
                  const nicConflictQuery = query(
                    collection(db, 'customers'),
                    where('nic', '==', patientNIC.trim())
                  );
                  const nicConflictSnapshot = await getDocs(nicConflictQuery);
                  
                  if (nicConflictSnapshot.empty) {
                    await updateDoc(doc(db, 'customers', customerId), {
                      nic: patientNIC.trim(),
                      updatedAt: new Date(),
                      lastUpdatedBy: 'POS_SYSTEM'
                    });
                    console.log('✅ NIC updated successfully');
                  } else {
                    console.warn('⚠️ NIC conflict detected - another customer already has this NIC');
                    alert(`⚠️ Warning: NIC ${patientNIC} is already registered to another customer. Using phone number identification.`);
                  }
                }
              }
            } catch (phoneError) {
              console.warn('⚠️ Phone search failed:', phoneError.message);
            }
          }
          
          // 🎯 STRATEGY 3: Create new customer (if no matches found)
          if (!customerFound && (patientNIC.trim() || customerContact.trim()) && customerName.trim()) {
            console.log('🆕 Creating new customer - no existing match found');
            
            // Validate uniqueness before creating
            let canCreate = true;
            let conflictMessage = '';
            
            // Check NIC uniqueness if provided
            if (patientNIC.trim() && patientNIC.length >= 9) {
              const nicCheck = await getDocs(query(
                collection(db, 'customers'),
                where('nic', '==', patientNIC.trim())
              ));
              if (!nicCheck.empty) {
                canCreate = false;
                conflictMessage += `NIC ${patientNIC} already exists. `;
              }
            }
            
            // Check phone uniqueness if provided
            if (customerContact.trim() && customerContact.length >= 9) {
              const phoneCheck = await getDocs(query(
                collection(db, 'customers'),
                where('phoneNumber', '==', customerContact.trim())
              ));
              if (!phoneCheck.empty) {
                canCreate = false;
                conflictMessage += `Phone ${customerContact} already exists. `;
              }
            }
            
            if (!canCreate) {
              console.warn('❌ Cannot create customer due to conflicts:', conflictMessage);
              alert(`❌ Customer already exists: ${conflictMessage}\nPlease check the customer information and try again.`);
              return; // Exit the sale process
            }
            
            // Create unique customer identifier
            const uniqueCustomerId = `${patientNIC || customerContact || Date.now()}_${Date.now()}`;
            
            const customerData = {
              name: customerName.trim(),
              phoneNumber: customerContact.trim() || '',
              nic: patientNIC.trim() || '',
              age: null, // Will be updated when more info is available
              email: '',
              address: '',
              status: 'Active',
              createdAt: new Date(),
              createdBy: 'POS_SYSTEM',
              totalPurchases: 0,
              // Add metadata for better tracking
              primaryIdentifier: patientNIC.trim() ? 'NIC' : 'Phone',
              uniqueId: uniqueCustomerId,
              lastVisit: new Date(),
              visitCount: 1
            };
            
            try {
              // Add to customers collection for Customer Management
              const customerRef = await addDoc(collection(db, 'customers'), customerData);
              customerId = customerRef.id;
              existingCustomer = { id: customerId, ...customerData };
              customerFound = true;
              searchMethod = 'Created';
              console.log('✅ Successfully created new customer:', customerId, customerData);
              
              // Enhanced success message with unique identification
              const identifier = patientNIC.trim() ? `NIC: ${patientNIC}` : `Phone: ${customerContact}`;
              alert(`✅ NEW CUSTOMER CREATED!\n👤 Name: ${customerName}\n🆔 ${identifier}\n📝 Customer ID: ${customerId}\n\n🎯 This customer is now in the system and future transactions will be linked automatically.`);
              
            } catch (customerError) {
              console.error('❌ Error creating customer:', customerError);
              alert(`❌ Failed to create customer: ${customerError.message}`);
            }
          }
          
          // 🎯 STRATEGY 4: Handle edge cases
          if (!customerFound && customerName.trim()) {
            console.log('⚠️ No unique identifier provided (NIC/Phone), creating walk-in record');
            const walkInData = {
              name: customerName.trim(),
              phoneNumber: customerContact.trim() || '',
              nic: patientNIC.trim() || '',
              age: null,
              email: '',
              address: '',
              status: 'Walk-in',
              createdAt: new Date(),
              createdBy: 'POS_SYSTEM',
              totalPurchases: 0,
              isWalkIn: true,
              walkInId: `WALKIN_${Date.now()}`
            };
            
            try {
              const walkInRef = await addDoc(collection(db, 'customers'), walkInData);
              customerId = walkInRef.id;
              existingCustomer = { id: customerId, ...walkInData };
              customerFound = true;
              searchMethod = 'Walk-in';
              console.log('✅ Created walk-in customer record:', customerId);
            } catch (walkInError) {
              console.error('❌ Error creating walk-in customer:', walkInError);
            }
          }
          
          // Log final customer identification result
          console.log('🎯 CUSTOMER IDENTIFICATION COMPLETE:');
          console.log('  Method:', searchMethod);
          console.log('  Customer Found:', customerFound);
          console.log('  Customer ID:', customerId);
          console.log('  Customer Data:', existingCustomer);
          console.log('===========================================');
          
          // Check if patient already exists
          let existingPatient = null;
          if (patientNIC.trim()) {
            console.log('Searching for existing patient with NIC:', patientNIC);
            existingPatient = await patientService.findPatientByNIC(patientNIC);
          }
          
          if (existingPatient) {
            patientId = existingPatient.id;
            setCurrentPatient({...existingPatient, isCustomer: true, id: customerId || existingPatient.id});
            console.log('Found existing patient:', patientId);
          } else if (patientNIC.trim() && customerName.trim()) {
            console.log('Creating new patient...');
            // Create patient record
            const newPatientData = await patientService.addPatient({
              nic: patientNIC,
              name: customerName || 'Walk-in Customer',
              contact: customerContact || '',
              address: '',
              age: '',
              gender: '',
              bloodGroup: '',
              medicalNotes: 'Auto-created during POS sale'
            });
            patientId = newPatientData.id;
            setCurrentPatient({...newPatientData, isCustomer: true, id: customerId || newPatientData.id});
            console.log('✅ Successfully created new patient:', patientId);
          }
        } catch (error) {
          console.error('❌ Error creating/finding patient/customer:', error);
          alert(`Warning: Could not create customer record: ${error.message}`);
          // Continue with sale even if customer creation fails
        }
      }
      
      console.log('Processing transaction for customer:', customerName || 'Walk-in Customer');
      
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
        customerContact: customerContact || '',
        // CRITICAL: These are the fields Customer Management searches for
        patientNIC: patientNIC || '',
        customerNIC: patientNIC || '', // Use same NIC for both fields for consistency
        // Only include patientId if it exists
        ...(patientId && { patientId: patientId }),
        // Add customer linking information
        ...(customerId && { customerId: customerId }),
        staffName: employeeName ? `${employeeName} (${employeeId})` : `EMPLOYEE: ${employeeId}`,
        staffType: 'employee',
        employeeId: employeeId,
        slmcRegNumber: slmcRegNumber,
        prescriptionType: prescriptionType,
        prescriptionInfo: prescriptionType === 'SLMC' ? `SLMC Prescription - Reg: ${slmcRegNumber}` : 'Over The Counter (OTC)',
        invoiceNumber: invoiceNumber,
        branchId: 'MAIN-BRANCH',
        location: 'Main Pharmacy',
        // Add timestamps for better tracking
        saleDate: new Date(),
        transactionType: 'SALE'
      };

      console.log('About to process sale with saleData:', saleData);
      
      // Enhanced logging for Customer Management integration
      console.log('=== CUSTOMER MANAGEMENT INTEGRATION ===');
      console.log('Customer Name:', saleData.customerName);
      console.log('Customer NIC (both fields):', saleData.customerNIC, '/', saleData.patientNIC);
      console.log('Customer ID:', saleData.customerId);
      console.log('Patient ID:', saleData.patientId);
      console.log('Transaction will be searchable by these fields in Customer Management');
      console.log('==========================================');

      // Process the sale transaction with stock updates
      const transaction = await transactionService.processSale(saleData);
      
      console.log('Transaction completed successfully:', transaction);
      
      // Update customer total purchases if we have a customerId
      if (customerId) {
        try {
          console.log('Updating customer purchase total for customerId:', customerId);
          const customerRef = doc(db, 'customers', customerId);
          const customerDoc = await getDoc(customerRef);
          
          if (customerDoc.exists()) {
            await updateDoc(customerRef, {
              totalPurchases: increment(total),
              lastVisit: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            console.log('✅ Successfully updated customer purchase total');
            
            // Verification check
            const updatedCustomerDoc = await getDoc(customerRef);
            if (updatedCustomerDoc.exists()) {
              const updatedData = updatedCustomerDoc.data();
              console.log('✅ CUSTOMER VERIFICATION - Customer exists in database:');
              console.log('  - Name:', updatedData.name);
              console.log('  - NIC:', updatedData.nic);
              console.log('  - Total Purchases:', updatedData.totalPurchases);
              console.log('  - Last Visit:', updatedData.lastVisit);
              console.log('🎯 This customer should now be visible in Customer Management!');
            }
          } else {
            console.warn('⚠️ Customer document not found:', customerId);
          }
        } catch (customerUpdateError) {
          console.error('❌ Error updating customer purchase total:', customerUpdateError);
        }
      }
      
      // Transaction verification for Customer Management
      console.log('=== TRANSACTION VERIFICATION ===');
      console.log('Transaction ID:', transaction.id);
      console.log('Receipt Number:', transaction.receiptNumber);
      console.log('Customer Name in Transaction:', transaction.customerName);
      console.log('Customer NIC in Transaction:', transaction.customerNIC);
      console.log('Patient NIC in Transaction:', transaction.patientNIC);
      console.log('🔍 Customer Management should find this transaction by NIC:', patientNIC || 'N/A');
      console.log('🔍 Or by Customer Name:', customerName || 'Walk-in Customer');
      console.log('===============================');
      
      // Update local cash balance for cash payments
      if (paymentMethod === 'cash') {
        const newBalance = cashBalance + total;
        setCashBalance(newBalance);
        localStorage.setItem('pharmacyCashBalance', newBalance.toString());
      }
      
      console.log('Setting lastTransaction and showing receipt...');
      
      // Ensure transaction has all required fields for receipt
      const enrichedTransaction = {
        ...transaction,
        items: transaction.items || cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          totalPrice: item.quantity * item.sellingPrice,
          unitPrice: item.sellingPrice,
          price: item.sellingPrice,
          batchNumber: item.batchNumber
        })),
        customerName: customerName || currentPatient?.name || 'Walk-in Customer',
        staffName: employeeName ? `${employeeName} (${employeeId})` : `EMPLOYEE: ${employeeId}`,
        receiptNumber: transaction.receiptNumber || `RCP-${transaction.invoiceNumber || invoiceNumber}`,
        createdAt: new Date(),
        total: transaction.total || total,
        subtotal: transaction.subtotal || totals.subtotal,
        paymentMethod: transaction.paymentMethod || paymentMethod
      };
      
      console.log('Enriched transaction for receipt:', enrichedTransaction);
      setLastTransaction(enrichedTransaction);
      setShowReceipt(true);
      
      // Show success message
      alert('Sale completed successfully! Receipt will be displayed.');
      
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
      
      // Reload medicines to reflect updated stock (do this after receipt is shown)
      setTimeout(async () => {
        try {
          await loadInitialData();
          console.log('Medicine data reloaded');
        } catch (reloadError) {
          console.error('Error reloading medicine data:', reloadError);
        }
      }, 1000);
      
      console.log('Sale completed successfully:', transaction.id);
      
    } catch (error) {
      console.error('Error processing sale:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Error processing sale: ${error.message}. Please check console for details.`);
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
        medicalNotes: '',
        isUnder15: false
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
            <Button
              onClick={handleLogout}
              variant="contained"
              startIcon={<LogoutIcon />}
              sx={{
                backgroundColor: '#dc2626',
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#b91c1c',
                },
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
              }}
            >
              LOGOUT
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* MAIN CONTENT - CLEAN WHITE LAYOUT */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 1.5, 
        p: { xs: 1, md: 1.5 }, 
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}>
        
        {/* LEFT PANEL - INPUT SECTIONS */}
        <Box sx={{ 
          width: { xs: '100%', md: '30%' }, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1.5,
          maxHeight: { xs: 'none', md: '100%' },
          overflowY: { xs: 'visible', md: 'auto' }
        }}>
          
          {/* PATIENT INFORMATION - COMPACT */}
          <Paper sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
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
            
            <Box sx={{ position: 'relative' }} className="patient-search-container">
              <TextField
                fullWidth
                label="Patient NIC / Phone Number"
                value={patientNIC}
                onChange={(e) => handlePatientNICChange(e.target.value)}
                placeholder="Enter NIC or Phone number to auto-load patient info"
                size="small"
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
                InputProps={{
                  endAdornment: searchingPatients && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Typography variant="caption" color="#1976d2">Searching...</Typography>
                    </Box>
                  )
                }}
              />
              
              {/* Patient Suggestions Dropdown */}
              {showPatientDropdown && patientSuggestions.length > 0 && (
                <Paper
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: 300,
                    overflow: 'auto',
                    border: '2px solid #1976d2',
                    borderRadius: 2,
                    mt: 0.5,
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)'
                  }}
                >
                  <Box sx={{ 
                    p: 1, 
                    backgroundColor: '#1976d2', 
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <Typography variant="caption" fontWeight="bold">
                      🎯 {patientSuggestions.length} Match{patientSuggestions.length > 1 ? 'es' : ''} Found - Sorted by Accuracy
                    </Typography>
                  </Box>
                  
                  {patientSuggestions.map((patient, index) => {
                    // Calculate age from date of birth if available
                    let ageText = 'Age: N/A';
                    if (patient.age) {
                      ageText = `Age: ${patient.age}`;
                    } else if (patient.dateOfBirth) {
                      try {
                        const birthDate = new Date(patient.dateOfBirth);
                        const today = new Date();
                        const age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }
                        ageText = `Age: ${age}`;
                      } catch (e) {
                        ageText = 'Age: N/A';
                      }
                    }

                    // Determine match type colors and icons
                    const getMatchBadge = (patient) => {
                      switch (patient.matchType) {
                        case 'Exact NIC':
                          return { color: '#d32f2f', bg: '#ffebee', icon: '🆔', text: 'EXACT NIC' };
                        case 'Exact Phone':
                          return { color: '#1976d2', bg: '#e3f2fd', icon: '📱', text: 'EXACT PHONE' };
                        case 'Partial NIC':
                          return { color: '#7b1fa2', bg: '#f3e5f5', icon: '🔍', text: 'NIC MATCH' };
                        case 'Partial Phone':
                          return { color: '#1976d2', bg: '#e8f5ff', icon: '📞', text: 'PHONE MATCH' };
                        case 'Name':
                          return { color: '#ff9800', bg: '#fff3e0', icon: '👤', text: 'NAME MATCH' };
                        default:
                          return { color: '#666', bg: '#f5f5f5', icon: '❓', text: 'MATCH' };
                      }
                    };

                    const matchBadge = getMatchBadge(patient);

                    return (
                      <Box
                        key={patient.id}
                        onClick={() => {
                          console.log('🎯 Dropdown item clicked:', patient.name, '- Match:', patient.matchType);
                          selectPatientFromDropdown(patient);
                        }}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderBottom: index < patientSuggestions.length - 1 ? '1px solid #e5e7eb' : 'none',
                          backgroundColor: index === 0 && patient.matchPriority <= 2 ? '#f8fff8' : 'white', // Highlight best matches
                          borderLeft: index === 0 && patient.matchPriority <= 2 ? '4px solid #4caf50' : 'none',
                          '&:hover': {
                            backgroundColor: '#e3f2fd',
                            transform: 'translateX(4px)',
                            transition: 'all 0.2s ease'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Priority indicator for top match */}
                        {index === 0 && patient.matchPriority <= 2 && (
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.65rem',
                            fontWeight: 'bold'
                          }}>
                            ⭐ BEST MATCH
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="bold" color="#1976d2" sx={{ fontSize: '0.95rem' }}>
                            {patient.name || 'Unknown Name'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip 
                              label={ageText}
                              size="small"
                              sx={{
                                backgroundColor: '#e8f5e8',
                                color: '#2e7d32',
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                                height: '20px'
                              }}
                            />
                          </Box>
                        </Box>
                        
                        {/* Match Type Badge */}
                        <Box sx={{ mb: 1 }}>
                          <Chip 
                            label={`${matchBadge.icon} ${matchBadge.text}`}
                            size="small"
                            sx={{
                              backgroundColor: matchBadge.bg,
                              color: matchBadge.color,
                              fontSize: '0.6rem',
                              height: '18px',
                              fontWeight: 'bold',
                              border: `1px solid ${matchBadge.color}`
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {patient.nic && (
                            <Chip 
                              label={`NIC: ${patient.nic}`}
                              size="small"
                              sx={{
                                backgroundColor: patient.matchType?.includes('NIC') ? '#ffebee' : '#f3e5f5',
                                color: patient.matchType?.includes('NIC') ? '#d32f2f' : '#7b1fa2',
                                fontSize: '0.65rem',
                                height: '18px',
                                fontWeight: patient.matchType?.includes('NIC') ? 'bold' : 'normal'
                              }}
                            />
                          )}
                          {(patient.contact || patient.phoneNumber) && (
                            <Chip 
                              label={`Phone: ${patient.contact || patient.phoneNumber}`}
                              size="small"
                              sx={{
                                backgroundColor: patient.matchType?.includes('Phone') ? '#e3f2fd' : '#e8f5ff',
                                color: patient.matchType?.includes('Phone') ? '#1976d2' : '#1976d2',
                                fontSize: '0.65rem',
                                height: '18px',
                                fontWeight: patient.matchType?.includes('Phone') ? 'bold' : 'normal'
                              }}
                            />
                          )}
                          {patient.isCustomer && (
                            <Chip 
                              label={`💰 LKR ${patient.totalPurchases || 0}`}
                              size="small"
                              sx={{
                                backgroundColor: '#e8f5e8',
                                color: '#2e7d32',
                                fontSize: '0.65rem',
                                height: '18px',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>
                        
                        {patient.address && (
                          <Typography variant="caption" color="#666" sx={{ 
                            fontSize: '0.7rem',
                            display: 'block',
                            fontStyle: 'italic'
                          }}>
                            📍 {patient.address}
                          </Typography>
                        )}
                        
                        {patient.lastVisit && (
                          <Typography variant="caption" color="#999" sx={{ 
                            fontSize: '0.65rem',
                            display: 'block',
                            mt: 0.5
                          }}>
                            🕒 Last Visit: {new Date(patient.lastVisit.toDate ? patient.lastVisit.toDate() : patient.lastVisit).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Paper>
              )}
            </Box>

            {/* Current Patient Display */}
            {currentPatient && (
              <Box sx={{ 
                mt: 1, 
                p: 1.5, 
                backgroundColor: '#e8f5e8', 
                borderRadius: 1,
                border: '1px solid #4caf50'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight="bold" color="#2e7d32">
                    ✓ Patient Selected: {currentPatient.name}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setCurrentPatient(null);
                      setCustomerName('');
                      setCustomerContact('');
                      setPatientNIC('');
                      console.log('✅ Patient selection cleared - ready for new transaction');
                    }}
                    sx={{
                      color: '#f44336',
                      fontSize: '0.7rem',
                      minWidth: 'auto',
                      p: 0.5,
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                  >
                    Clear
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {currentPatient.age && (
                    <Chip 
                      label={`Age: ${currentPatient.age}`}
                      size="small"
                      sx={{
                        backgroundColor: '#ffffff',
                        color: '#2e7d32',
                        fontSize: '0.7rem',
                        height: '18px'
                      }}
                    />
                  )}
                  {currentPatient.nic && (
                    <Chip 
                      label={`NIC: ${currentPatient.nic}`}
                      size="small"
                      sx={{
                        backgroundColor: '#ffffff',
                        color: '#2e7d32',
                        fontSize: '0.7rem',
                        height: '18px'
                      }}
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* PRESCRIPTION TYPE SELECTOR */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#1976d2' }}>
                PRESCRIPTION TYPE
              </Typography>
              <RadioGroup
                row
                value={prescriptionType}
                onChange={(e) => {
                  setPrescriptionType(e.target.value);
                  // Clear SLMC number when switching to OTC
                  if (e.target.value === 'OTC') {
                    setSlmcRegNumber('');
                  }
                }}
                sx={{ gap: 2 }}
              >
                <FormControlLabel
                  value="OTC"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#2e7d32' }}>
                        Over The Counter (OTC)
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="SLMC"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#d32f2f' }}>
                        SLMC Prescription
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </Box>

            {/* SLMC REG NUMBER - Only show when prescription type is SLMC */}
            {prescriptionType === 'SLMC' && (
              <TextField
                fullWidth
                label="SLMC REG NUMBER (6 digits) *REQUIRED*"
                value={slmcRegNumber}
                onChange={(e) => setSlmcRegNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit SLMC number"
                size="small"
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    borderColor: '#d32f2f',
                    '&:hover fieldset': { borderColor: '#d32f2f' },
                    '&.Mui-focused fieldset': { borderColor: '#d32f2f' }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#d32f2f',
                    '&.Mui-focused': { color: '#d32f2f' }
                  }
                }}
              />
            )}

            {prescriptionType === 'OTC' && (
              <Box sx={{ 
                p: 1.5, 
                backgroundColor: '#e8f5e8', 
                borderRadius: 1, 
                border: '1px solid #4caf50',
                mb: 2
              }}>
                <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  ✅ Over The Counter Sale - No prescription required
                </Typography>
              </Box>
            )}

          </Paper>

          {/* STAFF INFORMATION - COMPACT */}
          <Paper sx={{ 
            p: 1.5, 
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2', mb: 1.5 }}>
              STAFF INFORMATION
            </Typography>
            
            <TextField
              fullWidth
              label="Authorized Person - Employee ID"
              value={employeeId}
              onChange={(e) => handleEmployeeIdChange(e.target.value)}
              required
              error={!employeeId.trim()}
              helperText={employeeName ? `Employee: ${employeeName}` : (!employeeId.trim() ? 'Employee ID is required' : '')}
              size="small"
              sx={{ 
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: employeeName ? '#f0f9ff' : '#ffffff',
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

          </Paper>
        </Box>

        {/* MIDDLE PANEL - AVAILABLE MEDICINES */}
        <Box sx={{ 
          width: { xs: '100%', md: '40%' }, 
          display: 'flex', 
          flexDirection: 'column',
          order: { xs: 2, md: 0 }
        }}>
          
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

        {/* RIGHT PANEL - CART & CHECKOUT */}
        <Box sx={{ 
          width: { xs: '100%', md: '30%' }, 
          display: 'flex', 
          flexDirection: 'column',
          order: { xs: 3, md: 0 }
        }}>
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
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                SHOPPING CART
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${totals.totalItems} items`} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
                <Chip 
                  label={prescriptionType === 'SLMC' ? '💊 SLMC' : '🏪 OTC'} 
                  size="small" 
                  sx={{ 
                    backgroundColor: prescriptionType === 'SLMC' ? '#d32f2f' : '#4caf50', 
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
            </Box>

            {/* CART ITEMS - COMPACT */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              backgroundColor: '#f8f9fa'
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
                        mb: 1,
                        mx: 1,
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1976d2', fontSize: '0.9rem' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="#666" sx={{ fontSize: '0.8rem' }}>
                            {item.strength} - {formatCurrency(item.sellingPrice)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{ 
                            color: '#f44336',
                            padding: '2px',
                            '&:hover': { 
                              backgroundColor: 'rgba(244, 67, 54, 0.04)'
                            }
                          }}
                        >
                          ✕
                        </IconButton>
                      </Box>

                      {/* UNIT TYPE SELECTION for Tablets/Capsules - COMPACT */}
                      {isTabletOrCapsule && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: '#666', fontSize: '0.75rem' }}>
                            Unit Type:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button
                              size="small"
                              variant={cartItemUnits[item.id] === 'tablets' ? 'contained' : 'outlined'}
                              onClick={() => updateCartItemUnit(item.id, 'tablets')}
                              sx={{
                                fontSize: '0.7rem',
                                px: 1,
                                py: 0.25,
                                minHeight: 24,
                                borderRadius: 1,
                                backgroundColor: cartItemUnits[item.id] === 'tablets' ? '#1976d2' : 'transparent',
                                borderColor: '#1976d2',
                                color: cartItemUnits[item.id] === 'tablets' ? 'white' : '#1976d2',
                                '&:hover': {
                                  backgroundColor: cartItemUnits[item.id] === 'tablets' ? '#1565c0' : '#e3f2fd'
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
                                px: 1,
                                py: 0.25,
                                minHeight: 24,
                                borderRadius: 1,
                                backgroundColor: cartItemUnits[item.id] === 'cards' ? '#1976d2' : 'transparent',
                                borderColor: '#1976d2',
                                color: cartItemUnits[item.id] === 'cards' ? 'white' : '#1976d2',
                                '&:hover': {
                                  backgroundColor: cartItemUnits[item.id] === 'cards' ? '#1565c0' : '#e3f2fd'
                                }
                              }}
                            >
                              Cards (10s)
                            </Button>
                          </Box>
                        </Box>
                      )}
                      
                      {/* QUANTITY CONTROLS - COMPACT */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Button
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity - (cartItemUnits[item.id] === 'cards' ? 10 : 1))}
                          sx={{ 
                            minWidth: '28px', 
                            height: '28px',
                            borderRadius: 1,
                            backgroundColor: '#f44336',
                            color: 'white',
                            fontSize: '0.8rem',
                            '&:hover': { 
                              backgroundColor: '#d32f2f'
                            }
                          }}
                        >
                          -
                        </Button>
                        <TextField
                          size="small"
                          value={displayQty}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            if (newValue > 0) {
                              const actualQuantity = cartItemUnits[item.id] === 'cards' ? newValue * 10 : newValue;
                              updateCartQuantity(item.id, actualQuantity);
                            }
                          }}
                          inputProps={{
                            min: 1,
                            style: {
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              padding: '4px'
                            }
                          }}
                          sx={{ 
                            width: '60px',
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#e3f2fd',
                              borderColor: '#1976d2',
                              '&:hover fieldset': {
                                borderColor: '#1976d2',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#1976d2',
                              }
                            }
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity + (cartItemUnits[item.id] === 'cards' ? 10 : 1))}
                          sx={{ 
                            minWidth: '28px', 
                            height: '28px',
                            borderRadius: 1,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontSize: '0.8rem',
                            '&:hover': { 
                              backgroundColor: '#388e3c'
                            }
                          }}
                        >
                          +
                        </Button>
                        <Typography variant="body2" sx={{ 
                          ml: 'auto', 
                          fontWeight: 'bold', 
                          color: '#4caf50',
                          backgroundColor: '#e8f5e8',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: '0.8rem'
                        }}>
                          {formatCurrency(item.sellingPrice * item.quantity)}
                        </Typography>
                      </Box>

                      {/* ACTUAL TABLETS INFO - COMPACT */}
                      {isTabletOrCapsule && cartItemUnits[item.id] === 'cards' && (
                        <Typography variant="body2" sx={{ 
                          fontSize: '0.7rem', 
                          color: '#666',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          mt: 0.5,
                          p: 0.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 0.5
                        }}>
                          = {item.quantity} tablets total
                        </Typography>
                      )}
                    </Box>
                  );
                })
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="#666">Cart is empty</Typography>
                </Box>
              )}
            </Box>

            {/* BILLING SUMMARY - COMPACT WITH BLUE/WHITE/BLACK ONLY */}
            <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '2px solid #1976d2' }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatCurrency(totals.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Discount ({discountRate}%):</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">-{formatCurrency(discountAmount)}</Typography>
                </Box>
                
                {/* NET TOTAL - BLUE */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 1, 
                  p: 1, 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: 1,
                  border: '1px solid #1976d2'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>NET TOTAL:</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {formatCurrency(netTotal)}
                  </Typography>
                </Box>

                {/* BALANCE - BLACK */}
                {paymentMethod === 'cash' && cashReceived > 0 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1, 
                    p: 1, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 1,
                    border: '1px solid #333'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>BALANCE:</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                      {formatCurrency(balance)}
                    </Typography>
                  </Box>
                )}

                {/* BILL (Final Amount) - GREEN */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 1.5, 
                  backgroundColor: '#e8f5e8', 
                  borderRadius: 1, 
                  border: '2px solid #4caf50'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>BILL:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="medium"
                onClick={processSale}
                disabled={
                  cart.length === 0 || 
                  loading || 
                  !employeeId.trim() || 
                  (prescriptionType === 'SLMC' && (!slmcRegNumber.trim() || slmcRegNumber.length !== 6))
                }
                sx={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  py: 1.5,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#388e3c'
                  },
                  '&:disabled': {
                    backgroundColor: '#9ca3af',
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
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" color="#1976d2" sx={{ mb: 2, textAlign: 'center' }}>
            NEW PATIENT REGISTRATION
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number *"
                value={newPatient.contact}
                onChange={(e) => setNewPatient({...newPatient, contact: e.target.value})}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NIC Number"
                value={newPatient.nic}
                onChange={(e) => setNewPatient({...newPatient, nic: e.target.value})}
                disabled={newPatient.isUnder15}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newPatient.isUnder15}
                      onChange={(e) => setNewPatient({
                        ...newPatient, 
                        isUnder15: e.target.checked,
                        nic: e.target.checked ? '' : newPatient.nic
                      })}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Patient is under 15 years old (No NIC required)</Typography>}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                value={newPatient.address}
                onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                size="small"
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
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
              >
                <option value=""></option>
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
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medical Notes"
                value={newPatient.medicalNotes}
                onChange={(e) => setNewPatient({...newPatient, medicalNotes: e.target.value})}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', pt: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setShowPatientForm(false)}
              sx={{ 
                borderColor: '#6b7280', 
                color: '#6b7280',
                px: 3,
                py: 1
              }}
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              onClick={saveNewPatient}
              sx={{ 
                backgroundColor: '#1976d2', 
                color: 'white',
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
            >
              SAVE
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* RECEIPT DIALOG */}
      <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} maxWidth="sm" fullWidth>
        {lastTransaction ? (
          <Box id="receipt-content" sx={{ p: 4, fontFamily: 'monospace' }}>
            {/* PHARMACY HEADER WITH LOGO */}
            <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid #1976d2', pb: 2 }}>
              <img 
                src="/images/npk-logo.png" 
                alt="NPK Logo" 
                style={{ height: '60px', marginBottom: '10px' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#1976d2', letterSpacing: '1px' }}>
                MEDICARE PHARMACY SYSTEM
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Authorized Pharmacy & Medical Supplies
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                📍 123 Main Street, Colombo 01, Sri Lanka
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                📞 +94 11 234 5678 | 📧 info@medicare.lk
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 'bold' }}>
                Pharmacy Reg: PH/2024/001 | License: LIC/2024/001
              </Typography>
            </Box>

            {/* RECEIPT HEADER */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                backgroundColor: '#1976d2', 
                color: 'white', 
                p: 1, 
                borderRadius: 1,
                letterSpacing: '1px'
              }}>
                PHARMACY SALES RECEIPT
              </Typography>
            </Box>
            
            {/* TRANSACTION DETAILS */}
            <Box sx={{ mb: 2, borderBottom: '1px dashed #ccc', pb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Receipt No: {lastTransaction.receiptNumber || `RCP-${lastTransaction.invoiceNumber}`}
                  </Typography>
                  <Typography variant="body2">
                    Invoice No: {lastTransaction.invoiceNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    Date: {new Date().toLocaleDateString('en-GB')}
                  </Typography>
                  <Typography variant="body2">
                    Time: {new Date().toLocaleTimeString('en-GB')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* PRESCRIPTION TYPE INFO */}
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              backgroundColor: prescriptionType === 'SLMC' ? '#ffebee' : '#e8f5e8',
              border: `2px solid ${prescriptionType === 'SLMC' ? '#d32f2f' : '#4caf50'}`,
              borderRadius: 2
            }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold', 
                color: prescriptionType === 'SLMC' ? '#d32f2f' : '#2e7d32',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                {prescriptionType === 'SLMC' ? '💊 PRESCRIPTION SALE' : '🏪 OVER THE COUNTER SALE'}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: prescriptionType === 'SLMC' ? '#d32f2f' : '#2e7d32',
                textAlign: 'center',
                fontWeight: 'bold',
                mt: 0.5
              }}>
                {prescriptionType === 'SLMC' 
                  ? `SLMC Reg. Number: ${slmcRegNumber}`
                  : 'No prescription required'
                }
              </Typography>
            </Box>

            {/* STAFF AND PATIENT INFO */}
            <Box sx={{ mb: 2, borderBottom: '1px dashed #ccc', pb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                👨‍⚕️ Served By: {lastTransaction.staffName}
              </Typography>
              {(currentPatient || customerName) && (
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  👤 Patient: {currentPatient?.name || customerName || 'Walk-in Customer'}
                  {currentPatient?.nic && ` (NIC: ${currentPatient.nic})`}
                </Typography>
              )}
              {(currentPatient?.contact || customerContact) && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  📞 Contact: {currentPatient?.contact || customerContact}
                </Typography>
              )}
            </Box>

            {/* ITEMS SECTION */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 1, 
                borderRadius: 1,
                mb: 1,
                textAlign: 'center'
              }}>
                ITEMS PURCHASED
              </Typography>
              
              {/* Items Header */}
              <Box sx={{ display: 'flex', fontWeight: 'bold', borderBottom: '1px solid #ccc', pb: 0.5, mb: 1 }}>
                <Typography variant="body2" sx={{ flex: 3, fontSize: '0.8rem' }}>MEDICINE</Typography>
                <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>QTY</Typography>
                <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>RATE</Typography>
                <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', fontSize: '0.8rem' }}>TOTAL</Typography>
              </Box>

              {/* Items List */}
              {lastTransaction.items && lastTransaction.items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 0.5, fontSize: '0.85rem' }}>
                  <Typography variant="body2" sx={{ flex: 3, fontSize: '0.8rem' }}>
                    {item.name}
                    {item.batchNumber && <br />}<span style={{ color: '#666', fontSize: '0.7rem' }}>Batch: {item.batchNumber}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>
                    {item.quantity}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>
                    {formatCurrency(item.price || (item.totalPrice / item.quantity))}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', fontSize: '0.8rem' }}>
                    {formatCurrency(item.totalPrice)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* TOTALS SECTION */}
            <Box sx={{ borderTop: '2px solid #1976d2', pt: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">{formatCurrency(lastTransaction.subtotal)}</Typography>
              </Box>
              {lastTransaction.discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="error">Discount ({lastTransaction.discountRate || 0}%):</Typography>
                  <Typography variant="body2" color="error">-{formatCurrency(lastTransaction.discountAmount || 0)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, borderTop: '1px dashed #ccc', pt: 1 }}>
                <Typography variant="h6" fontWeight="bold">NET TOTAL:</Typography>
                <Typography variant="h6" fontWeight="bold">{formatCurrency(lastTransaction.netTotal || lastTransaction.total)}</Typography>
              </Box>
              
              {/* Payment Method */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">Payment Method:</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                  {lastTransaction.paymentMethod || 'CASH'}
                </Typography>
              </Box>
              
              {lastTransaction.balance > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight="bold" color="success">BALANCE:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success">
                    {formatCurrency(lastTransaction.balance)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* FOOTER */}
            <Box sx={{ textAlign: 'center', borderTop: '1px dashed #ccc', pt: 2, mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                Thank you for choosing Medicare Pharmacy!
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                For any queries, please contact us within 7 days
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.7rem', mt: 1 }}>
                This is a computer-generated receipt
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.7rem' }}>
                Visit us at: www.medicare.lk
              </Typography>
            </Box>

            {/* ACTION BUTTONS */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
              <Button
                variant="outlined"
                onClick={() => setShowReceipt(false)}
                sx={{ borderColor: '#6b7280', color: '#6b7280' }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                onClick={printReceipt}
                sx={{ background: '#1976d2', color: 'white' }}
              >
                🖨️ Print Receipt
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Loading receipt...</Typography>
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
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ 
          backgroundColor: '#1976d2',
          color: 'white',
          p: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
            Select Unit Type
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Choose how you want to add this medicine to cart
          </Typography>
        </Box>

        {selectedMedicineForUnit && (
          <Box sx={{ p: 3 }}>
            {/* Medicine Information */}
            <Box sx={{ 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2, 
              p: 2, 
              mb: 3,
              border: '1px solid #e5e7eb'
            }}>
              <Typography variant="h6" fontWeight="bold" color="#1976d2" sx={{ mb: 0.5 }}>
                {selectedMedicineForUnit.name}
              </Typography>
              <Typography variant="body2" color="#666" sx={{ mb: 1.5 }}>
                {selectedMedicineForUnit.genericName} - {selectedMedicineForUnit.strength}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  {formatCurrency(selectedMedicineForUnit.sellingPrice)} per unit
                </Typography>
                <Chip 
                  label={`Stock: ${getMedicineStock(selectedMedicineForUnit)}`}
                  size="small"
                  sx={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>

            {/* Unit Selection */}
            <Typography variant="subtitle1" fontWeight="bold" color="#333" sx={{ mb: 2 }}>
              Select Unit Type:
            </Typography>

            <RadioGroup
              value={selectedUnitType}
              onChange={(e) => setSelectedUnitType(e.target.value)}
              sx={{ mb: 3 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Paper
                  sx={{
                    p: 2,
                    border: selectedUnitType === 'tablets' ? '2px solid #1976d2' : '2px solid #e5e7eb',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: '#f8f9fa'
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
                          color: '#1976d2',
                          '&.Mui-checked': { color: '#1976d2' }
                        }}
                      />
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="#333">
                          Individual Tablets/Capsules
                        </Typography>
                        <Typography variant="body2" color="#666">
                          Add one tablet/capsule at a time
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" fontWeight="bold" color="#1976d2">
                        +1 unit
                      </Typography>
                      <Typography variant="body2" color="#666">
                        {formatCurrency(selectedMedicineForUnit.sellingPrice)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    border: selectedUnitType === 'cards' ? '2px solid #1976d2' : '2px solid #e5e7eb',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: '#f8f9fa'
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
                          color: '#1976d2',
                          '&.Mui-checked': { color: '#1976d2' }
                        }}
                      />
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="#333">
                          Full Card/Strip
                        </Typography>
                        <Typography variant="body2" color="#666">
                          Add a complete card (10 tablets/capsules)
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" fontWeight="bold" color="#1976d2">
                        +10 units
                      </Typography>
                      <Typography variant="body2" color="#666">
                        {formatCurrency(selectedMedicineForUnit.sellingPrice * 10)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </RadioGroup>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', pt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setShowUnitSelectionModal(false)}
                sx={{ 
                  borderColor: '#6b7280', 
                  color: '#6b7280',
                  px: 4,
                  py: 1,
                  borderRadius: 1,
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                CANCEL
              </Button>
              <Button
                variant="contained"
                onClick={handleUnitSelectionAndAddToCart}
                sx={{ 
                  backgroundColor: '#1976d2',
                  color: 'white',
                  px: 4,
                  py: 1,
                  borderRadius: 1,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                ADD TO CART
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default PharmacyPOSFirebaseIntegrated;
