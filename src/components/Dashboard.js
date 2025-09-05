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
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: `${color}.light`,
            color: `${color}.contrastText`,
            mr: 2
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
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
    <Box>
      <Typography variant="h4" gutterBottom>
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
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.100',
                borderRadius: 1
              }}
            >
              <Typography color="textSecondary">
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
