import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  Box,
  Container,
  Grid,
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
  Tab,
  Tabs,
  Fab,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  InputLabel,
  Breadcrumbs,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Tooltip
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
  Sort as SortIcon,
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
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  LocalShipping as LocalShippingIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  HelpOutline as HelpOutlineIcon,
  Store as StoreIcon,
  LocalOffer as LocalOfferIcon,
  Verified as VerifiedIcon,
  Shield as ShieldIcon,
  ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import ProfessionalFooter from './ProfessionalFooter';

// Professional Medicine Database
const medicineCategories = [
  { id: 'pain-relief', name: 'Pain Relief', count: 45 },
  { id: 'cold-flu', name: 'Cold & Flu', count: 32 },
  { id: 'vitamins', name: 'Vitamins & Supplements', count: 67 },
  { id: 'skincare', name: 'Skin Care', count: 28 },
  { id: 'digestive', name: 'Digestive Health', count: 24 },
  { id: 'first-aid', name: 'First Aid', count: 19 },
  { id: 'personal-care', name: 'Personal Care', count: 41 },
  { id: 'baby-care', name: 'Baby Care', count: 23 }
];

const professionalProducts = [
  {
    id: 1,
    name: 'Paracetamol 500mg Tablets',
    brand: 'Panadol',
    category: 'pain-relief',
    price: 450.00,
    originalPrice: 520.00,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 2341,
    description: 'Fast and effective relief from headaches, body aches, and fever. Trusted by millions worldwide.',
    inStock: true,
    stockCount: 156,
    features: ['Fast Acting', 'Fever Relief', 'Pain Relief', 'Trusted Brand'],
    reviews: [
      { id: 1, user: 'Sarah M.', rating: 5, comment: 'Very effective for headaches. Works quickly.', date: '2025-09-20' },
      { id: 2, user: 'John D.', rating: 5, comment: 'Great product, always keep it at home.', date: '2025-09-18' }
    ],
    specifications: {
      'Active Ingredient': 'Paracetamol 500mg',
      'Pack Size': '24 Tablets',
      'Dosage': 'Adults: 1-2 tablets every 4-6 hours',
      'Maximum Daily Dose': '8 tablets in 24 hours'
    }
  },
  {
    id: 2,
    name: 'Vitamin C 1000mg Tablets',
    brand: 'Centrum',
    category: 'vitamins',
    price: 1250.00,
    originalPrice: 1400.00,
    images: [
      'https://images.unsplash.com/photo-1550572017-1d98be3c5c85?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop'
    ],
    rating: 4.7,
    reviewCount: 1876,
    description: 'High-strength Vitamin C supplement to support immune system and overall health.',
    inStock: true,
    stockCount: 89,
    features: ['Immune Support', 'Antioxidant', 'High Potency', 'Easy to Swallow'],
    reviews: [
      { id: 1, user: 'Maria K.', rating: 5, comment: 'Great quality vitamin C. Helps boost immunity.', date: '2025-09-22' },
      { id: 2, user: 'David L.', rating: 4, comment: 'Good product, reasonable price.', date: '2025-09-19' }
    ],
    specifications: {
      'Active Ingredient': 'Vitamin C (Ascorbic Acid) 1000mg',
      'Pack Size': '60 Tablets',
      'Dosage': 'Adults: 1 tablet daily with food',
      'Storage': 'Store in cool, dry place'
    }
  },
  {
    id: 3,
    name: 'Antiseptic Cream 30g',
    brand: 'Savlon',
    category: 'first-aid',
    price: 285.00,
    originalPrice: 320.00,
    images: [
      'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop'
    ],
    rating: 4.6,
    reviewCount: 934,
    description: 'Antiseptic cream for minor cuts, wounds, and skin infections. Helps prevent infection and promotes healing.',
    inStock: true,
    stockCount: 67,
    features: ['Antiseptic', 'Wound Care', 'Infection Prevention', 'Fast Healing'],
    reviews: [
      { id: 1, user: 'Anna P.', rating: 5, comment: 'Essential for first aid kit. Very effective.', date: '2025-09-21' },
      { id: 2, user: 'Tom R.', rating: 4, comment: 'Good for minor cuts and scrapes.', date: '2025-09-17' }
    ],
    specifications: {
      'Active Ingredients': 'Chlorhexidine Gluconate, Cetrimide',
      'Pack Size': '30g Tube',
      'Application': 'Apply thin layer to affected area 2-3 times daily',
      'Suitable For': 'Adults and children over 2 years'
    }
  },
  {
    id: 4,
    name: 'Omega-3 Fish Oil Capsules',
    brand: 'Nature\'s Own',
    category: 'vitamins',
    price: 1850.00,
    originalPrice: 2100.00,
    images: [
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1550572017-1d98be3c5c85?w=400&h=400&fit=crop'
    ],
    rating: 4.9,
    reviewCount: 1567,
    description: 'Premium Omega-3 fish oil capsules for heart health, brain function, and joint support.',
    inStock: true,
    stockCount: 45,
    features: ['Heart Health', 'Brain Support', 'Joint Health', 'Premium Quality'],
    reviews: [
      { id: 1, user: 'Lisa W.', rating: 5, comment: 'Excellent quality fish oil. No aftertaste.', date: '2025-09-23' },
      { id: 2, user: 'Mike S.', rating: 5, comment: 'Great for heart health. Highly recommended.', date: '2025-09-20' }
    ],
    specifications: {
      'EPA': '300mg',
      'DHA': '200mg',
      'Pack Size': '90 Capsules',
      'Dosage': 'Adults: 1-2 capsules daily with meals'
    }
  },
  {
    id: 5,
    name: 'Moisturizing Face Cream 50ml',
    brand: 'Nivea',
    category: 'skincare',
    price: 950.00,
    originalPrice: 1100.00,
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    ],
    rating: 4.5,
    reviewCount: 2156,
    description: 'Daily moisturizing face cream with SPF 15 protection. Suitable for all skin types.',
    inStock: true,
    stockCount: 78,
    features: ['SPF 15', 'All Skin Types', '24hr Moisture', 'Dermatologist Tested'],
    reviews: [
      { id: 1, user: 'Emma T.', rating: 5, comment: 'Perfect daily moisturizer. Light and non-greasy.', date: '2025-09-22' },
      { id: 2, user: 'Rachel B.', rating: 4, comment: 'Good product, nice texture.', date: '2025-09-19' }
    ],
    specifications: {
      'SPF': '15',
      'Pack Size': '50ml',
      'Skin Type': 'All skin types',
      'Application': 'Apply morning and evening to clean face'
    }
  },
  {
    id: 6,
    name: 'Cough Syrup 100ml',
    brand: 'Benadryl',
    category: 'cold-flu',
    price: 385.00,
    originalPrice: 440.00,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559757274-b67dd7b3d4f1?w=400&h=400&fit=crop'
    ],
    rating: 4.4,
    reviewCount: 1234,
    description: 'Effective cough syrup for dry and productive coughs. Provides long-lasting relief.',
    inStock: true,
    stockCount: 92,
    features: ['Cough Relief', 'Long Acting', 'Pleasant Taste', 'Non-Drowsy'],
    reviews: [
      { id: 1, user: 'Peter H.', rating: 4, comment: 'Works well for cough relief.', date: '2025-09-21' },
      { id: 2, user: 'Jane C.', rating: 5, comment: 'Very effective, tastes good too.', date: '2025-09-18' }
    ],
    specifications: {
      'Active Ingredient': 'Dextromethorphan HBr 15mg/5ml',
      'Pack Size': '100ml',
      'Dosage': 'Adults: 10ml every 4-6 hours',
      'Age Group': 'Adults and children over 12 years'
    }
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

// Ecommerce Provider
const EcommerceProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
    notifications,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    placeOrder,
    setUser,
    setNotifications
  };

  return (
    <EcommerceContext.Provider value={value}>
      {children}
    </EcommerceContext.Provider>
  );
};

// Professional Header Component
const ProfessionalHeader = ({ onSearch, searchQuery, onCategorySelect }) => {
  const { cart, wishlist, user } = useEcommerce();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <AppBar position="sticky" sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
      }}>
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            sx={{ mr: 2, display: { md: 'none' } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Box display="flex" alignItems="center" sx={{ flexGrow: { xs: 1, md: 0 }, mr: 3 }}>
            <LocalPharmacyIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Kaluthara Pharmacy
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 3 }}>
            {medicineCategories.slice(0, 4).map((category) => (
              <Button
                key={category.id}
                color="inherit"
                onClick={() => onCategorySelect(category.id)}
                sx={{
                  mx: 0.5,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                {category.name}
              </Button>
            ))}
          </Box>

          <TextField
            placeholder="Search medicines, health products..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            size="small"
            sx={{
              flexGrow: 1,
              maxWidth: 400,
              mr: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '& input::placeholder': { color: 'rgba(255,255,255,0.7)' }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              )
            }}
          />

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton color="inherit">
              <Badge badgeContent={wishlist.length} color="error">
                <FavoriteIcon />
              </Badge>
            </IconButton>

            <IconButton color="inherit">
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>

            <IconButton
              color="inherit"
              onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

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

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e3a8a' }}>
            Categories
          </Typography>
          <List>
            {medicineCategories.map((category) => (
              <ListItem
                key={category.id}
                component="button"
                onClick={() => {
                  onCategorySelect(category.id);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  '&:hover': { backgroundColor: '#f3f4f6' }
                }}
              >
                <ListItemIcon>
                  <CategoryIcon sx={{ color: '#3b82f6' }} />
                </ListItemIcon>
                <ListItemText primary={category.name} />
                <Chip label={category.count} size="small" />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useEcommerce();
  const [selectedImage, setSelectedImage] = useState(0);
  const isInWishlist = wishlist.some(item => item.id === product.id);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          border: '1px solid #3b82f6'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.images[selectedImage]}
          alt={product.name}
          sx={{ borderRadius: '16px 16px 0 0' }}
        />
        
        {/* Discount Badge */}
        {product.originalPrice > product.price && (
          <Chip
            label={`${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          />
        )}

        {/* Wishlist Button */}
        <IconButton
          onClick={() => toggleWishlist(product)}
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

        {/* Stock Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: product.inStock ? '#10b981' : '#ef4444',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500, mb: 0.5 }}
        >
          {product.brand}
        </Typography>
        
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            mb: 1,
            fontSize: '1rem',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <Rating value={product.rating} precision={0.1} size="small" readOnly />
          <Typography variant="body2" color="text.secondary">
            ({product.reviewCount})
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
            Rs. {product.price.toFixed(2)}
          </Typography>
          {product.originalPrice > product.price && (
            <Typography
              variant="body2"
              sx={{
                textDecoration: 'line-through',
                color: 'text.secondary'
              }}
            >
              Rs. {product.originalPrice.toFixed(2)}
            </Typography>
          )}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.description}
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
          {product.features.slice(0, 2).map((feature) => (
            <Chip
              key={feature}
              label={feature}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
          sx={{
            borderRadius: '12px',
            py: 1.5,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            fontWeight: 'bold',
            '&:hover': {
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)'
            }
          }}
        >
          <ShoppingCartIcon sx={{ mr: 1 }} />
          Add to Cart
        </Button>
      </Box>
    </Card>
  );
};

// Product Detail Modal
const ProductDetailModal = ({ product, open, onClose }) => {
  const { addToCart, toggleWishlist, wishlist } = useEcommerce();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  
  const isInWishlist = wishlist.some(item => item.id === product?.id);

  if (!product) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            {product.name}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <Box>
              <CardMedia
                component="img"
                height="400"
                image={product.images[selectedImage]}
                alt={product.name}
                sx={{ borderRadius: '12px', mb: 2 }}
              />
              <Box display="flex" gap={1}>
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid #3b82f6' : '2px solid transparent',
                      '&:hover': { border: '2px solid #3b82f6' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {product.brand}
            </Typography>
            
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
              {product.name}
            </Typography>

            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Rating value={product.rating} precision={0.1} readOnly />
              <Typography variant="body1">
                {product.rating} ({product.reviewCount} reviews)
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
                Rs. {product.price.toFixed(2)}
              </Typography>
              {product.originalPrice > product.price && (
                <Typography
                  variant="h5"
                  sx={{
                    textDecoration: 'line-through',
                    color: 'text.secondary'
                  }}
                >
                  Rs. {product.originalPrice.toFixed(2)}
                </Typography>
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {product.description}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
              {product.features.map((feature) => (
                <Chip
                  key={feature}
                  label={feature}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>

            {/* Stock Status */}
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
              <CheckCircleIcon sx={{ color: product.inStock ? '#10b981' : '#ef4444' }} />
              <Typography variant="body1" color={product.inStock ? 'success.main' : 'error.main'}>
                {product.inStock ? `In Stock (${product.stockCount} available)` : 'Out of Stock'}
              </Typography>
            </Box>

            {/* Quantity Selector */}
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="medium">
                Quantity:
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  size="small"
                  sx={{ border: '1px solid #e5e7eb' }}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton
                  onClick={() => setQuantity(quantity + 1)}
                  size="small"
                  sx={{ border: '1px solid #e5e7eb' }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  addToCart(product, quantity);
                  onClose();
                }}
                disabled={!product.inStock}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                }}
              >
                <ShoppingCartIcon sx={{ mr: 1 }} />
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => toggleWishlist(product)}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  color: isInWishlist ? '#ef4444' : 'inherit'
                }}
              >
                {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Product Tabs */}
        <Box sx={{ mt: 4 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Specifications" />
            <Tab label="Reviews" />
            <Tab label="Shipping Info" />
          </Tabs>

          {/* Specifications Tab */}
          {activeTab === 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Product Specifications
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Paper sx={{ p: 2, borderRadius: '8px' }}>
                      <Typography variant="body2" color="text.secondary">
                        {key}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Reviews Tab */}
          {activeTab === 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Customer Reviews
              </Typography>
              {product.reviews.map((review) => (
                <Paper key={review.id} sx={{ p: 3, mb: 2, borderRadius: '12px' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" sx={{ mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {review.user}
                      </Typography>
                      <Rating value={review.rating} size="small" readOnly />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(review.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {review.comment}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}

          {/* Shipping Info Tab */}
          {activeTab === 2 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Shipping Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 3, borderRadius: '12px', textAlign: 'center' }}>
                    <LocalShippingIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Standard Delivery
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      2-3 business days
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      Rs. 250.00
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 3, borderRadius: '12px', textAlign: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Express Delivery
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Same day delivery
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      Rs. 500.00
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Main Professional Ecommerce Component
const ProfessionalEcommerce = () => {
  const [products, setProducts] = useState(professionalProducts);
  const [filteredProducts, setFilteredProducts] = useState(professionalProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filter and search logic
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
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

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  return (
    <EcommerceProvider>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1 }}>
          {/* Professional Header */}
        <ProfessionalHeader
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          onCategorySelect={setSelectedCategory}
        />

        {/* Hero Section */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Paper
            sx={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              p: 4,
              mb: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
              Your Health, Our Priority
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Quality medicines and healthcare products delivered to your doorstep
            </Typography>
            <Box display="flex" justifyContent="center" gap={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <VerifiedIcon />
                <Typography>Licensed Pharmacy</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalShippingIcon />
                <Typography>Fast Delivery</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <ShieldIcon />
                <Typography>Secure Payment</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Categories Grid */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1e3a8a' }}>
              Shop by Category
            </Typography>
            <Grid container spacing={2}>
              {medicineCategories.map((category) => (
                <Grid item xs={6} sm={4} md={3} key={category.id}>
                  <Card
                    onClick={() => setSelectedCategory(category.id)}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      border: selectedCategory === category.id ? '2px solid #3b82f6' : '2px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        border: '2px solid #3b82f6'
                      }
                    }}
                  >
                    <CategoryIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.count} products
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Filters and Sort */}
          <Box display="flex" justifyContent="between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
              Products ({filteredProducts.length})
            </Typography>
            <Box display="flex" gap={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Name A-Z</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="popularity">Most Popular</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Products Grid */}
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(8)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card sx={{ borderRadius: '16px' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={24} />
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="text" height={20} width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Box onClick={() => handleProductClick(product)}>
                    <ProductCard product={product} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          {filteredProducts.length === 0 && !loading && (
            <Box textAlign="center" sx={{ py: 8 }}>
              <StoreIcon sx={{ fontSize: 80, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          )}
        </Container>

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          open={productModalOpen}
          onClose={() => setProductModalOpen(false)}
        />

        {/* Floating Action Buttons */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
          }}
        >
          <ChatIcon />
        </Fab>

        <Fab
          color="secondary"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20
          }}
        >
          <HelpOutlineIcon />
        </Fab>

        </Box>
        
        {/* Professional Footer */}
        <ProfessionalFooter />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </EcommerceProvider>
  );
};

export default ProfessionalEcommerce;
