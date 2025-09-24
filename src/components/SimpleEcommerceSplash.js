import React from 'react';
import { 
  Box, Typography, Button, Container, Paper, Fade
} from '@mui/material';
import { 
  ShoppingCart, Verified, LocalShipping, Security
} from '@mui/icons-material';

const SimpleEcommerceSplash = ({ onStartShopping }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        zIndex: 1001,
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                width: 140,
                height: 140,
                mx: 'auto',
                mb: 3,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <img 
                src="/images/npk-logo.png" 
                alt="NPK Logo"
                style={{
                  width: '80%',
                  height: '80%',
                  objectFit: 'contain',
                  borderRadius: '50%'
                }}
              />
            </Box>

            {/* Brand Name */}
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              mb: 2, 
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Kaluthara Pharmacy
            </Typography>

            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Your Trusted Online Healthcare Store
            </Typography>

            {/* Simple Trust Indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Verified sx={{ fontSize: 32, color: '#10b981', mb: 1 }} />
                <Typography variant="caption">Licensed</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <LocalShipping sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
                <Typography variant="caption">Fast Delivery</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Security sx={{ fontSize: 32, color: '#8b5cf6', mb: 1 }} />
                <Typography variant="caption">Secure</Typography>
              </Box>
            </Box>

            {/* CTA Button */}
            <Button
              variant="contained"
              size="large"
              onClick={onStartShopping}
              startIcon={<ShoppingCart />}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                boxShadow: '0 8px 25px rgba(30, 58, 138, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(30, 58, 138, 0.4)'
                }
              }}
            >
              Start Shopping
            </Button>

            {/* Simple Footer */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
              Trusted healthcare online since 2023
            </Typography>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default SimpleEcommerceSplash;
