import React from 'react';
import { Box } from '@mui/material';
import SimpleEcommerceApp from './SimpleEcommerceApp';

const EcommerceWrapper = () => {
  // Force redirect if somehow we're not on ecommerce route
  React.useEffect(() => {
    if (!window.location.pathname.startsWith('/ecommerce')) {
      window.location.href = '/ecommerce';
      return;
    }

    // Hide any ERP elements that might appear
    const style = document.createElement('style');
    style.id = 'ecommerce-isolation';
    style.textContent = `
      .login-screen,
      .login-card,
      .login-form,
      .splash-screen,
      .erp-dashboard,
      div[class*="login"],
      div[class*="splash"],
      div[class*="erp"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        z-index: -1 !important;
      }
      
      /* Ensure ecommerce wrapper takes full control */
      #ecommerce-wrapper {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background-color: #f8fafc !important;
        z-index: 999999 !important;
        overflow: auto !important;
      }
    `;
    document.head.appendChild(style);

    // Set body data attribute for targeting
    document.body.setAttribute('data-route', '/ecommerce');

    return () => {
      const existingStyle = document.getElementById('ecommerce-isolation');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
      document.body.removeAttribute('data-route');
    };
  }, []);

  return (
    <Box
      id="ecommerce-wrapper"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8fafc',
        zIndex: 999999,
        overflow: 'auto'
      }}
    >
      <SimpleEcommerceApp />
    </Box>
  );
};

export default EcommerceWrapper;
