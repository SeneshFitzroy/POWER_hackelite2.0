import React, { useState, useEffect, createContext, useContext } from 'react';
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
  Chip,
  IconButton,
  Badge,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
  Rating,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  LocalPharmacy as LocalPharmacyIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  History as HistoryIcon,
  Support as SupportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  LocalShipping as LocalShippingIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  HelpOutline as HelpOutlineIcon,
  Store as StoreIcon,
  Verified as VerifiedIcon,
  Shield as ShieldIcon,
  NavigateNext as NavigateNextIcon,
  Receipt as ReceiptIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import ProfessionalFooter from './ProfessionalFooter';

// Professional Medicine Database - Real Pharmacy Products
const medicineCategories = [
  { id: 'all', name: 'All Products', count: 245 },
  { id: 'medicine', name: 'Medicine', count: 89 },
  { id: 'personal-care', name: 'Personal Care', count: 67 },
  { id: 'covid-19', name: 'COVID-19', count: 23 },
  { id: 'prescription', name: 'Prescription', count: 45 },
  { id: 'vitamins', name: 'Vitamins & Supplements', count: 34 }
];

const professionalProducts = [
  {
    id: 1,
    name: 'ABCDERM COLD-CREAM CORPS',
    brand: 'BIODERMA',
    category: 'personal-care',
    price: 700.00,
    originalPrice: 850.00,
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 234,
    description: 'Cold cream for dry and sensitive skin. Provides 24-hour moisturization and protection.',
    inStock: true,
    stockCount: 45,
    features: ['Moisturizing', 'Sensitive Skin', 'Dermatologist Tested', '24hr Protection'],
    reviews: [
      { id: 1, user: 'Sarah M.', rating: 5, comment: 'Excellent for dry skin. Very moisturizing.', date: '2025-09-20', verified: true },
      { id: 2, user: 'John D.', rating: 4, comment: 'Good quality cream, gentle on skin.', date: '2025-09-18', verified: true }
    ]
  },
  {
    id: 2,
    name: 'ABCDERM CHANGE INTENSIF CREAM',
    brand: 'BIODERMA',
    category: 'personal-care',
    price: 450.00,
    originalPrice: 520.00,
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    ],
    rating: 4.7,
    reviewCount: 189,
    description: 'Intensive repair cream for damaged skin. Fast-acting formula for skin restoration.',
    inStock: true,
    stockCount: 32,
    features: ['Intensive Repair', 'Fast Acting', 'Damaged Skin', 'Professional Grade'],
    reviews: [
      { id: 1, user: 'Maria K.', rating: 5, comment: 'Amazing results on damaged skin. Highly recommend.', date: '2025-09-22', verified: true }
    ]
  },
  {
    id: 3,
    name: 'SENSATION STRAWBERRY CONDOM',
    brand: 'SENSATION',
    category: 'personal-care',
    price: 150.00,
    originalPrice: 180.00,
    images: [
      'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=400&fit=crop'
    ],
    rating: 4.5,
    reviewCount: 67,
    description: 'Premium quality condoms with strawberry flavor for enhanced experience.',
    inStock: true,
    stockCount: 89,
    features: ['Premium Quality', 'Flavored', 'Safe', 'Tested'],
    reviews: []
  },
  {
    id: 4,
    name: 'AB GOLD BAR SOAP',
    brand: 'AB GOLD',
    category: 'personal-care',
    price: 550.00,
    originalPrice: 650.00,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
    ],
    rating: 4.6,
    reviewCount: 123,
    description: 'Luxury gold bar soap with moisturizing properties. Premium skincare for daily use.',
    inStock: true,
    stockCount: 56,
    features: ['Luxury', 'Moisturizing', 'Gold Infused', 'Premium'],
    reviews: [
      { id: 1, user: 'Lisa W.', rating: 5, comment: 'Luxurious soap, leaves skin soft and smooth.', date: '2025-09-21', verified: true }
    ]
  },
  {
    id: 5,
    name: 'Paracetamol 500mg Tablets',
    brand: 'PANADOL',
    category: 'medicine',
    price: 350.00,
    originalPrice: 400.00,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
    ],
    rating: 4.9,
    reviewCount: 456,
    description: 'Fast and effective relief from headaches, body aches, and fever. Trusted pain relief.',
    inStock: true,
    stockCount: 234,
    features: ['Pain Relief', 'Fever Reduction', 'Fast Acting', 'Trusted Brand'],
    reviews: [
      { id: 1, user: 'Dr. Smith', rating: 5, comment: 'Excellent pain relief medication. Works quickly.', date: '2025-09-23', verified: true }
    ]
  },
  {
    id: 6,
    name: 'Vitamin C 1000mg',
    brand: 'CENTRUM',
    category: 'vitamins',
    price: 1250.00,
    originalPrice: 1450.00,
    images: [
      'https://images.unsplash.com/photo-1550572017-1d98be3c5c85?w=400&h=400&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 289,
    description: 'High-strength Vitamin C supplement for immune system support and daily wellness.',
    inStock: true,
    stockCount: 78,
    features: ['Immune Support', 'High Strength', 'Daily Wellness', 'Antioxidant'],
    reviews: [
      { id: 1, user: 'Health Expert', rating: 5, comment: 'Great vitamin C supplement. Boosts immunity effectively.', date: '2025-09-22', verified: true }
    ]
  }
];

// Ecommerce Context
const EcommerceContext = createContext();

const useEcommerce = () => {
  const context = useContext(EcommerceContext);
  if (!context) {
    throw new Error('useEcommerce must be used within EcommerceProvider');
  }
  return context;
};

// Ecommerce Provider Component
const EcommerceProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const toggleWishlist = (product) => {
    setWishlist(prevWishlist => {
      const isInWishlist = prevWishlist.some(item => item.id === product.id);
      if (isInWishlist) {
        return prevWishlist.filter(item => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const placeOrder = (orderData) => {
    const newOrder = {
      id: `ORD${Date.now()}`,
      ...orderData,
      date: new Date().toISOString(),
      status: 'Processing',
      items: [...cart]
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    return newOrder;
  };

  const value = {
    cart,
    wishlist,
    user,
    orders,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    placeOrder,
    setUser
  };

  return (
    <EcommerceContext.Provider value={value}>
      {children}
    </EcommerceContext.Provider>
  );
};

// Main Professional Pharmacy Ecommerce Component
const ProfessionalPharmacyEcommerce = () => {
  const [currentView, setCurrentView] = useState('home'); // home, cart, checkout, admin, product
  const [products] = useState(professionalProducts);
  const [filteredProducts, setFilteredProducts] = useState(professionalProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [productDetailOpen, setProductDetailOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  // Filter and search logic
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.reviewCount - a.reviewCount;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products, sortBy]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Professional Header Component
  const ProfessionalHeader = () => {
    const { cart, wishlist } = useEcommerce();
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
      <AppBar position="sticky" sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
      }}>
        <Toolbar sx={{ py: 1.5 }}>
          {/* Logo */}
          <Box display="flex" alignItems="center" sx={{ mr: 4 }}>
            <img 
              src="/images/npk-logo.png" 
              alt="NPK Pharmacy" 
              style={{ 
                height: '60px',
                width: 'auto',
                borderRadius: '8px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline-flex';
              }}
            />
            <Box sx={{ display: 'none', alignItems: 'center' }}>
              <LocalPharmacyIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          </Box>

          {/* Search Bar */}
          <TextField
            placeholder="Search medicines, health products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              flexGrow: 1,
              maxWidth: 500,
              mr: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                borderRadius: '25px',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '& input::placeholder': { color: 'rgba(255,255,255,0.8)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                </InputAdornment>
              )
            }}
          />

          {/* Category Filter */}
          <FormControl size="small" sx={{ minWidth: 120, mr: 3 }}>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              displayEmpty
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)'
                },
                '& .MuiSvgIcon-root': {
                  color: 'white'
                }
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {medicineCategories.slice(1).map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Cart and Wishlist */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton color="inherit">
              <Badge badgeContent={wishlist.length} color="error">
                <FavoriteIcon />
              </Badge>
            </IconButton>

            <IconButton color="inherit" onClick={() => setCartDrawerOpen(true)}>
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
              LKR {cartTotal.toFixed(2)}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    );
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    const { addToCart, toggleWishlist, wishlist } = useEcommerce();
    const isInWishlist = wishlist.some(item => item.id === product.id);

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
            border: '1px solid #3b82f6'
          }
        }}
        onClick={() => {
          setSelectedProduct(product);
          setCurrentView('product');
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={product.images[0]}
            alt={product.name}
            sx={{ borderRadius: '12px 12px 0 0' }}
          />
          
          {product.originalPrice > product.price && (
            <Chip
              label={`${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`}
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                fontWeight: 'bold'
              }}
            />
          )}

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
              showSnackbar(`${product.name} ${isInWishlist ? 'removed from' : 'added to'} wishlist`);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              '&:hover': { backgroundColor: 'white' }
            }}
          >
            {isInWishlist ? (
              <FavoriteIcon sx={{ color: '#ef4444' }} />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {product.category.toUpperCase()}
          </Typography>
          
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, fontSize: '1rem' }}>
            {product.name}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Rating value={product.rating} precision={0.1} size="small" readOnly />
            <Typography variant="body2" color="text.secondary">
              ({product.reviewCount})
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a', mb: 1 }}>
            LKR {product.price.toFixed(2)}
            {product.originalPrice > product.price && (
              <Typography
                component="span"
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'text.secondary', ml: 1 }}
              >
                LKR {product.originalPrice.toFixed(2)}
              </Typography>
            )}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {product.description}
          </Typography>
        </CardContent>

        <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
              setProductDetailOpen(true);
            }}
            sx={{
              borderRadius: '8px',
              py: 1,
              flex: 1,
              border: '1px solid #3b82f6',
              color: '#3b82f6',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid #1e3a8a'
              }
            }}
          >
            View More
          </Button>
          <Button
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
              showSnackbar(`${product.name} added to cart!`);
            }}
            disabled={!product.inStock}
            sx={{
              borderRadius: '8px',
              py: 1,
              flex: 1,
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              fontWeight: 'bold'
            }}
          >
            Add to Cart
          </Button>
        </Box>
      </Card>
    );
  };

  // Product Detail Modal Component
  const ProductDetailModal = () => {
    const { addToCart, toggleWishlist, wishlist } = useEcommerce();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    
    if (!selectedProduct) {
      return null;
    }
    
    const isInWishlist = wishlist.some(item => item.id === selectedProduct.id);

    return (
      <Dialog
        open={productDetailOpen}
        onClose={() => setProductDetailOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 3, pb: 0 }}>
            <Typography variant="h5" fontWeight="bold">
              Product Details
            </Typography>
            <IconButton onClick={() => setProductDetailOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Product Images */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <img
                  src={selectedProduct.images[selectedImage]}
                  alt={selectedProduct.name}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
                {selectedProduct.originalPrice > selectedProduct.price && (
                  <Chip
                    label={`${Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100)}% OFF`}
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontWeight: 'bold'
                    }}
                  />
                )}
                <IconButton
                  onClick={() => {
                    toggleWishlist(selectedProduct);
                    showSnackbar(`${selectedProduct.name} ${isInWishlist ? 'removed from' : 'added to'} wishlist`);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '&:hover': { backgroundColor: 'white' }
                  }}
                >
                  {isInWishlist ? (
                    <FavoriteIcon sx={{ color: '#ef4444' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Box>
              
              {/* Additional Images */}
              {selectedProduct.images.length > 1 && (
                <Box display="flex" gap={1}>
                  {selectedProduct.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${selectedProduct.name} ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: selectedImage === index ? '2px solid #3b82f6' : '2px solid transparent',
                        opacity: selectedImage === index ? 1 : 0.7
                      }}
                    />
                  ))}
                </Box>
              )}
            </Grid>

            {/* Product Info */}
            <Grid item xs={12} md={6}>
              <Chip
                label={selectedProduct.category.toUpperCase()}
                size="small"
                sx={{ mb: 2, backgroundColor: '#e5e7eb', color: '#374151' }}
              />
              
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                {selectedProduct.name}
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                Brand: {selectedProduct.brand}
              </Typography>

              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <Rating value={selectedProduct.rating} precision={0.1} size="small" readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({selectedProduct.reviewCount} reviews)
                </Typography>
              </Box>

              <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e3a8a', mb: 2 }}>
                LKR {selectedProduct.price.toFixed(2)}
                {selectedProduct.originalPrice > selectedProduct.price && (
                  <Typography
                    component="span"
                    variant="h6"
                    sx={{ textDecoration: 'line-through', color: 'text.secondary', ml: 2 }}
                  >
                    LKR {selectedProduct.originalPrice.toFixed(2)}
                  </Typography>
                )}
              </Typography>

              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {selectedProduct.description}
              </Typography>

              {/* Features */}
              {selectedProduct.features && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    Key Features:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedProduct.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Stock Status */}
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
                <CheckCircleIcon sx={{ color: selectedProduct.inStock ? '#10b981' : '#ef4444', fontSize: 20 }} />
                <Typography color={selectedProduct.inStock ? 'success.main' : 'error.main'}>
                  {selectedProduct.inStock ? `In Stock (${selectedProduct.stockCount} available)` : 'Out of Stock'}
                </Typography>
              </Box>

              {/* Quantity Selector */}
              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
                <Typography variant="body1" fontWeight="bold">
                  Quantity:
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    sx={{ border: '1px solid #e5e7eb' }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(Math.min(selectedProduct.stockCount, quantity + 1))}
                    disabled={quantity >= selectedProduct.stockCount}
                    sx={{ border: '1px solid #e5e7eb' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setProductDetailOpen(false)}
            sx={{ mr: 1 }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              for (let i = 0; i < quantity; i++) {
                addToCart(selectedProduct);
              }
              showSnackbar(`${quantity} x ${selectedProduct.name} added to cart!`);
              setProductDetailOpen(false);
              setQuantity(1);
            }}
            disabled={!selectedProduct.inStock}
            sx={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              fontWeight: 'bold',
              px: 4
            }}
          >
            Add {quantity} to Cart
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Cart Drawer Component
  const CartDrawer = () => {
    const { cart, removeFromCart, updateCartQuantity } = useEcommerce();
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
      <Drawer
        anchor="right"
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100vw', sm: 400 } }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Shopping Cart
            </Typography>
            <IconButton onClick={() => setCartDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <Box textAlign="center" sx={{ py: 4 }}>
                <ShoppingCartIcon sx={{ fontSize: 60, color: '#9ca3af', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Your cart is empty
                </Typography>
              </Box>
            ) : (
              <List>
                {cart.map((item) => (
                  <ListItem key={item.id} sx={{ px: 0, py: 2 }}>
                    <Avatar
                      src={item.images[0]}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        LKR {item.price.toFixed(2)} each
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" fontWeight="bold">
                        LKR {(item.price * item.quantity).toFixed(2)}
                      </Typography>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {cart.length > 0 && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Total: LKR {cartTotal.toFixed(2)}
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => {
                  setCartDrawerOpen(false);
                  setCurrentView('checkout');
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1.5,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                }}
              >
                Proceed to Checkout
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    );
  };

  // Home View Component
  const HomeView = () => (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <ProfessionalHeader />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Products Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
            {selectedCategory === 'all' ? 'All Products' : 
             medicineCategories.find(cat => cat.id === selectedCategory)?.name || 'Products'}
            <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 2 }}>
              ({filteredProducts.length} items)
            </Typography>
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                borderRadius: '25px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e5e7eb'
                }
              }}
            >
              <MenuItem value="name">Name A-Z</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
              <MenuItem value="popularity">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Products Grid */}
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>

        {filteredProducts.length === 0 && (
          <Box textAlign="center" sx={{ py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>

      <CartDrawer />
      <ProductDetailModal />
    </Box>
  );

  // Checkout View Component
  const CheckoutView = () => {
    const { cart, placeOrder } = useEcommerce();
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Customer Info', 'Shipping', 'Payment', 'Review'];
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCost = 250.00;
    const tax = cartTotal * 0.02; // 2% tax
    const finalTotal = cartTotal + shippingCost + tax;
    
    // Form data
    const [customerInfo, setCustomerInfo] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      nic: ''
    });
    
    const [paymentInfo, setPaymentInfo] = useState({
      paymentMethod: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    });
    
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    const handleNext = () => {
      if (activeStep === steps.length - 1) {
        const newOrderNumber = `NPK${Date.now()}`;
        setOrderNumber(newOrderNumber);
        placeOrder({ 
          customerInfo, 
          paymentInfo,
          orderNumber: newOrderNumber,
          total: finalTotal,
          subtotal: cartTotal,
          shipping: shippingCost,
          tax: tax
        });
        setOrderComplete(true);
      } else {
        setActiveStep(prev => prev + 1);
      }
    };

    const handleBack = () => {
      setActiveStep(prev => prev - 1);
    };

    const renderStepContent = () => {
      switch (activeStep) {
        case 0:
          return (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Customer Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="NIC Number"
                    value={customerInfo.nic}
                    onChange={(e) => setCustomerInfo({...customerInfo, nic: e.target.value})}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          );
        case 1:
          return (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Shipping Address</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    required
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="City"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={customerInfo.postalCode}
                    onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          );
        case 2:
          return (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Payment Information</Typography>
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                  value={paymentInfo.paymentMethod}
                  onChange={(e) => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value})}
                >
                  <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                  <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
                  <FormControlLabel value="bank" control={<Radio />} label="Bank Transfer" />
                </RadioGroup>
              </FormControl>
              
              {paymentInfo.paymentMethod === 'card' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                      placeholder="MM/YY"
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                      placeholder="123"
                      required
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          );
        case 3:
          return (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Order Review</Typography>
              <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Customer Details</Typography>
                <Typography><strong>Name:</strong> {customerInfo.firstName} {customerInfo.lastName}</Typography>
                <Typography><strong>Email:</strong> {customerInfo.email}</Typography>
                <Typography><strong>Phone:</strong> {customerInfo.phone}</Typography>
                <Typography><strong>Address:</strong> {customerInfo.address}, {customerInfo.city} {customerInfo.postalCode}</Typography>
              </Paper>
              
              <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Order Summary</Typography>
                {cart.map((item) => (
                  <Box key={item.id} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography>{item.name} x {item.quantity}</Typography>
                    <Typography>LKR {(item.price * item.quantity).toFixed(2)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>LKR {cartTotal.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography>Shipping:</Typography>
                  <Typography>LKR {shippingCost.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography>Tax (2%):</Typography>
                  <Typography>LKR {tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">LKR {finalTotal.toFixed(2)}</Typography>
                </Box>
              </Paper>
            </Box>
          );
        default:
          return null;
      }
    };

    if (orderComplete) {
      return <OrderReceipt orderNumber={orderNumber} customerInfo={customerInfo} cart={cart} total={finalTotal} subtotal={cartTotal} shipping={shippingCost} tax={tax} />;
    }

    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <ProfessionalHeader />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: '#1e3a8a' }}>
              Checkout
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent()}

            <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
              <Button
                onClick={activeStep === 0 ? () => setCurrentView('home') : handleBack}
                sx={{ color: '#6b7280' }}
              >
                {activeStep === 0 ? 'Back to Shop' : 'Back'}
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  px: 4
                }}
              >
                {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  };

  // Order Receipt Component
  const OrderReceipt = ({ orderNumber, customerInfo, cart, total, subtotal, shipping, tax }) => {
    const currentDate = new Date();
    
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', py: 4 }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, backgroundColor: 'white' }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid #1e3a8a', pb: 2 }}>
              <img 
                src="/images/npk-logo.png" 
                alt="NPK Pharmacy" 
                style={{ 
                  height: '60px',
                  width: 'auto',
                  marginBottom: '8px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <Typography variant="h6" sx={{ display: 'none', fontWeight: 'bold', color: '#1e3a8a' }}>
                NPK PHARMACY
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                New Pharmacy Kalutara
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                📍 123 Main Street, Kalutara, Sri Lanka
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                📞 +94 34 223 4567 | 📧 info@npkpharmacy.lk
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 'bold' }}>
                Pharmacy Reg: PH/2024/NPK001 | License: LIC/2024/NPK001
              </Typography>
            </Box>

            {/* Receipt Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ 
                backgroundColor: '#1e3a8a', 
                color: 'white', 
                py: 1, 
                borderRadius: 1,
                mb: 2
              }}>
                PURCHASE RECEIPT
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                Order #: {orderNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {currentDate.toLocaleDateString('en-GB')} {currentDate.toLocaleTimeString('en-GB')}
              </Typography>
            </Box>

            {/* Customer Info */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#1e3a8a' }}>
                CUSTOMER DETAILS
              </Typography>
              <Typography variant="body2"><strong>Name:</strong> {customerInfo.firstName} {customerInfo.lastName}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {customerInfo.email}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {customerInfo.phone}</Typography>
              <Typography variant="body2"><strong>NIC:</strong> {customerInfo.nic}</Typography>
              <Typography variant="body2"><strong>Address:</strong> {customerInfo.address}, {customerInfo.city} {customerInfo.postalCode}</Typography>
            </Box>

            {/* Items */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e3a8a' }}>
                ITEMS PURCHASED
              </Typography>
              <Box sx={{ display: 'flex', mb: 1, fontWeight: 'bold', borderBottom: '1px solid #ddd', pb: 1 }}>
                <Typography variant="body2" sx={{ flex: 3 }}>ITEM</Typography>
                <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>QTY</Typography>
                <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>RATE</Typography>
                <Typography variant="body2" sx={{ flex: 1, textAlign: 'right' }}>TOTAL</Typography>
              </Box>

              {cart.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 1, py: 0.5 }}>
                  <Typography variant="body2" sx={{ flex: 3, fontSize: '0.85rem' }}>
                    {item.name}
                    <br />
                    <Typography component="span" variant="caption" color="text.secondary">
                      {item.brand}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>{item.quantity}</Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>LKR {item.price.toFixed(2)}</Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
                    LKR {(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Totals */}
            <Box sx={{ borderTop: '2px solid #1e3a8a', pt: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">LKR {subtotal.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body1">Shipping:</Typography>
                <Typography variant="body1">LKR {shipping.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="body1">Tax (2%):</Typography>
                <Typography variant="body1">LKR {tax.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ 
                backgroundColor: '#1e3a8a', 
                color: 'white', 
                p: 1, 
                borderRadius: 1,
                fontWeight: 'bold'
              }}>
                <Typography variant="h6" fontWeight="bold">GRAND TOTAL:</Typography>
                <Typography variant="h6" fontWeight="bold">LKR {total.toFixed(2)}</Typography>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 2, borderTop: '1px solid #ddd' }}>
              <Typography variant="body2" color="text.secondary">
                Thank you for shopping with NPK Pharmacy!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For support, call +94 34 223 4567 or email info@npkpharmacy.lk
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This is a computer generated receipt. Return policy: 7 days with original receipt.
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                onClick={() => window.print()}
                sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}
              >
                Print Receipt
              </Button>
              <Button
                variant="outlined"
                onClick={() => setCurrentView('home')}
                sx={{ borderColor: '#1e3a8a', color: '#1e3a8a' }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  };

  // Admin View Component
  const AdminView = () => (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <ProfessionalHeader />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: '#1e3a8a' }}>
            Admin Dashboard
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {products.length}
                </Typography>
                <Typography variant="body1">Total Products</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  156
                </Typography>
                <Typography variant="body1">Orders Today</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  LKR 12,450
                </Typography>
                <Typography variant="body1">Revenue Today</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  23
                </Typography>
                <Typography variant="body1">Pending Orders</Typography>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => setCurrentView('home')}
              sx={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                mr: 2
              }}
            >
              Back to Shop
            </Button>
            <Button variant="outlined">
              Manage Products
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );

  // Product Detail View Component
  const ProductDetailView = () => {
    const { addToCart } = useEcommerce();

    if (!selectedProduct) {
      return null;
    }

    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <ProfessionalHeader />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Button
            startIcon={<NavigateNext sx={{ transform: 'rotate(180deg)' }} />}
            onClick={() => setCurrentView('home')}
            sx={{ mb: 3 }}
          >
            Back to Products
          </Button>
          
          <Paper sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  sx={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedProduct.category.toUpperCase()}
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                  {selectedProduct.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedProduct.brand}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                  <Rating value={selectedProduct.rating} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({selectedProduct.reviewCount} reviews)
                  </Typography>
                </Box>

                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e3a8a', mb: 2 }}>
                  LKR {selectedProduct.price.toFixed(2)}
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <Typography
                      component="span"
                      variant="h6"
                      sx={{ textDecoration: 'line-through', color: 'text.secondary', ml: 2 }}
                    >
                      LKR {selectedProduct.originalPrice.toFixed(2)}
                    </Typography>
                  )}
                </Typography>

                <Typography variant="body1" sx={{ mb: 3 }}>
                  {selectedProduct.description}
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                  {selectedProduct.features.map((feature) => (
                    <Chip key={feature} label={feature} variant="outlined" />
                  ))}
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => {
                    addToCart(selectedProduct);
                    showSnackbar(`${selectedProduct.name} added to cart!`);
                  }}
                  sx={{
                    borderRadius: '8px',
                    py: 1.5,
                    px: 4,
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    fontWeight: 'bold'
                  }}
                >
                  Add to Cart
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    );
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'checkout':
        return <CheckoutView />;
      case 'admin':
        return <AdminView />;
      case 'product':
        return <ProductDetailView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <EcommerceProvider>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1 }}>
          {renderCurrentView()}
        </Box>
        
        {/* Professional Footer */}
        <ProfessionalFooter />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={() => setProfileMenuAnchor(null)}
        >
          <MenuItem>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem>
            <ListItemIcon><HistoryIcon /></ListItemIcon>
            Order History
          </MenuItem>
          <MenuItem>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>


      </Box>
    </EcommerceProvider>
  );
};

export default ProfessionalPharmacyEcommerce;
