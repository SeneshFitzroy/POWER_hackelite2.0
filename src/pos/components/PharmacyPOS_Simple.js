import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

const PharmacyPOS = () => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      <Paper sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 0,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', letterSpacing: '1px' }}>
            MEDICARE PHARMACY SYSTEM
          </Typography>
          <Button
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                window.location.href = '/';
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>
      
      <Box sx={{ flex: 1, p: 2, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mt: 4 }}>
          Pharmacy POS System Loading...
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Professional pharmacy management system with blue header and logout functionality.
        </Typography>
      </Box>
    </Box>
  );
};

export default PharmacyPOS;
