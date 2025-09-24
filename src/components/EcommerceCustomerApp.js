import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, 
  CardActions, Button, AppBar, Toolbar, IconButton, Badge, Drawer,
  List, ListItem, ListItemText, ListItemIcon, Divider, TextField,
  InputAdornment, Chip, Rating, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, Avatar, Menu, MenuItem, Fab, Paper,
  FormControl, InputLabel, Select, Backdrop, CircularProgress
} from '@mui/material';
import {
  ShoppingCart, Favorite, Search, FilterList, Sort, Category,
  LocalPharmacy, Star, Add, Remove, Delete, AccountCircle,
  Logout, Home, Info, LocationOn, Phone, Email, Menu as MenuIcon,
  Visibility, VisibilityOff, Google, Facebook, Close, Person,
  ShoppingBag
} from '@mui/icons-material';

// Real Sri Lankan OTC Medicine Data
const medicineCategories = [
  { id: 1, name: 'Pain Relief', icon: '💊', color: '#e3f2fd' },
  { id: 2, name: 'Cold & Flu', icon: '🤧', color: '#f3e5f5' },
  { id: 3, name: 'Digestive Health', icon: '🫄', color: '#e8f5e8' },
  { id: 4, name: 'Vitamins & Supplements', icon: '💪', color: '#fff3e0' },
  { id: 5, name: 'Skin Care', icon: '🧴', color: '#fce4ec' },
  { id: 6, name: 'First Aid', icon: '🩹', color: '#e0f2f1' },
  { id: 7, name: 'Baby Care', icon: '👶', color: '#e1f5fe' },
  { id: 8, name: 'Personal Care', icon: '🧼', color: '#f1f8e9' }
];

const featuredProducts = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    category: 'Pain Relief',
    price: 85.00,
    originalPrice: 95.00,
    image: '/api/placeholder/300/300',
    rating: 4.8,
    reviews: 1245,
    description: 'Effective pain relief and fever reducer. Safe for adults and children over 12 years.',
    inStock: true,
    brand: 'Generic'
  },
  {
    id: 2,
    name: 'Vitamin C 1000mg',
    category: 'Vitamins & Supplements',
    price: 450.00,
    originalPrice: 500.00,
    image: '/api/placeholder/300/300',
    rating: 4.6,
    reviews: 892,
    description: 'High potency Vitamin C tablets for immune system support.',
    inStock: true,
    brand: 'Nature\'s Own'
  },
  {
    id: 3,
    name: 'Cough Syrup 100ml',
    category: 'Cold & Flu',
    price: 125.00,
    originalPrice: 140.00,
    image: '/api/placeholder/300/300',
    rating: 4.7,
    reviews: 567,
    description: 'Non-drowsy cough syrup for dry and productive cough relief.',
    inStock: true,
    brand: 'Benylin'
  },
  {
    id: 4,
    name: 'Antacid Tablets',
    category: 'Digestive Health',
    price: 95.00,
    originalPrice: 110.00,
    image: '/api/placeholder/300/300',
    rating: 4.5,
    reviews: 423,
    description: 'Fast-acting antacid for heartburn and indigestion relief.',
    inStock: true,
    brand: 'Digene'
  },
  {
    id: 5,
    name: 'Antiseptic Cream 30g',
    category: 'First Aid',
    price: 165.00,
    originalPrice: 180.00,
    image: '/api/placeholder/300/300',
    rating: 4.9,
    reviews: 789,
    description: 'Antiseptic cream for cuts, wounds and minor skin infections.',
    inStock: true,
    brand: 'Savlon'
  },
  {
    id: 6,
    name: 'Multivitamin Tablets',
    category: 'Vitamins & Supplements',
    price: 750.00,
    originalPrice: 850.00,
    image: '/api/placeholder/300/300',
    rating: 4.4,
    reviews: 1089,
    description: 'Complete multivitamin formula with essential vitamins and minerals.',
    inStock: true,
    brand: 'Centrum'
  }
];

const EcommerceCustomerApp = ({ onLogout, cart = [], setCart, onOrderComplete }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginTab, setLoginTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  const [cartItems, setCartItems] = useState(cart);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Login handlers
  const handleLogin = (email, password) => {
    setLoading(true);
    // Simulate login API call
    setTimeout(() => {
      setUser({ 
        name: 'John Doe', 
        email, 
        avatar: '/api/placeholder/40/40',
        memberSince: '2024'
      });
      setIsLoggedIn(true);
      setLoginDialogOpen(false);
      setLoading(false);
    }, 1500);
  };

  const handleGuestContinue = () => {
    setUser({ 
      name: 'Guest User', 
      email: 'guest@medishop.lk',
      avatar: '/api/placeholder/40/40',
      memberSince: 'Guest'
    });
    setIsLoggedIn(true);
    setLoginDialogOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCartItems([]);
    setWishlistItems([]);
    if (onLogout) {
      onLogout();
    }
  };

  const requireLogin = (callback) => {
    if (!isLoggedIn) {
      setLoginDialogOpen(true);
      return;
    }
    callback();
  };

  const addToCart = (product) => {
    requireLogin(() => {
      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    });
  };

  const addToWishlist = (product) => {
    requireLogin(() => {
      setWishlistItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev;
        }
        return [...prev, product];
      });
    });
  };

  const ProductCard = ({ product }) => (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: '16px',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.category}
        </Typography>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, fontSize: '1rem' }}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
          {product.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={product.rating} precision={0.1} size="small" readOnly />
          <Typography variant="caption" sx={{ ml: 1 }}>
            ({product.reviews})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Rs. {product.price.toFixed(2)}
          </Typography>
          {product.originalPrice > product.price && (
            <Typography 
              variant="body2" 
              sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}
            >
              Rs. {product.originalPrice.toFixed(2)}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<ShoppingCart />}
            onClick={() => addToCart(product)}
            sx={{ flex: 1, borderRadius: '8px' }}
          >
            Add to Cart
          </Button>
          <IconButton
            color="primary"
            onClick={() => addToWishlist(product)}
            sx={{ border: '1px solid', borderColor: 'primary.main' }}
          >
            <Favorite />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <LocalPharmacy sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            MediShop
          </Typography>

          <TextField
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ 
              mr: 2, 
              minWidth: 300,
              display: { xs: 'none', md: 'block' },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '25px',
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: '2px solid rgba(255,255,255,0.3)' }
              },
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton color="inherit" onClick={() => requireLogin(() => {})}>
            <Badge badgeContent={wishlistItems.length} color="error">
              <Favorite />
            </Badge>
          </IconButton>
          
          <IconButton color="inherit" onClick={() => setCartDrawerOpen(true)}>
            <Badge badgeContent={cartItems.reduce((sum, item) => sum + item.quantity, 0)} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          
          {isLoggedIn ? (
            <IconButton
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <Avatar 
                src={user?.avatar} 
                sx={{ width: 32, height: 32 }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          ) : (
            <Button
              color="inherit"
              startIcon={<AccountCircle />}
              onClick={() => setLoginDialogOpen(true)}
              sx={{ 
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: '20px',
                px: 3
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Categories Bar */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Container maxWidth="xl">
          <Tabs
            value={selectedCategory}
            onChange={(e, newValue) => setSelectedCategory(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ py: 1 }}
          >
            <Tab label="All Products" />
            {medicineCategories.map((category) => (
              <Tab key={category.id} label={category.name} />
            ))}
          </Tabs>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Hero Banner */}
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏥 Trusted Online Pharmacy in Sri Lanka
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Over 1000+ genuine OTC medicines & health products
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
              borderRadius: '25px',
              px: 4
            }}
          >
            Shop Now
          </Button>
        </Paper>

        {/* Featured Products */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Featured Products
        </Typography>
        
        <Grid container spacing={3}>
          {featuredProducts.map((product) => (
            <Grid key={product.id} xs={12} sm={6} md={4} lg={2}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>

        {/* Categories Grid */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 5, mb: 3 }}>
          Shop by Category
        </Typography>
        
        <Grid container spacing={2}>
          {medicineCategories.map((category) => (
            <Grid key={category.id} xs={6} sm={4} md={3} lg={2}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: '12px',
                  backgroundColor: category.color,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                <Typography variant="h4" sx={{ mb: 1 }}>{category.icon}</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {category.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Floating Cart Button */}
      <Fab
        color="primary"
        onClick={() => setCartDrawerOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Badge badgeContent={cartItems.reduce((sum, item) => sum + item.quantity, 0)} color="error">
          <ShoppingBag />
        </Badge>
      </Fab>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { mt: 1, minWidth: 200 }
        }}
      >
        <MenuItem>
          <Avatar src={user?.avatar} sx={{ mr: 2, width: 32, height: 32 }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Member since {user?.memberSince}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><Person /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><ShoppingBag /></ListItemIcon>
          Orders
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><Favorite /></ListItemIcon>
          Wishlist
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Professional Login Dialog */}
      <Dialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            textAlign: 'center'
          }}
        >
          <LocalPharmacy sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Welcome to MediShop
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Login to access your cart, wishlist, and exclusive deals
          </Typography>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <Tabs 
            value={loginTab} 
            onChange={(e, newValue) => setLoginTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {loginTab === 0 ? (
              // Login Form
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleLogin('demo@medishop.lk', 'password')}
                  disabled={loading}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>
              </Box>
            ) : (
              // Sign Up Form
              <Box component="form" sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Social Login */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    textTransform: 'none',
                    borderColor: '#db4437',
                    color: '#db4437',
                    '&:hover': {
                      borderColor: '#db4437',
                      backgroundColor: 'rgba(219, 68, 55, 0.04)'
                    }
                  }}
                >
                  Google
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Facebook />}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    textTransform: 'none',
                    borderColor: '#4267B2',
                    color: '#4267B2',
                    '&:hover': {
                      borderColor: '#4267B2',
                      backgroundColor: 'rgba(66, 103, 178, 0.04)'
                    }
                  }}
                >
                  Facebook
                </Button>
              </Grid>
            </Grid>

            {/* Guest Continue */}
            <Button
              fullWidth
              variant="text"
              onClick={handleGuestContinue}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Continue as Guest
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default EcommerceCustomerApp;
