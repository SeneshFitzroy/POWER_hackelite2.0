import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Inventory,
  Assessment,
  AccountBalance,
  ShoppingCart,
  TrendingUp,
  Notifications
} from '@mui/icons-material';

const DashboardCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ 
    height: '100%',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: '2px solid #333333',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
      borderColor: '#555555'
    }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '50%',
            backgroundColor: '#333333',
            color: '#ffffff',
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography color="#cccccc" gutterBottom variant="body2" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold" color="#ffffff">
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const QuickActions = () => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>
      Quick Actions
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Button variant="outlined" fullWidth startIcon={<People />}>
          Add Customer
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button variant="outlined" fullWidth startIcon={<ShoppingCart />}>
          New Order
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button variant="outlined" fullWidth startIcon={<Inventory />}>
          Add Product
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button variant="outlined" fullWidth startIcon={<Assessment />}>
          View Reports
        </Button>
      </Grid>
    </Grid>
  </Paper>
);

const RecentActivity = () => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>
      Recent Activity
    </Typography>
    <List>
      <ListItem>
        <ListItemIcon>
          <ShoppingCart />
        </ListItemIcon>
        <ListItemText
          primary="New order #1234"
          secondary="2 minutes ago"
        />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText
          primary="Customer John Doe registered"
          secondary="15 minutes ago"
        />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemIcon>
          <Inventory />
        </ListItemIcon>
        <ListItemText
          primary="Low stock alert: Product ABC"
          secondary="1 hour ago"
        />
      </ListItem>
    </List>
  </Paper>
);

export default function Dashboard() {
  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#000000', fontWeight: 'bold', mb: 4 }}>
        Dashboard
      </Typography>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Sales"
            value="$24,500"
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Orders"
            value="156"
            icon={<ShoppingCart />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Customers"
            value="89"
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Products"
            value="234"
            icon={<Inventory />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            borderRadius: 2
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#000000', fontWeight: 'bold' }}>
              Sales Overview
            </Typography>
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                border: '2px dashed #000000'
              }}
            >
              <Typography color="#000000" fontWeight="bold">
                Chart Component Placeholder
              </Typography>
            </Box>
          </Paper>
          <QuickActions />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <RecentActivity />
        </Grid>
      </Grid>
    </Box>
  );
}
