import React, { useState, useEffect } from 'react';
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
  Breadcrumbs,
  Link,
  CircularProgress,
  LinearProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  ThumbUp as ThumbUpIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

// Import components
import ProfessionalCheckout from './ProfessionalCheckout';
import ProfessionalEcommerceAdmin from './ProfessionalEcommerceAdmin';

// Professional Medicine Database with Real Data
const medicineCategories = [
  { id: 'all', name: 'All Products', count: 245 },
  { id: 'pain-relief', name: 'Pain Relief', count: 45, description: 'Effective pain and fever relief medications' },
  { id: 'cold-flu', name: 'Cold & Flu', count: 32, description: 'Remedies for cold, cough and flu symptoms' },
  { id: 'vitamins', name: 'Vitamins & Supplements', count: 67, description: 'Essential vitamins and dietary supplements' },
  { id: 'skincare', name: 'Skin Care', count: 28, description: 'Dermatological and cosmetic products' },
  { id: 'digestive', name: 'Digestive Health', count: 24, description: 'Stomach care and digestive aids' },
  { id: 'first-aid', name: 'First Aid', count: 19, description: 'Emergency care and wound treatment' },
  { id: 'personal-care', name: 'Personal Care', count: 41, description: 'Hygiene and personal care products' },
  { id: 'baby-care', name: 'Baby Care', count: 23, description: 'Specialized products for infants and children' }
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
    description: 'Fast and effective relief from headaches, body aches, and fever. Trusted by millions worldwide for safe and reliable pain management.',
    detailedDescription: 'Panadol contains paracetamol which is a clinically proven analgesic and antipyretic. It provides fast, safe and effective relief of pain and discomfort associated with headache, tension headache, period pain, cold and flu symptoms, dental pain, muscular aches, arthritis and osteoarthritis and reduces fever.',
    inStock: true,
    stockCount: 156,
    features: ['Fast Acting', 'Fever Relief', 'Pain Relief', 'Trusted Brand', 'Gentle on Stomach'],
    reviews: [
      { id: 1, user: 'Sarah M.', rating: 5, comment: 'Very effective for headaches. Works quickly and no side effects.', date: '2025-09-20', verified: true },
      { id: 2, user: 'John D.', rating: 5, comment: 'Great product, always keep it at home. Reliable brand.', date: '2025-09-18', verified: true },
      { id: 3, user: 'Maria K.', rating: 4, comment: 'Good for fever reduction. Takes about 30 minutes to work.', date: '2025-09-15', verified: false }
    ],
    specifications: {
      'Active Ingredient': 'Paracetamol 500mg',
      'Pack Size': '24 Tablets',
      'Dosage': 'Adults: 1-2 tablets every 4-6 hours',
      'Maximum Daily Dose': '8 tablets in 24 hours',
      'Age Group': 'Adults and children over 12 years',
      'Manufacturer': 'GSK Consumer Healthcare',
      'Country of Origin': 'Sri Lanka'
    },
    tags: ['bestseller', 'trusted'],
    relatedProducts: [2, 6, 3]
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
    description: 'High-strength Vitamin C supplement to support immune system and overall health. Essential for daily wellness and immunity boost.',
    detailedDescription: 'Centrum Vitamin C 1000mg provides essential immune support with high-potency vitamin C. Each tablet delivers a full day\'s supply of this essential nutrient to help maintain a healthy immune system, support collagen formation, and act as a powerful antioxidant.',
    inStock: true,
    stockCount: 89,
    features: ['Immune Support', 'Antioxidant', 'High Potency', 'Easy to Swallow', 'Daily Wellness'],
    reviews: [
      { id: 1, user: 'Maria K.', rating: 5, comment: 'Great quality vitamin C. Helps boost immunity during flu season.', date: '2025-09-22', verified: true },
      { id: 2, user: 'David L.', rating: 4, comment: 'Good product, reasonable price. Taking it daily.', date: '2025-09-19', verified: true }
    ],
    specifications: {
      'Active Ingredient': 'Vitamin C (Ascorbic Acid) 1000mg',
      'Pack Size': '60 Tablets',
      'Dosage': 'Adults: 1 tablet daily with food',
      'Storage': 'Store in cool, dry place',
      'Manufacturer': 'Pfizer Consumer Healthcare',
      'Suitable For': 'Adults and children over 12 years'
    },
    tags: ['immunity', 'wellness'],
    relatedProducts: [4, 5, 7]
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
    description: 'Antiseptic cream for minor cuts, wounds, and skin infections. Helps prevent infection and promotes faster healing.',
    detailedDescription: 'Savlon Antiseptic Cream is a dual-action antiseptic that kills germs and helps prevent infection in minor cuts, grazes, insect bites and stings. It contains two antiseptic ingredients that work together to provide protection against infection.',
    inStock: true,
    stockCount: 67,
    features: ['Antiseptic', 'Wound Care', 'Infection Prevention', 'Fast Healing', 'Dual Action'],
    reviews: [
      { id: 1, user: 'Anna P.', rating: 5, comment: 'Essential for first aid kit. Very effective on cuts and scrapes.', date: '2025-09-21', verified: true },
      { id: 2, user: 'Tom R.', rating: 4, comment: 'Good for minor cuts and scrapes. Heals quickly.', date: '2025-09-17', verified: false }
    ],
    specifications: {
      'Active Ingredients': 'Chlorhexidine Gluconate 0.1%, Cetrimide 0.5%',
      'Pack Size': '30g Tube',
      'Application': 'Apply thin layer to affected area 2-3 times daily',
      'Suitable For': 'Adults and children over 2 years',
      'Manufacturer': 'ICI Pakistan Limited'
    },
    tags: ['first-aid', 'antiseptic'],
    relatedProducts: [1, 6, 8]
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
    description: 'Premium Omega-3 fish oil capsules for heart health, brain function, and joint support. Molecularly distilled for purity.',
    detailedDescription: 'Nature\'s Own Omega-3 Fish Oil provides essential fatty acids EPA and DHA that support cardiovascular health, brain function, and joint mobility. Sourced from deep-sea fish and molecularly distilled to remove impurities and concentrate the beneficial omega-3s.',
    inStock: true,
    stockCount: 45,
    features: ['Heart Health', 'Brain Support', 'Joint Health', 'Premium Quality', 'Molecularly Distilled'],
    reviews: [
      { id: 1, user: 'Lisa W.', rating: 5, comment: 'Excellent quality fish oil. No aftertaste and great for heart health.', date: '2025-09-23', verified: true },
      { id: 2, user: 'Mike S.', rating: 5, comment: 'Great for heart health. Doctor recommended. Highly satisfied.', date: '2025-09-20', verified: true }
    ],
    specifications: {
      'EPA': '300mg per capsule',
      'DHA': '200mg per capsule',
      'Pack Size': '90 Capsules',
      'Dosage': 'Adults: 1-2 capsules daily with meals',
      'Source': 'Deep sea fish oil',
      'Manufacturer': 'Nature\'s Own'
    },
    tags: ['premium', 'heart-health'],
    relatedProducts: [2, 5, 7]
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
    description: 'Daily moisturizing face cream with SPF 15 protection. Suitable for all skin types with 24-hour hydration.',
    detailedDescription: 'NIVEA Daily Essentials Moisturising Day Cream provides 24-hour moisture and SPF 15 protection. The lightweight, non-greasy formula absorbs quickly and is enriched with Vitamin E and UV filters to protect against daily environmental damage.',
    inStock: true,
    stockCount: 78,
    features: ['SPF 15', 'All Skin Types', '24hr Moisture', 'Dermatologist Tested', 'Vitamin E'],
    reviews: [
      { id: 1, user: 'Emma T.', rating: 5, comment: 'Perfect daily moisturizer. Light and non-greasy, great under makeup.', date: '2025-09-22', verified: true },
      { id: 2, user: 'Rachel B.', rating: 4, comment: 'Good product, nice texture. Keeps skin moisturized all day.', date: '2025-09-19', verified: false }
    ],
    specifications: {
      'SPF': '15',
      'Pack Size': '50ml',
      'Skin Type': 'All skin types',
      'Application': 'Apply morning and evening to clean face',
      'Key Ingredients': 'Vitamin E, UV Filters',
      'Manufacturer': 'Beiersdorf'
    },
    tags: ['skincare', 'daily-use'],
    relatedProducts: [8, 9, 10]
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
    description: 'Effective cough syrup for dry and productive coughs. Provides long-lasting relief with pleasant taste.',
    detailedDescription: 'Benadryl Cough Formula provides effective relief from both dry and chesty coughs. The active ingredient helps to reduce the urge to cough while soothing throat irritation. Suitable for adults and children over 6 years.',
    inStock: true,
    stockCount: 92,
    features: ['Cough Relief', 'Long Acting', 'Pleasant Taste', 'Non-Drowsy', 'Throat Soothing'],
    reviews: [
      { id: 1, user: 'Peter H.', rating: 4, comment: 'Works well for cough relief. Pleasant cherry flavor.', date: '2025-09-21', verified: true },
      { id: 2, user: 'Jane C.', rating: 5, comment: 'Very effective, tastes good too. Helps with night cough.', date: '2025-09-18', verified: true }
    ],
    specifications: {
      'Active Ingredient': 'Dextromethorphan HBr 15mg/5ml',
      'Pack Size': '100ml',
      'Dosage': 'Adults: 10ml every 4-6 hours, Children 6-12: 5ml every 4-6 hours',
      'Age Group': 'Adults and children over 6 years',
      'Flavor': 'Cherry',
      'Manufacturer': 'Johnson & Johnson'
    },
    tags: ['cough-relief', 'family'],
    relatedProducts: [1, 3, 7]
  }
];

// Create context for ecommerce state management
const EcommerceContext = React.createContext();

const useEcommerce = () => {
  const context = React.useContext(EcommerceContext);
  if (!context) {
    throw new Error('useEcommerce must be used within EcommerceProvider');
  }
  return context;
};

// Main Ecommerce Provider
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

// Professional Ecommerce Main Application
const ProfessionalEcommerceMain = () => {
  const [currentScreen, setCurrentScreen] = useState('home'); // home, checkout, admin, product-detail
  const [products, setProducts] = useState(professionalProducts);
  const [filteredProducts, setFilteredProducts] = useState(professionalProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const { cart, wishlist, addToCart, removeFromCart, updateCartQuantity, toggleWishlist } = useEcommerce();

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
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
        case 'newest':
          return b.id - a.id;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products, sortBy]);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Professional Header Component
  const ProfessionalHeader = () => (
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
          {medicineCategories.slice(1, 5).map((category) => (
            <Button
              key={category.id}
              color="inherit"
              onClick={() => setSelectedCategory(category.id)}
              sx={{
                mx: 0.5,
                textTransform: 'none',
                backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : 'transparent',
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
          onChange={(e) => setSearchQuery(e.target.value)}
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
          <IconButton color="inherit" onClick={() => setCurrentScreen('admin')}>
            <Badge badgeContent={0} color="error">
              <SettingsIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit">
            <Badge badgeContent={wishlist.length} color="error">
              <FavoriteIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
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
  );

  // Product Card Component
  const ProductCard = ({ product }) => {
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
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
            border: '1px solid #3b82f6'
          }
        }}
        onClick={() => handleProductClick(product)}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={product.images[0]}
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

          {/* Tags */}
          {product.tags.includes('bestseller') && (
            <Chip
              label="Bestseller"
              color="warning"
              size="small"
              sx={{
                position: 'absolute',
                top: 45,
                left: 8,
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
          )}
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
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
              showSnackbar(`${product.name} added to cart!`);
            }}
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

  // Cart Drawer Component
  const CartDrawer = () => (
    <Drawer
      anchor="right"
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      PaperProps={{
        sx: { width: { xs: '100vw', sm: 400 }, borderRadius: '16px 0 0 16px' }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="between" sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Shopping Cart ({cartItemCount})
          </Typography>
          <IconButton onClick={() => setCartOpen(false)}>
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
              <Typography variant="body2" color="text.secondary">
                Add some products to get started
              </Typography>
            </Box>
          ) : (
            <List>
              {cart.map((item) => (
                <ListItem key={item.id} sx={{ px: 0, py: 2 }}>
                  <Avatar
                    src={item.images ? item.images[0] : ''}
                    variant="rounded"
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.brand}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        sx={{ border: '1px solid #e5e7eb' }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        sx={{ border: '1px solid #e5e7eb' }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight="bold">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        removeFromCart(item.id);
                        showSnackbar(`${item.name} removed from cart`);
                      }}
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
            <Box display="flex" justifyContent="between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Total: Rs. {cartTotal.toFixed(2)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => {
                setCartOpen(false);
                setCurrentScreen('checkout');
              }}
              sx={{
                borderRadius: '12px',
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

  // Main Home Screen
  const HomeScreen = () => (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <ProfessionalHeader />

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
          <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap">
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
            <Box display="flex" alignItems="center" gap={1}>
              <SupportIcon />
              <Typography>24/7 Support</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Categories Grid */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1e3a8a' }}>
            Shop by Category
          </Typography>
          <Grid container spacing={2}>
            {medicineCategories.slice(1).map((category) => (
              <Grid item xs={6} sm={4} md={3} key={category.id}>
                <Card
                  onClick={() => setSelectedCategory(category.id)}
                  sx={{
                    p: 3,
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
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {category.count} products
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Filters and Sort */}
        <Box display="flex" justifyContent="between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
              Products ({filteredProducts.length})
            </Typography>
            {selectedCategory !== 'all' && (
              <Breadcrumbs sx={{ mt: 1 }}>
                <Link
                  color="inherit"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategory('all');
                  }}
                  sx={{ textDecoration: 'none' }}
                >
                  All Products
                </Link>
                <Typography color="text.primary">
                  {medicineCategories.find(c => c.id === selectedCategory)?.name}
                </Typography>
              </Breadcrumbs>
            )}
          </Box>
          <Box display="flex" gap={2} alignItems="center">
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
                <MenuItem value="newest">Newest First</MenuItem>
              </Select>
            </FormControl>
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Products Grid */}
        {loading ? (
          <Box textAlign="center" sx={{ py: 8 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading products...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or filter criteria
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>

      {/* Floating Action Buttons */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
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

      {/* Cart Drawer */}
      <CartDrawer />

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
          <ListItemIcon><FavoriteIcon /></ListItemIcon>
          Wishlist ({wishlist.length})
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
                  setSelectedCategory(category.id);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  backgroundColor: selectedCategory === category.id ? '#e0f2fe' : 'transparent',
                  '&:hover': { backgroundColor: '#f3f4f6' }
                }}
              >
                <ListItemIcon>
                  <CategoryIcon sx={{ color: '#3b82f6' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={category.name} 
                  secondary={`${category.count} products`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );

  // Screen rendering logic
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'checkout':
        return (
          <ProfessionalCheckout
            cart={cart}
            onBack={() => setCurrentScreen('home')}
            onOrderComplete={() => {
              setCurrentScreen('home');
              showSnackbar('Order placed successfully!');
            }}
          />
        );
      case 'admin':
        return <ProfessionalEcommerceAdmin />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {renderCurrentScreen()}

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
    </Box>
  );
};

// Wrap the component with the provider
const ProfessionalEcommerceMainWithProvider = () => {
  return (
    <EcommerceProvider>
      <ProfessionalEcommerceMain />
    </EcommerceProvider>
  );
};

export default ProfessionalEcommerceMainWithProvider;
