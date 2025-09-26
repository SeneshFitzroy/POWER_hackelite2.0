import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Tooltip,
  Badge,
  LinearProgress,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';`nimport Grid from '@mui/material/Grid2';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingBag as ShoppingBagIcon,
  Group as GroupIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  StarRate as StarRateIcon,
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, change, color = '#1e3a8a' }) => (
  <Card sx={{
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: 'white',
    height: '140px',
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
          <Typography variant="body2" fontWeight="medium" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
            {trend !== 0 && `${Math.abs(trend)}%`} {change || 'from last month'}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const ProfessionalEcommerceAdmin = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock data states
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 125600,
    totalOrders: 1847,
    activeProducts: 245,
    totalCustomers: 3421,
    pendingOrders: 23,
    lowStockItems: 8,
    newCustomers: 167,
    conversionRate: 3.4
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Mock data loading
      const mockOrders = [
        { id: 'ORD001', customer: 'John Silva', email: 'john@email.com', total: 2850.00, status: 'Processing', date: '2025-09-24', items: 3 },
        { id: 'ORD002', customer: 'Mary Fernando', email: 'mary@email.com', total: 1450.00, status: 'Shipped', date: '2025-09-24', items: 2 },
        { id: 'ORD003', customer: 'David Perera', email: 'david@email.com', total: 890.00, status: 'Delivered', date: '2025-09-23', items: 1 },
        { id: 'ORD004', customer: 'Sarah Wickrama', email: 'sarah@email.com', total: 3200.00, status: 'Processing', date: '2025-09-23', items: 5 },
        { id: 'ORD005', customer: 'Mike Jayasinghe', email: 'mike@email.com', total: 1680.00, status: 'Cancelled', date: '2025-09-22', items: 2 }
      ];

      const mockProducts = [
        { id: 1, name: 'Paracetamol 500mg Tablets', category: 'Pain Relief', price: 450.00, stock: 156, status: 'Active', sales: 234, rating: 4.8 },
        { id: 2, name: 'Vitamin C 1000mg', category: 'Vitamins', price: 1250.00, stock: 89, status: 'Active', sales: 187, rating: 4.7 },
        { id: 3, name: 'Antiseptic Cream 30g', category: 'First Aid', price: 285.00, stock: 67, status: 'Active', sales: 156, rating: 4.6 },
        { id: 4, name: 'Omega-3 Fish Oil', category: 'Vitamins', price: 1850.00, stock: 45, status: 'Active', sales: 123, rating: 4.9 },
        { id: 5, name: 'Face Moisturizer', category: 'Skin Care', price: 950.00, stock: 78, status: 'Active', sales: 167, rating: 4.5 },
        { id: 6, name: 'Cough Syrup 100ml', category: 'Cold & Flu', price: 385.00, stock: 12, status: 'Low Stock', sales: 89, rating: 4.4 }
      ];

      const mockCustomers = [
        { id: 1, name: 'John Silva', email: 'john@email.com', phone: '+94771234567', orders: 12, totalSpent: 15680.00, status: 'VIP', joinDate: '2024-03-15' },
        { id: 2, name: 'Mary Fernando', email: 'mary@email.com', phone: '+94712345678', orders: 8, totalSpent: 8920.00, status: 'Regular', joinDate: '2024-06-20' },
        { id: 3, name: 'David Perera', email: 'david@email.com', phone: '+94723456789', orders: 15, totalSpent: 22450.00, status: 'VIP', joinDate: '2024-01-10' },
        { id: 4, name: 'Sarah Wickrama', email: 'sarah@email.com', phone: '+94734567890', orders: 5, totalSpent: 4560.00, status: 'New', joinDate: '2025-08-01' }
      ];

      setRecentOrders(mockOrders);
      setProducts(mockProducts);
      setCustomers(mockCustomers);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load admin data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setRecentOrders(orders => 
      orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setSnackbar({
      open: true,
      message: 'Order status updated successfully',
      severity: 'success'
    });
  };

  const handleEdit = (type, item) => {
    setDialogType(type);
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (type, id) => {
    if (type === 'product') {
      setProducts(products => products.filter(p => p.id !== id));
    } else if (type === 'customer') {
      setCustomers(customers => customers.filter(c => c.id !== id));
    }
    setSnackbar({
      open: true,
      message: `${type} deleted successfully`,
      severity: 'success'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': 
      case 'active': 
      case 'vip': return '#10b981';
      case 'processing': 
      case 'regular': return '#f59e0b';
      case 'shipped': return '#3b82f6';
      case 'cancelled': 
      case 'low stock': return '#ef4444';
      case 'new': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return CheckCircleIcon;
      case 'processing': return ScheduleIcon;
      case 'shipped': return LocalShippingIcon;
      case 'cancelled': return CancelIcon;
      default: return ScheduleIcon;
    }
  };

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#1e3a8a' }}>
        Ecommerce Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sales"
            value={`Rs. ${(dashboardStats.totalSales / 1000).toFixed(1)}K`}
            icon={AttachMoneyIcon}
            trend={12.5}
            change="from last month"
            color="#10b981"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={dashboardStats.totalOrders}
            icon={ShoppingBagIcon}
            trend={8.2}
            change="from last month"
            color="#3b82f6"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Active Products"
            value={dashboardStats.activeProducts}
            icon={InventoryIcon}
            trend={5.1}
            change="from last month"
            color="#8b5cf6"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={dashboardStats.totalCustomers}
            icon={GroupIcon}
            trend={15.3}
            change="from last month"
            color="#f59e0b"
          />
        </Grid>
      </Grid>

      {/* Alert Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '2px solid #f59e0b', textAlign: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
              PENDING ORDERS
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="warning.main">
              {dashboardStats.pendingOrders}
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '2px solid #ef4444', textAlign: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
              LOW STOCK ITEMS
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="error.main">
              {dashboardStats.lowStockItems}
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '2px solid #10b981', textAlign: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
              NEW CUSTOMERS
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="success.main">
              {dashboardStats.newCustomers}
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '2px solid #3b82f6', textAlign: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
              CONVERSION RATE
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {dashboardStats.conversionRate}%
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity & Quick Stats */}
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Paper sx={{ borderRadius: '16px', p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Recent Orders
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.slice(0, 5).map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <TableRow key={order.id} hover>
                        <TableCell fontWeight="medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>Rs. {order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<StatusIcon />}
                            label={order.status}
                            sx={{
                              backgroundColor: getStatusColor(order.status),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton size="small" color="primary">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Order">
                              <IconButton size="small" color="primary" onClick={() => handleEdit('order', order)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid xs={12} md={4}>
          <Paper sx={{ borderRadius: '16px', p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Top Selling Products
            </Typography>
            <List>
              {products.slice(0, 4).map((product) => (
                <ListItem key={product.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={product.name}
                    secondary={`${product.sales} sales • Rs. ${product.price}`}
                  />
                  <Chip
                    label={product.stock}
                    size="small"
                    color={product.stock > 50 ? 'success' : product.stock > 20 ? 'warning' : 'error'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ borderRadius: '16px', p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                fullWidth
                sx={{ borderRadius: '8px' }}
                onClick={() => handleEdit('product', null)}
              >
                Add New Product
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReceiptIcon />}
                fullWidth
                sx={{ borderRadius: '8px' }}
              >
                Generate Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<NotificationsActiveIcon />}
                fullWidth
                sx={{ borderRadius: '8px' }}
              >
                Send Notifications
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );

  // Orders Management Component
  const OrdersManagement = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Order Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
                <TableCell fontWeight="bold">Email</TableCell>
                <TableCell fontWeight="bold">Items</TableCell>
                <TableCell fontWeight="bold">Total</TableCell>
                <TableCell fontWeight="bold">Status</TableCell>
                <TableCell fontWeight="bold">Date</TableCell>
                <TableCell fontWeight="bold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <TableRow key={order.id} hover>
                    <TableCell fontWeight="medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>Rs. {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          sx={{ borderRadius: '8px' }}
                        >
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
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Order">
                          <IconButton size="small" color="primary" onClick={() => handleEdit('order', order)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Order">
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );

  // Products Management Component
  const ProductsManagement = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Product Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<CategoryIcon />} sx={{ borderRadius: '10px' }}>
            Categories
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleEdit('product', null)}
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
                <TableCell fontWeight="bold">Sales</TableCell>
                <TableCell fontWeight="bold">Rating</TableCell>
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
                  <TableCell>Rs. {product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.stock}
                      color={product.stock < 30 ? 'error' : product.stock < 50 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{product.sales}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StarRateIcon sx={{ color: '#fbbf24', fontSize: 16 }} />
                      <Typography variant="body2">{product.rating}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.status === 'Active'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Product">
                        <IconButton size="small" color="primary" onClick={() => handleEdit('product', product)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton size="small" color="error" onClick={() => handleDelete('product', product.id)}>
                          <DeleteIcon />
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
      <Box display="flex" justifyContent="between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Customer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
                <TableCell fontWeight="bold">Phone</TableCell>
                <TableCell fontWeight="bold">Orders</TableCell>
                <TableCell fontWeight="bold">Total Spent</TableCell>
                <TableCell fontWeight="bold">Status</TableCell>
                <TableCell fontWeight="bold">Join Date</TableCell>
                <TableCell fontWeight="bold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: getStatusColor(customer.status) }}>
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography fontWeight="medium">{customer.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>Rs. {customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={customer.status}
                      sx={{
                        backgroundColor: getStatusColor(customer.status),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{customer.joinDate}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Profile">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Customer">
                        <IconButton size="small" color="primary" onClick={() => handleEdit('customer', customer)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Customer">
                        <IconButton size="small" color="error" onClick={() => handleDelete('customer', customer.id)}>
                          <DeleteIcon />
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

  const menuItems = [
    { label: 'Dashboard', icon: DashboardIcon, value: 0 },
    { label: 'Orders', icon: ShoppingCartIcon, value: 1 },
    { label: 'Products', icon: InventoryIcon, value: 2 },
    { label: 'Customers', icon: PeopleIcon, value: 3 },
    { label: 'Payments', icon: PaymentIcon, value: 4 },
    { label: 'Analytics', icon: AssessmentIcon, value: 5 },
    { label: 'Settings', icon: SettingsIcon, value: 6 }
  ];

  // Payments Management Component
  const PaymentsManagement = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        💳 Payment Management
      </Typography>
      
      <Grid container spacing={3}>
        {/* Payment Stats */}
        <Grid xs={12} md={3}>
          <Card sx={{ p: 3, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Rs. 125,450
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue (Today)
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 3, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              248
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Successful Payments
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 3, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              12
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Payments
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 3, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Failed Payments
            </Typography>
          </Card>
        </Grid>

        {/* Recent Payments Table */}
        <Grid xs={12}>
          <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Payments
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell fontWeight="bold">Payment ID</TableCell>
                    <TableCell fontWeight="bold">Customer</TableCell>
                    <TableCell fontWeight="bold">Amount</TableCell>
                    <TableCell fontWeight="bold">Method</TableCell>
                    <TableCell fontWeight="bold">Status</TableCell>
                    <TableCell fontWeight="bold">Date</TableCell>
                    <TableCell fontWeight="bold">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { id: 'PAY001', customer: 'John Silva', amount: 2850, method: 'Card', status: 'Completed', date: '2025-09-26' },
                    { id: 'PAY002', customer: 'Mary Fernando', amount: 1450, method: 'Bank Transfer', status: 'Pending', date: '2025-09-26' },
                    { id: 'PAY003', customer: 'David Perera', amount: 3200, method: 'Cash on Delivery', status: 'Completed', date: '2025-09-25' },
                    { id: 'PAY004', customer: 'Priya Wickrama', amount: 1850, method: 'eZ Cash', status: 'Failed', date: '2025-09-25' },
                    { id: 'PAY005', customer: 'Nimal Rajapaksa', amount: 4200, method: 'Card', status: 'Completed', date: '2025-09-25' }
                  ].map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell fontWeight="medium">{payment.id}</TableCell>
                      <TableCell>{payment.customer}</TableCell>
                      <TableCell fontWeight="bold">Rs. {payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.method} 
                          size="small"
                          sx={{ 
                            backgroundColor: payment.method === 'Card' ? '#e3f2fd' : 
                                           payment.method === 'Bank Transfer' ? '#f3e5f5' :
                                           payment.method === 'Cash on Delivery' ? '#fff3e0' : '#e8f5e8',
                            color: payment.method === 'Card' ? '#1976d2' : 
                                   payment.method === 'Bank Transfer' ? '#7b1fa2' :
                                   payment.method === 'Cash on Delivery' ? '#f57c00' : '#388e3c'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.status} 
                          size="small"
                          color={payment.status === 'Completed' ? 'success' : 
                                 payment.status === 'Pending' ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton size="small" color="primary">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );

  const getTabContent = (tab) => {
    switch (tab) {
      case 0:
        return <DashboardOverview />;
      case 1:
        return <OrdersManagement />;
      case 2:
        return <ProductsManagement />;
      case 3:
        return <CustomersManagement />;
      case 4:
        return <PaymentsManagement />;
      case 5:
        return <DashboardOverview />; // Analytics placeholder
      case 6:
        return <DashboardOverview />; // Settings placeholder
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            borderRight: 'none',
            backgroundColor: 'white',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} sx={{ mb: 4 }}>
            <StoreIcon sx={{ fontSize: 32, color: '#1e3a8a' }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
              Pharmacy Admin
            </Typography>
          </Box>

          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.value}
                component="button"
                onClick={() => setActiveTab(item.value)}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  backgroundColor: activeTab === item.value ? '#1e3a8a' : 'transparent',
                  color: activeTab === item.value ? 'white' : '#6b7280',
                  '&:hover': {
                    backgroundColor: activeTab === item.value ? '#1e40af' : '#f3f4f6'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280 }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} sx={{ mb: 4 }}>
            <StoreIcon sx={{ fontSize: 32, color: '#1e3a8a' }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
              Pharmacy Admin
            </Typography>
          </Box>

          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.value}
                component="button"
                onClick={() => {
                  setActiveTab(item.value);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  backgroundColor: activeTab === item.value ? '#1e3a8a' : 'transparent',
                  color: activeTab === item.value ? 'white' : '#6b7280'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, ml: { md: '280px' } }}>
        {/* Mobile Header */}
        <AppBar
          position="sticky"
          sx={{
            display: { md: 'none' },
            backgroundColor: 'white',
            color: '#1e3a8a',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
              Pharmacy Admin
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Tab Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: '50vh' }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          getTabContent(activeTab)
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfessionalEcommerceAdmin;


