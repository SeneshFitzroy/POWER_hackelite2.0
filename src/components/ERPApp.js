import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
  Backdrop,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

// Context Providers
import { RoleProvider } from '../contexts/RoleContext';

// Navigation
import ERPNavigation from './ERPNavigation';

// Modules
import ERPDashboard from './ERPDashboard';
import InventoryModule from './inventory/InventoryModule';
import RegulatoryCompliance from './inventory/RegulatoryCompliance';

// Shared Components
import { Notification } from './shared/SharedComponents';

const ERPApp = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info'
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Handle module change
  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle logout
  const handleLogout = () => {
    // In a real app, this would clear authentication tokens
    window.location.reload();
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handle navigation for different modules
  const handleInventoryAccess = () => {
    console.log('ERPApp: Inventory access requested')
    handleModuleChange('inventory')
  }

  const handleModuleNavigation = (module) => {
    console.log(`ERPApp: Navigation to ${module}`)
    switch (module) {
      case 'inventory':
        handleModuleChange('inventory')
        break
      case 'dashboard':
        handleModuleChange('dashboard')
        break
      default:
        console.log(`Module ${module} not handled in ERPApp`)
    }
  }

  // Render current module
  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <ERPDashboard 
            onModuleChange={handleModuleChange}
            onInventoryAccess={handleInventoryAccess}
            onPOSAccess={() => console.log('POS not available in ERPApp')}
            onSalesAccess={() => console.log('Sales not available in ERPApp')}
            onHRAccess={() => console.log('HR not available in ERPApp')}
            onLegalAccess={() => console.log('Legal not available in ERPApp')}
            onColdChainAccess={() => console.log('Cold Chain not available in ERPApp')}
            onLogout={() => console.log('Logout not available in ERPApp')}
          />
        );
      
      case 'inventory':
      case 'stock-tracking':
      case 'reorder-management':
      case 'supplier-management':
        return (
          <InventoryModule 
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            onNotification={showNotification}
          />
        );
      
      case 'compliance':
        return <RegulatoryCompliance />;
      
      default:
        return <ERPDashboard onModuleChange={handleModuleChange} />;
    }
  };

  return (
    <RoleProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Navigation */}
        <ERPNavigation
          activeModule={activeModule}
          onModuleChange={handleModuleChange}
          onLogout={handleLogout}
          open={mobileOpen}
          onToggle={handleDrawerToggle}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            ml: { md: '280px' }
          }}
        >
          {/* Top App Bar */}
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              backgroundColor: 'white',
              borderBottom: '1px solid #e5e7eb',
              color: '#1f2937'
            }}
          >
            <Toolbar>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                  {activeModule === 'dashboard' ? 'Dashboard' :
                   activeModule === 'inventory' ? 'Inventory Management' :
                   activeModule === 'stock-tracking' ? 'Stock Management' :
                   activeModule === 'reorder-management' ? 'Reorder Management' :
                   activeModule === 'supplier-management' ? 'Supplier & Orders Management' :
                   activeModule === 'compliance' ? 'Regulatory Compliance' :
                   'Pharma ERP'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
                <IconButton color="inherit">
                  <AccountCircleIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Module Content */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {renderModule()}
          </Box>
        </Box>

        {/* Notification */}
        <Notification
          open={notification.open}
          onClose={handleCloseNotification}
          message={notification.message}
          type={notification.type}
        />
      </Box>
    </RoleProvider>
  );
};

export default ERPApp;
