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
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Skeleton
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
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  History as HistoryIcon,
  Support as SupportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { medicineCategories, medicineProducts } from '../data/medicineDatabase';

const EcommerceMainScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState(medicineProducts);
  const [filteredProducts, setFilteredProducts] = useState(medicineProducts);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
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

  // Cart functions
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
    setSnackbar({
      open: true,
      message: `${product.name} added to cart!`,
      severity: 'success'
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

  // Wishlist functions
  const toggleWishlist = (product) => {
    setWishlist(prevWishlist => {
      const isInWishlist = prevWishlist.some(item => item.id === product.id);
      if (isInWishlist) {
        setSnackbar({
          open: true,
          message: `${product.name} removed from wishlist!`,
          severity: 'info'
        });
        return prevWishlist.filter(item => item.id !== product.id);
      }
      setSnackbar({
        open: true,
        message: `${product.name} added to wishlist!`,
        severity: 'success'
      });
      return [...prevWishlist, product];
    });
  };

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Product card component
  const ProductCard = ({ product }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
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
          image={product.image}
          alt={product.name}
          sx={{ 
            objectFit: 'cover',
            cursor: 'pointer'
          }}
          onClick={() => {
            setSelectedProduct(product);
            setProductDialogOpen(true);
          }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.9)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
          }}
          onClick={() => toggleWishlist(product)}
        >
          {wishlist.some(item => item.id === product.id) ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
        {product.originalPrice > product.price && (
          <Chip
            label={`${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`}
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
        <Typography variant="subtitle2" color="primary" gutterBottom>
          {product.brand}
        </Typography>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.2,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={product.rating} precision={0.1} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({product.reviewCount})
          </Typography>
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

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              LKR {product.price.toFixed(2)}
            </Typography>
            {product.originalPrice > product.price && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 1, textDecoration: 'line-through' }}
              >
                LKR {product.originalPrice.toFixed(2)}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCartIcon />}
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            sx={{
              backgroundColor: '#1e3a8a',
              '&:hover': { backgroundColor: '#1e40af' }
            }}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Category filter component
  const CategoryFilter = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Categories
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="All Products"
          onClick={() => setSelectedCategory('all')}
          color={selectedCategory === 'all' ? 'primary' : 'default'}
          variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
        />
        {medicineCategories.map(category => (
          <Chip
            key={category.id}
            label={`${category.icon} ${category.name}`}
            onClick={() => setSelectedCategory(category.id)}
            color={selectedCategory === category.id ? 'primary' : 'default'}
            variant={selectedCategory === category.id ? 'filled' : 'outlined'}
          />
        ))}
      </Box>
    </Paper>
  );

  // Product detail dialog
  const ProductDetailDialog = () => (
    <Dialog
      open={productDialogOpen}
      onClose={() => setProductDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      {selectedProduct && (
        <>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="div">
              {selectedProduct.name}
            </Typography>
            <IconButton onClick={() => setProductDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {selectedProduct.brand}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={selectedProduct.rating} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({selectedProduct.reviewCount} reviews)
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {selectedProduct.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    LKR {selectedProduct.price.toFixed(2)}
                  </Typography>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      LKR {selectedProduct.originalPrice.toFixed(2)}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Active Ingredient:</strong> {selectedProduct.activeIngredient}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Dosage:</strong> {selectedProduct.dosage}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Pack Size:</strong> {selectedProduct.packSize}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {selectedProduct.features.map((feature, index) => (
                    <Chip key={index} label={feature} size="small" />
                  ))}
                </Box>
                <Typography variant="body2" color={selectedProduct.inStock ? 'success.main' : 'error.main'}>
                  {selectedProduct.inStock ? `In Stock (${selectedProduct.stockCount} available)` : 'Out of Stock'}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => toggleWishlist(selectedProduct)}
              startIcon={
                wishlist.some(item => item.id === selectedProduct.id) ? (
                  <FavoriteIcon />
                ) : (
                  <FavoriteBorderIcon />
                )
              }
            >
              {wishlist.some(item => item.id === selectedProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={() => {
                addToCart(selectedProduct);
                setProductDialogOpen(false);
              }}
              disabled={!selectedProduct.inStock}
              sx={{
                backgroundColor: '#1e3a8a',
                '&:hover': { backgroundColor: '#1e40af' }
              }}
            >
              Add to Cart
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  // Shopping cart drawer
  const CartDrawer = () => (
    <Drawer
      anchor="right"
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      sx={{ '& .MuiDrawer-paper': { width: 400 } }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Shopping Cart ({cartItemCount})</Typography>
          <IconButton onClick={() => setCartOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        
        {cart.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Your cart is empty
            </Typography>
          </Box>
        ) : (
          <>
            <List>
              {cart.map(item => (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                    <Avatar
                      src={item.image}
                      sx={{ width: 60, height: 60, mr: 2 }}
                      variant="rounded"
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        LKR {item.price.toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <IconButton onClick={() => removeFromCart(item.id)}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Total: LKR {cartTotal.toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  backgroundColor: '#1e3a8a',
                  '&:hover': { backgroundColor: '#1e40af' }
                }}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );

  // Navigation drawer
  const NavigationDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{ '& .MuiDrawer-paper': { width: 280 } }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocalPharmacyIcon sx={{ fontSize: 32, color: '#1e3a8a', mr: 1 }} />
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
            MediStore
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem button>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button>
            <ListItemIcon><CategoryIcon /></ListItemIcon>
            <ListItemText primary="Categories" />
          </ListItem>
          <ListItem button>
            <ListItemIcon><FavoriteIcon /></ListItemIcon>
            <ListItemText primary={`Wishlist (${wishlist.length})`} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><HistoryIcon /></ListItemIcon>
            <ListItemText primary="Order History" />
          </ListItem>
          <ListItem button>
            <ListItemIcon><SupportIcon /></ListItemIcon>
            <ListItemText primary="Customer Support" />
          </ListItem>
          <ListItem button>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <Divider sx={{ my: 1 }} />
          <ListItem button>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="sticky" sx={{ backgroundColor: '#1e3a8a' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <LocalPharmacyIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" fontWeight="bold">
              MediStore
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => setCartOpen(true)}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="inherit"
              onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
            >
              <PersonIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search medicines, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredProducts.length} of {products.length} products
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Category Filter */}
        <CategoryFilter />

        {/* Products Grid */}
        <Grid container spacing={3}>
          {loading ? (
            Array.from(new Array(12)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : filteredProducts.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No products found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filter criteria
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredProducts.map(product => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* Drawers and Dialogs */}
      <NavigationDrawer />
      <CartDrawer />
      <ProductDetailDialog />

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={() => setProfileMenuAnchor(null)}
      >
        <MenuItem onClick={() => setProfileMenuAnchor(null)}>
          <PersonIcon sx={{ mr: 1 }} /> My Profile
        </MenuItem>
        <MenuItem onClick={() => setProfileMenuAnchor(null)}>
          <HistoryIcon sx={{ mr: 1 }} /> Order History
        </MenuItem>
        <MenuItem onClick={() => setProfileMenuAnchor(null)}>
          <SettingsIcon sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setProfileMenuAnchor(null)}>
          <LogoutIcon sx={{ mr: 1 }} /> Sign Out
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button for Quick Cart Access */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#1e3a8a',
          '&:hover': { backgroundColor: '#1e40af' }
        }}
        onClick={() => setCartOpen(true)}
      >
        <Badge badgeContent={cartItemCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      </Fab>
    </Box>
  );
};

export default EcommerceMainScreen;
