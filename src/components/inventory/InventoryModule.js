import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Drawer,
  Divider,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  ShoppingCart as ShoppingCartIcon,
  Assignment as AssignmentIcon,
  Block as BlockIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  Gavel as GavelIcon,
  Logout
} from '@mui/icons-material';
import StockTracking from './StockTracking';
import ExpiryMonitoring from './ExpiryMonitoring';
import LowStockAlerts from './LowStockAlerts';
import ReorderManagement from './ReorderManagement';
import PurchaseOrderManagement from './PurchaseOrderManagement';
import QuarantinedStock from './QuarantinedStock';
import SupplierManagement from './SupplierManagement';
import PurchaseHistory from './PurchaseHistory';
import RegulatoryCompliance from './RegulatoryCompliance';
import InventoryDashboard from './InventoryDashboard';

export default function InventoryModule({ 
  activeModule = 'inventory', 
  onModuleChange,
  onNotification 
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const sidebarWidth = 280;

  const navigationItems = [
    { label: 'Inventory Dashboard', icon: <DashboardIcon />, index: 0 },
    { label: 'Stock Tracking', icon: <InventoryIcon />, index: 1 },
    { label: 'Reorder Management', icon: <ShoppingCartIcon />, index: 2 },
    { label: 'Purchase Orders', icon: <AssignmentIcon />, index: 3 },
    { label: 'Supplier Management', icon: <BusinessIcon />, index: 4 },
    { label: 'Purchase History', icon: <HistoryIcon />, index: 5 },
    { label: 'Regulatory Compliance', icon: <GavelIcon />, index: 6 },
    { label: 'Quarantined Stock', icon: <BlockIcon />, index: 7 },
    { label: 'Expiry Monitoring', icon: <ScheduleIcon />, index: 8 },
    { label: 'Low Stock Alerts', icon: <WarningIcon />, index: 9 }
  ];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Map activeModule to tab index
  useEffect(() => {
    const moduleToTabMap = {
      'inventory': 0,
      'stock-tracking': 1,
      'reorder-management': 2,
      'purchase-orders': 3,
      'supplier-management': 4,
      'purchase-history': 5,
      'regulatory-compliance': 6,
      'quarantined-stock': 7,
      'expiry-monitoring': 8,
      'low-stock-alerts': 9
    };
    
    // Get the correct tab index based on activeModule, default to 0 if not found
    const tabIndex = moduleToTabMap[activeModule] || 0;
    setActiveTab(tabIndex);
  }, [activeModule]);

  const handleNavClick = (index) => {
    setActiveTab(index);
    // Map tab index back to module name for parent navigation
    const tabToModuleMap = {
      0: 'inventory',
      1: 'stock-tracking',
      2: 'reorder-management',
      3: 'purchase-orders',
      4: 'supplier-management',
      5: 'purchase-history',
      6: 'quarantine-management',
      7: 'expiry-monitoring',
      8: 'low-stock-alerts'
    };
    
    const moduleName = tabToModuleMap[index];
    if (moduleName && onModuleChange) {
      onModuleChange(moduleName);
    }
  };

  const handleLogout = () => {
    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate back to login screen
    window.location.href = '/?screen=login';
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      {/* Left Sidebar Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
            color: '#ffffff',
            borderRight: 'none',
            boxShadow: '4px 0 12px rgba(0,0,0,0.15)'
          },
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              color: '#ffffff',
              mb: 1
            }}
          >
            COREERP
          </Typography>
          <Chip 
            label="INVENTORY MODULE" 
            variant="outlined" 
            size="small"
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.5)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              fontWeight: 'bold',
              fontSize: '10px'
            }} 
          />
        </Box>

        {/* Navigation Menu */}
        <List sx={{ px: 2, py: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.index} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.index)}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  px: 2,
                  backgroundColor: activeTab === item.index ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: activeTab === item.index ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: '#ffffff',
                    minWidth: 40,
                    '& .MuiSvgIcon-root': {
                      fontSize: '22px'
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '14px',
                      fontWeight: activeTab === item.index ? 'bold' : 'medium',
                      color: '#ffffff'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.15)', mx: 2 }} />

        {/* Time and Date Display */}
        <Box sx={{ p: 3, mt: 'auto' }}>
          <Box 
            sx={{ 
              textAlign: 'center', 
              mb: 3,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              py: 2,
              px: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '11px',
                fontWeight: 'medium',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 0.5
              }}
            >
              Current Date & Time
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '15px',
                mb: 0.3
              }}
            >
              {currentTime.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '14px',
                fontWeight: 'medium'
              }}
            >
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: true,
                hour: 'numeric',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
          
          {/* Logout Button */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderRadius: '10px',
              py: 1.5,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              border: '1px solid rgba(220, 38, 38, 0.8)',
              '&:hover': {
                backgroundColor: '#b91c1c',
                boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0px)',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Content Container */}
        <Box sx={{ 
          py: 3, 
          px: 3,
          height: '100%', 
          overflow: 'auto' 
        }}>
          {activeTab === 0 && <InventoryDashboard />}
          {activeTab === 1 && <StockTracking />}
          {activeTab === 2 && <ReorderManagement />}
          {activeTab === 3 && <PurchaseOrderManagement />}
          {activeTab === 4 && <SupplierManagement />}
          {activeTab === 5 && <PurchaseHistory />}
          {activeTab === 6 && <RegulatoryCompliance />}
          {activeTab === 7 && <QuarantinedStock />}
          {activeTab === 8 && <ExpiryMonitoring />}
          {activeTab === 9 && <LowStockAlerts />}
        </Box>
      </Box>
    </Box>
  );
}

