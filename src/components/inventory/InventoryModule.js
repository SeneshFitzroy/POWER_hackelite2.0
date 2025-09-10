import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Container,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Drawer,
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
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

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

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
    
    // Always default to inventory dashboard (index 0)
    const tabIndex = 0;
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
          overflow: 'auto',
          ml: 0
        }}
      >
        {/* Content Container */}
        <Container maxWidth="xl" sx={{ py: 3, height: '100%', overflow: 'auto' }}>
          <TabPanel value={activeTab} index={0}>
            {activeTab === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: '#1e40af', fontWeight: 'bold' }}>
                  Inventory Dashboard
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white' }}>
                      <CardContent>
                        <Typography variant="h4">150</Typography>
                        <Typography variant="body2">Total Medicines</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
                      <CardContent>
                        <Typography variant="h4">145</Typography>
                        <Typography variant="body2">Active Stock</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', color: 'white' }}>
                      <CardContent>
                        <Typography variant="h4">12</Typography>
                        <Typography variant="body2">Low Stock</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', color: 'white' }}>
                      <CardContent>
                        <Typography variant="h4">3</Typography>
                        <Typography variant="body2">Expiring Soon</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : null}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {activeTab === 1 ? (
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: '#1e40af', fontWeight: 'bold' }}>
                  Stock Tracking
                </Typography>
                <Card>
                  <CardContent>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Medicine Name</TableCell>
                          <TableCell>Stock Quantity</TableCell>
                          <TableCell>Expiry Date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Paracetamol 500mg</TableCell>
                          <TableCell>250</TableCell>
                          <TableCell>Dec 2025</TableCell>
                          <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Amoxicillin 250mg</TableCell>
                          <TableCell>180</TableCell>
                          <TableCell>Nov 2025</TableCell>
                          <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Box>
            ) : null}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <ReorderManagement />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <PurchaseOrderManagement />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <SupplierManagement />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <PurchaseHistory />
          </TabPanel>
          <TabPanel value={activeTab} index={6}>
            <RegulatoryCompliance />
          </TabPanel>
          <TabPanel value={activeTab} index={7}>
            <QuarantinedStock />
          </TabPanel>
          <TabPanel value={activeTab} index={8}>
            <ExpiryMonitoring />
          </TabPanel>
          <TabPanel value={activeTab} index={9}>
            <LowStockAlerts />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <ReorderManagement />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <PurchaseOrderManagement />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <SupplierManagement />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <PurchaseHistory />
          </TabPanel>
          <TabPanel value={activeTab} index={6}>
            <RegulatoryCompliance />
          </TabPanel>
          <TabPanel value={activeTab} index={7}>
            <QuarantinedStock />
          </TabPanel>
          <TabPanel value={activeTab} index={8}>
            <ExpiryMonitoring />
          </TabPanel>
          <TabPanel value={activeTab} index={9}>
            <LowStockAlerts />
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
}

