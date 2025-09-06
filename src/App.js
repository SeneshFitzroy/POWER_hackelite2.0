import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Login from './components/Login';
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    }}>
      <Routes>
        <Route path="/" element={<Navigate to="/sales" replace />} />
        <Route path="/sales" element={<SalesModule />} />
        <Route path="*" element={<Navigate to="/sales" replace />} />
      </Routes>
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
