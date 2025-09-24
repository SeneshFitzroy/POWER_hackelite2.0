import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  Rating
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Security as SecurityIcon,
  LocalShipping as LocalShippingIcon,
  Support as SupportIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';

const EcommerceHomePage = () => {
  const featuredProducts = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      brand: 'Panadol',
      image: '/images/medicines/paracetamol-500mg.jpg',
      price: 450.00,
      originalPrice: 500.00,
      rating: 4.8,
      reviews: 1247
    },
    {
      id: 2,
      name: 'Vitamin D3 1000 IU',
      brand: 'Ostelin',
      image: '/images/medicines/vitamin-d3-1000iu.jpg',
      price: 780.00,
      originalPrice: 860.00,
      rating: 4.8,
      reviews: 634
    },
    {
      id: 3,
      name: 'Digene Antacid Gel',
      brand: 'Digene',
      image: '/images/medicines/digene-gel.jpg',
      price: 280.00,
      originalPrice: 320.00,
      rating: 4.6,
      reviews: 923
    },
    {
      id: 4,
      name: 'Complete Multivitamin',
      brand: 'Centrum',
      image: '/images/medicines/centrum-multivitamin.jpg',
      price: 1250.00,
      originalPrice: 1400.00,
      rating: 4.7,
      reviews: 1156
    }
  ];

  const categories = [
    { name: 'Pain Relief', icon: '💊', count: '50+ products' },
    { name: 'Vitamins', icon: '🌟', count: '80+ products' },
    { name: 'Cold & Flu', icon: '🤧', count: '30+ products' },
    { name: 'Digestive Health', icon: '🍃', count: '25+ products' },
    { name: 'Skin Care', icon: '✨', count: '60+ products' },
    { name: 'Baby Care', icon: '👶', count: '40+ products' }
  ];

  const features = [
    {
      icon: <LocalPharmacyIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
      title: 'Licensed Pharmacy',
      description: 'All medicines sourced from licensed pharmaceutical companies'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
      title: 'Secure Shopping',
      description: 'Your personal and payment information is always protected'
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
      title: 'Fast Delivery',
      description: 'Same-day delivery available in Colombo area'
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
      title: '24/7 Support',
      description: 'Professional pharmacist support available anytime'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Priya Perera',
      location: 'Colombo',
      rating: 5,
      comment: 'Amazing service! Got my medicines delivered within 2 hours. Highly recommend!',
      avatar: '/images/avatars/priya.jpg'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      location: 'Kandy',
      rating: 5,
      comment: 'Best online pharmacy in Sri Lanka. Genuine products and excellent customer service.',
      avatar: '/images/avatars/rajesh.jpg'
    },
    {
      id: 3,
      name: 'Anita Silva',
      location: 'Galle',
      rating: 5,
      comment: 'Convenient and reliable. Love the detailed product information and reviews.',
      avatar: '/images/avatars/anita.jpg'
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                Your Trusted Online Pharmacy
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Get genuine medicines delivered to your doorstep across Sri Lanka
              </Typography>
              <List sx={{ mb: 4 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText primary="100% Genuine Medicines" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText primary="Licensed Pharmacists Available" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText primary="Island-wide Delivery" />
                </ListItem>
              </List>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#10b981',
                  '&:hover': { backgroundColor: '#059669' },
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Shop Now
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/pharmacy-hero.jpg"
                alt="Online Pharmacy"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" fontWeight="bold" gutterBottom>
          Shop by Category
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Find exactly what you need from our wide range of medicine categories
        </Typography>
        
        <Grid container spacing={3}>
          {categories.map((category, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: 3,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Typography variant="h2" sx={{ mb: 2 }}>
                  {category.icon}
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.count}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Box sx={{ backgroundColor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" fontWeight="bold" gutterBottom>
            Featured Products
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Top-rated medicines trusted by thousands of customers
          </Typography>
          
          <Grid container spacing={3}>
            {featuredProducts.map(product => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
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
                    />
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
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {product.brand}
                    </Typography>
                    <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={product.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({product.reviews})
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          LKR {product.price.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1, textDecoration: 'line-through' }}
                        >
                          LKR {product.originalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                      <Button variant="contained" fullWidth>
                        Add to Cart
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" fontWeight="bold" gutterBottom>
            Why Choose MediStore?
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            We're committed to providing you with the best healthcare experience
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper sx={{ p: 4, height: '100%', textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ backgroundColor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" fontWeight="bold" gutterBottom>
            What Our Customers Say
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Join thousands of satisfied customers across Sri Lanka
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map(testimonial => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={testimonial.avatar} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    "{testimonial.comment}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <VerifiedIcon sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="#10b981">
                      Verified Purchase
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <LocalPharmacyIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Ready to Start Shopping?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Browse our extensive collection of medicines and healthcare products
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' },
              px: 6,
              py: 2,
              fontSize: '1.2rem'
            }}
          >
            Browse Products
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default EcommerceHomePage;
