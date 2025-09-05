import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Navigation from './components/Navigation';
import PharmacyPOS from './components/pos/PharmacyPOS';
import SetupComponent from './components/SetupComponent';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { user } = useAuth();

  // POS is accessible without login for open access
  if (window.location.pathname === '/pos') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          <Route path="/pos" element={<PharmacyPOS />} />
        </Routes>
      </Box>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<PharmacyPOS />} />
          <Route path="/setup" element={<SetupComponent />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
