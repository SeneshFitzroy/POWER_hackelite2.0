import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material';
import ProfessionalPharmacyEcommerce from './components/ecommerce/ProfessionalPharmacyEcommerce';

// Professional Blue Theme for Ecommerce
const ecommerceTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e3a8a',
      dark: '#1d4ed8',
      light: '#3b82f6',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#1e40af',
      dark: '#1e3a8a',
      light: '#3b82f6',
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
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280'
    },
    divider: '#e5e7eb'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem'
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.875rem'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem'
    },
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px'
          }
        }
      }
    }
  }
});

// Error Boundary Component
class EcommerceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Ecommerce Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          padding: '20px'
        }}>
          <div style={{
            padding: '40px',
            textAlign: 'center',
            maxWidth: '500px',
            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
            color: '#ffffff',
            borderRadius: '12px'
          }}>
            <h2>Pharmacy Ecommerce - Error</h2>
            <p>Something went wrong. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function EcommerceApp() {
  return (
    <ThemeProvider theme={ecommerceTheme}>
      <EcommerceErrorBoundary>
        <BrowserRouter>
          <ProfessionalPharmacyEcommerce />
        </BrowserRouter>
      </EcommerceErrorBoundary>
    </ThemeProvider>
  );
}

export default EcommerceApp;
