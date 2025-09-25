import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Card, CardContent, Fade, LinearProgress } from '@mui/material';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import LocalPharmacy from '@mui/icons-material/LocalPharmacy';
import Security from '@mui/icons-material/Security';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Payment from '@mui/icons-material/Payment';

const EcommerceSplashScreen = ({ onGetStarted }) => {
  const [loading, setLoading] = useState(true);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: LocalPharmacy, title: "OTC Medicines", desc: "Quality over-the-counter medicines" },
    { icon: Security, title: "Secure Shopping", desc: "Safe and secure transactions" },
    { icon: LocalShipping, title: "Fast Delivery", desc: "Quick delivery to your doorstep" },
    { icon: Payment, title: "Easy Payment", desc: "Multiple payment options" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    const featureTimer = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(featureTimer);
    };
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Animation */}
      <Box sx={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite'
      }} />

      <Container maxWidth="md">
        <Fade in timeout={1000}>
          <Card sx={{
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            p: 4
          }}>
            <CardContent>
              {/* Logo */}
              <Box sx={{ mb: 3 }}>
                <LocalPharmacy sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
                <Typography variant="h3" fontWeight="bold" sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  MediMart Online
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Your Trusted Online Pharmacy
                </Typography>
              </Box>

              {/* Loading or Features */}
              {loading ? (
                <Box sx={{ my: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Loading your pharmacy experience...
                  </Typography>
                  <LinearProgress sx={{ 
                    borderRadius: 10, 
                    height: 8,
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }
                  }} />
                </Box>
              ) : (
                <Box sx={{ my: 4 }}>
                  <Fade in key={currentFeature} timeout={800}>
                    <Box>
                      {React.createElement(features[currentFeature].icon, {
                        sx: { fontSize: 48, color: '#667eea', mb: 2 }
                      })}
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {features[currentFeature].title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {features[currentFeature].desc}
                      </Typography>
                    </Box>
                  </Fade>
                </Box>
              )}

              {/* Get Started Button */}
              {!loading && (
                <Fade in timeout={1500}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={onGetStarted}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Start Shopping
                  </Button>
                </Fade>
              )}

              {/* Features Grid */}
              {!loading && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                  {features.map((feature, index) => (
                    <Box key={index} sx={{ textAlign: 'center', opacity: 0.7 }}>
                      {React.createElement(feature.icon, {
                        sx: { fontSize: 24, color: '#667eea', mb: 0.5 }
                      })}
                      <Typography variant="caption" display="block">
                        {feature.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          50% { transform: translate(-50%, -50%) rotate(180deg); }
        }
      `}</style>
    </Box>
  );
};

export default EcommerceSplashScreen;
