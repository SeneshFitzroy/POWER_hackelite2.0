import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Container, Paper, 
  Divider, IconButton, InputAdornment, Link, Tabs, Tab
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Google, Facebook, 
  LocalPharmacy, Person, Email, Phone, Lock
} from '@mui/icons-material';

const EcommerceLoginScreen = ({ onLoginSuccess }) => {
  const [loginTab, setLoginTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleLogin = () => {
    // Simple validation - in real app, you'd validate against backend
    if (loginTab === 0) {
      // Login
      if (formData.email && formData.password) {
        onLoginSuccess();
      }
    } else {
      // Signup
      if (formData.name && formData.email && formData.password && formData.confirmPassword) {
        if (formData.password === formData.confirmPassword) {
          onLoginSuccess();
        }
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LocalPharmacy 
                sx={{ 
                  fontSize: 60, 
                  color: '#667eea',
                  mb: 2
                }} 
              />
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                MediShop
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your health, our priority
              </Typography>
            </Box>

            {/* Login/Signup Tabs */}
            <Tabs 
              value={loginTab} 
              onChange={(e, newValue) => setLoginTab(newValue)}
              centered
              sx={{ mb: 3 }}
            >
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>

            {/* Login Form */}
            {loginTab === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email or Phone"
                  variant="outlined"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={formData.password}
                  onChange={handleInputChange('password')}
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
                    ),
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLogin}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    py: 1.5,
                    mt: 1
                  }}
                >
                  Login
                </Button>
              </Box>
            ) : (
              // Signup Form
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={formData.password}
                  onChange={handleInputChange('password')}
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
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLogin}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    py: 1.5,
                    mt: 1
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}

            {/* Social Login */}
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }}>Or continue with</Divider>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  sx={{ borderRadius: '12px' }}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Facebook />}
                  sx={{ borderRadius: '12px' }}
                >
                  Facebook
                </Button>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EcommerceLoginScreen;
