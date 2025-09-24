import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Dashboard,
  People,
  Gavel,
  Security,
  Backup,
  Settings,
  ExitToApp,
  Menu as MenuIcon,
  Assessment,
  Warning,
  CheckCircle,
  ErrorOutline,
  TrendingUp,
  DataUsage,
  Notifications
} from '@mui/icons-material';
import LegalDocEditor from './LegalDocEditor';
import UserManagement from './UserManagement';
import DataBackup from './DataBackup';
import LoginAttempts from './LoginAttempts';
import { toast } from 'react-hot-toast';
import { db } from '../../firebase/config';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    loginAttempts: 0,
    legalDocs: 0,
    backups: 0,
    failedLogins: 0,
    systemHealth: 'Loading...'
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminTabs = [
    { id: 'overview', name: 'Dashboard Overview', icon: Dashboard },
    { id: 'users', name: 'User Management', icon: People },
    { id: 'legal', name: 'Legal Documents', icon: Gavel },
    { id: 'security', name: 'Security Monitor', icon: Security },
    { id: 'backup', name: 'Data Backup', icon: Backup }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load real stats from Firebase
      const [usersSnapshot, docsSnapshot, attemptsSnapshot, backupsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'legalDocuments')),
        getDocs(query(collection(db, 'loginAttempts'), orderBy('timestamp', 'desc'), limit(50))),
        getDocs(collection(db, 'backupHistory'))
      ]);

      const users = [];
      usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
      
      const attempts = [];
      attemptsSnapshot.forEach(doc => attempts.push({ id: doc.id, ...doc.data() }));

      const activeUsers = users.filter(user => user.status === 'active' || !user.status).length;
      const blockedUsers = users.filter(user => user.status === 'blocked').length;
      const failedLogins = attempts.filter(attempt => !attempt.success).length;

      setStats({
        totalUsers: users.length,
        activeUsers: activeUsers,
        blockedUsers: blockedUsers,
        loginAttempts: attempts.length,
        legalDocs: docsSnapshot.size,
        backups: backupsSnapshot.size,
        failedLogins: failedLogins,
        systemHealth: failedLogins > 10 ? 'Warning' : 'Good'
      });

      // Recent activity
      const activities = [];
      attempts.slice(0, 5).forEach(attempt => {
        activities.push({
          id: attempt.id,
          type: attempt.success ? 'login_success' : 'login_failed',
          user: attempt.email || 'Unknown',
          timestamp: attempt.timestamp,
          description: `${attempt.success ? 'Successful' : 'Failed'} login attempt`
        });
      });

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const StatCard = ({ title, value, icon: Icon, trend, change }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
        color: 'white',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[10]
        },
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
              {title}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Typography variant="h4" fontWeight="bold">
                {value}
              </Typography>
              {trend && (
                <Box ml={2} display="flex" alignItems="center">
                  <TrendingUp sx={{ 
                    fontSize: 16, 
                    mr: 0.5,
                    transform: trend < 0 ? 'rotate(180deg)' : 'none',
                    color: trend > 0 ? '#4ade80' : trend < 0 ? '#f87171' : 'inherit'
                  }} />
                  <Typography variant="body2" fontWeight="medium">
                    {Math.abs(trend)}%
                  </Typography>
                </Box>
              )}
            </Box>
            {change && (
              <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5 }}>
                {change}
              </Typography>
            )}
          </Box>
          <Box sx={{ p: 1, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Icon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const OverviewTab = () => (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Welcome Header */}
        <Paper 
          sx={{ 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
            color: 'white',
            p: 4,
            mb: 4,
            borderRadius: 2
          }}
        >
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Admin Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Manage your ERP system with complete control
              </Typography>
            </Grid>
            <Grid item>
              <Box textAlign="right">
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  System Status
                </Typography>
                <Chip 
                  label={stats.systemHealth}
                  color={stats.systemHealth === 'Good' ? 'success' : 'warning'}
                  sx={{ color: 'white', fontWeight: 'bold' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Statistics Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={People}
              trend={12}
              change="from last month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              icon={CheckCircle}
              trend={8}
              change="from last month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Failed Logins"
              value={stats.failedLogins}
              icon={ErrorOutline}
              trend={-15}
              change="from last month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Legal Documents"
              value={stats.legalDocs}
              icon={Gavel}
              trend={2}
              change="from last month"
            />
          </Grid>
        </Grid>

        {/* Additional Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Blocked Users"
              value={stats.blockedUsers}
              icon={Warning}
              trend={-3}
              change="from last month"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Data Backups"
              value={stats.backups}
              icon={Backup}
              trend={0}
              change="from last month"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Login Attempts"
              value={stats.loginAttempts}
              icon={Security}
              trend={5}
              change="from last month"
            />
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
            <Box display="flex" alignItems="center">
              <Assessment sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Recent Activity
              </Typography>
            </Box>
            <Badge badgeContent={recentActivity.length} color="primary">
              <Notifications />
            </Badge>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : recentActivity.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No recent activity to display
            </Typography>
          ) : (
            <Box>
              {recentActivity.map((activity, index) => (
                <Box 
                  key={activity.id} 
                  display="flex" 
                  alignItems="center" 
                  py={2}
                  borderBottom={index < recentActivity.length - 1 ? 1 : 0}
                  borderColor="divider"
                >
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: activity.type === 'login_success' ? 'success.main' : 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    {activity.type === 'login_success' ? 
                      <CheckCircle sx={{ color: 'white', fontSize: 20 }} /> : 
                      <ErrorOutline sx={{ color: 'white', fontSize: 20 }} />
                    }
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight="medium">
                      {activity.user}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.description}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activity.timestamp ? 
                      new Date(activity.timestamp.seconds * 1000).toLocaleString() : 
                      'Just now'
                    }
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {adminTabs.map((tab, index) => (
          <ListItem key={tab.id} disablePadding>
            <ListItemButton
              selected={activeTab === index}
              onClick={() => {
                setActiveTab(index);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                <tab.icon />
              </ListItemIcon>
              <ListItemText primary={tab.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <OverviewTab />;
      case 1:
        return <UserManagement />;
      case 2:
        return <LegalDocEditor />;
      case 3:
        return <LoginAttempts />;
      case 4:
        return <DataBackup />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - 280px)` },
          ml: { md: '280px' },
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {adminTabs[activeTab]?.name || 'Admin Dashboard'}
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={stats.failedLogins} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 280px)` },
          mt: 8,
        }}
      >
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
