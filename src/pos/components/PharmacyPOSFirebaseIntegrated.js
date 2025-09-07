import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Chip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Receipt,
  Payment,
  Inventory,
  Analytics,
  Settings,
  Search,
  Print,
  Save,
  Clear,
  Home,
  ExitToApp,
  AccountCircle,
  Notifications,
  Dashboard,
  Store,
  LocalPharmacy,
  MonetizationOn,
  TrendingUp,
  People,
  Category,
  Today,
  Timer
} from '@mui/icons-material';

const PharmacyPOSFirebaseIntegrated = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Sample products data
  useEffect(() => {
    const sampleProducts = [
      { id: 1, name: 'Paracetamol 500mg', category: 'Tablets', price: 25.00, stock: 100, barcode: '123456789' },
      { id: 2, name: 'Amoxicillin 250mg', category: 'Capsules', price: 45.00, stock: 50, barcode: '123456790' },
      { id: 3, name: 'Cough Syrup', category: 'Syrups', price: 120.00, stock: 30, barcode: '123456791' },
      { id: 4, name: 'Vitamin C', category: 'Supplements', price: 80.00, stock: 75, barcode: '123456792' },
      { id: 5, name: 'Hand Sanitizer', category: 'Personal Care', price: 35.00, stock: 200, barcode: '123456793' }
    ];
    setProducts(sampleProducts);
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate total
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setSnackbarMessage(`${product.name} added to cart`);
    setSnackbarOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setSnackbarMessage('Cart cleared');
    setSnackbarOpen(true);
  };

  const processPayment = () => {
    if (cart.length === 0) {
      setSnackbarMessage('Cart is empty');
      setSnackbarOpen(true);
      return;
    }
    setDialogOpen(true);
  };

  const confirmPayment = () => {
    // Here you would integrate with your payment system
    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setDialogOpen(false);
    setSnackbarMessage('Payment processed successfully');
    setSnackbarOpen(true);
  };

  const handleLogout = () => {
    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate back to login screen
    window.location.href = '/';
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const sidebarItems = [
    { text: 'Dashboard', icon: <Dashboard />, active: true },
    { text: 'Sales', icon: <MonetizationOn /> },
    { text: 'Inventory', icon: <Inventory /> },
    { text: 'Analytics', icon: <TrendingUp /> },
    { text: 'Customers', icon: <People /> },
    { text: 'Categories', icon: <Category /> },
    { text: 'Settings', icon: <Settings /> }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Top App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 1300,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          boxShadow: '0 4px 20px rgba(30, 58, 138, 0.3)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <Store />
          </IconButton>
          
          <LocalPharmacy sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            CoreERP - Pharmacy POS
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<Today />}
              label={currentTime.toLocaleDateString()}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            <Chip
              icon={<Timer />}
              label={currentTime.toLocaleTimeString()}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <Button
              color="inherit"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              sx={{
                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(220, 38, 38, 1)',
                },
                fontWeight: 'bold'
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            mt: 8,
            background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
            color: 'white'
          },
        }}
      >
        <List sx={{ mt: 2 }}>
          {sidebarItems.map((item, index) => (
            <ListItem 
              key={item.text} 
              button
              sx={{
                mx: 1,
                mb: 1,
                borderRadius: 2,
                backgroundColor: item.active ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          ml: drawerOpen ? 0 : 0,
          transition: 'margin-left 0.3s',
          display: 'flex',
          gap: 2,
          p: 2
        }}
      >
        {/* Products Section */}
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1e3a8a', fontWeight: 'bold' }}>
              Product Search
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products by name, category, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: '#1e3a8a' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#1e3a8a',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e3a8a',
                  }
                }
              }}
            />
          </Paper>

          <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ p: 2, color: '#1e3a8a', fontWeight: 'bold' }}>
              Available Products
            </Typography>
            <Grid container spacing={2} sx={{ p: 2 }}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(30, 58, 138, 0.2)'
                      }
                    }}
                    onClick={() => addToCart(product)}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                        {product.name}
                      </Typography>
                      <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                        {product.category}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                          ₹{product.price.toFixed(2)}
                        </Typography>
                        <Chip 
                          label={`Stock: ${product.stock}`} 
                          size="small" 
                          color={product.stock > 20 ? 'success' : product.stock > 5 ? 'warning' : 'error'}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* Cart Section */}
        <Box sx={{ flex: 1, minWidth: 350 }}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1e3a8a', fontWeight: 'bold' }}>
                Shopping Cart
              </Typography>
              <IconButton onClick={clearCart} color="error">
                <Clear />
              </IconButton>
            </Box>

            {cart.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ShoppingCart sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                <Typography color="textSecondary">
                  Your cart is empty
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
                  {cart.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ₹{item.price.toFixed(2)} each
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Add />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total:
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                    ₹{total.toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Payment />}
                    onClick={processPayment}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      }
                    }}
                  >
                    Pay Now
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Print />}
                    sx={{
                      borderColor: '#1e3a8a',
                      color: '#1e3a8a',
                      '&:hover': {
                        backgroundColor: '#eff6ff',
                        borderColor: '#1d4ed8'
                      }
                    }}
                  >
                    Print
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Payment Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Payment sx={{ mr: 1 }} />
            Process Payment
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total Amount:</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    ₹{total.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Customer Information (Optional)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmPayment}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }
            }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success"
          sx={{ borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PharmacyPOSFirebaseIntegrated;
