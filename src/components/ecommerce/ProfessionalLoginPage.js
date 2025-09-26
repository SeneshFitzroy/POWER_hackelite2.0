import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  
  Divider,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';`nimport Grid from '@mui/material/Grid2';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  LocalShipping as ShippingIcon,
  Support as SupportIcon,
  Verified as VerifiedIcon,
  Star as StarIcon
} from '@mui/icons-material';

const ProfessionalLoginPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setAlert({ show: false, message: '', severity: 'success' });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login logic
    if (loginData.email && loginData.password) {
      setAlert({ show: true, message: 'Login successful! Welcome back!', severity: 'success' });
      // Here you would typically authenticate with your backend
    } else {
      setAlert({ show: true, message: 'Please fill in all fields', severity: 'error' });
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Mock signup logic
    if (signupData.password !== signupData.confirmPassword) {
      setAlert({ show: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }
    if (!signupData.acceptTerms) {
      setAlert({ show: true, message: 'Please accept terms and conditions', severity: 'error' });
      return;
    }
    if (signupData.firstName && signupData.lastName && signupData.email && signupData.password) {
      setAlert({ show: true, message: 'Account created successfully! Welcome to MediCare Lanka!', severity: 'success' });
      // Here you would typically create account with your backend
    } else {
      setAlert({ show: true, message: 'Please fill in all required fields', severity: 'error' });
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  const features = [
    {
      icon: <SpeedIcon color="primary" />,
      title: 'Fast Delivery',
      description: 'Same day delivery within Colombo area'
    },
    {
      icon: <VerifiedIcon color="primary" />,
      title: 'Authentic Products',
      description: 'All products are sourced from authorized distributors'
    },
    {
      icon: <SupportIcon color="primary" />,
      title: '24/7 Support',
      description: 'Round the clock customer support'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Secure Payments',
      description: 'Your payment information is always protected'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Perera',
      rating: 5,
      comment: 'Excellent service! Got my medicines delivered within 2 hours.',
      location: 'Colombo 3'
    },
    {
      name: 'Ravi Silva',
      rating: 5,
      comment: 'Very reliable pharmacy with genuine products. Highly recommended!',
      location: 'Nugegoda'
    },
    {
      name: 'Kamala Fernando',
      rating: 5,
      comment: 'Great prices and friendly customer service. Will order again!',
      location: 'Kandy'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 6
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
            Join MediCare Lanka Family
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Get access to exclusive deals, faster checkout, order tracking, and personalized medicine recommendations
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Login/Signup Form */}
          <Grid xs={12} md={6}>
            <Paper 
              elevation={8} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                  <Tab label="Sign In" />
                  <Tab label="Create Account" />
                </Tabs>
              </Box>

              {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 3 }}>
                  {alert.message}
                </Alert>
              )}

              {/* Sign In Tab */}
              <TabPanel value={activeTab} index={0}>
                <form onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    margin="normal"
                    required
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
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={loginData.rememberMe}
                          onChange={(e) => setLoginData({...loginData, rememberMe: e.target.checked})}
                          color="primary"
                        />
                      }
                      label="Remember me"
                    />
                    <Link href="#" color="primary" variant="body2">
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ 
                      mt: 2, 
                      mb: 3,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      fontWeight: 'bold'
                    }}
                  >
                    Sign In
                  </Button>

                  <Divider sx={{ my: 3 }}>or continue with</Divider>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GoogleIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Google
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FacebookIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Facebook
                    </Button>
                  </Box>
                </form>
              </TabPanel>

              {/* Sign Up Tab */}
              <TabPanel value={activeTab} index={1}>
                <form onSubmit={handleSignup}>
                  <Grid container spacing={2}>
                    <Grid xs={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                        required
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                    margin="normal"
                    placeholder="+94 77 123 4567"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    margin="normal"
                    required
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
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    margin="normal"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={signupData.acceptTerms}
                        onChange={(e) => setSignupData({...signupData, acceptTerms: e.target.checked})}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <Link href="#" color="primary">
                          Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="#" color="primary">
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                    sx={{ mt: 2 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ 
                      mt: 3, 
                      mb: 3,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      fontWeight: 'bold'
                    }}
                  >
                    Create Account
                  </Button>

                  <Divider sx={{ my: 3 }}>or sign up with</Divider>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GoogleIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Google
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FacebookIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Facebook
                    </Button>
                  </Box>
                </form>
              </TabPanel>
            </Paper>
          </Grid>

          {/* Benefits and Features */}
          <Grid xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                Why Choose MediCare Lanka?
              </Typography>
              
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid xs={12} sm={6} key={index}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        height: '100%',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Customer Testimonials */}
            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                What Our Customers Say
              </Typography>
              
              <List>
                {testimonials.map((testimonial, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                        {testimonial.name[0]}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {testimonial.name}
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <StarIcon key={i} sx={{ fontSize: 16, color: '#ffd700' }} />
                            ))}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                            "{testimonial.comment}"
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            - {testimonial.location}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom CTA */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" gutterBottom>
            Already have thousands of satisfied customers across Sri Lanka
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join them today and experience the convenience of online pharmacy shopping
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfessionalLoginPage;


