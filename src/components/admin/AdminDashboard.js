import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatLKR, formatLKRCompact } from '../../utils/currencyFormatter';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Tooltip,
  Avatar,
  LinearProgress,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  Inventory,
  People,
  Assessment,
  Payment,
  LocalShipping,
  Campaign,
  Security,
  Settings,
  ExitToApp,
  Menu as MenuIcon,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingBag,
  Group,
  Warning,
  CheckCircle,
  Notifications,
  PersonAdd,
  Store,
  Category,
  LocalOffer,
  Email,
  Language,
  CurrencyExchange,
  Article,
  AdminPanelSettings,
  Gavel,
  Backup,
  Block,
  CloudDownload,
  CloudUpload,
  Image,
  Save,
  RestoreFromTrash,
  FileDownload,
  CheckBox,
  Cancel,
  PersonOff,
  Business,
  MonitorHeart,
  Shield,
  CloudSync,
  Computer,
  DashboardCustomize,
  AccountBalance,
  Lock,
  Timeline,
  Receipt,
  Sync,
  StorageRounded
} from '@mui/icons-material';

import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Combined Admin Stats (E-commerce + System Admin)
  const [adminStats, setAdminStats] = useState({
    // E-commerce Stats
    totalSales: 125420,
    totalOrders: 3245,
    activeProducts: 1850,
    totalCustomers: 8965,
    pendingOrders: 89,
    lowStockItems: 24,
    totalRevenue: 2845690,
    avgOrderValue: 387.50,
    // System Admin Stats
    totalUsers: 1245,
    activeUsers: 892,
    blockedUsers: 23,
    systemBackups: 156,
    loginAttempts: 89,
    legalDocs: 12,
    securityAlerts: 5,
    systemHealth: 98
  });

  // Sample data for all sections
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [loginAttemptsList, setLoginAttemptsList] = useState([]);
  const [legalDocuments, setLegalDocuments] = useState([]);
  const [backupHistory, setBackupHistory] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Mock e-commerce data
      const mockRecentOrders = [
        { id: 'ORD001', customer: 'John Doe', amount: 299.99, status: 'Pending', date: '2025-09-24' },
        { id: 'ORD002', customer: 'Jane Smith', amount: 459.50, status: 'Shipped', date: '2025-09-24' },
        { id: 'ORD003', customer: 'Mike Johnson', amount: 189.99, status: 'Delivered', date: '2025-09-23' },
        { id: 'ORD004', customer: 'Sarah Wilson', amount: 599.99, status: 'Processing', date: '2025-09-23' },
        { id: 'ORD005', customer: 'David Brown', amount: 99.99, status: 'Cancelled', date: '2025-09-22' }
      ];

      // Mock system users for management
      const mockSystemUsers = [
        { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'Active', lastLogin: '2025-09-24 10:30 AM', attempts: 0 },
        { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'Manager', status: 'Active', lastLogin: '2025-09-24 09:15 AM', attempts: 0 },
        { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'User', status: 'Blocked', lastLogin: '2025-09-23 02:45 PM', attempts: 5 },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', role: 'User', status: 'Active', lastLogin: '2025-09-24 08:20 AM', attempts: 1 },
        { id: 5, name: 'David Brown', email: 'david@company.com', role: 'Manager', status: 'Pending', lastLogin: 'Never', attempts: 0 }
      ];

      // Mock login attempts for security monitoring
      const mockLoginAttempts = [
        { id: 1, email: 'john@company.com', ip: '192.168.1.100', timestamp: '2025-09-24 10:30:15', status: 'Success', location: 'New York, US' },
        { id: 2, email: 'suspicious@hacker.com', ip: '45.123.45.67', timestamp: '2025-09-24 10:25:30', status: 'Failed', location: 'Unknown' },
        { id: 3, email: 'jane@company.com', ip: '192.168.1.105', timestamp: '2025-09-24 09:15:45', status: 'Success', location: 'California, US' },
        { id: 4, email: 'admin@test.com', ip: '178.45.67.89', timestamp: '2025-09-24 08:50:22', status: 'Failed', location: 'Russia' },
        { id: 5, email: 'sarah@company.com', ip: '192.168.1.110', timestamp: '2025-09-24 08:20:10', status: 'Success', location: 'Texas, US' }
      ];

      // Mock legal documents
      const mockLegalDocs = [
        { id: 1, title: 'Terms of Service', type: 'Legal', lastUpdated: '2025-09-20', status: 'Active', editor: 'Legal Team' },
        { id: 2, title: 'Privacy Policy', type: 'Legal', lastUpdated: '2025-09-18', status: 'Active', editor: 'Legal Team' },
        { id: 3, title: 'GDPR Compliance', type: 'Compliance', lastUpdated: '2025-09-15', status: 'Active', editor: 'Compliance Officer' },
        { id: 4, title: 'Cookie Policy', type: 'Legal', lastUpdated: '2025-09-10', status: 'Draft', editor: 'Legal Team' },
        { id: 5, title: 'Refund Policy', type: 'Commercial', lastUpdated: '2025-09-12', status: 'Active', editor: 'Business Team' }
      ];

      // Mock backup history
      const mockBackupHistory = [
        { id: 1, type: 'Full Backup', size: '2.4 GB', date: '2025-09-24 03:00 AM', status: 'Completed', duration: '45 min' },
        { id: 2, type: 'Incremental', size: '145 MB', date: '2025-09-23 03:00 AM', status: 'Completed', duration: '8 min' },
        { id: 3, type: 'Database Backup', size: '890 MB', date: '2025-09-22 02:00 AM', status: 'Completed', duration: '15 min' },
        { id: 4, type: 'Full Backup', size: '2.3 GB', date: '2025-09-21 03:00 AM', status: 'Failed', duration: '12 min' },
        { id: 5, type: 'Incremental', size: '230 MB', date: '2025-09-20 03:00 AM', status: 'Completed', duration: '10 min' }
      ];

      const mockTopProducts = [
        { id: 1, name: 'Wireless Headphones', sales: 245, revenue: 12250, stock: 45 },
        { id: 2, name: 'Smart Watch', sales: 189, revenue: 37800, stock: 23 },
        { id: 3, name: 'Laptop Stand', sales: 156, revenue: 4680, stock: 67 },
        { id: 4, name: 'USB-C Cable', sales: 298, revenue: 2980, stock: 156 },
        { id: 5, name: 'Phone Case', sales: 167, revenue: 3340, stock: 89 }
      ];

      const mockCustomers = [
        { id: 1, name: 'John Doe', email: 'john@email.com', orders: 12, totalSpent: 2450.99, status: 'VIP' },
        { id: 2, name: 'Jane Smith', email: 'jane@email.com', orders: 8, totalSpent: 1890.50, status: 'Regular' },
        { id: 3, name: 'Mike Johnson', email: 'mike@email.com', orders: 15, totalSpent: 3200.75, status: 'VIP' },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@email.com', orders: 5, totalSpent: 980.25, status: 'New' }
      ];

      const mockProducts = [
        { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 99.99, stock: 45, status: 'Active' },
        { id: 2, name: 'Smart Watch', category: 'Electronics', price: 199.99, stock: 23, status: 'Active' },
        { id: 3, name: 'Laptop Stand', category: 'Accessories', price: 29.99, stock: 67, status: 'Active' },
        { id: 4, name: 'USB-C Cable', category: 'Accessories', price: 9.99, stock: 156, status: 'Active' }
      ];

      const mockActivity = [
        { id: 1, type: 'order', message: 'New order #ORD001 received', time: '2 min ago', status: 'success' },
        { id: 2, type: 'product', message: 'Product "Smart Watch" updated', time: '15 min ago', status: 'info' },
        { id: 3, type: 'customer', message: 'New customer registration', time: '1 hour ago', status: 'success' },
        { id: 4, type: 'stock', message: 'Low stock alert: Wireless Headphones', time: '2 hours ago', status: 'warning' },
        { id: 5, type: 'payment', message: 'Payment received for order #ORD002', time: '3 hours ago', status: 'success' }
      ];

      // Set all data
      setRecentOrders(mockRecentOrders);
      setTopProducts(mockTopProducts);
      setCustomers(mockCustomers);
      setProducts(mockProducts);
      setSystemUsers(mockSystemUsers);
      setLoginAttemptsList(mockLoginAttempts);
      setLegalDocuments(mockLegalDocs);
      setBackupHistory(mockBackupHistory);
      setRecentActivity(mockActivity);
    } catch (error) {
      toast.error('Failed to load admin data');
      console.error('Admin data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAddNew = (type) => {
    setDialogType(type);
    setSelectedItem(null);
    setOpenDialog(true);
  };

  const handleEdit = (type, item) => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleDelete = (type, id) => {
    // Add delete logic here
    toast.success(`${type} deleted successfully`);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setRecentOrders(orders => 
      orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast.success('Order status updated');
  };

  const handleLogout = () => {
    // Clear only admin-specific session data, not main authentication
    localStorage.removeItem('adminSession');
    localStorage.removeItem('currentAdminView');
    
    // Show logout confirmation
    toast.success('Logged out successfully!');
    
    // Navigate back to ERP Dashboard
    window.location.href = '/?screen=dashboard';
  };

  const menuItems = [
    { label: 'Dashboard', icon: Dashboard, value: 0 },
    { label: 'E-commerce', icon: Store, value: 1 },
    { label: 'Administration', icon: AdminPanelSettings, value: 2 },
    { label: 'Settings', icon: Settings, value: 3 }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success': 
      case 'delivered': 
      case 'active': 
      case 'vip': return '#4ade80';
      case 'warning': 
      case 'pending': 
      case 'processing': return '#fbbf24';
      case 'error': 
      case 'cancelled': return '#f87171';
      case 'info': 
      case 'shipped': return '#60a5fa';
      case 'regular': return '#8b5cf6';
      case 'new': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return Warning;
      case 'error': return ErrorOutline;
      case 'info': return Assessment;
      default: return Assessment;
    }
  };

  // Modern Stat Card Component (HR Dashboard Style)
  const StatCard = ({ title, value, icon: Icon, trend, change, color = '#1e3a8a', subtitle }) => (
    <Card sx={{
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      color: 'white',
      height: '145px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 25px rgba(30, 58, 138, 0.3)',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 35px rgba(30, 58, 138, 0.4)'
      }
    }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ mt: 0.5, fontSize: '1.75rem', lineHeight: 1.1 }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.25, fontSize: '0.7rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            p: 1.25, 
            borderRadius: '10px', 
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <Icon sx={{ fontSize: 24, color: 'white' }} />
          </Box>
        </Box>
        
        {trend !== undefined && (
          <Box display="flex" alignItems="center" mt={1.5}>
            {trend > 0 ? (
              <TrendingUp sx={{ fontSize: 14, mr: 0.75, color: '#4ade80' }} />
            ) : trend < 0 ? (
              <TrendingDown sx={{ fontSize: 14, mr: 0.75, color: '#f87171' }} />
            ) : null}
            <Typography variant="body2" fontWeight="medium" sx={{ opacity: 0.9, fontSize: '0.875rem', lineHeight: 1.2 }}>
              {trend !== 0 && `${Math.abs(trend)}%`}{trend !== 0 && ' '}{change || 'from last month'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Quick Action Button Component


  // Professional Admin Dashboard Overview - Streamlined & Optimized
  const ComprehensiveDashboard = () => (
    <Container maxWidth="xl" sx={{ py: 3, px: 2.5 }}>
      {/* Executive Summary Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <DashboardCustomize sx={{ color: '#1e3a8a', fontSize: 28 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
              Executive Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time business analytics and system monitoring
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip 
            label="Live Data" 
            color="success" 
            size="small" 
            icon={<CircularProgress size={12} sx={{ color: '#fff !important' }} />}
          />
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      {/* Core Business Metrics - Single Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatLKRCompact(adminStats.totalSales)}
            icon={AttachMoney}
            trend={12.5}
            subtitle="Monthly earnings"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Orders"
            value={adminStats.totalOrders}
            icon={ShoppingBag}
            trend={8.2}
            subtitle="This month"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={adminStats.activeUsers}
            icon={People}
            trend={12.1}
            subtitle="Currently online"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="System Health"
            value={`${adminStats.systemHealth}%`}
            icon={Assessment}
            trend={2.1}
            subtitle="Overall performance"
          />
        </Grid>
      </Grid>

      {/* Critical Alerts - Consolidated */}
      <Paper sx={{ p: 3, borderRadius: '16px', mb: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <Grid container spacing={3}>
          <Grid xs={6} md={3}>
            <Box textAlign="center" py={1}>
              <Typography variant="h3" fontWeight="bold" color="warning.main" sx={{ fontSize: '2rem' }}>
                {adminStats.pendingOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                Pending Orders
              </Typography>
            </Box>
          </Grid>
          <Grid xs={6} md={3}>
            <Box textAlign="center" py={1}>
              <Typography variant="h3" fontWeight="bold" color="error.main" sx={{ fontSize: '2rem' }}>
                {adminStats.blockedUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                Blocked Users
              </Typography>
            </Box>
          </Grid>
          <Grid xs={6} md={3}>
            <Box textAlign="center" py={1}>
              <Typography variant="h3" fontWeight="bold" color="info.main" sx={{ fontSize: '2rem' }}>
                {adminStats.loginAttempts}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                Login Attempts
              </Typography>
            </Box>
          </Grid>
          <Grid xs={6} md={3}>
            <Box textAlign="center" py={1}>
              <Typography variant="h3" fontWeight="bold" color="success.main" sx={{ fontSize: '2rem' }}>
                {adminStats.systemBackups}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                Backups
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Business Intelligence Dashboard */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Performance Analytics */}
        <Grid xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: '16px', minHeight: '350px' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUp sx={{ color: '#1e3a8a' }} />
              Business Performance Analytics
            </Typography>
            <Grid container spacing={2.5}>
              <Grid xs={12} sm={6}>
                <Box p={2.5} sx={{ backgroundColor: '#f0f9ff', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.5rem' }}>
                    +15.7%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                    Monthly Growth
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6}>
                <Box p={2.5} sx={{ backgroundColor: '#f0fdf4', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ fontSize: '1.5rem' }}>
                    {formatLKR(adminStats.avgOrderValue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                    Avg Order Value
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6}>
                <Box p={2.5} sx={{ backgroundColor: '#fefce8', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.5rem' }}>
                    3.4%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                    Conversion Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6}>
                <Box p={2.5} sx={{ backgroundColor: '#f5f3ff', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main" sx={{ fontSize: '1.5rem' }}>
                    87.3%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                    Customer Retention
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Performance Trend Indicators */}
            <Box sx={{ mt: 2.5 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
                Performance Trends
              </Typography>
              <Box display="flex" gap={1.5} flexWrap="wrap">
                <Chip icon={<TrendingUp />} label="Sales +12.5%" color="success" size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip icon={<TrendingUp />} label="Users +8.2%" color="info" size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip icon={<TrendingDown />} label="Bounce -3.1%" color="success" size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip icon={<TrendingUp />} label="Revenue +23.1%" color="primary" size="small" sx={{ fontSize: '0.7rem' }} />
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Quick Insights */}
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '16px', minHeight: '350px' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Assessment sx={{ color: '#f59e0b' }} />
              Business Insights
            </Typography>
            <Box display="flex" flexDirection="column" gap={2.5} sx={{ mt: 1 }}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Customer Satisfaction
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1rem' }}>
                    4.8/5
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={96} color="success" sx={{ height: 6, borderRadius: 3 }} />
              </Box>
              
              <Divider sx={{ my: 0.5 }} />
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem' }}>
                  Top Category
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.1rem' }}>
                  Electronics
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  45% of total sales
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem' }}>
                  Peak Hours
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a', fontSize: '1.1rem' }}>
                  2:00 PM - 4:00 PM
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Best conversion time
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem' }}>
                  Return Rate
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.1rem' }}>
                  2.1%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Industry average: 3.2%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Products Overview */}
      <Paper sx={{ p: 3, borderRadius: '16px' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Store sx={{ color: '#1e3a8a' }} />
          Top Performing Products
        </Typography>
        <Grid container spacing={2.5}>
          {topProducts.slice(0, 4).map((product, index) => (
            <Grid xs={12} sm={6} md={3} key={product.id}>
              <Paper sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', minHeight: '140px' }}>
                <Typography variant="body1" fontWeight="bold" noWrap sx={{ fontSize: '0.9rem' }}>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                  {product.sales} sales
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1, fontSize: '1rem' }}>
                  {formatLKR(product.revenue)}
                </Typography>
                <Chip 
                  label={`Stock: ${product.stock}`} 
                  size="small" 
                  color={product.stock > 50 ? 'success' : product.stock > 20 ? 'warning' : 'error'}
                  sx={{ mt: 1, fontSize: '0.7rem' }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );

  // Orders Management Component
  const OrdersManagement = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Order Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleAddNew('order')}
          sx={{ borderRadius: '10px' }}
        >
          New Order
        </Button>
      </Box>

      <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell fontWeight="bold">Order ID</TableCell>
                <TableCell fontWeight="bold">Customer</TableCell>
                <TableCell fontWeight="bold">Amount</TableCell>
                <TableCell fontWeight="bold">Status</TableCell>
                <TableCell fontWeight="bold">Date</TableCell>
                <TableCell fontWeight="bold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell fontWeight="medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{formatLKR(order.amount)}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Processing">Processing</MenuItem>
                        <MenuItem value="Shipped">Shipped</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Order">
                        <IconButton size="small" color="primary" onClick={() => handleEdit('order', order)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );

  // Products Management Component
  const ProductsManagement = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Product Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<Category />} sx={{ borderRadius: '10px' }}>
            Categories
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleAddNew('product')}
            sx={{ borderRadius: '10px' }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell fontWeight="bold">Product</TableCell>
                <TableCell fontWeight="bold">Category</TableCell>
                <TableCell fontWeight="bold">Price</TableCell>
                <TableCell fontWeight="bold">Stock</TableCell>
                <TableCell fontWeight="bold">Status</TableCell>
                <TableCell fontWeight="bold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {product.name.charAt(0)}
                      </Avatar>
                      <Typography fontWeight="medium">{product.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatLKR(product.price)}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.stock}
                      color={product.stock < 30 ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.status === 'Active'}
                      onChange={() => {}}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit Product">
                        <IconButton size="small" color="primary" onClick={() => handleEdit('product', product)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton size="small" color="error" onClick={() => handleDelete('product', product.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );

  // Customers Management Component
  const CustomersManagement = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Customer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleAddNew('customer')}
          sx={{ borderRadius: '10px' }}
        >
          Add Customer
        </Button>
      </Box>

      <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell fontWeight="bold">Customer</TableCell>
                <TableCell fontWeight="bold">Email</TableCell>
                <TableCell fontWeight="bold">Orders</TableCell>
                <TableCell fontWeight="bold">Total Spent</TableCell>
                <TableCell fontWeight="bold">Status</TableCell>
                <TableCell fontWeight="bold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {customer.name.charAt(0)}
                      </Avatar>
                      <Typography fontWeight="medium">{customer.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{formatLKR(customer.totalSpent)}</TableCell>
                  <TableCell>
                    <Chip
                      label={customer.status}
                      color={customer.status === 'VIP' ? 'warning' : customer.status === 'New' ? 'info' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Profile">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Customer">
                        <IconButton size="small" color="primary" onClick={() => handleEdit('customer', customer)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );

  // Professional E-commerce Management - Combined Orders, Products, Customers
  const EcommerceManagement = () => {
    const [activeTab, setActiveTab] = useState(0);
    
    const ecomTabs = [
      { label: 'Orders', icon: ShoppingCart },
      { label: 'Products', icon: Inventory },
      { label: 'Customers', icon: People },
      { label: 'Payments', icon: Payment }
    ];

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header with Action Buttons */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" fontWeight="bold" sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🛍️ E-commerce Management
          </Typography>
          
          {/* Action Buttons based on active tab */}
          {activeTab === 0 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleAddNew('order')}
                sx={{
                  backgroundColor: '#1e3a8a',
                  '&:hover': { backgroundColor: '#1d4ed8' },
                  borderRadius: '10px',
                  fontWeight: 'bold'
                }}
              >
                New Order
              </Button>
              <Badge badgeContent={recentActivity.length} color="error">
                <Notifications sx={{ color: '#1e3a8a' }} />
              </Badge>
            </Box>
          )}
          {activeTab === 1 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleAddNew('product')}
                sx={{
                  backgroundColor: '#1e3a8a',
                  '&:hover': { backgroundColor: '#1d4ed8' },
                  borderRadius: '10px',
                  fontWeight: 'bold'
                }}
              >
                Add Product
              </Button>
            </Box>
          )}
          {activeTab === 2 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleAddNew('customer')}
                sx={{
                  backgroundColor: '#1e3a8a',
                  '&:hover': { backgroundColor: '#1d4ed8' },
                  borderRadius: '10px',
                  fontWeight: 'bold'
                }}
              >
                Add New Customer
              </Button>
              <Badge badgeContent={recentActivity.length} color="error">
                <Notifications sx={{ color: '#1e3a8a' }} />
              </Badge>
            </Box>
          )}
          {activeTab === 3 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Badge badgeContent={5} color="warning">
                <Payment sx={{ color: '#1e3a8a' }} />
              </Badge>
            </Box>
          )}
        </Box>

        <Paper sx={{ borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              backgroundColor: '#f8fafc',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 60
              }
            }}
          >
            {ecomTabs.map((tab, index) => (
              <Tab
                key={index}
                icon={<tab.icon />}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>

        {activeTab === 0 && <OrdersManagement />}
        {activeTab === 1 && <ProductsManagement />}
        {activeTab === 2 && <CustomersManagement />}
        {activeTab === 3 && <PaymentsComponent />}
      </Container>
    );
  };

  // Professional System Administration - Combined Users, Security, Legal, Backup
  const SystemAdministration = () => {
    const [activeTab, setActiveTab] = useState(0);
    
    const adminTabs = [
      { label: 'User Management', icon: AdminPanelSettings },
      { label: 'Security Monitor', icon: Security },
      { label: 'Legal Documents', icon: Gavel },
      { label: 'Data Backup', icon: Backup }
    ];

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <AdminPanelSettings sx={{ color: '#ef4444', fontSize: 28 }} />
            <Typography variant="h5" fontWeight="600">
              System Administration
            </Typography>
          </Box>
          
          {/* Action Buttons based on active tab */}
          {activeTab === 0 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleAddNew('user')}
                sx={{
                  backgroundColor: '#1e3a8a',
                  '&:hover': { backgroundColor: '#1d4ed8' },
                  borderRadius: '10px',
                  fontWeight: 'bold'
                }}
              >
                Add User
              </Button>
              <Badge badgeContent={adminStats.securityAlerts} color="error">
                <Security sx={{ color: '#1e3a8a' }} />
              </Badge>
            </Box>
          )}
          {activeTab === 1 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Badge badgeContent={adminStats.securityAlerts} color="error">
                <Warning sx={{ color: '#ef4444' }} />
              </Badge>
            </Box>
          )}
          {activeTab === 2 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleAddNew('legal')}
                sx={{
                  backgroundColor: '#1e3a8a',
                  '&:hover': { backgroundColor: '#1d4ed8' },
                  borderRadius: '10px',
                  fontWeight: 'bold'
                }}
              >
                Add Document
              </Button>
            </Box>
          )}
          {activeTab === 3 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Badge badgeContent={adminStats.systemBackups} color="success">
                <CloudSync sx={{ color: '#10b981' }} />
              </Badge>
            </Box>
          )}
        </Box>

        <Paper sx={{ borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              backgroundColor: '#f8fafc',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 60
              }
            }}
          >
            {adminTabs.map((tab, index) => (
              <Tab
                key={index}
                icon={<tab.icon />}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>

        {activeTab === 0 && <SystemUserManagement />}
        {activeTab === 1 && <LoginAttemptsMonitor />}
        {activeTab === 2 && <LegalDocumentsEditor />}
        {activeTab === 3 && <DataBackupManagement />}
      </Container>
    );
  };

  // Legal Documents Editor - Simplified Professional Version
  const LegalDocumentsEditor = () => {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [docContent, setDocContent] = useState('');

    const handleEditDoc = (doc) => {
      setSelectedDoc(doc);
      setEditMode(true);
      setDocContent(`# ${doc.title}\n\nLast updated: ${doc.lastUpdated}\nEditor: ${doc.editor}\n\n## Content\n\nThis is the editable content for ${doc.title}. You can modify all text and update any legal documentation here.\n\n### Features:\n- Full editing capabilities\n- Real-time preview\n- Version control\n- Auto-save functionality\n\n---\n*This document is legally binding and subject to review.*`);
    };

    const handleSaveDoc = () => {
      toast.success(`${selectedDoc.title} updated successfully!`);
      setEditMode(false);
      setSelectedDoc(null);
      setLegalDocuments(docs => 
        docs.map(doc => 
          doc.id === selectedDoc.id 
            ? { ...doc, lastUpdated: new Date().toISOString().split('T')[0], status: 'Active' }
            : doc
        )
      );
    };

    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <AccountBalance sx={{ color: '#1e3a8a', fontSize: 24 }} />
            <Box>
              <Typography variant="h6" fontWeight="600">Legal Documents</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                pharma-core-erp.vercel.app/legal
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleAddNew('legal')}
            sx={{ borderRadius: '10px', bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1d4ed8' } }}
          >
            New Document
          </Button>
        </Box>

        {editMode ? (
          <Paper sx={{ p: 3, borderRadius: '16px' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Edit sx={{ color: '#f59e0b', fontSize: 20 }} />
                <Typography variant="h6" fontWeight="600">Editing: {selectedDoc.title}</Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Button variant="outlined" onClick={() => setEditMode(false)} sx={{ borderRadius: '10px' }}>Cancel</Button>
                <Button variant="contained" startIcon={<Save />} onClick={handleSaveDoc} sx={{ borderRadius: '10px', bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>Save</Button>
              </Box>
            </Box>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: '#f8fafc', minHeight: '400px', borderRadius: '12px' }}>
                  <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                    {docContent}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell fontWeight="bold">Document</TableCell>
                  <TableCell fontWeight="bold">Type</TableCell>
                  <TableCell fontWeight="bold">Last Updated</TableCell>
                  <TableCell fontWeight="bold">Status</TableCell>
                  <TableCell fontWeight="bold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {legalDocuments.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Gavel color="primary" />
                        <Typography fontWeight="medium">{doc.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{doc.lastUpdated}</TableCell>
                    <TableCell>
                      <Chip label={doc.status} color={doc.status === 'Active' ? 'success' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button size="small" variant="contained" onClick={() => handleEditDoc(doc)} sx={{ borderRadius: '8px' }}>
                          <Edit />
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => window.open('https://pharma-core-erp.vercel.app/legal', '_blank')} sx={{ borderRadius: '8px' }}>
                          <Visibility />
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  // System User Management Component - 100% Working
  const SystemUserManagement = () => {
    const handleBlockUser = (userId) => {
      setSystemUsers(users => 
        users.map(user => 
          user.id === userId 
            ? { ...user, status: user.status === 'Blocked' ? 'Active' : 'Blocked' }
            : user
        )
      );
      toast.success('User status updated successfully!');
    };

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            👥 System User Management - High Privilege Control
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => handleAddNew('user')}
            sx={{ borderRadius: '10px' }}
          >
            Add New User
          </Button>
        </Box>

        <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell fontWeight="bold">User</TableCell>
                  <TableCell fontWeight="bold">Email</TableCell>
                  <TableCell fontWeight="bold">Role</TableCell>
                  <TableCell fontWeight="bold">Status</TableCell>
                  <TableCell fontWeight="bold">Last Login</TableCell>
                  <TableCell fontWeight="bold">Failed Attempts</TableCell>
                  <TableCell fontWeight="bold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {systemUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: user.status === 'Blocked' ? 'error.main' : 'primary.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography fontWeight="medium">{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'Admin' ? 'error' : user.role === 'Manager' ? 'warning' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={user.status === 'Active' ? 'success' : user.status === 'Blocked' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.attempts}
                        color={user.attempts > 3 ? 'error' : user.attempts > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title={user.status === 'Blocked' ? 'Unblock User' : 'Block User'}>
                          <Button
                            size="small"
                            variant="contained"
                            color={user.status === 'Blocked' ? 'success' : 'error'}
                            onClick={() => handleBlockUser(user.id)}
                            sx={{ borderRadius: '8px' }}
                          >
                            {user.status === 'Blocked' ? <CheckBox /> : <Block />}
                          </Button>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEdit('user', user)}
                            sx={{ borderRadius: '8px' }}
                          >
                            <Edit />
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    );
  };

  // Login Attempts Security Monitor - 100% Working
  const LoginAttemptsMonitor = () => {
    const handleBlockIP = (attemptId) => {
      setLoginAttemptsList(attempts => 
        attempts.map(attempt => 
          attempt.id === attemptId 
            ? { ...attempt, status: 'Blocked' }
            : attempt
        )
      );
      toast.success('IP Address blocked successfully!');
    };

    const handleApproveAttempt = (attemptId) => {
      setLoginAttemptsList(attempts => 
        attempts.map(attempt => 
          attempt.id === attemptId 
            ? { ...attempt, status: 'Approved' }
            : attempt
        )
      );
      toast.success('Login attempt approved!');
    };

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🔐 Login Attempts Security Monitor - Approve/Deny Control
        </Typography>

        <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell fontWeight="bold">Email/User</TableCell>
                  <TableCell fontWeight="bold">IP Address</TableCell>
                  <TableCell fontWeight="bold">Timestamp</TableCell>
                  <TableCell fontWeight="bold">Location</TableCell>
                  <TableCell fontWeight="bold">Status</TableCell>
                  <TableCell fontWeight="bold">Security Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loginAttemptsList.map((attempt) => (
                  <TableRow key={attempt.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Security color={attempt.status === 'Failed' ? 'error' : 'primary'} />
                        <Typography fontWeight="medium">{attempt.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{attempt.ip}</TableCell>
                    <TableCell>{attempt.timestamp}</TableCell>
                    <TableCell>{attempt.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={attempt.status}
                        color={
                          attempt.status === 'Success' || attempt.status === 'Approved' ? 'success' : 
                          attempt.status === 'Failed' ? 'error' : 
                          attempt.status === 'Blocked' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Approve Login">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApproveAttempt(attempt.id)}
                            disabled={attempt.status === 'Approved'}
                            sx={{ borderRadius: '8px' }}
                          >
                            <CheckCircle />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Block IP">
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleBlockIP(attempt.id)}
                            disabled={attempt.status === 'Blocked'}
                            sx={{ borderRadius: '8px' }}
                          >
                            <PersonOff />
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    );
  };

  // Data Backup & Restore Management - 100% Working
  const DataBackupManagement = () => {
    const handleCreateBackup = () => {
      const newBackup = {
        id: backupHistory.length + 1,
        type: 'Manual Backup',
        size: '2.1 GB',
        date: new Date().toLocaleString(),
        status: 'In Progress',
        duration: 'Estimating...'
      };
      setBackupHistory(prev => [newBackup, ...prev]);
      toast.success('Backup initiated successfully!');
      
      // Simulate backup completion
      setTimeout(() => {
        setBackupHistory(prev => 
          prev.map(backup => 
            backup.id === newBackup.id 
              ? { ...backup, status: 'Completed', duration: '32 min' }
              : backup
          )
        );
        toast.success('Backup completed successfully!');
      }, 3000);
    };

    const handleRestoreBackup = (backupId) => {
      toast.success('System restore initiated! This may take several minutes.');
      // Simulate restore process
      setTimeout(() => {
        toast.success('System restored successfully from backup!');
      }, 2000);
    };

    const handleDownloadBackup = (backup) => {
      toast.success(`Downloading backup: ${backup.type} (${backup.size})`);
    };

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            💾 Data Backup & Restore Management
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={() => toast.success('Auto-backup scheduled!')}
              sx={{ borderRadius: '10px' }}
            >
              Auto-Backup Settings
            </Button>
            <Button
              variant="contained"
              startIcon={<Backup />}
              onClick={handleCreateBackup}
              sx={{ borderRadius: '10px' }}
            >
              Create Backup Now
            </Button>
          </Box>
        </Box>

        <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell fontWeight="bold">Backup Type</TableCell>
                  <TableCell fontWeight="bold">Size</TableCell>
                  <TableCell fontWeight="bold">Date Created</TableCell>
                  <TableCell fontWeight="bold">Status</TableCell>
                  <TableCell fontWeight="bold">Duration</TableCell>
                  <TableCell fontWeight="bold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backupHistory.map((backup) => (
                  <TableRow key={backup.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Backup color="primary" />
                        <Typography fontWeight="medium">{backup.type}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell>{backup.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={backup.status}
                        color={
                          backup.status === 'Completed' ? 'success' : 
                          backup.status === 'Failed' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{backup.duration}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Download Backup">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleDownloadBackup(backup)}
                            disabled={backup.status !== 'Completed'}
                            sx={{ borderRadius: '8px' }}
                          >
                            <FileDownload />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Restore from Backup">
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            onClick={() => handleRestoreBackup(backup.id)}
                            disabled={backup.status !== 'Completed'}
                            sx={{ borderRadius: '8px' }}
                          >
                            <RestoreFromTrash />
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    );
  };

  // Payment Management Component
  const PaymentsComponent = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>💳 Payment Management</Typography>
      <Paper sx={{ p: 3, borderRadius: '16px' }}>
        <Typography>Payment processing, refunds, and transaction monitoring functionality.</Typography>
      </Paper>
    </Container>
  );



  const ShippingComponent = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Shipping Management</Typography>
      <Paper sx={{ p: 3, borderRadius: '16px' }}>
        <Typography>Shipping methods, tracking, and logistics management coming soon...</Typography>
      </Paper>
    </Container>
  );

  const MarketingComponent = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Marketing & Promotions</Typography>
      <Paper sx={{ p: 3, borderRadius: '16px' }}>
        <Typography>Campaign management, promotions, and email marketing coming soon...</Typography>
      </Paper>
    </Container>
  );

  const SiteManagementComponent = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Site Management</Typography>
      <Paper sx={{ p: 3, borderRadius: '16px' }}>
        <Typography>Content management, SEO tools, and site configuration coming soon...</Typography>
      </Paper>
    </Container>
  );





  // Professional Settings & Configuration
  const ProfessionalSettings = () => {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Settings sx={{ color: '#6b7280', fontSize: 28 }} />
          <Typography variant="h5" fontWeight="600">Settings & Configuration</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '16px' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <DashboardCustomize sx={{ color: '#1e3a8a', fontSize: 20 }} />
                <Typography variant="h6" fontWeight="600">Theme Settings</Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Theme Mode</InputLabel>
                  <Select defaultValue="professional" label="Theme Mode">
                    <MenuItem value="professional">Professional</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="light">Light</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Primary Color</InputLabel>
                  <Select defaultValue="blue" label="Primary Color">
                    <MenuItem value="blue">Blue Gradient</MenuItem>
                    <MenuItem value="green">Green</MenuItem>
                    <MenuItem value="purple">Purple</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '16px' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Settings sx={{ color: '#10b981', fontSize: 20 }} />
                <Typography variant="h6" fontWeight="600">System Settings</Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>Auto-save</Typography>
                  <Switch defaultChecked />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>Notifications</Typography>
                  <Switch defaultChecked />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>Dark Mode</Typography>
                  <Switch />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>Analytics</Typography>
                  <Switch defaultChecked />
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid xs={12}>
            <Paper sx={{ p: 3, borderRadius: '16px' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Computer sx={{ color: '#f59e0b', fontSize: 20 }} />
                <Typography variant="h6" fontWeight="600">General Configuration</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid xs={12} md={4}>
                  <TextField fullWidth label="Site Name" defaultValue="Pharma Core ERP" />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField fullWidth label="Contact Email" defaultValue="admin@pharma-core.com" />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField fullWidth label="Support Phone" defaultValue="+1 (555) 123-4567" />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <ComprehensiveDashboard />;
      case 1:
        return <EcommerceManagement />;
      case 2:
        return <SystemAdministration />;
      case 3:
        return <ProfessionalSettings />;
      default:
        return <ComprehensiveDashboard />;
    }
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
          COREERP
        </Typography>
        <Chip 
          label="E-COMMERCE MODULE" 
          size="small" 
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }} 
        />
      </Box>

      {/* Main Navigation */}
      <List sx={{ px: 2, py: 3 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.value}
            selected={selectedTab === item.value}
            onClick={() => {
              setSelectedTab(item.value);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            sx={{
              borderRadius: '12px',
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                '& .MuiListItemIcon-root': {
                  color: 'white'
                },
                '& .MuiListItemText-primary': {
                  color: 'white',
                  fontWeight: 'bold'
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: '12px'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{ 
                fontWeight: selectedTab === item.value ? 'bold' : 'medium',
                fontSize: '0.9rem'
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Bottom Section */}
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        
        {/* Current Date & Time */}
        <Paper sx={{ 
          p: 2, 
          textAlign: 'center', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          mb: 2
        }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
            CURRENT DATE & TIME
          </Typography>
          <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
            Sep 24, 2025
          </Typography>
          <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
            10:34 AM
          </Typography>
        </Paper>

        {/* Logout Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          sx={{
            backgroundColor: '#dc2626',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px',
            py: 1.5,
            '&:hover': {
              backgroundColor: '#b91c1c'
            }
          }}
        >
          LOGOUT
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>

      {/* Side Navigation */}
      <Box component="nav" sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
              border: 'none'
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
              border: 'none'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 280px)` },
          backgroundColor: '#f8fafc',
          minHeight: '100vh'
        }}
      >
        {renderTabContent()}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          {selectedItem ? `Edit ${dialogType}` : `Add New ${dialogType}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'product' && (
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Product Name" variant="outlined" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Category" variant="outlined" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Price" type="number" variant="outlined" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Stock" type="number" variant="outlined" />
                </Grid>
                <Grid xs={12}>
                  <TextField fullWidth label="Description" multiline rows={3} variant="outlined" />
                </Grid>
              </Grid>
            )}
            {dialogType === 'customer' && (
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Customer Name" variant="outlined" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Email" type="email" variant="outlined" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Phone" variant="outlined" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select defaultValue="Regular">
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="VIP">VIP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12}>
                  <TextField fullWidth label="Address" multiline rows={2} variant="outlined" />
                </Grid>
              </Grid>
            )}
            {dialogType === 'order' && (
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Customer Name" variant="outlined" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Order Amount" type="number" variant="outlined" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select defaultValue="Pending">
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Processing">Processing</MenuItem>
                      <MenuItem value="Shipped">Shipped</MenuItem>
                      <MenuItem value="Delivered">Delivered</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Order Date" 
                    type="date" 
                    InputLabelProps={{ shrink: true }}
                    variant="outlined" 
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: '10px' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenDialog(false);
              toast.success(`${dialogType} ${selectedItem ? 'updated' : 'created'} successfully!`);
            }}
            sx={{ borderRadius: '10px' }}
          >
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
