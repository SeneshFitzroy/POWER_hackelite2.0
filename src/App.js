import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Paper, createTheme, ThemeProvider } from '@mui/material';
import SalesModule from './components/sales/SalesModule';
import './App.css';

// Professional White-Blue-Black Theme (Matching POS System)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e40af', // Deep blue matching POS
      dark: '#1e3a8a',
      light: '#3b82f6',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#ff9800', // Orange accent matching POS cart
      dark: '#f57c00',
      light: '#ffb74d',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc', // Light blue-gray background
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b', // Dark gray-blue
      secondary: '#64748b'
    },
    divider: '#e2e8f0'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { color: '#1e293b', fontWeight: 700, letterSpacing: '0.5px' },
    h2: { color: '#1e293b', fontWeight: 700, letterSpacing: '0.5px' },
    h3: { color: '#1e293b', fontWeight: 700, letterSpacing: '0.5px' },
    h4: { color: '#1e293b', fontWeight: 700, letterSpacing: '0.5px' },
    h5: { color: '#1e293b', fontWeight: 700, letterSpacing: '0.5px' },
    h6: { color: '#1e293b', fontWeight: 700, letterSpacing: '0.5px' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: '8px',
          letterSpacing: '0.5px'
        },
        contained: {
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            boxShadow: '0 6px 20px rgba(30, 64, 175, 0.4)',
            transform: 'translateY(-1px)'
          }
        },
        outlined: {
          borderColor: '#1e40af',
          color: '#1e40af',
          borderWidth: '2px',
          '&:hover': {
            backgroundColor: '#1e40af',
            color: '#ffffff',
            borderWidth: '2px'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }
});

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
            backgroundColor: '#f8fafc',
            p: 3
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              padding: 4, 
              textAlign: 'center',
              maxWidth: 500,
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: '#ffffff',
              border: '1px solid #1e40af'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              CoreERP - System Error
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
              Something went wrong. Please refresh the page.
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(255,255,255,0.1)',
                p: 2,
                borderRadius: 2,
                mt: 2,
                border: '1px solid rgba(255,255,255,0.2)'
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: '#f8fafc'
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/sales" replace />} />
            <Route path="/sales" element={<SalesModule />} />
            <Route path="*" element={<Navigate to="/sales" replace />} />
          </Routes>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
