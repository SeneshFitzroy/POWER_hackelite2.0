import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import PharmacyPOS from './pos/components/PharmacyPOS';
import SetupComponent from './components/SetupComponent';
import './App.css';

// Simple Navigation Component
function SimpleNavigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CoreERP - Pharmacy POS
        </Typography>
        <Button color="inherit" href="/">Home</Button>
        <Button color="inherit" href="/setup">Setup</Button>
        <Button color="inherit" href="/pos">POS System</Button>
      </Toolbar>
    </AppBar>
  );
}

// Simple Dashboard Component
function SimpleDashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to CoreERP Pharmacy System
      </Typography>
      <Typography variant="body1" paragraph>
        Your comprehensive pharmacy management solution is ready!
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="contained" href="/setup" size="large">
          Initialize Sample Data
        </Button>
        <Button variant="outlined" href="/pos" size="large">
          Access POS System
        </Button>
      </Box>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Quick Start Guide:
        </Typography>
        <Typography variant="body2" component="ul">
          <li>First, visit the Setup page to initialize sample data</li>
          <li>Then access the POS System to start processing sales</li>
          <li>Use Employee IDs: EMP001 or EMP002 for verification</li>
          <li>Use Registration: PH-2024-001 for prescriptions</li>
        </Typography>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SimpleNavigation />
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        <Routes>
          <Route path="/" element={<SimpleDashboard />} />
          <Route path="/setup" element={<SetupComponent />} />
          <Route path="/pos" element={<PharmacyPOS />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
