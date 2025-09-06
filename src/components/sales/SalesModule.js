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
      {/* Main Black Navigation Bar */}
      <Box
        sx={{
          backgroundColor: '#000000',
          color: '#ffffff',
          py: 3,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #333333'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          CoreERP - Sales Management
        </Typography>

        {/* Date Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarToday sx={{ color: '#cccccc' }} />
          <Typography variant="body2" sx={{ color: '#cccccc', mr: 1 }}>
            Time Period
          </Typography>
          <FormControl size="small">
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              sx={{
                backgroundColor: '#333333',
                color: '#ffffff',
                border: 'none',
                minWidth: 120,
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
                  border: '1px solid #555555'
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#000000',
                    border: '1px solid #333333',
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#333333'
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#555555'
                      }
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
          <Typography
            variant="caption"
            sx={{
              color: '#888888',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              ml: 2
            }}
          >
            Current: {dateFilter.toUpperCase()}
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
