import React from 'react';
import { Box, Typography, Button, Container, Paper, Fade } from '@mui/material';
import { ShoppingCart, LocalPharmacy, Verified, LocalShipping } from '@mui/icons-material';

const EcommerceSplashScreen = ({ onGetStarted }) => {
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
      <Container maxWidth="md">
        <Fade in timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <Box sx={{ p: 6, textAlign: 'center' }}>
              {/* Logo/Icon */}
              <Box sx={{ mb: 4 }}>
                <LocalPharmacy 
                  sx={{ 
                    fontSize: 80, 
                    color: '#667eea',
                    mb: 2
                  }} 
                />
                <Typography 
                  variant="h3" 
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
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Your Trusted Online Pharmacy
                </Typography>
              </Box>

              {/* Features */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center', maxWidth: 120 }}>
                  <Verified sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Verified Products
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', maxWidth: 120 }}>
                  <LocalShipping sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Fast Delivery
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', maxWidth: 120 }}>
                  <ShoppingCart sx={{ fontSize: 40, color: '#8b5cf6', mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Easy Shopping
                  </Typography>
                </Box>
              </Box>

              {/* Description */}
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ mb: 4, lineHeight: 1.6, maxWidth: 500, mx: 'auto' }}
              >
                Shop for over-the-counter medicines, health supplements, and personal care products 
                from the comfort of your home. Licensed pharmacy with genuine products.
              </Typography>

              {/* CTA Button */}
              <Button
                variant="contained"
                size="large"
                onClick={onGetStarted}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50px',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)'
                  }
                }}
              >
                Start Shopping
              </Button>

              {/* Footer note */}
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ mt: 3, display: 'block' }}
              >
                🇱🇰 Serving customers across Sri Lanka with quality healthcare products
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default EcommerceSplashScreen;
