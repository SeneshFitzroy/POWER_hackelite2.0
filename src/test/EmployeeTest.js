import React from 'react';
import { Box, Button, Typography } from '@mui/material';

// Simple test component to check button functionality
export default function EmployeeTest() {
  const handleTest = () => {
    alert('Button clicked successfully!');
    console.log('Button test clicked');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Employee Button Test
      </Typography>
      
      <Button
        variant="contained"
        onClick={handleTest}
        sx={{
          backgroundColor: '#2563eb',
          color: 'white',
          px: 3,
          py: 1.5,
          mr: 2
        }}
      >
        Test Button 1
      </Button>
      
      <Button
        variant="outlined"
        onClick={() => alert('Button 2 works!')}
        sx={{
          borderColor: '#2563eb',
          color: '#2563eb',
          px: 3,
          py: 1.5
        }}
      >
        Test Button 2
      </Button>
    </Box>
  );
}
