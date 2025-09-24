import React, { useState } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, 
  CardActions, Button, AppBar, Toolbar, IconButton, Badge, TextField,
  InputAdornment, Chip, Rating, Fab, Paper, Divider
} from '@mui/material';
import {
  ShoppingCart, Favorite, Search, LocalPharmacy, Star, Add, Remove
} from '@mui/icons-material';

const SimpleEcommerceApp = () => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const products = [
    {
      id: 1,
      name: 'Panadol Extra 24 Tablets',
      category: 'Pain Relief',
      price: 285.00,
      originalPrice: 320.00,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
      rating: 4.7,
      reviews: 1543,
      description: 'Fast and effective relief from headaches, body aches, and fever.',
      inStock: true,
      brand: 'Panadol'
    },
    {
      id: 2,
      name: 'Piriton 30 Tablets',
      category: 'Allergy Relief',
      price: 195.00,
      originalPrice: 225.00,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
      rating: 4.5,
      reviews: 892,
      description: 'Effective antihistamine for allergies, hay fever, and skin conditions.',
      inStock: true,
      brand: 'Piriton'
    },
    {
      id: 3,
      name: 'Centrum Multivitamin 60s',
      category: 'Vitamins & Supplements',
      price: 1250.00,
      originalPrice: 1400.00,
      image: 'https://images.unsplash.com/photo-1550572017-1d98be3c5c85?w=300&h=300&fit=crop',
      rating: 4.8,
      reviews: 2156,
      description: 'Complete multivitamin with essential nutrients for daily health.',
      inStock: true,
      brand: 'Centrum'
    },
    {
      id: 4,
      name: 'Dettol Antiseptic 250ml',
      category: 'Personal Care',
      price: 390.00,
      originalPrice: 450.00,
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop',
      rating: 4.9,
      reviews: 3267,
      description: 'Trusted antiseptic liquid for cuts, wounds, and infections.',
      inStock: true,
      brand: 'Dettol'
    },
    {
      id: 5,
      name: 'Savlon Antiseptic Cream 30g',
      category: 'First Aid',
      price: 165.00,
      originalPrice: 180.00,
      image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=300&h=300&fit=crop',
      rating: 4.6,
      reviews: 789,
      description: 'Antiseptic cream for cuts, wounds and minor skin infections.',
      inStock: true,
      brand: 'Savlon'
    },
    {
      id: 6,
      name: 'Disprin 24 Tablets',
      category: 'Pain Relief',
      price: 145.00,
      originalPrice: 160.00,
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop',
      rating: 4.4,
      reviews: 654,
      description: 'Fast dissolving aspirin tablets for quick pain relief.',
      inStock: true,
      brand: 'Disprin'
    },
    {
      id: 7,
      name: 'Glucose-D Orange 200g',
      category: 'Health Drinks',
      price: 245.00,
      originalPrice: 280.00,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      rating: 4.3,
      reviews: 445,
      description: 'Instant energy drink with glucose and essential vitamins.',
      inStock: true,
      brand: 'Glucose-D'
    },
    {
      id: 8,
      name: 'Berocca Energy 15 Tablets',
      category: 'Vitamins & Supplements',
      price: 875.00,
      originalPrice: 950.00,
      image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&h=300&fit=crop',
      rating: 4.7,
      reviews: 1234,
      description: 'Effervescent vitamin B complex and C for energy and immunity.',
      inStock: true,
      brand: 'Berocca'
    }
  ];

  const categories = [
    { name: 'All Products', icon: '🏥', color: '#e3f2fd' },
    { name: 'Pain Relief', icon: '💊', color: '#fce4ec' },
    { name: 'Vitamins & Supplements', icon: '🌟', color: '#f3e5f5' },
    { name: 'Personal Care', icon: '🧴', color: '#e8f5e8' },
    { name: 'First Aid', icon: '🩹', color: '#fff3e0' },
    { name: 'Allergy Relief', icon: '🤧', color: '#e1f5fe' }
  ];

  const addToCart = (product) => {
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
  };

  const addToWishlist = (product) => {
    setWishlistItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCartValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box sx={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 10,
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          boxShadow: '0 4px 20px rgba(30, 58, 138, 0.15)',
          zIndex: 11
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              border: '2px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url(/images/npk-logo.png) center/contain no-repeat',
                borderRadius: '50%'
              }
            }}
          >
            <LocalPharmacy sx={{ fontSize: 20, color: 'rgba(255,255,255,0.3)' }} />
          </Box>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Kaluthara Pharmacy
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

          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={wishlistItems.length} color="error">
              <Favorite />
            </Badge>
          </IconButton>
          
          <IconButton color="inherit">
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Categories */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Shop by Category
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {categories.map((category) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={category.name}>
              <Paper
                elevation={2}
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

        <Divider sx={{ my: 4 }} />

        {/* Products */}
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Featured Medicines
        </Typography>
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: '16px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                  }
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
                  <Chip 
                    label={product.category} 
                    size="small" 
                    sx={{ mb: 1, backgroundColor: '#e3f2fd' }}
                  />
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
                      sx={{ 
                        flex: 1, 
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                      }}
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
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Floating Cart Summary */}
      {totalItems > 0 && (
        <Fab
          variant="extended"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            minWidth: 200,
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
            }
          }}
        >
          <ShoppingCart sx={{ mr: 1 }} />
          {totalItems} items - Rs. {totalCartValue.toFixed(2)}
        </Fab>
      )}

      {/* Cart Items Display */}
      {cartItems.length > 0 && (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Shopping Cart ({totalItems} items)
          </Typography>
          <Grid container spacing={2}>
            {cartItems.map((item) => (
              <Grid size={{ xs: 12 }} key={item.id}>
                <Card sx={{ p: 2, borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 80, height: 80, borderRadius: '8px' }}
                      image={item.image}
                      alt={item.name}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rs. {item.price.toFixed(2)} each
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Remove />
                      </IconButton>
                      <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Total: Rs. {totalCartValue.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default SimpleEcommerceApp;
