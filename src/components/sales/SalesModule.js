import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Container,
  Chip
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

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Professional Header - Matching POS Design */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: '#ffffff'
            }}
          >
            COREERP SALES SYSTEM
          </Typography>
          <Chip 
            label="SALES MODULE" 
            variant="outlined" 
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              backgroundColor: 'rgba(255,255,255,0.15)',
              fontWeight: 'bold'
            }} 
          />
        </Box>

        {/* Time & Date + Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {currentTime.toLocaleDateString('en-US', { 
                  month: 'numeric', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {currentTime.toLocaleTimeString('en-US', { 
                  hour12: true,
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
          </Box>
          
          <FormControl size="small">
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: 'none',
                minWidth: 120,
                borderRadius: '6px',
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
      </Box>

      {/* Clean Professional Tab Navigation */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <Container maxWidth="xl">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#1e3a8a',
                height: 3
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6b7280',
                minHeight: 56,
                px: 3,
                '&.Mui-selected': {
                  color: '#1e3a8a'
                },
                '&:hover': {
                  color: '#1e3a8a'
                }
              }
            }}
          >
            <Tab
              icon={<Assessment />}
              label="Sales Dashboard"
              iconPosition="start"
            />
            <Tab
              icon={<People />}
              label="Customer Management"
              iconPosition="start"
            />
            <Tab
              icon={<ShoppingCart />}
              label="Sales Orders"
              iconPosition="start"
            />
            <Tab
              icon={<Receipt />}
              label="Invoicing"
              iconPosition="start"
            />
          </Tabs>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ py: 1.5, minHeight: 'calc(100vh - 160px)' }}>
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
  );
}
