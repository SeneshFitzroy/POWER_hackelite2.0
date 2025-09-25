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
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ProfessionalFooter from './ProfessionalFooter';
import { useTheme, ThemeContextProvider } from '../../contexts/ThemeContext';
import DeliveryManagement from './DeliveryManagement';

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

// Professional Delivery Content Component for Popup
const ProfessionalDeliveryContent = ({ orderId }) => {
  const [deliveryStatus] = useState('in_transit');
  const [estimatedTime] = useState('15-20 minutes');

  // Professional CSS-in-JS animations
  const pulseAnimation = {
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
        opacity: 1,
      },
      '50%': {
        transform: 'scale(1.05)',
        opacity: 0.7,
      },
      '100%': {
        transform: 'scale(1)',
        opacity: 1,
      },
    },
  };

  const slideInAnimation = {
    '@keyframes slideIn': {
      '0%': {
        transform: 'translateY(20px)',
        opacity: 0,
      },
      '100%': {
        transform: 'translateY(0)',
        opacity: 1,
      },
    },
  };
  
  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Fixed delivery timeline times (don't change)
  const [deliveryTimes] = useState(() => {
    const baseTime = new Date();
    return {
      confirmed: new Date(baseTime.getTime() - (50 * 60 * 1000)), // 50 mins ago
      preparing: new Date(baseTime.getTime() - (35 * 60 * 1000)), // 35 mins ago
      dispatched: new Date(baseTime.getTime() - (15 * 60 * 1000)), // 15 mins ago
      eta: new Date(baseTime.getTime() + (12 * 60 * 1000)) // 12 mins from now
    };
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
  // Format time in 12-hour format for Sri Lanka timezone
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true,
      timeZone: 'Asia/Colombo'
    });
  };

  const deliverySteps = [
    { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircleIcon, completed: true, time: formatTime(deliveryTimes.confirmed) },
    { id: 'preparing', label: 'Preparing Order', icon: StoreIcon, completed: true, time: formatTime(deliveryTimes.preparing) },
    { id: 'dispatched', label: 'Out for Delivery', icon: LocalShippingIcon, completed: true, time: formatTime(deliveryTimes.dispatched), active: true },
    { id: 'delivered', label: 'Delivered', icon: VerifiedIcon, completed: false, time: `ETA: ${formatTime(deliveryTimes.eta)}` }
  ];

  const driverInfo = {
    name: 'Kamal Perera',
    vehicle: 'Motorcycle - ABC 1234',
    rating: 4.8,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'
  };

  return (
    <Box sx={{ 
      minHeight: '650px', 
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 24px 48px rgba(25,118,210,0.15)',
      border: '1px solid #e3f2fd',
      animation: 'slideIn 0.4s ease-out',
      ...slideInAnimation,
      ...pulseAnimation
    }}>
      {/* Header Section */}
      <Box sx={{ 
        p: 4, 
        backgroundColor: 'white',
        borderBottom: '1px solid #e3f2fd',
        background: 'linear-gradient(180deg, #f8fafe 0%, #ffffff 100%)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box 
            sx={{ 
              width: 14, 
              height: 14, 
              backgroundColor: '#1976d2', 
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 0 4px rgba(25,118,210,0.2)'
            }} 
          />
          <Typography 
            variant="h5" 
            sx={{
              color: '#1565c0',
              fontWeight: '800',
              fontSize: '24px',
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Live Tracking
          </Typography>
        </Box>
        
        {/* ETA Card */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', 
          color: 'white',
          boxShadow: '0 12px 40px rgba(21,101,192,0.35)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 3.5, px: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9, 
                mb: 1,
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Estimated Arrival
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: '800', 
                mb: 1,
                fontSize: '32px',
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {estimatedTime}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.95,
                fontSize: '16px',
                fontWeight: '500',
                fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Your medicines are on the way
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Delivery Progress Section */}
      <Box sx={{ 
        p: 4, 
        backgroundColor: 'white', 
        mb: 1,
        borderTop: '1px solid #f3f4f6'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: '800', 
            color: '#1565c0', 
            mb: 4,
            fontSize: '20px',
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Delivery Progress
        </Typography>
        
        <Box sx={{ position: 'relative', pl: 2 }}>
          {deliverySteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Box key={step.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 4, position: 'relative' }}>
                {/* Progress Line */}
                {index < deliverySteps.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '18px',
                      top: '36px',
                      width: '3px',
                      height: '36px',
                      backgroundColor: step.completed ? '#1565c0' : '#bbdefb',
                      borderRadius: '2px',
                      zIndex: 0
                    }}
                  />
                )}
                
                {/* Step Icon */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: step.completed ? '#1565c0' : step.active ? '#1976d2' : '#e3f2fd',
                    color: step.completed || step.active ? 'white' : '#90caf9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    position: 'relative',
                    boxShadow: step.active ? '0 0 0 6px rgba(25,118,210,0.15)' : step.completed ? '0 4px 12px rgba(21,101,192,0.25)' : 'none',
                    transform: step.active ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.4s ease',
                    border: step.active ? '2px solid white' : 'none'
                  }}
                >
                  <IconComponent sx={{ fontSize: 18 }} />
                </Box>
                
                {/* Step Details */}
                <Box sx={{ ml: 3, flex: 1, pt: 0.5 }}>
                  <Typography 
                    variant="body1" 
                    sx={{
                      fontWeight: step.active ? '800' : '700',
                      color: step.active ? '#1565c0' : step.completed ? '#0d47a1' : '#90caf9',
                      mb: 0.5,
                      fontSize: '17px',
                      fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {step.label}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: step.active ? '#1976d2' : '#64b5f6',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {step.time}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Driver Information */}
      <Box sx={{ 
        p: 4, 
        backgroundColor: 'white', 
        mb: 1,
        borderTop: '1px solid #f3f4f6'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: '800', 
            color: '#1565c0', 
            mb: 4,
            fontSize: '20px',
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Your Delivery Partner
        </Typography>
        
        <Card sx={{ 
          p: 4, 
          border: '2px solid #e3f2fd',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(25,118,210,0.12)',
          background: 'linear-gradient(135deg, #fafbff 0%, #f3f4f6 100%)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Avatar 
              src={driverInfo.photo}
              sx={{ 
                width: 84, 
                height: 84,
                border: '4px solid #1565c0',
                boxShadow: '0 8px 24px rgba(21,101,192,0.35)',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
              }}
            >
              <PersonIcon sx={{ fontSize: 42, color: 'white' }} />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: '800', 
                  color: '#0d47a1', 
                  mb: 0.5,
                  fontSize: '20px',
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                {driverInfo.name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#1976d2', 
                  mb: 1.5,
                  fontSize: '15px',
                  fontWeight: '600',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                {driverInfo.vehicle}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Rating value={driverInfo.rating} precision={0.1} readOnly size="medium" 
                  sx={{ color: '#1976d2' }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#1565c0', 
                    fontWeight: '700',
                    fontSize: '15px',
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {driverInfo.rating} rating
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ ml: 'auto' }}>
              <Chip
                label="Professional Driver"
                sx={{ 
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '13px',
                  height: '32px',
                  px: 2,
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.3)'
                }}
              />
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Professional Route Map */}
      <Box sx={{ 
        p: 4, 
        backgroundColor: 'white', 
        mb: 1,
        borderTop: '1px solid #f3f4f6'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: '800', 
              color: '#1565c0',
              fontSize: '20px',
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Live Route Tracking
          </Typography>
          
          {/* Real-time Current Time */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '11px', display: 'block' }}>
              Current Time
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#1565c0', 
                fontWeight: '700',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            >
              {formatTime(currentTime)}
            </Typography>
          </Box>
        </Box>
        
        {/* Real Google Maps */}
        <Box
          sx={{
            position: 'relative',
            height: 320,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '2px solid #e3f2fd',
            mb: 3
          }}
        >
          {/* Clean Real Google Maps */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            {/* Embedded Google Maps - Clean View */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d15843.296905834536!2d79.85162!3d6.92707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3ae25911dd8b1b91%3A0x2db2c18a68712863!2sNPK%20Pharmacy%2C%20Colombo%2C%20Sri%20Lanka!3m2!1d6.9201!2d79.8585!4m5!1s0x3ae259692f4b7bdd%3A0x52963fe4145c4a2b!2sColombo%2C%20Sri%20Lanka!3m2!1d6.9341!2d79.8639!5e0!3m2!1sen!2slk!4v1697123456789!5m2!1sen!2slk"
              width="100%"
              height="100%"
              style={{ 
                border: 0,
                borderRadius: '16px'
              }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Live Delivery Tracking"
            />
          </Box>
          
          {/* Location Labels */}
          <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
            <Chip 
              icon={<StoreIcon />} 
              label="NPK Pharmacy" 
              size="medium"
              sx={{ 
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', 
                color: 'white',
                fontWeight: '700',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(21,101,192,0.4)',
                fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
          </Box>
          
          <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
            <Chip 
              icon={<LocationOnIcon />} 
              label="Your Location" 
              size="medium"
              sx={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
                color: 'white',
                fontWeight: '700',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
                fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
          </Box>
          
          {/* Driver position indicator */}
          <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>
            <Chip 
              icon={<LocalShippingIcon />} 
              label="Driver En Route" 
              size="small"
              sx={{ 
                backgroundColor: '#ff5722', 
                color: 'white',
                fontWeight: '600',
                fontSize: '0.75rem'
              }}
            />
          </Box>
        </Box>
        
        {/* Delivery Statistics */}
        <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
          <Card sx={{ 
            flex: 1, 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: '900', 
                  color: '#1565c0',
                  fontSize: '26px',
                  mb: 0.5,
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                2.4 km
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64b5f6',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Distance Left
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            flex: 1, 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: '900', 
                  color: '#1976d2',
                  fontSize: '26px',
                  mb: 0.5,
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                12 min
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                ETA
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            flex: 1, 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: '900', 
                  color: '#0d47a1',
                  fontSize: '26px',
                  mb: 0.5,
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                32 km/h
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Speed
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Action Button */}
      <Box sx={{ 
        p: 4, 
        backgroundColor: '#fafbff', 
        borderTop: '2px solid #e3f2fd',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafe 100%)'
      }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ReceiptIcon />}
          onClick={() => {
            // Close delivery tracking and show receipt
            if (window.closeDeliveryTracking) {
              window.closeDeliveryTracking();
            }
            if (window.showOrderReceipt) {
              window.showOrderReceipt();
            }
          }}
          sx={{ 
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            fontWeight: '800',
            py: 3,
            fontSize: '18px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(21,101,192,0.4)',
            fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '&:hover': {
              background: 'linear-gradient(135deg, #0d47a1 0%, #1a237e 100%)',
              boxShadow: '0 12px 40px rgba(13,71,161,0.5)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          View Receipt
        </Button>
      </Box>
    </Box>
  );
};

// Main Professional Pharmacy Ecommerce Component
const ProfessionalPharmacyEcommerce = () => {
  const [currentView, setCurrentView] = useState('home'); // home, cart, checkout, admin, product, delivery, delivery-management
  const [products] = useState(professionalProducts);
  const [filteredProducts, setFilteredProducts] = useState(professionalProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // en, si, ta
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [showDeliveryTracker, setShowDeliveryTracker] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  
  // Order completion state at main component level
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

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

  // Delivery tracking and receipt functions
  useEffect(() => {
    // Set up global functions for delivery tracking
    window.closeDeliveryTracking = () => {
      setShowDeliveryTracker(false);
    };
    
    window.showOrderReceipt = () => {
      setOrderComplete(true);
      setCurrentView('home');
    };
    
    return () => {
      delete window.closeDeliveryTracking;
      delete window.showOrderReceipt;
    };
  }, []);

  // Dark Mode Toggle Component
  const DarkModeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    
    return (
      <IconButton
        color="inherit"
        onClick={toggleTheme}
        sx={{
          mr: 2,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.2)',
          }
        }}
      >
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    );
  };

  // Professional Header Component
  const ProfessionalHeader = () => {
    const { cart, wishlist } = useEcommerce();
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const { isDarkMode } = useTheme();
    
    return (
      <AppBar position="sticky" sx={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        boxShadow: isDarkMode 
          ? '0 4px 20px rgba(15, 23, 42, 0.5)'
          : '0 4px 20px rgba(59, 130, 246, 0.3)',
        transition: 'all 0.3s ease'
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

          {/* Search Bar - Made Longer */}
          <TextField
            placeholder="Search medicines, health products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              flexGrow: 1,
              maxWidth: 650, // Increased from 500
              mr: 2, // Reduced margin
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                borderRadius: '25px',
                height: '42px', // Made slightly taller
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

          {/* Category Filter - Made Longer */}
          <FormControl size="small" sx={{ minWidth: 180, mr: 4 }}> {/* Increased from 120, added more margin */}
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              displayEmpty
              sx={{
                color: 'white',
                height: '42px', // Made same height as search bar
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderRadius: '25px' // Rounded corners to match search
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

          {/* Language Dropdown */}
          <FormControl size="small" sx={{ minWidth: 160, mr: 3 }}>
            <Select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              displayEmpty
              sx={{
                color: 'white',
                height: '42px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderRadius: '25px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)'
                },
                '& .MuiSvgIcon-root': {
                  color: 'white'
                }
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="si">සිංහල</MenuItem>
              <MenuItem value="ta">தமிழ்</MenuItem>
            </Select>
          </FormControl>

          {/* Dark/Light Mode Toggle */}
          <DarkModeToggle />

          {/* Spacer to push cart to the right */}
          <Box sx={{ flexGrow: 0.3 }} />

          {/* Cart and Wishlist - Aligned More to Right */}
          <Box display="flex" alignItems="center" gap={1.5} sx={{ ml: 'auto' }}>
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
            image={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400x400/e5e7eb/6b7280?text=No+Image'}
            alt={product.name}
            sx={{ 
              borderRadius: '12px 12px 0 0',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400/e5e7eb/6b7280?text=No+Image';
            }}
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
            <Grid size={{ xs: 12, md: 6 }}>
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
            <Grid size={{ xs: 12, md: 6 }}>
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
          
          {/* Sort Dropdown */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ backgroundColor: 'white' }}
            >
              <MenuItem value="name">Sort by Name</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="rating">Sort by Rating</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Products Grid */}
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
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
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '0771234567',
      address: '123 Main Street',
      city: 'Colombo',
      postalCode: '10100',
      nic: '123456789V'
    });
    
    const [paymentInfo, setPaymentInfo] = useState({
      paymentMethod: 'cash',
      cardNumber: '1234567890123456',
      expiryDate: '12/25',
      cvv: '123',
      cardName: 'John Doe'
    });
    
    // Order state moved to main component level

    const validateCurrentStep = () => {
      switch (activeStep) {
        case 0: // Customer Info
          return customerInfo.firstName.trim() && customerInfo.lastName.trim() && customerInfo.email.trim() && 
                 customerInfo.phone.trim() && customerInfo.address.trim() && customerInfo.city.trim() && 
                 customerInfo.postalCode.trim() && customerInfo.nic.trim();
        case 1: // Shipping - no additional validation needed
          return true;
        case 2: // Payment
          if (paymentInfo.paymentMethod === 'card') {
            return paymentInfo.cardName.trim() && paymentInfo.cardNumber.trim() && 
                   paymentInfo.expiryDate.trim() && paymentInfo.cvv.trim();
          }
          return true;
        case 3: // Review
          return true;
        default:
          return true;
      }
    };

    const handleNext = () => {
      // Only validate on the final step (Place Order)
      if (activeStep === steps.length - 1) {
        // Basic validation - just check if required fields exist
        if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
          alert('Please fill in your name and email before placing your order.');
          return;
        }
        
        const newOrderNumber = `NPK-2025-${String(Date.now()).slice(-6)}`;
        
        // Store cart items before placeOrder clears them
        const currentOrderItems = [...cart];
        
        // Create complete order object
        const orderData = {
          orderNumber: newOrderNumber,
          customerInfo,
          paymentInfo,
          items: currentOrderItems,
          total: finalTotal,
          subtotal: cartTotal,
          shipping: shippingCost,
          tax: tax,
          date: new Date().toISOString()
        };
        
        placeOrder(orderData);
        
        // Set completed order in main state
        setCompletedOrder(orderData);
        setOrderComplete(true);
        
        // Set up delivery tracking
        setTrackingOrderId(newOrderNumber);
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
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
                <Grid size={{ xs: 12 }}>
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
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                      placeholder="MM/YY"
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
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

    // Order completion is now handled at main component level

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
  const OrderReceipt = ({ orderNumber, customerInfo, cart, total, subtotal, shipping, tax, onContinueShopping }) => {
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
                123 Main Street, Kalutara, Sri Lanka
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                +94 34 223 4567 | info@npkpharmacy.lk
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

            {/* Delivery Status Alert */}
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                border: '1px solid #22c55e'
              }}
            >
              <Typography fontWeight="bold">
                Your order is being processed for delivery!
              </Typography>
              <Typography variant="body2">
                Estimated delivery time: 2-3 hours | You will receive SMS updates
              </Typography>
            </Alert>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<LocalShippingIcon />}
                onClick={() => setShowDeliveryTracker(true)}
                sx={{ 
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  minWidth: '150px'
                }}
              >
                Track Your Order
              </Button>
              <Button
                variant="contained"
                onClick={() => window.print()}
                sx={{ 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  minWidth: '120px'
                }}
              >
                Print Receipt
              </Button>
              <Button
                variant="outlined"
                onClick={onContinueShopping}
                sx={{ 
                  borderColor: '#1e3a8a', 
                  color: '#1e3a8a',
                  minWidth: '140px'
                }}
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
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {products.length}
                </Typography>
                <Typography variant="body1">Total Products</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  156
                </Typography>
                <Typography variant="body1">Orders Today</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  LKR 12,450
                </Typography>
                <Typography variant="body1">Revenue Today</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
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
            <Button 
              variant="contained"
              startIcon={<DeliveryIcon />}
              onClick={() => setCurrentView('delivery-management')}
              sx={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                mr: 2
              }}
            >
              Delivery Management
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
              <Grid size={{ xs: 12, md: 6 }}>
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
              <Grid size={{ xs: 12, md: 6 }}>
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
    // Check for completed order first
    if (orderComplete && completedOrder) {
      return (
        <OrderReceipt 
          orderNumber={completedOrder.orderNumber}
          customerInfo={completedOrder.customerInfo}
          cart={completedOrder.items}
          total={completedOrder.total}
          subtotal={completedOrder.subtotal}
          shipping={completedOrder.shipping}
          tax={completedOrder.tax}
          onContinueShopping={() => {
            setOrderComplete(false);
            setCompletedOrder(null);
            setCurrentView('home');
          }}
        />
      );
    }

    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'checkout':
        return <CheckoutView />;
      case 'admin':
        return <AdminView />;
      case 'product':
        return <ProductDetailView />;
      case 'delivery-management':
        return <DeliveryManagement />;
      default:
        return <HomeView />;
    }
  };

  return (
    <ThemeContextProvider>
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
          <MenuItem onClick={() => window.location.href = '/?screen=dashboard'}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Delivery Tracker Dialog */}
        {/* Professional Delivery Tracking Dialog */}
        <Dialog 
          open={showDeliveryTracker} 
          onClose={() => setShowDeliveryTracker(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            p: 3,
            position: 'relative'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <LocalShippingIcon sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Track Your Delivery
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Order #{trackingOrderId}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={() => setShowDeliveryTracker(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            <ProfessionalDeliveryContent orderId={trackingOrderId} />
          </DialogContent>
        </Dialog>

        </Box>
      </EcommerceProvider>
    </ThemeContextProvider>
  );
};

export default ProfessionalPharmacyEcommerce;
