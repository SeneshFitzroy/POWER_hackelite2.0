import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  Phone,
  LocalPharmacy,
  Google,
  Facebook,
  Apple
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const EcommerceLoginScreen = ({ onLoginSuccess }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      confirmPassword: '',
      agreeTerms: false
    });
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Validation
    if (tabValue === 1) { // Signup
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }
      if (!formData.agreeTerms) {
        toast.error('Please accept the terms and conditions');
        setLoading(false);
        return;
      }
    }

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (tabValue === 0) {
        toast.success('Login successful!');
      } else {
        toast.success('Account created successfully!');
      }
      onLoginSuccess({
        id: Date.now(),
        name: tabValue === 0 ? 'Customer' : `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        type: 'customer'
      });
    }, 1500);
  };

  const handleSocialLogin = (provider) => {
    toast.success(`${provider} login integration would be implemented here`);
    // Simulate successful social login
    setTimeout(() => {
      onLoginSuccess({
        id: Date.now(),
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
        type: 'customer'
      });
    }, 1000);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="sm">
        <Paper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3
          }}>
            <LocalPharmacy sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              MediMart Online
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Your Trusted Online Pharmacy
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>
          </Box>

          {/* Form */}
          <Box sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              {tabValue === 0 ? (
                // Login Form
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Remember me"
                      />
                      <Link href="#" variant="body2">
                        Forgot password?
                      </Link>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                // Signup Form
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.agreeTerms}
                          onChange={handleInputChange('agreeTerms')}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the{' '}
                          <Link href="#" color="primary">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="#" color="primary">
                            Privacy Policy
                          </Link>
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Processing...' : (tabValue === 0 ? 'Sign In' : 'Create Account')}
              </Button>

              {/* Social Login */}
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Or continue with
                  </Typography>
                </Divider>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Google />}
                      onClick={() => handleSocialLogin('Google')}
                      sx={{ borderRadius: '12px' }}
                    >
                      Google
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Facebook />}
                      onClick={() => handleSocialLogin('Facebook')}
                      sx={{ borderRadius: '12px' }}
                    >
                      Facebook
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Apple />}
                      onClick={() => handleSocialLogin('Apple')}
                      sx={{ borderRadius: '12px' }}
                    >
                      Apple
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EcommerceLoginScreen;
