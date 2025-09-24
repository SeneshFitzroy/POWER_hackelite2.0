// Cache-busting comment: 2025-09-24-v2
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Rating,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  Radio,
  Switch
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import DownloadIcon from '@mui/icons-material/Download';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import { 
  medicineCategories, 
  medicineProducts, 
  sriLankanBrands,
  getProductRecommendations,
  recentlyViewedManager,
  priceRanges,
  sortOptions
} from '../../data/enhancedMedicineDatabase';
import ProfessionalLoginPage from './ProfessionalLoginPage';

const SriLankanPharmacyEcommerce = () => {
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [currentView, setCurrentView] = useState('products'); // products, cart, checkout, orders, profile
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orders, setOrders] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showChat, setShowChat] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pharmacyCart');
    const savedWishlist = localStorage.getItem('pharmacyWishlist');
    const savedUser = localStorage.getItem('pharmacyUser');
    const savedOrders = localStorage.getItem('pharmacyOrders');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    
    setRecentlyViewed(recentlyViewedManager.getProducts(medicineProducts));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('pharmacyCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pharmacyWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('pharmacyOrders', JSON.stringify(orders));
  }, [orders]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = medicineProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesSubcategory && matchesBrand && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        // Keep default order for relevance
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedSubcategory, selectedBrand, priceRange, sortBy]);

  // Cart functions
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    showSnackbar('Product added to cart!', 'success');
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    showSnackbar('Product removed from cart!', 'info');
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  // Wishlist functions
  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      showSnackbar('Removed from wishlist!', 'info');
    } else {
      setWishlist([...wishlist, product]);
      showSnackbar('Added to wishlist!', 'success');
    }
  };

  // Product detail functions
  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
    recentlyViewedManager.add(product.id);
    setRecentlyViewed(recentlyViewedManager.getProducts(medicineProducts));
  };

  // Utility functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setCurrentView('checkout');
    setCheckoutStep(0);
  };

  const completeOrder = () => {
    const newOrder = {
      id: Date.now().toString(),
      items: [...cart],
      total: calculateCartTotal(),
      customerInfo,
      paymentMethod,
      status: 'processing',
      date: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    setOrders([newOrder, ...orders]);
    setCart([]);
    setCurrentView('orders');
    showSnackbar('Order placed successfully!', 'success');
  };

  // Get subcategories for selected category
  const getSubcategories = () => {
    if (selectedCategory === 'all') return [];
    const category = medicineCategories.find(cat => cat.id === selectedCategory);
    return category?.subcategories || [];
  };

  // Header Component
  const Header = () => (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      color: 'white',
      py: 2,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <Container maxWidth="xl">
        <Grid container alignItems="center" spacing={2}>
          {/* Logo */}
          <Grid xs={12} sm={2}>
            <Typography variant="h5" fontWeight="bold" sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentView('products')}>
              🏥 MediCare Lanka
            </Typography>
          </Grid>

          {/* Search Bar */}
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search medicines, brands, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(0,0,0,0.6)' }} />
                  </InputAdornment>
                ),
                sx: { 
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid xs={12} sm={2}>
            <FormControl fullWidth>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ 
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {medicineCategories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* User Actions */}
          <Grid xs={12} sm={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
              {/* Notifications */}
              <IconButton 
                color="inherit" 
                onClick={() => setShowNotifications(true)}
                sx={{ position: 'relative' }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Cart */}
              <IconButton 
                color="inherit" 
                onClick={() => setShowCart(true)}
                sx={{ position: 'relative' }}
              >
                <Badge badgeContent={cart.length} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {/* User Account */}
              <IconButton 
                color="inherit" 
                onClick={() => isLoggedIn ? setCurrentView('profile') : setShowLogin(true)}
              >
                <AccountCircleIcon />
              </IconButton>

              {/* Live Chat */}
              <IconButton 
                color="inherit" 
                onClick={() => setShowChat(true)}
              >
                <ChatIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  // Filter Panel Component
  const FilterPanel = () => (
    <Drawer
      anchor="left"
      open={showFilters}
      onClose={() => setShowFilters(false)}
      PaperProps={{ sx: { width: 350, p: 2 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setShowFilters(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Price Range */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Price Range (LKR)</Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
          valueLabelFormat={(value) => `Rs. ${value}`}
        />
        <Typography variant="body2" color="text.secondary">
          Rs. {priceRange[0]} - Rs. {priceRange[1]}
        </Typography>
      </Box>

      {/* Brand Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Brand</Typography>
        <FormControl fullWidth>
          <Select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <MenuItem value="all">All Brands</MenuItem>
            {sriLankanBrands.map(brand => (
              <MenuItem key={brand} value={brand}>{brand}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Subcategory Filter */}
      {selectedCategory !== 'all' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Subcategory</Typography>
          <FormControl fullWidth>
            <Select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
            >
              <MenuItem value="all">All Subcategories</MenuItem>
              {getSubcategories().map(subcat => (
                <MenuItem key={subcat} value={subcat}>{subcat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Sort Options */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Sort By</Typography>
        <FormControl fullWidth>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* In Stock Only */}
      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label="In Stock Only"
        sx={{ mb: 2 }}
      />

      {/* Clear Filters */}
      <Button
        fullWidth
        variant="outlined"
        onClick={() => {
          setSelectedCategory('all');
          setSelectedSubcategory('all');
          setSelectedBrand('all');
          setPriceRange([0, 10000]);
          setSortBy('relevance');
        }}
      >
        Clear All Filters
      </Button>
    </Drawer>
  );

  // Product Card Component
  const ProductCard = ({ product }) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image || '/images/medicines/default-medicine.jpg'}
          alt={product.name}
          sx={{ objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => openProductDetail(product)}
        />
        
        {/* Discount Badge */}
        {product.originalPrice > product.price && (
          <Chip
            label={`${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`}
            color="error"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}

        {/* Wishlist Button */}
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)' }}
          onClick={() => toggleWishlist(product)}
        >
          {wishlist.some(item => item.id === product.id) ? 
            <FavoriteIcon color="error" /> : 
            <FavoriteBorderIcon />
          }
        </IconButton>

        {/* Stock Status */}
        {!product.inStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h6" color="white" fontWeight="bold">
              Out of Stock
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' }
          }}
          onClick={() => openProductDetail(product)}
        >
          {product.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.brand} • {product.packSize}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
          {product.description.substring(0, 100)}...
        </Typography>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={product.rating} precision={0.1} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({product.reviewCount})
          </Typography>
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            Rs. {product.price.toFixed(2)}
          </Typography>
          {product.originalPrice > product.price && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ textDecoration: 'line-through', ml: 1 }}
            >
              Rs. {product.originalPrice.toFixed(2)}
            </Typography>
          )}
        </Box>

        {/* Features */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {product.features.slice(0, 2).map((feature, index) => (
            <Chip 
              key={index} 
              label={feature} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
          ))}
        </Box>

        {/* Add to Cart Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
          sx={{ mt: 'auto' }}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );

  // Product Detail Dialog
  const ProductDetailDialog = () => (
    <Dialog
      open={showProductDetail}
      onClose={() => setShowProductDetail(false)}
      maxWidth="md"
      fullWidth
    >
      {selectedProduct && (
        <>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              {selectedProduct.name}
            </Typography>
            <IconButton onClick={() => setShowProductDetail(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3}>
              {/* Product Image */}
              <Grid xs={12} md={5}>
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={selectedProduct.image || '/images/medicines/default-medicine.jpg'}
                    alt={selectedProduct.name}
                    style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  
                  {/* Wishlist Button */}
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)' }}
                    onClick={() => toggleWishlist(selectedProduct)}
                  >
                    {wishlist.some(item => item.id === selectedProduct.id) ? 
                      <FavoriteIcon color="error" /> : 
                      <FavoriteBorderIcon />
                    }
                  </IconButton>
                </Box>
              </Grid>

              {/* Product Details */}
              <Grid xs={12} md={7}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  {selectedProduct.name}
                </Typography>

                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {selectedProduct.brand} • {selectedProduct.packSize}
                </Typography>

                {/* Rating and Reviews */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={selectedProduct.rating} precision={0.1} readOnly />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {selectedProduct.rating} ({selectedProduct.reviewCount} reviews)
                  </Typography>
                </Box>

                {/* Price */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    Rs. {selectedProduct.price.toFixed(2)}
                  </Typography>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <Typography 
                      variant="h6" 
                      color="text.secondary" 
                      sx={{ textDecoration: 'line-through', ml: 2 }}
                    >
                      Rs. {selectedProduct.originalPrice.toFixed(2)}
                    </Typography>
                  )}
                </Box>

                {/* Stock Status */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" color={selectedProduct.inStock ? 'success.main' : 'error.main'}>
                    {selectedProduct.inStock ? `In Stock (${selectedProduct.stockCount} available)` : 'Out of Stock'}
                  </Typography>
                </Box>

                {/* Features */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {selectedProduct.features.map((feature, index) => (
                    <Chip 
                      key={index} 
                      label={feature} 
                      color="primary" 
                      variant="outlined"
                    />
                  ))}
                </Box>

                {/* Description */}
                <Typography variant="body1" paragraph>
                  {selectedProduct.longDescription || selectedProduct.description}
                </Typography>

                {/* Add to Cart */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => addToCart(selectedProduct)}
                    disabled={!selectedProduct.inStock}
                    sx={{ flexGrow: 1 }}
                  >
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ShoppingBagIcon />}
                    onClick={() => {
                      addToCart(selectedProduct);
                      handleCheckout();
                    }}
                    disabled={!selectedProduct.inStock}
                  >
                    Buy Now
                  </Button>
                </Box>

                {/* Additional Information */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Product Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">Active Ingredient:</Typography>
                        <Typography variant="body2">{selectedProduct.activeIngredient}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">Manufacturer:</Typography>
                        <Typography variant="body2">{selectedProduct.manufacturer}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">Country of Origin:</Typography>
                        <Typography variant="body2">{selectedProduct.countryOfOrigin}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">Pack Size:</Typography>
                        <Typography variant="body2">{selectedProduct.packSize}</Typography>
                      </Grid>
                      <Grid xs={12}>
                        <Typography variant="body2" color="text.secondary">Dosage:</Typography>
                        <Typography variant="body2">{selectedProduct.dosage}</Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>

            {/* Recommendations */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recommended Products
              </Typography>
              <Grid container spacing={2}>
                {getProductRecommendations(selectedProduct, medicineProducts).map(product => (
                  <Grid xs={12} sm={6} md={3} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );

  // Cart Drawer
  const CartDrawer = () => (
    <Drawer
      anchor="right"
      open={showCart}
      onClose={() => setShowCart(false)}
      PaperProps={{ sx: { width: 400, p: 2 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Shopping Cart ({cart.length})</Typography>
        <IconButton onClick={() => setShowCart(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {cart.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add some products to get started
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ flexGrow: 1, maxHeight: '400px', overflow: 'auto' }}>
            {cart.map(item => (
              <ListItem key={item.id} sx={{ px: 0, flexDirection: 'column', alignItems: 'stretch' }}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <img
                    src={item.image || '/images/medicines/default-medicine.jpg'}
                    alt={item.name}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 12 }}
                  />
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.brand} • {item.packSize}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold">
                      Rs. {item.price.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="body1" sx={{ mx: 2, fontWeight: 'bold' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  
                  <Button
                    size="small"
                    color="error"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </Box>
                
                <Divider sx={{ mt: 2 }} />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1">Rs. {calculateCartTotal().toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Delivery:</Typography>
              <Typography variant="body1">Rs. 200.00</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Total:</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Rs. {(calculateCartTotal() + 200).toFixed(2)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => {
                setShowCart(false);
                handleCheckout();
              }}
              sx={{ mb: 1 }}
            >
              Proceed to Checkout
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => setShowCart(false)}
            >
              Continue Shopping
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );

  // Main Content based on current view
  const renderMainContent = () => {
    switch (currentView) {
      case 'products':
        return (
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Category Pills */}
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="All Categories"
                onClick={() => setSelectedCategory('all')}
                color={selectedCategory === 'all' ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
              />
              {medicineCategories.map(category => (
                <Chip
                  key={category.id}
                  label={`${category.icon} ${category.name}`}
                  onClick={() => setSelectedCategory(category.id)}
                  color={selectedCategory === category.id ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>

            {/* Filter and Results Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(true)}
                >
                  Filters
                </Button>
                <Typography variant="body1" color="text.secondary">
                  {filteredProducts.length} products found
                </Typography>
              </Box>
              
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  size="small"
                >
                  {sortOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Products Grid */}
            <Grid container spacing={3}>
              {filteredProducts.map(product => (
                <Grid xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Recently Viewed
                </Typography>
                <Grid container spacing={2}>
                  {recentlyViewed.slice(0, 4).map(product => (
                    <Grid xs={12} sm={6} md={3} key={product.id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Container>
        );

      case 'checkout':
        return <CheckoutComponent />;

      case 'orders':
        return <OrdersComponent />;

      case 'profile':
        return <ProfileComponent />;

      default:
        return renderMainContent();
    }
  };

  // Checkout Component
  const CheckoutComponent = () => {
    const steps = ['Shipping Information', 'Payment Method', 'Order Review'];

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Checkout
        </Typography>

        <Stepper activeStep={checkoutStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {checkoutStep === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Information
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={customerInfo.postalCode}
                  onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => setCheckoutStep(1)}
            >
              Continue to Payment
            </Button>
          </Paper>
        )}

        {checkoutStep === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                <FormControlLabel value="bank" control={<Radio />} label="Bank Transfer" />
                <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
                <FormControlLabel value="mobile" control={<Radio />} label="Mobile Wallet (eZ Cash/mCash)" />
              </RadioGroup>
            </FormControl>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => setCheckoutStep(0)}>
                Back
              </Button>
              <Button variant="contained" onClick={() => setCheckoutStep(2)}>
                Review Order
              </Button>
            </Box>
          </Paper>
        )}

        {checkoutStep === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Review
            </Typography>
            
            {/* Order Items */}
            <List>
              {cart.map(item => (
                <ListItem key={item.id}>
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.quantity} x Rs. ${item.price}`}
                  />
                  <Typography variant="body1">
                    Rs. {(item.quantity * item.price).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>Rs. {calculateCartTotal().toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Delivery:</Typography>
              <Typography>Rs. 200.00</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Total:</Typography>
              <Typography variant="h6" fontWeight="bold">
                Rs. {(calculateCartTotal() + 200).toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => setCheckoutStep(1)}>
                Back
              </Button>
              <Button variant="contained" onClick={completeOrder}>
                Place Order
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    );
  };

  // Orders Component
  const OrdersComponent = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BagIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No orders yet
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setCurrentView('products')}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map(order => (
            <Grid xs={12} key={order.id}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Order #{order.id}
                  </Typography>
                  <Chip
                    label={order.status}
                    color={order.status === 'delivered' ? 'success' : 'primary'}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Placed on {new Date(order.date).toLocaleDateString()}
                </Typography>
                
                <Typography variant="h6" color="primary" gutterBottom>
                  Total: Rs. {order.total.toFixed(2)}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  {order.items.length} items
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button variant="outlined" startIcon={<LocalShippingIcon />}>
                    Track Order
                  </Button>
                  <Button variant="outlined" startIcon={<DownloadIcon />}>
                    Download Invoice
                  </Button>
                  {order.status !== 'delivered' && (
                    <Button variant="outlined" color="error" startIcon={<AssignmentReturnIcon />}>
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );

  // Profile Component
  const ProfileComponent = () => (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Typography variant="h6">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Paper>
        </Grid>

        <Grid xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  defaultValue={user?.firstName}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  defaultValue={user?.lastName}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue={user?.email}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  defaultValue={user?.phone}
                />
              </Grid>
            </Grid>
            
            <Button variant="contained" sx={{ mt: 2 }}>
              Update Profile
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );

  // Login Dialog
  const LoginDialog = () => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [isSignUp, setIsSignUp] = useState(false);

    const handleLogin = () => {
      // Mock login
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: loginData.email,
        phone: '+94 77 123 4567'
      };
      
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('pharmacyUser', JSON.stringify(userData));
      setShowLogin(false);
      showSnackbar('Login successful!', 'success');
    };

    return (
      <Dialog open={showLogin} onClose={() => setShowLogin(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {isSignUp && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid xs={6}>
                  <TextField fullWidth label="First Name" />
                </Grid>
                <Grid xs={6}>
                  <TextField fullWidth label="Last Name" />
                </Grid>
              </Grid>
            )}
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            {isSignUp && (
              <>
                <TextField fullWidth label="Confirm Password" type="password" sx={{ mb: 2 }} />
                <TextField fullWidth label="Phone Number" sx={{ mb: 2 }} />
              </>
            )}
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              sx={{ mb: 2 }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  // Chat Widget
  const ChatWidget = () => (
    <Dialog open={showChat} onClose={() => setShowChat(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              <SupportIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Customer Support</Typography>
              <Typography variant="body2" color="text.secondary">
                Online • Typically replies in a few minutes
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setShowChat(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ height: 400 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Welcome to MediCare Lanka Support!<br />
            How can we help you today?
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton color="primary">
                  <ChatIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      {renderMainContent()}

      {/* Professional Login Page Section */}
      <ProfessionalLoginPage />

      {/* Footer */}
      <Box sx={{ 
        mt: 6, 
        py: 4, 
        backgroundColor: '#1976d2', 
        color: 'white',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
      }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                🏥 MediCare Lanka
              </Typography>
              <Typography variant="body2" paragraph>
                Your trusted online pharmacy in Sri Lanka. Quality medicines delivered to your doorstep.
              </Typography>
            </Grid>
            
            <Grid xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start' }}>About Us</Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start' }}>Contact</Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start' }}>FAQs</Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start' }}>Terms & Conditions</Button>
              </Box>
            </Grid>
            
            <Grid xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Customer Service
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">+94 11 234 5678</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">support@medicarelanka.lk</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">Colombo, Sri Lanka</Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                We Accept
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="💳 Credit Cards" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                <Chip label="🏦 Bank Transfer" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                <Chip label="📱 eZ Cash" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                <Chip label="💰 Cash on Delivery" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
          
          <Typography variant="body2" textAlign="center">
            © 2025 MediCare Lanka. All rights reserved. | Licensed Pharmacy in Sri Lanka
          </Typography>
        </Container>
      </Box>

      {/* Drawers and Dialogs */}
      <FilterPanel />
      <CartDrawer />
      <ProductDetailDialog />
      <LoginDialog />
      <ChatWidget />

      {/* Loading Backdrop */}
      <Backdrop open={loading} sx={{ zIndex: 9999 }}>
        <CircularProgress color="primary" />
      </Backdrop>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SriLankanPharmacyEcommerce;
