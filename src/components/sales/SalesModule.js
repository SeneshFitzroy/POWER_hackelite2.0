import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Container
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Main Professional Blue Navigation Bar */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          color: '#ffffff',
          py: 3,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
          borderRadius: '0 0 16px 16px'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: '#ffffff'
          }}
        >
          🏢 CoreERP - Sales Management System
        </Typography>

        {/* Date Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarToday sx={{ color: 'rgba(255,255,255,0.9)' }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mr: 1, fontWeight: 'bold' }}>
            TIME PERIOD
          </Typography>
          <FormControl size="small">
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: 'none',
                minWidth: 140,
                borderRadius: '8px',
                fontWeight: 'bold',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '& .MuiSvgIcon-root': {
                  color: '#ffffff'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid rgba(255,255,255,0.5)'
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#1e40af',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }
                    }
                  }
                }
              }}
            >
              <MenuItem value="daily">📅 Daily</MenuItem>
              <MenuItem value="weekly">📊 Weekly</MenuItem>
              <MenuItem value="monthly">📈 Monthly</MenuItem>
            </Select>
          </FormControl>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              ml: 2,
              fontWeight: 'bold',
              backgroundColor: 'rgba(255,255,255,0.1)',
              px: 2,
              py: 0.5,
              borderRadius: '12px'
            }}
          >
            CURRENT: {dateFilter.toUpperCase()}
          </Typography>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box
        sx={{
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Container maxWidth="xl">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#000000',
                height: 3
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: '#666666',
                minHeight: 60,
                '&.Mui-selected': {
                  color: '#000000'
                },
                '&:hover': {
                  color: '#333333'
                }
              }
            }}
          >
            <Tab
              icon={<Assessment />}
              label="Sales Dashboard"
              iconPosition="start"
              sx={{ px: 3 }}
            />
            <Tab
              icon={<People />}
              label="Customer Management"
              iconPosition="start"
              sx={{ px: 3 }}
            />
            <Tab
              icon={<ShoppingCart />}
              label="Sales Orders"
              iconPosition="start"
              sx={{ px: 3 }}
            />
            <Tab
              icon={<Receipt />}
              label="Invoicing"
              iconPosition="start"
              sx={{ px: 3 }}
            />
          </Tabs>
        </Container>
      </Box>

      {/* Tab Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
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
