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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  Autocomplete,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Print,
  Receipt,
  Inventory,
  Remove,
  Visibility
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc, Timestamp, writeBatch } from 'firebase/firestore';

export default function Invoicing({ dateFilter }) {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    items: [],
    subtotal: 0,
    tax: 0,
    taxRate: 12,
    discount: 0,
    total: 0,
    paymentMethod: 'cash',
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);

  useEffect(() => {
    loadInvoices();
    loadCustomers();
    loadInventory();
  }, []);

  useEffect(() => {
    // Filter invoices based on search term
    const filtered = invoices.filter(invoice =>
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [invoices, searchTerm]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const invoicesQuery = query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(invoicesQuery);
      const invoiceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setInvoices(invoiceData);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersQuery = query(collection(db, 'customers'));
      const snapshot = await getDocs(customersQuery);
      const customerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customerData);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const inventoryQuery = query(
        collection(db, 'medicines'),
        where('stockQuantity', '>', 0)
      );
      const snapshot = await getDocs(inventoryQuery);
      const inventoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const calculateInvoiceTotals = (items, taxRate = 12, discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax - discount;
    
    return { subtotal, tax, total };
  };

  const addItemToInvoice = () => {
    if (!selectedProduct || productQuantity <= 0) return;

    const existingItemIndex = newInvoice.items.findIndex(item => item.productId === selectedProduct.id);
    
    let updatedItems;
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = [...newInvoice.items];
      updatedItems[existingItemIndex].quantity += productQuantity;
    } else {
      // Add new item
      const newItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        genericName: selectedProduct.genericName,
        batchNumber: selectedProduct.batchNumber,
        expiryDate: selectedProduct.expiryDate,
        unitPrice: selectedProduct.sellingPrice,
        quantity: productQuantity,
        stockAvailable: selectedProduct.stockQuantity
      };
      updatedItems = [...newInvoice.items, newItem];
    }

    const totals = calculateInvoiceTotals(updatedItems, newInvoice.taxRate, newInvoice.discount);
    
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      ...totals
    });

    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const removeItemFromInvoice = (productId) => {
    const updatedItems = newInvoice.items.filter(item => item.productId !== productId);
    const totals = calculateInvoiceTotals(updatedItems, newInvoice.taxRate, newInvoice.discount);
    
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      ...totals
    });
  };

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromInvoice(productId);
      return;
    }

    const updatedItems = newInvoice.items.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    
    const totals = calculateInvoiceTotals(updatedItems, newInvoice.taxRate, newInvoice.discount);
    
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      ...totals
    });
  };

  const handleSaveInvoice = async () => {
    try {
      setLoading(true);

      // Validation
      if (!newInvoice.customerId || newInvoice.items.length === 0) {
        alert('Customer and at least one item are required!');
        return;
      }

      // Check stock availability
      for (const item of newInvoice.items) {
        if (item.quantity > item.stockAvailable) {
          alert(`Insufficient stock for ${item.productName}. Available: ${item.stockAvailable}`);
          return;
        }
      }

      const invoiceData = {
        ...newInvoice,
        invoiceNumber: `INV-${Date.now()}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'paid'
      };

      // Use batch to update inventory and create invoice
      const batch = writeBatch(db);

      // Add invoice
      const invoiceRef = doc(collection(db, 'invoices'));
      batch.set(invoiceRef, invoiceData);

      // Update inventory stock
      for (const item of newInvoice.items) {
        const medicineRef = doc(db, 'medicines', item.productId);
        const newStock = item.stockAvailable - item.quantity;
        batch.update(medicineRef, {
          stockQuantity: newStock,
          updatedAt: Timestamp.now()
        });
      }

      await batch.commit();

      setShowInvoiceDialog(false);
      resetNewInvoice();
      loadInvoices();
      loadInventory(); // Refresh inventory
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteDoc(doc(db, 'invoices', invoiceId));
        loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Error deleting invoice!');
      }
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsDialog(true);
  };

  const handlePrintInvoice = (invoice) => {
    // This would typically open a print dialog or generate PDF
    console.log('Print invoice:', invoice);
    alert(`Printing invoice ${invoice.invoiceNumber} (Feature: Generate PDF)`);
  };

  const resetNewInvoice = () => {
    setNewInvoice({
      customerId: '',
      customerName: '',
      customerPhone: '',
      items: [],
      subtotal: 0,
      tax: 0,
      taxRate: 12,
      discount: 0,
      total: 0,
      paymentMethod: 'cash',
      notes: ''
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toLocaleString() || '0.00'}`;
  };

  return (
    <Box>
      {/* Header with Search and Add Button */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="#000000">
            Invoicing & Billing
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowInvoiceDialog(true)}
            sx={{
              backgroundColor: '#000000',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            Create New Invoice
          </Button>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Search invoices by customer name, invoice number, or payment method..."
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
      </Paper>

      {/* Invoices Table */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#000000' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Invoice #</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Items</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((invoice, index) => (
                <TableRow 
                  key={invoice.id} 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                  }}
                >
                  <TableCell>
                    <Typography fontWeight="bold">{invoice.invoiceNumber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography fontWeight="bold">{invoice.customerName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {invoice.customerPhone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${invoice.items?.length || 0} items`}
                      color="info"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="#000000">
                      {formatCurrency(invoice.total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={invoice.paymentMethod} 
                      color={invoice.paymentMethod === 'cash' ? 'success' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {invoice.createdAt ? new Date(invoice.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      onClick={() => handleViewDetails(invoice)}
                      sx={{ color: '#000000', mr: 1 }}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      onClick={() => handlePrintInvoice(invoice)}
                      sx={{ color: '#000000', mr: 1 }}
                      title="Print Invoice"
                    >
                      <Print />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      sx={{ color: '#d32f2f' }}
                      title="Delete Invoice"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm ? 'No invoices found matching your search.' : 'No invoices found. Create your first invoice!'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Invoice Dialog */}
      <Dialog 
        open={showInvoiceDialog} 
        onClose={() => setShowInvoiceDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#000000', color: 'white', fontWeight: 'bold' }}>
          Create New Invoice
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Customer Selection */}
            <Grid item xs={12}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.name} - ${option.phoneNumber}`}
                value={customers.find(c => c.id === newInvoice.customerId) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setNewInvoice({
                      ...newInvoice,
                      customerId: newValue.id,
                      customerName: newValue.name,
                      customerPhone: newValue.phoneNumber
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer *"
                    error={!newInvoice.customerId}
                    helperText={!newInvoice.customerId ? 'Customer selection is required' : ''}
                  />
                )}
              />
            </Grid>

            {/* Product Selection */}
            <Grid item xs={12} md={8}>
              <Autocomplete
                options={inventory}
                getOptionLabel={(option) => `${option.name} - ${option.genericName} (Stock: ${option.stockQuantity})`}
                value={selectedProduct}
                onChange={(event, newValue) => setSelectedProduct(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Product"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Inventory />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={addItemToInvoice}
                disabled={!selectedProduct || productQuantity <= 0}
                sx={{
                  backgroundColor: '#000000',
                  height: '56px',
                  '&:hover': {
                    backgroundColor: '#333333'
                  }
                }}
              >
                Add Item
              </Button>
            </Grid>

            {/* Invoice Items */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Invoice Items
              </Typography>
              {newInvoice.items.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell fontWeight="bold">Product</TableCell>
                        <TableCell fontWeight="bold">Batch/Lot</TableCell>
                        <TableCell fontWeight="bold">Unit Price</TableCell>
                        <TableCell fontWeight="bold">Quantity</TableCell>
                        <TableCell fontWeight="bold">Total</TableCell>
                        <TableCell fontWeight="bold">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {newInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography fontWeight="bold">{item.productName}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.genericName}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.batchNumber}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                              size="small"
                              inputProps={{ min: 0, max: item.stockAvailable }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell>{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => removeItemFromInvoice(item.productId)}
                              color="error"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No items added yet. Select products from inventory above.</Alert>
              )}
            </Grid>

            {/* Invoice Totals */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Tax Rate (%)"
                    type="number"
                    value={newInvoice.taxRate}
                    onChange={(e) => {
                      const taxRate = parseFloat(e.target.value) || 0;
                      const totals = calculateInvoiceTotals(newInvoice.items, taxRate, newInvoice.discount);
                      setNewInvoice({ ...newInvoice, taxRate, ...totals });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Discount"
                    type="number"
                    value={newInvoice.discount}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      const totals = calculateInvoiceTotals(newInvoice.items, newInvoice.taxRate, discount);
                      setNewInvoice({ ...newInvoice, discount, ...totals });
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={newInvoice.paymentMethod}
                      onChange={(e) => setNewInvoice({ ...newInvoice, paymentMethod: e.target.value })}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Credit/Debit Card</MenuItem>
                      <MenuItem value="bank">Bank Transfer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Invoice Summary */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Invoice Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCurrency(newInvoice.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax ({newInvoice.taxRate}%):</Typography>
                    <Typography>{formatCurrency(newInvoice.tax)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Discount:</Typography>
                    <Typography>-{formatCurrency(newInvoice.discount)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">Total:</Typography>
                    <Typography variant="h6" fontWeight="bold" color="#000000">
                      {formatCurrency(newInvoice.total)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Invoice Notes"
                multiline
                rows={3}
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                placeholder="Additional notes or special instructions..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setShowInvoiceDialog(false);
              resetNewInvoice();
            }}
            sx={{ color: '#666666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveInvoice}
            disabled={loading || !newInvoice.customerId || newInvoice.items.length === 0}
            sx={{
              backgroundColor: '#000000',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#000000', color: 'white', fontWeight: 'bold' }}>
          Invoice Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedInvoice && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Invoice Information
                    </Typography>
                    <Typography><strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}</Typography>
                    <Typography><strong>Date:</strong> {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt.toDate()).toLocaleDateString() : 'N/A'}</Typography>
                    <Typography><strong>Payment:</strong> 
                      <Chip 
                        label={selectedInvoice.paymentMethod} 
                        color={selectedInvoice.paymentMethod === 'cash' ? 'success' : 'primary'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Customer Information
                    </Typography>
                    <Typography><strong>Name:</strong> {selectedInvoice.customerName}</Typography>
                    <Typography><strong>Phone:</strong> {selectedInvoice.customerPhone}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Items
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell fontWeight="bold">Product</TableCell>
                        <TableCell fontWeight="bold">Batch</TableCell>
                        <TableCell fontWeight="bold">Unit Price</TableCell>
                        <TableCell fontWeight="bold">Quantity</TableCell>
                        <TableCell fontWeight="bold">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedInvoice.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography fontWeight="bold">{item.productName}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.genericName}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.batchNumber}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Invoice Summary
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>{formatCurrency(selectedInvoice.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Tax:</Typography>
                      <Typography>{formatCurrency(selectedInvoice.tax)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Discount:</Typography>
                      <Typography>-{formatCurrency(selectedInvoice.discount)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="bold">Total:</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#000000">
                        {formatCurrency(selectedInvoice.total)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              {selectedInvoice.notes && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Notes
                      </Typography>
                      <Typography>{selectedInvoice.notes}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowDetailsDialog(false)}
            sx={{ color: '#666666' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => handlePrintInvoice(selectedInvoice)}
            sx={{
              backgroundColor: '#000000',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
