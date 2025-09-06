import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box, Typography, Paper, Grid } from '@mui/material';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Navigation from './components/Navigation';
import SalesModule from './components/sales/SalesModule';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            textAlign: 'center',
            maxWidth: 400 
          }}
        >
          <Typography variant="h6" gutterBottom>
            Loading CoreERP...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Initializing application...
          </Typography>
        </Paper>
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
          <Route path="/sales" element={<SalesModule />} />
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
