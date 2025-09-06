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
  Divider
} from '@mui/material';
import {
  Assessment,
  People,
  ShoppingCart,
  Receipt,
  CalendarToday
} from '@mui/icons-material';
import SalesDashboard from './SalesDashboard';
import CustomerManagement from './CustomerManagement';
import SalesOrders from './SalesOrders';
import Invoicing from './Invoicing';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
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

export default function SalesModule() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateFilter, setDateFilter] = useState('daily');
  const [currentTime, setCurrentTime] = useState(new Date());

  const sidebarWidth = 280;

  const navigationItems = [
    { label: 'Sales Dashboard', icon: <Assessment />, index: 0 },
    { label: 'Customer Management', icon: <People />, index: 1 },
    { label: 'Sales Orders', icon: <ShoppingCart />, index: 2 },
    { label: 'Invoicing', icon: <Receipt />, index: 3 }
  ];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNavClick = (index) => {
    setActiveTab(index);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
            label="SALES MODULE" 
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
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
              {currentTime.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: true,
                hour: 'numeric',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
          
          <FormControl fullWidth size="small">
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSvgIcon-root': { color: '#ffffff' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(255,255,255,0.5)' }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#1e3a8a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      fontWeight: 'bold',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                      '&.Mui-selected': { backgroundColor: 'rgba(255,255,255,0.2)' }
                    }
                  }
                }
              }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          ml: 0
        }}
      >
        {/* Content Container */}
        <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
          <TabPanel value={activeTab} index={0}>
            <SalesDashboard dateFilter={dateFilter} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <CustomerManagement dateFilter={dateFilter} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <SalesOrders dateFilter={dateFilter} />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <Invoicing dateFilter={dateFilter} />
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
}
