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
  Chip
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
  DataUsage
} from '@mui/icons-material';
import LegalDocEditor from './LegalDocEditor';
import UserManagement from './UserManagement';
import DataBackup from './DataBackup';
import LoginAttempts from './LoginAttempts';
import { toast } from 'react-hot-toast';
import { db } from '../../firebase/config';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    loginAttempts: 0,
    legalDocs: 0,
    backups: 0,
    failedLogins: 0,
    systemHealth: 'Good'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const StatCard = ({ title, value, icon: Icon, color, change, trend }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        <Grid container spacing={3}>
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
        <Paper sx={{ mt: 4 }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'login_success' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {activity.type === 'login_success' ? 
                      <CheckCircle className="w-5 h-5" /> : 
                      <XCircle className="w-5 h-5" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.timestamp ? 
                          new Date(activity.timestamp.seconds * 1000).toLocaleString() : 
                          'Just now'
                        }
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-600">Activity will appear here as users interact with the system.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
          >
            <Users className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2" />
            <div className="text-sm font-medium text-gray-900">Manage Users</div>
            <div className="text-xs text-gray-500">View and manage user accounts</div>
          </button>
          
          <button
            onClick={() => setActiveTab('legal')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
          >
            <FileText className="w-8 h-8 text-gray-600 group-hover:text-purple-600 mb-2" />
            <div className="text-sm font-medium text-gray-900">Legal Documents</div>
            <div className="text-xs text-gray-500">Edit legal content</div>
          </button>
          
          <button
            onClick={() => setActiveTab('backup')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
          >
            <Database className="w-8 h-8 text-gray-600 group-hover:text-green-600 mb-2" />
            <div className="text-sm font-medium text-gray-900">Backup Data</div>
            <div className="text-xs text-gray-500">Create system backups</div>
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 group"
          >
            <Shield className="w-8 h-8 text-gray-600 group-hover:text-red-600 mb-2" />
            <div className="text-sm font-medium text-gray-900">Security</div>
            <div className="text-xs text-gray-500">Monitor login attempts</div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Control Center</h1>
              <p className="text-gray-600 text-lg">Complete system administration and management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg border border-gray-100">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-transparent rounded-xl">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'legal' && <LegalDocEditor />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'security' && <LoginAttempts />}
          {activeTab === 'backup' && <DataBackup />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
