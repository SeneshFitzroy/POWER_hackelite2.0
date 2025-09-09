import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Typography, Paper, createTheme, ThemeProvider } from '@mui/material'
import SplashScreen from './components/SplashScreen'
import LoginScreen from './components/LoginScreen'
import ERPDashboard from './components/ERPDashboard'
import PharmacyPOS from './pos/components/PharmacyPOSFirebaseIntegrated'
import SalesModule from './components/sales/SalesModule'
import HRModule from './components/hr/HRModule'
import FirebaseDataCleaner from './components/FirebaseDataCleaner'
import './App.css'

// Professional Blue Theme (Matching POS System)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e3a8a', // Bright blue from POS
      dark: '#1d4ed8',
      light: '#1e3a8a',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#1e40af', // Deep blue from POS
      dark: '#1e3a8a',
      light: '#1e3a8a',
      contrastText: '#ffffff'
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669'
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706'
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper: '#ffffff'
    },
    text: {
      primary: '#1f2937', // Dark gray
      secondary: '#6b7280'
    },
    divider: '#e5e7eb'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { color: '#1f2937', fontWeight: 700 },
    h2: { color: '#1f2937', fontWeight: 700 },
    h3: { color: '#1f2937', fontWeight: 700 },
    h4: { color: '#1f2937', fontWeight: 700 },
    h5: { color: '#1f2937', fontWeight: 700 },
    h6: { color: '#1f2937', fontWeight: 700 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '6px'
        },
        contained: {
          backgroundColor: '#1e3a8a',
          color: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: '#1d4ed8',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }
        },
        outlined: {
          borderColor: '#1e3a8a',
          color: '#1e3a8a',
          '&:hover': {
            backgroundColor: '#eff6ff',
            borderColor: '#1d4ed8'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
              background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
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
  const [currentScreen, setCurrentScreen] = useState('splash')

  // Check URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const screenParam = urlParams.get('screen');
    if (screenParam === 'login') {
      setCurrentScreen('login');
    }
  }, []);

  const handleSplashComplete = () => {
    setCurrentScreen('login')
  }

  const handleLoginSuccess = () => {
    setCurrentScreen('dashboard')
  }

  const handlePOSAccess = () => {
    window.location.href = '/pos'
  }

  const handleSalesAccess = () => {
    window.location.href = '/sales'
  }

  const handleHRAccess = () => {
    window.location.href = '/hr'
  }

  const handleLegalAccess = () => {
    window.location.href = '/legal'
  }

  const handleLogout = () => {
    setCurrentScreen('login')
  }

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Routes>
          <Route path="/pos" element={
            <Box sx={{ height: '100vh', overflow: 'hidden' }}>
              <PharmacyPOS />
            </Box>
          } />
          <Route path="/sales" element={
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh',
              backgroundColor: '#f8fafc'
            }}>
              <SalesModule />
            </Box>
          } />
          <Route path="/hr" element={
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh',
              backgroundColor: '#f8fafc'
            }}>
              <HRModule />
            </Box>
          } />
          <Route path="/legal" element={
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh',
              backgroundColor: '#f8fafc'
            }}>
              <iframe 
                src="/legal/index.html" 
                title="Legal Module"
                style={{ 
                  flex: 1, 
                  border: 'none',
                  width: '100%'
                }}
              />
            </Box>
          } />
          <Route path="/clear-data" element={
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh',
              backgroundColor: '#f8fafc'
            }}>
              <FirebaseDataCleaner />
            </Box>
          } />
          <Route path="/" element={
            <div className="App">
              {currentScreen === 'splash' && <SplashScreen onGetStarted={handleSplashComplete} />}
              {currentScreen === 'login' && <LoginScreen onLoginSuccess={handleLoginSuccess} />}
              {currentScreen === 'dashboard' && <ERPDashboard onPOSAccess={handlePOSAccess} onSalesAccess={handleSalesAccess} onHRAccess={handleHRAccess} onLegalAccess={handleLegalAccess} onLogout={handleLogout} />}
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
