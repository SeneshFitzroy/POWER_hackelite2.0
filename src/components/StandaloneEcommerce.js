import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import SimpleEcommerceApp from './SimpleEcommerceApp';
import useEcommerceRouteGuard from '../hooks/useEcommerceRouteGuard';

// Completely isolated e-commerce component that bypasses all ERP routing
const StandaloneEcommerce = () => {
  // Use the route guard to ensure we stay in e-commerce
  useEcommerceRouteGuard();
  
  // Additional protection
  useEffect(() => {
    document.body.setAttribute('data-ecommerce', 'true');
    document.title = 'Kaluthara Pharmacy - E-commerce';
    
    return () => {
      document.body.removeAttribute('data-ecommerce');
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8fafc',
        zIndex: 99999,
        overflow: 'auto',
        display: 'block'
      }}
    >
      <SimpleEcommerceApp />
    </Box>
  );
};

export default StandaloneEcommerce;
