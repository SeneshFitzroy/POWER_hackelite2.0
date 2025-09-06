import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import Login from './components/Login';
import SalesModule from './components/sales/SalesModule';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            backgroundColor: '#ffffff',
            p: 3
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              padding: 4, 
              textAlign: 'center',
              maxWidth: 500,
              backgroundColor: '#000000',
              color: '#ffffff'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ color: '#ffffff' }}>
              CoreERP - System Error
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: '#cccccc' }}>
              Something went wrong. Please refresh the page.
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#888888',
                fontFamily: 'monospace',
                backgroundColor: '#333333',
                p: 2,
                borderRadius: 1,
                mt: 2
              }}
            >
              {this.state.error?.message || 'Unknown error'}
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { user, loading, error, demoMode } = useAuth();

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#ffffff'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            textAlign: 'center',
            maxWidth: 400,
            backgroundColor: '#000000',
            color: '#ffffff'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
            Loading CoreERP...
          </Typography>
          <Typography variant="body2" sx={{ color: '#cccccc' }}>
            Initializing Sales Management System...
          </Typography>
          {demoMode && (
            <Typography variant="caption" sx={{ color: '#888888', mt: 2, display: 'block' }}>
              Demo Mode: Firebase not configured
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#ffffff'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            textAlign: 'center',
            maxWidth: 500,
            backgroundColor: '#000000',
            color: '#ffffff'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
            CoreERP - Configuration Error
          </Typography>
          <Typography variant="body2" sx={{ color: '#cccccc', mb: 2 }}>
            Please check your Firebase configuration in the .env file.
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#888888',
              fontFamily: 'monospace',
              backgroundColor: '#333333',
              p: 2,
              borderRadius: 1,
              display: 'block'
            }}
          >
            {error.message}
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
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
