import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Paper, createTheme, ThemeProvider } from '@mui/material';
import SalesModule from './components/sales/SalesModule';
import './App.css';

// Custom Black/White Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#ffffff',
      contrastText: '#000000'
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: '#000000',
      secondary: '#666666'
    },
    divider: '#e5e7eb'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { color: '#000000', fontWeight: 700 },
    h2: { color: '#000000', fontWeight: 700 },
    h3: { color: '#000000', fontWeight: 700 },
    h4: { color: '#000000', fontWeight: 700 },
    h5: { color: '#000000', fontWeight: 700 },
    h6: { color: '#000000', fontWeight: 700 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        },
        outlined: {
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#000000',
            color: '#ffffff'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb'
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
              color: '#ffffff',
              border: '2px solid #000000'
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
