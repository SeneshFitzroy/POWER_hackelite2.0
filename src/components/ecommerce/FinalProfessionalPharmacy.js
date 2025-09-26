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
  Rating,
  Divider,
  Alert,
  Snackbar,
  Paper,
  Chip,
  createTheme,
  ThemeProvider
} from '@mui/material';`nimport Grid from '@mui/material/Grid2';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';

// Data
import { 
  medicineCategories, 
  medicineProducts, 
  sriLankanBrands 
} from '../../data/enhancedMedicineDatabase';

// Firestore Service
import firestoreService from '../../services/firestoreService';

// Professional Blue Theme
const professionalTheme = createTheme({
  palette: {
    primary: {
      main: '#1565C0', // Professional Blue
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    secondary: {
      main: '#FFA726', // Complementary Orange
      light: '#FFB74D',
      dark: '#F57C00',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#1A202C',
    },
    h5: {
      fontWeight: 600,
      color: '#1A202C',
    },
    h6: {
      fontWeight: 600,
      color: '#1A202C',
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        }
      }
    }
  }
});

const FinalProfessionalPharmacy = () => {
  // State Management - Simplified
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // Single filter
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load saved data and initialize Firestore
  useEffect(() => {
    const savedCart = localStorage.getItem('pharmacy-cart');
    const savedWishlist = localStorage.getItem('pharmacy-wishlist');
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    // Initialize Firestore data
    const initializeData = async () => {
      try {
        const result = await firestoreService.saveProducts(medicineProducts);
        if (result.success) {
          console.log('✅ Medicine data successfully saved to Firestore');
          setSnackbar({ 
            open: true, 
            message: 'Product database initialized successfully!', 
            severity: 'success' 
          });
        }
      } catch (error) {
        console.log('⚠️ Firestore not configured, using local data');
      }
    };
    
    initializeData();
  }, []);

  // Analytics functions
  const logSearch = async (term, count) => {
    try {
      await firestoreService.logSearch(term, count);
    } catch (error) {
      console.log('Analytics logging skipped');
    }
  };

  const logProductView = async (product) => {
    try {
      await firestoreService.logProductView(product.id, product.name);
    } catch (error) {
      console.log('Analytics logging skipped');
    }
  };

  const logCartAction = async (productId, action) => {
    try {
      await firestoreService.logCartAction(productId, action);
    } catch (error) {
      console.log('Analytics logging skipped');
    }
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pharmacy-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pharmacy-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Filter options for single dropdown
  const filterOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'prescription', label: 'Prescription Medicine' },
    { value: 'otc', label: 'Over-the-Counter' },
    { value: 'vitamins', label: 'Vitamins & Supplements' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'baby', label: 'Baby Care' },
    { value: 'medical-devices', label: 'Medical Devices' },
    { value: 'popular', label: 'Popular Items' },
    { value: 'new', label: 'New Arrivals' },
    { value: 'local', label: 'Sri Lankan Brands' }
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let filtered = medicineProducts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Log search analytics
      logSearch(searchTerm, filtered.length);
    }

    // Single dropdown filter
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'prescription':
          filtered = filtered.filter(p => p.requiresPrescription);
          break;
        case 'otc':
          filtered = filtered.filter(p => !p.requiresPrescription);
          break;
        case 'vitamins':
          filtered = filtered.filter(p => p.category.toLowerCase().includes('vitamin') || p.category.toLowerCase().includes('supplement'));
          break;
        case 'skincare':
          filtered = filtered.filter(p => p.category.toLowerCase().includes('skin') || p.category.toLowerCase().includes('dermat'));
          break;
        case 'baby':
          filtered = filtered.filter(p => p.category.toLowerCase().includes('baby') || p.category.toLowerCase().includes('pediatric'));
          break;
        case 'medical-devices':
          filtered = filtered.filter(p => p.category.toLowerCase().includes('device') || p.category.toLowerCase().includes('equipment'));
          break;
        case 'popular':
          filtered = filtered.filter(p => p.rating >= 4.0);
          break;
        case 'new':
          filtered = filtered.slice(0, 12); // Show first 12 as new arrivals
          break;
        case 'local':
          filtered = filtered.filter(p => sriLankanBrands.includes(p.brand));
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [searchTerm, selectedFilter]);

  // Cart functions
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
    
    // Log cart action for analytics
    logCartAction(product.id, 'add');
    
    setSnackbar({ open: true, message: 'Added to cart!', severity: 'success' });
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Wishlist functions
  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      setSnackbar({ open: true, message: 'Removed from wishlist', severity: 'info' });
    } else {
      setWishlist([...wishlist, product]);
      setSnackbar({ open: true, message: 'Added to wishlist!', severity: 'success' });
    }
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Professional product image generator
  const getProductImage = (product) => {
    const imageMap = {
      // Pain Relief
      'Panadol': 'https://images.unsplash.com/photo-1585435557343-3b092031363a?w=400&h=300&fit=crop&auto=format',
      'Aspirin': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format',
      'Ibuprofen': 'https://images.unsplash.com/photo-1550572017-ebe35fe80513?w=400&h=300&fit=crop&auto=format',
      'Disprin': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&auto=format',
      
      // Antibiotics
      'Amoxicillin': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&auto=format',
      'Augmentin': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&auto=format',
      'Azithromycin': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop&auto=format',
      
      // Vitamins
      'Vitamin C': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format',
      'Vitamin D3': 'https://images.unsplash.com/photo-1550572017-ebe35fe80513?w=400&h=300&fit=crop&auto=format',
      'Multivitamin': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format',
      
      // Cold & Flu
      'Cough Syrup': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&auto=format',
      'Lozenges': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&auto=format',
      
      // Default fallback
      'default': 'https://images.unsplash.com/photo-1585435557343-3b092031363a?w=400&h=300&fit=crop&auto=format'
    };

    // Find image by product name
    const productKey = Object.keys(imageMap).find(key => 
      product.name.toLowerCase().includes(key.toLowerCase())
    );
    
    return productKey ? imageMap[productKey] : imageMap['default'];
  };

  // Product Card Component - Enhanced
  const ProductCard = ({ product }) => (
    <Card 
      sx={{ 
        height: 560, // Optimized height for better content fit
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(21, 101, 192, 0.08)',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(21, 101, 192, 0.08)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 40px rgba(21, 101, 192, 0.2)',
          borderColor: 'primary.main',
          '& .product-image': {
            transform: 'scale(1.08)'
          }
        }
      }}
    >
      <Box sx={{ 
        position: 'relative', 
        backgroundColor: '#f8faff', 
        height: 220,
        overflow: 'hidden'
      }}>
        <CardMedia
          component="img"
          height="220"
          image={getProductImage(product)}
          alt={product.name}
          className="product-image"
          sx={{ 
            objectFit: 'cover',
            backgroundColor: 'white',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%'
          }}
        />
        
        {/* Wishlist Button - Enhanced */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: 40,
            height: 40,
            '&:hover': { 
              backgroundColor: 'white',
              transform: 'scale(1.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => toggleWishlist(product)}
        >
          {wishlist.some(item => item.id === product.id) ? 
            <FavoriteIcon sx={{ color: '#e91e63', fontSize: 22 }} /> : 
            <FavoriteBorderIcon sx={{ color: '#666', fontSize: 22 }} />
          }
        </IconButton>

        {/* Prescription Badge - Professional */}
        {product.requiresPrescription && (
          <Chip
            label="Prescription Required"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: '#ff6b35',
              color: 'white',
              height: 28,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        )}

        {/* NMRA Verified Badge */}
        {product.isVerified && (
          <Box sx={{ 
            position: 'absolute', 
            top: 12, 
            left: product.requiresPrescription ? 180 : 12,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            backdropFilter: 'blur(8px)'
          }}>
            <VerifiedIcon sx={{ 
              fontSize: 18, 
              color: '#4caf50',
              mr: 0.5
            }} />
            <Typography sx={{ 
              fontSize: '0.7rem', 
              fontWeight: 600, 
              color: '#4caf50' 
            }}>
              NMRA
            </Typography>
          </Box>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h6" color="white" fontWeight="bold">
              OUT OF STOCK
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        p: 3.5,
        height: 340,
        backgroundColor: 'white'
      }}>
        {/* Product Name - Enhanced */}
        <Typography 
          variant="h6" 
          gutterBottom 
          fontWeight="700" 
          color="#1565C0" 
          sx={{ 
            minHeight: 56, 
            maxHeight: 56,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
            fontSize: '1.15rem',
            letterSpacing: '-0.01em',
            mb: 2
          }}
        >
          {product.name}
        </Typography>
        
        {/* Brand and Category - Improved */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, minHeight: 32 }}>
          <Chip 
            label={product.brand} 
            size="small" 
            color="primary" 
            sx={{ 
              fontSize: '0.78rem', 
              height: 28,
              fontWeight: 600,
              backgroundColor: 'rgba(21, 101, 192, 0.1)',
              color: '#1565C0',
              border: '1px solid rgba(21, 101, 192, 0.2)'
            }}
          />
          <Chip 
            label={product.category} 
            size="small" 
            sx={{ 
              fontSize: '0.78rem', 
              height: 28,
              fontWeight: 500,
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              color: '#ff6b35',
              border: '1px solid rgba(255, 107, 53, 0.2)'
            }}
          />
        </Box>

        {/* Rating - Enhanced */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, minHeight: 32 }}>
          <Rating 
            value={product.rating} 
            precision={0.1} 
            readOnly 
            size="small"
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#ff6b35'
              }
            }}
          />
          <Typography variant="body2" color="#666" sx={{ ml: 1.5, fontSize: '0.85rem', fontWeight: 500 }}>
            ({product.reviews} reviews)
          </Typography>
        </Box>

        {/* Price - More Professional */}
        <Box sx={{ mb: 3, minHeight: 64, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h4" color="#1565C0" fontWeight="800" sx={{ 
            fontSize: '1.6rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            LKR {product.price.toLocaleString()}
          </Typography>
          {product.originalPrice && product.originalPrice > product.price && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2" color="#999" sx={{ 
                textDecoration: 'line-through', 
                fontSize: '0.95rem',
                fontWeight: 500
              }}>
                LKR {product.originalPrice.toLocaleString()}
              </Typography>
              <Chip 
                label={`${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`}
                size="small"
                sx={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  height: 20
                }}
              />
            </Box>
          )}
        </Box>

        {/* Actions - Professional Design */}
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            sx={{ 
              height: 48,
              borderRadius: 3,
              fontSize: '0.95rem',
              fontWeight: 700,
              mb: 1.5,
              textTransform: 'none',
              backgroundColor: '#1565C0',
              boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
              '&:hover': {
                backgroundColor: '#0d47a1',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(21, 101, 192, 0.4)'
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#9e9e9e'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            size="medium"
            onClick={() => {
              setSelectedProduct(product);
              setShowProductDetail(true);
              // Log product view for analytics
              logProductView(product);
            }}
            sx={{ 
              height: 40,
              borderRadius: 3,
              fontSize: '0.88rem',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#1565C0',
              color: '#1565C0',
              '&:hover': {
                borderColor: '#0d47a1',
                backgroundColor: 'rgba(21, 101, 192, 0.05)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider theme={professionalTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* Header with Search and Filter */}
        <Paper elevation={3} sx={{ backgroundColor: 'primary.main', color: 'white', py: 2 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <img 
                  src="/images/npk-logo.png" 
                  alt="Professional Pharmacy" 
                  style={{ 
                    height: 60, 
                    width: 'auto',
                    filter: 'brightness(1.1) contrast(1.1)',
                    padding: '4px'
                  }}
                />
              </Box>

              {/* Search Bar - In Navigation */}
              <Box sx={{ flexGrow: 1, maxWidth: 600 }}>
                <TextField
                  fullWidth
                  placeholder="Search medicines, vitamins, supplements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      height: 48,
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: 'primary.main',
                      '&::placeholder': {
                        color: 'rgba(21, 101, 192, 0.7)',
                        opacity: 1
                      }
                    }
                  }}
                />
              </Box>

              {/* Filter Dropdown - In Navigation */}
              <Box sx={{ flexShrink: 0, minWidth: 200 }}>
                <FormControl fullWidth>
                  <Select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    displayEmpty
                    sx={{ 
                      borderRadius: 2,
                      height: 48,
                      backgroundColor: 'white',
                      '& .MuiSelect-select': {
                        color: 'primary.main',
                        fontWeight: 500
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      }
                    }}
                  >
                    {filterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Cart Icon */}
              <IconButton 
                color="inherit" 
                onClick={() => setShowCart(true)}
                sx={{ 
                  position: 'relative',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                  p: 1.5,
                  flexShrink: 0
                }}
              >
                <Badge badgeContent={cart.length} color="secondary">
                  <ShoppingCartIcon fontSize="large" />
                </Badge>
              </IconButton>
            </Box>
          </Container>
        </Paper>



        {/* Products Section - Professional */}
        <Container maxWidth="xl" sx={{ py: 8 }}>
          {/* Results Summary - Enhanced */}
          <Box sx={{ 
            mb: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
            py: 6,
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(21, 101, 192, 0.1)'
          }}>
            <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
              {selectedFilter === 'all' ? 'All Products' : filterOptions.find(f => f.value === selectedFilter)?.label}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              {filteredProducts.length} quality medicines and health products available
            </Typography>
          </Box>

          {/* Products Grid - Professional Layout */}
          <Grid container spacing={5}>
            {filteredProducts.map((product) => (
              <Grid key={product.id} xs={12} sm={6} md={4} xl={3}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center', mt: 4, borderRadius: 3 }}>
              <Typography variant="h5" gutterBottom color="primary.main">
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Try adjusting your search terms or category filter
              </Typography>
            </Paper>
          )}
        </Container>

        {/* Cart Drawer */}
        <Drawer
          anchor="right"
          open={showCart}
          onClose={() => setShowCart(false)}
          PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Shopping Cart ({cart.length})</Typography>
              <IconButton onClick={() => setShowCart(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            {cart.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Your cart is empty
              </Typography>
            ) : (
              <>
                <List>
                  {cart.map((item) => (
                    <ListItem key={item.id} sx={{ px: 0, py: 1 }}>
                      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                        <img 
                          src={item.image || '/images/medicines/default-medicine.jpg'} 
                          alt={item.name}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4, marginRight: 12 }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" noWrap>{item.name}</Typography>
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            ₨{item.price.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ₨{cartTotal.toFixed(2)}
                  </Typography>
                </Box>
                
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setSnackbar({ open: true, message: 'Checkout feature coming soon!', severity: 'info' });
                  }}
                >
                  Proceed to Checkout
                </Button>
              </>
            )}
          </Box>
        </Drawer>

        {/* Product Detail Dialog */}
        <Dialog
          open={showProductDetail}
          onClose={() => setShowProductDetail(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedProduct && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedProduct.name}
                  </Typography>
                  <IconButton onClick={() => setShowProductDetail(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid xs={12} md={5}>
                    <img
                      src={selectedProduct.image || '/images/medicines/default-medicine.jpg'}
                      alt={selectedProduct.name}
                      style={{ width: '100%', borderRadius: 8 }}
                    />
                  </Grid>
                  <Grid xs={12} md={7}>
                    <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                      ₨{selectedProduct.price.toFixed(2)}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Rating value={selectedProduct.rating} precision={0.1} readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {selectedProduct.reviews} customer reviews
                      </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Brand:</strong> {selectedProduct.brand}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Category:</strong> {selectedProduct.category}
                    </Typography>

                    {selectedProduct.genericName && (
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Generic Name:</strong> {selectedProduct.genericName}
                      </Typography>
                    )}

                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {selectedProduct.description}
                    </Typography>

                    {selectedProduct.requiresPrescription && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        This is a prescription medicine. Valid prescription required.
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => toggleWishlist(selectedProduct)}
                  startIcon={wishlist.some(item => item.id === selectedProduct.id) ? 
                    <FavoriteIcon /> : <FavoriteBorderIcon />
                  }
                >
                  {wishlist.some(item => item.id === selectedProduct.id) ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    addToCart(selectedProduct);
                    setShowProductDetail(false);
                  }}
                  disabled={!selectedProduct.inStock}
                  startIcon={<ShoppingCartIcon />}
                >
                  Add to Cart
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default FinalProfessionalPharmacy;


