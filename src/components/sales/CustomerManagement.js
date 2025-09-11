import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
  InputAdornment,
  Fab,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add,
  Edit,
  History,
  Search,
  Person,
  Phone,
  Email,
  Badge,
  Receipt,
  CheckCircle,
  Cancel,
  ChildCare,
  Close,
  Delete,
  PersonAdd
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { patientService } from '../../services/patientService';

export default function CustomerManagement({ dateFilter }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nic, setNic] = useState('');
  const [age, setAge] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [status, setStatus] = useState('Active');

  // Load customers from Firebase
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'customers'));
      const customerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customerList);
      console.log('Loaded customers:', customerList.length);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm) ||
      (customer.nic && customer.nic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  // Load customer transaction history
  const loadCustomerHistory = async (customerId) => {
    try {
      setLoading(true);
      
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        console.log('Customer not found for ID:', customerId);
        setCustomerOrders([]);
        return;
      }
      
      console.log('=== CUSTOMER HISTORY DEBUG ===');
      console.log('Loading history for customer:', customer);
      console.log('Customer NIC:', customer.nic);
      console.log('Customer Name:', customer.name);
      console.log('Customer Phone:', customer.phoneNumber);
      
      // Create multiple query strategies to find transactions
      const searchStrategies = [
        // Strategy 1: Search by NIC in customerNIC field
        {
          name: 'customerNIC',
          field: 'customerNIC',
          value: customer.nic
        },
        // Strategy 2: Search by NIC in patientNIC field
        {
          name: 'patientNIC', 
          field: 'patientNIC',
          value: customer.nic
        },
        // Strategy 3: Search by customer name
        {
          name: 'customerName',
          field: 'customerName', 
          value: customer.name
        },
        // Strategy 4: Search by customer contact/phone
        {
          name: 'customerContact',
          field: 'customerContact',
          value: customer.phoneNumber
        }
      ];
      
      let allTransactions = [];
      
      for (const strategy of searchStrategies) {
        if (!strategy.value) continue; // Skip if value is empty
        
        try {
          console.log(`🔍 Searching by ${strategy.name}: "${strategy.value}"`);
          
          const transactionQuery = query(
            collection(db, 'transactions'),
            where(strategy.field, '==', strategy.value),
            orderBy('createdAt', 'desc')
          );
          
          const snapshot = await getDocs(transactionQuery);
          const transactions = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            searchStrategy: strategy.name
          }));
          
          console.log(`✅ ${strategy.name} search found ${transactions.length} transactions`);
          if (transactions.length > 0) {
            console.log('Sample transaction:', transactions[0]);
          }
          
          allTransactions = [...allTransactions, ...transactions];
          
        } catch (queryError) {
          console.warn(`❌ ${strategy.name} search failed:`, queryError.message);
          
          // Try without orderBy if it fails
          try {
            console.log(`🔄 Retrying ${strategy.name} without orderBy...`);
            const simpleQuery = query(
              collection(db, 'transactions'),
              where(strategy.field, '==', strategy.value)
            );
            
            const snapshot = await getDocs(simpleQuery);
            const transactions = snapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              searchStrategy: strategy.name + '_simple'
            }));
            
            console.log(`✅ ${strategy.name} simple search found ${transactions.length} transactions`);
            allTransactions = [...allTransactions, ...transactions];
            
          } catch (simpleError) {
            console.warn(`❌ ${strategy.name} simple search also failed:`, simpleError.message);
          }
        }
      }
      
      // Remove duplicates based on transaction ID
      const uniqueTransactions = allTransactions.reduce((acc, current) => {
        const exists = acc.find(item => item.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      // Sort by date (newest first)
      uniqueTransactions.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.toDate() - a.createdAt.toDate();
      });
      
      console.log('📊 SEARCH RESULTS SUMMARY:');
      console.log(`Total transactions found: ${uniqueTransactions.length}`);
      console.log('Search strategies used:', searchStrategies.map(s => s.name).join(', '));
      console.log('Unique transactions:', uniqueTransactions.map(t => ({
        id: t.id.substring(0, 8),
        strategy: t.searchStrategy,
        customer: t.customerName,
        total: t.total,
        date: t.createdAt ? new Date(t.createdAt.toDate()).toLocaleDateString() : 'No date'
      })));
      console.log('================================');
      
      setCustomerOrders(uniqueTransactions);
      setSelectedCustomerHistory(customer);
      setShowHistoryDialog(true);
      
    } catch (error) {
      console.error('Error loading customer history:', error);
      setCustomerOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCustomerName('');
    setPhoneNumber('');
    setEmail('');
    setAddress('');
    setNic('');
    setAge('');
    setDateOfBirth('');
    setGender('');
    setBloodGroup('');
    setMedicalNotes('');
    setStatus('Active');
    setEditingCustomer(null);
  };

  // Save customer with enhanced duplicate prevention
  const handleSaveCustomer = async () => {
    try {
      // Validation
      if (!customerName.trim()) {
        alert('Customer name is required');
        return;
      }

      // Enhanced duplicate prevention
      const duplicateChecks = [];
      
      // Check for NIC duplicates (if NIC provided)
      if (nic.trim() && nic.length >= 9) {
        const nicQuery = query(
          collection(db, 'customers'),
          where('nic', '==', nic.trim())
        );
        duplicateChecks.push(
          getDocs(nicQuery).then(snapshot => ({
            type: 'NIC',
            value: nic.trim(),
            exists: !snapshot.empty,
            existingId: snapshot.empty ? null : snapshot.docs[0].id
          }))
        );
      }

      // Check for phone duplicates (if phone provided)
      if (phoneNumber.trim() && phoneNumber.length >= 9) {
        const phoneQuery = query(
          collection(db, 'customers'),
          where('phoneNumber', '==', phoneNumber.trim())
        );
        duplicateChecks.push(
          getDocs(phoneQuery).then(snapshot => ({
            type: 'Phone',
            value: phoneNumber.trim(),
            exists: !snapshot.empty,
            existingId: snapshot.empty ? null : snapshot.docs[0].id
          }))
        );
      }

      // Perform duplicate checks
      const duplicateResults = await Promise.all(duplicateChecks);
      const conflicts = duplicateResults.filter(result => 
        result.exists && result.existingId !== editingCustomer?.id
      );

      if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(conflict => 
          `${conflict.type}: ${conflict.value} already exists`
        ).join('\n');
        
        const shouldContinue = confirm(
          `⚠️ DUPLICATE CUSTOMER DETECTED:\n\n${conflictMessages}\n\nThis may create duplicate records. Do you want to continue anyway?`
        );
        
        if (!shouldContinue) {
          return;
        }
      }

      const customerData = {
        name: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        address: address.trim(),
        nic: nic.trim(),
        age: age ? parseInt(age) : null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        bloodGroup: bloodGroup || null,
        medicalNotes: medicalNotes.trim() || null,
        status,
        totalPurchases: editingCustomer?.totalPurchases || 0,
        createdAt: editingCustomer?.createdAt || new Date(),
        updatedAt: new Date(),
        // Enhanced tracking
        primaryIdentifier: nic.trim() ? 'NIC' : (phoneNumber.trim() ? 'Phone' : 'Name'),
        lastUpdatedBy: 'CUSTOMER_MANAGEMENT',
        visitCount: editingCustomer?.visitCount || 0
      };

      let savedCustomerId = null;

      if (editingCustomer) {
        await updateDoc(doc(db, 'customers', editingCustomer.id), customerData);
        savedCustomerId = editingCustomer.id;
        console.log('✅ Customer updated:', editingCustomer.id);
        alert(`✅ Customer "${customerName}" updated successfully!`);
      } else {
        const customerRef = await addDoc(collection(db, 'customers'), customerData);
        savedCustomerId = customerRef.id;
        console.log('✅ New customer created:', customerRef.id);
        alert(`✅ Customer "${customerName}" created successfully!\nID: ${customerRef.id}\nIdentifier: ${customerData.primaryIdentifier}`);
      }

      // Also create/update patient record if we have medical info or if this is a new customer
      if (savedCustomerId && (medicalNotes.trim() || gender || bloodGroup || !editingCustomer)) {
        try {
          const patientData = {
            name: customerName.trim(),
            contact: phoneNumber.trim(),
            nic: nic.trim(),
            age: age || '',
            address: address.trim(),
            gender: gender || '',
            bloodGroup: bloodGroup || '',
            medicalNotes: medicalNotes.trim() || 'Customer record from Customer Management',
            customerId: savedCustomerId,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Check if patient already exists
          const existingPatient = nic.trim() ? await patientService.findPatientByNIC(nic.trim()) : null;
          
          if (existingPatient) {
            // Update existing patient
            await patientService.updatePatient(existingPatient.id, patientData);
            console.log('✅ Updated existing patient record');
          } else {
            // Create new patient
            await patientService.addPatient(patientData);
            console.log('✅ Created new patient record');
          }
        } catch (patientError) {
          console.warn('⚠️ Could not create/update patient record:', patientError.message);
          // Don't fail the customer creation for this
        }
      }

      setShowCustomerDialog(false);
      resetForm();
      loadCustomers();
    } catch (error) {
      console.error('❌ Error saving customer:', error);
      alert(`❌ Error saving customer: ${error.message}`);
    }
  };

  // Edit customer
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustomerName(customer.name);
    setPhoneNumber(customer.phoneNumber);
    setEmail(customer.email || '');
    setAddress(customer.address || '');
    setNic(customer.nic);
    setAge(customer.age?.toString() || '');
    setDateOfBirth(customer.dateOfBirth || '');
    setGender(customer.gender || '');
    setBloodGroup(customer.bloodGroup || '');
    setMedicalNotes(customer.medicalNotes || '');
    setStatus(customer.status);
    setShowCustomerDialog(true);
  };

  // Delete customer
  const handleDeleteCustomer = async (customer) => {
    const confirmed = window.confirm(
      `🗑️ DELETE CUSTOMER\n\n` +
      `Are you sure you want to delete "${customer.name}"?\n\n` +
      `This will:\n` +
      `• Remove the customer record\n` +
      `• Keep transaction history (for audit purposes)\n` +
      `• This action cannot be undone\n\n` +
      `Continue with deletion?`
    );
    
    if (!confirmed) return;
    
    try {
      setLoading(true);
      
      // Delete customer record
      await deleteDoc(doc(db, 'customers', customer.id));
      
      // Also delete associated patient record if it exists
      try {
        if (customer.nic) {
          const existingPatient = await patientService.findPatientByNIC(customer.nic);
          if (existingPatient) {
            await patientService.deletePatient(existingPatient.id);
            console.log('✅ Deleted associated patient record');
          }
        }
      } catch (patientError) {
        console.warn('⚠️ Could not delete patient record:', patientError.message);
        // Continue with customer deletion even if patient deletion fails
      }
      
      console.log('✅ Customer deleted:', customer.id);
      alert(`✅ Customer "${customer.name}" deleted successfully!`);
      
      // Reload customer list
      await loadCustomers();
      
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      alert(`❌ Error deleting customer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <Box>
      {/* Header with Search and Add Button */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="#000000">
            Customer Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={loadCustomers}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  borderColor: '#1976d2'
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => {
                resetForm();
                setShowCustomerDialog(true);
              }}
              sx={{
                backgroundColor: '#1976d2',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
            >
              Add Customer / Patient
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          placeholder="🔍 Smart Search: Enter NIC, phone number, name, or email to find customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        
        {/* Search Help Text */}
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Search Tips:
          </Typography>
          <Chip 
            label="NIC: Exact or partial match" 
            size="small" 
            sx={{ fontSize: '0.65rem', height: '20px' }}
          />
          <Chip 
            label="Phone: Full or partial number" 
            size="small" 
            sx={{ fontSize: '0.65rem', height: '20px' }}
          />
          <Chip 
            label="Name: Any part of the name" 
            size="small" 
            sx={{ fontSize: '0.65rem', height: '20px' }}
          />
        </Box>
      </Paper>

      {/* Customers Table */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#000000' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Customer Name
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Phone
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  <Badge sx={{ mr: 1, verticalAlign: 'middle' }} />
                  NIC
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Total Purchases
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Box>
                      <Typography fontWeight="bold">{customer.name}</Typography>
                      {customer.primaryIdentifier && (
                        <Chip 
                          label={`ID: ${customer.primaryIdentifier}`}
                          size="small"
                          sx={{
                            backgroundColor: customer.primaryIdentifier === 'NIC' ? '#e8f5e8' : '#e3f2fd',
                            color: customer.primaryIdentifier === 'NIC' ? '#2e7d32' : '#1976d2',
                            fontSize: '0.65rem',
                            height: '18px',
                            mt: 0.5
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography>{customer.phoneNumber}</Typography>
                      {customer.visitCount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {customer.visitCount} visit{customer.visitCount > 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography>{customer.nic}</Typography>
                      {customer.lastVisit && (
                        <Typography variant="caption" color="text.secondary">
                          Last: {new Date(customer.lastVisit.toDate ? customer.lastVisit.toDate() : customer.lastVisit).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography fontWeight="bold" color="primary">
                        LKR {(customer.totalPurchases || 0).toLocaleString()}
                      </Typography>
                      {customer.totalPurchases > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Avg: LKR {Math.round((customer.totalPurchases || 0) / Math.max(customer.visitCount || 1, 1)).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Chip
                        label={customer.status}
                        color={customer.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                      {customer.isWalkIn && (
                        <Chip
                          label="Walk-in"
                          size="small"
                          sx={{
                            backgroundColor: '#fff3e0',
                            color: '#ff9800',
                            fontSize: '0.65rem'
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditCustomer(customer)}
                        sx={{ color: '#1976d2' }}
                        title="Edit Customer/Patient"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => loadCustomerHistory(customer.id)}
                        sx={{ color: '#ff9800' }}
                        title="View Purchase History"
                      >
                        <History />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCustomer(customer)}
                        sx={{ color: '#f44336' }}
                        title="Delete Customer"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredCustomers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No customers found matching your search.' : 'No customers yet.'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Customer/Patient Dialog */}
      <Dialog open={showCustomerDialog} onClose={() => setShowCustomerDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd />
            {editingCustomer ? 'Update Customer / Patient' : 'Add Customer / Patient'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              💡 This form creates both a <strong>Customer</strong> (for sales tracking) and a <strong>Patient</strong> (for medical records). 
              Fill in as much information as available.
            </Typography>
          </Alert>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#1976d2', mb: 2, fontWeight: 'bold' }}>
                👤 Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0771234567"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NIC Number"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                placeholder="123456789V or 199812345678"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@email.com"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, city, postal code"
              />
            </Grid>

            {/* Medical Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, fontWeight: 'bold', mt: 2 }}>
                🏥 Medical Information (Optional)
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  label="Gender"
                >
                  <MenuItem value="">Not Specified</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  label="Blood Group"
                >
                  <MenuItem value="">Unknown</MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Notes / Allergies"
                multiline
                rows={3}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="Any medical conditions, allergies, or special notes..."
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomerDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveCustomer} variant="contained" sx={{ backgroundColor: '#1976d2' }}>
            {editingCustomer ? 'Update' : 'Add'} Customer / Patient
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onClose={() => setShowHistoryDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Customer Transaction History - {selectedCustomerHistory?.name}
            <IconButton onClick={() => setShowHistoryDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {customerOrders.length > 0 ? (
            customerOrders.map((order, index) => (
              <Paper key={order.id} sx={{ p: 3, mb: 3, border: '2px solid #1976d2', borderRadius: 2, backgroundColor: '#f8f9ff' }}>
                {/* Header Section - Exact same as POS Receipt */}
                <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '2px solid #1976d2' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                    🏥 CORE ERP PHARMACY
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    📍 Main Branch | 📞 Contact: +94-XX-XXXX-XXX
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000' }}>
                    📋 PHARMACY RECEIPT
                  </Typography>
                </Box>

                {/* Receipt Details */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      🧾 Receipt No: {order.receiptNumber || `RCP-${order.invoiceNumber}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      📄 Invoice No: {order.invoiceNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      📅 Date: {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                    </Typography>
                    <Typography variant="body2">
                      ⏰ Time: {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleTimeString('en-GB') : new Date().toLocaleTimeString('en-GB')}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Staff and Customer Info */}
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                    👨‍⚕️ Served By: {order.staffName || 'Staff'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>
                    👤 Customer: {order.customerName || 'Walk-in Customer'}
                  </Typography>
                  {order.customerContact && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📞 Contact: {order.customerContact}
                    </Typography>
                  )}
                  {order.prescriptionType && (
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                      💊 Prescription: {order.prescriptionInfo || order.prescriptionType}
                    </Typography>
                  )}
                </Box>

                {/* Items Table - Exact same format as POS */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, borderBottom: '1px dashed #ccc', pb: 1 }}>
                    📦 ITEMS PURCHASED
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Item</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'right' }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items?.map((item, itemIndex) => (
                        <TableRow key={itemIndex}>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {item.name}
                              </Typography>
                              {item.activeIngredient && (
                                <Typography variant="caption" color="text.secondary">
                                  {item.activeIngredient}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
                            {item.quantity}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
                            LKR {Number(item.price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            LKR {Number(item.totalPrice || (item.price * item.quantity)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>

                {/* Payment Summary - Exact same as POS */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={8}>
                      <Typography variant="body2">Subtotal:</Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">LKR {Number(order.netTotal || order.total || 0).toFixed(2)}</Typography>
                    </Grid>
                    
                    <Grid item xs={8}>
                      <Typography variant="body2">Discount:</Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">LKR {Number(order.discount || 0).toFixed(2)}</Typography>
                    </Grid>
                    
                    <Grid item xs={8}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', borderTop: '1px solid #ccc', pt: 1 }}>
                        TOTAL:
                      </Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', borderTop: '1px solid #ccc', pt: 1 }}>
                        LKR {Number(order.total || 0).toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={8}>
                      <Typography variant="body2">Payment Method:</Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                        {order.paymentMethod || 'CASH'}
                      </Typography>
                    </Grid>
                    
                    {order.paymentMethod === 'cash' && order.amountPaid && (
                      <>
                        <Grid item xs={8}>
                          <Typography variant="body2">Amount Paid:</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">LKR {Number(order.amountPaid).toFixed(2)}</Typography>
                        </Grid>
                        
                        <Grid item xs={8}>
                          <Typography variant="body2">Balance:</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">LKR {Number(order.balance || 0).toFixed(2)}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px dashed #ccc' }}>
                  <Typography variant="caption" color="text.secondary">
                    Thank you for choosing Core ERP Pharmacy!
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    🌿 Your health is our priority 🌿
                  </Typography>
                </Box>
              </Paper>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No transaction history found for this customer.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
