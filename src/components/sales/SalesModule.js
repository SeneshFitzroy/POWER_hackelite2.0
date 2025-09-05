import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { CalendarToday, TrendingUp, People, ShoppingCart, Receipt } from '@mui/icons-material';
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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SalesModule() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateFilter, setDateFilter] = useState('daily');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  return (
    <Box sx={{ width: '100%', bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 2, 
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        color: 'white',
        borderRadius: 0
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: '1px' }}>
            COREERP - SALES MANAGEMENT
          </Typography>
          
          {/* Common Date Filter */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarToday sx={{ color: 'white' }} />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: 'white' }}>Time Period</InputLabel>
              <Select
                value={dateFilter}
                onChange={handleDateFilterChange}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <Chip 
              label={`Current: ${dateFilter.toUpperCase()}`}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          </Box>
        </Box>
      </Paper>

      {/* Navigation Tabs */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
              fontSize: '1rem',
              minHeight: 70,
              '&.Mui-selected': {
                backgroundColor: '#000000',
                color: 'white'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#000000',
              height: 4
            }
          }}
        >
          <Tab 
            icon={<TrendingUp />} 
            label="SALES DASHBOARD" 
            iconPosition="start"
            sx={{ flex: 1 }}
          />
          <Tab 
            icon={<People />} 
            label="CUSTOMER MANAGEMENT" 
            iconPosition="start"
            sx={{ flex: 1 }}
          />
          <Tab 
            icon={<ShoppingCart />} 
            label="SALES ORDERS" 
            iconPosition="start"
            sx={{ flex: 1 }}
          />
          <Tab 
            icon={<Receipt />} 
            label="INVOICING" 
            iconPosition="start"
            sx={{ flex: 1 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
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
    </Box>
  );
}
