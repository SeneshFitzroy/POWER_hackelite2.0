import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Badge,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Switch,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  Assessment,
  Receipt,
  People,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  AccountBalance,
  ArrowUpward,
  ArrowDownward,
  Warning,
  CheckCircle,
  Schedule,
  NotificationsActive,
  Business,
  Payment,
  Add,
  Download,
  Print,
  DateRange,
  Block,
  Delete,
  PersonOff,
  PaymentsOutlined,
  Close,
  Edit
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Finance({ dateFilter }) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [salesTrendData, setSalesTrendData] = useState([]);
  const [financialMetrics, setFinancialMetrics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashBalance: 0
  });
  
  // New state for enhanced functionality
  const [showAddBillDialog, setShowAddBillDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newBill, setNewBill] = useState({
    supplier: '',
    amount: '',
    dueDate: '',
    description: '',
    status: 'pending'
  });
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    baseSalary: '',
    email: '',
    paymentBlocked: false,
    status: 'active'
  });

  useEffect(() => {
    loadFinancialData();
  }, [dateFilter]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Load sales orders data
      const salesQuery = query(
        collection(db, 'salesOrders'),
        orderBy('createdAt', 'desc')
      );
      const salesSnapshot = await getDocs(salesQuery);
      const salesOrders = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Load customers data for revenue calculation
      const customersQuery = query(collection(db, 'customers'));
      const customersSnapshot = await getDocs(customersQuery);
      const customers = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate financial metrics from real data
      const totalRevenue = salesOrders.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);

      const totalExpenses = totalRevenue * 0.65; // Estimate expenses as 65% of revenue
      const netProfit = totalRevenue - totalExpenses;
      const cashBalance = netProfit * 1.8; // Estimate cash balance

      setFinancialMetrics({
        totalRevenue,
        totalExpenses,
        netProfit,
        cashBalance
      });

      // Process sales data for charts
      const salesByMonth = processSalesDataByMonth(salesOrders);
      setSalesData(salesByMonth);
      setSalesTrendData(salesByMonth);

      // Set sample employee data with enhanced properties
      setEmployeesData([
        {
          id: 'EMP-001',
          name: 'John Silva',
          position: 'Pharmacist',
          baseSalary: 75000,
          netSalary: 67500,
          email: 'john.silva@example.com',
          status: 'pending',
          paymentStatus: 'pending',
          paymentBlocked: false,
          lastPaid: null
        },
        {
          id: 'EMP-002',
          name: 'Sarah Fernando',
          position: 'Sales Assistant',
          baseSalary: 45000,
          netSalary: 40500,
          email: 'sarah.fernando@example.com',
          status: 'pending',
          paymentStatus: 'pending',
          paymentBlocked: false,
          lastPaid: null
        },
        {
          id: 'EMP-003',
          name: 'Mike Perera',
          position: 'Store Manager',
          baseSalary: 65000,
          netSalary: 58500,
          email: 'mike.perera@example.com',
          status: 'paid',
          paymentStatus: 'paid',
          paymentBlocked: false,
          lastPaid: new Date()
        },
        {
          id: 'EMP-004',
          name: 'Lisa Jayasinghe',
          position: 'Accountant',
          baseSalary: 55000,
          netSalary: 49500,
          email: 'lisa.jayasinghe@example.com',
          status: 'resigned',
          paymentStatus: 'blocked',
          paymentBlocked: true,
          lastPaid: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      ]);

      setSuppliersData([
        {
          id: 'SUP-001',
          supplier: 'Medical Supplies Ltd',
          amount: Math.floor(totalRevenue * 0.3),
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          daysOverdue: 0
        },
        {
          id: 'SUP-002',
          supplier: 'Pharmacy Equipment Co',
          amount: Math.floor(totalRevenue * 0.15),
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'overdue',
          daysOverdue: 5
        }
      ]);

    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSalesDataByMonth = (salesOrders) => {
    const monthData = {};
    
    salesOrders.forEach(order => {
      if (order.createdAt) {
        const month = order.createdAt.toLocaleDateString('en-US', { month: 'short' });
        const year = order.createdAt.getFullYear();
        const key = `${month} ${year}`;
        
        if (!monthData[key]) {
          monthData[key] = { month: key, sales: 0, expenses: 0, profit: 0 };
        }
        
        monthData[key].sales += order.totalAmount || 0;
        monthData[key].expenses += (order.totalAmount || 0) * 0.65;
        monthData[key].profit = monthData[key].sales - monthData[key].expenses;
      }
    });

    return Object.values(monthData).slice(-6); // Last 6 months
  };

  // PayPal Sandbox Integration
  const processPayPalPayment = async (amount, recipient, type = 'employee') => {
    try {
      setPaymentProcessing(true);
      
      // Simulate PayPal API call (in real implementation, this would be actual PayPal API)
      const paymentData = {
        amount: amount,
        currency: 'LKR',
        recipient: recipient,
        type: type,
        timestamp: new Date().toISOString(),
        paypal_transaction_id: `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, you would make actual PayPal API call here
      console.log('PayPal Payment Processed:', paymentData);
      
      return paymentData;
    } catch (error) {
      console.error('PayPal payment failed:', error);
      throw error;
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Pay individual employee
  const handlePayEmployee = async (employee) => {
    if (employee.paymentBlocked) {
      setSnackbar({
        open: true,
        message: `Payment blocked for ${employee.name}. Cannot process payment.`,
        severity: 'error'
      });
      return;
    }

    try {
      const paymentResult = await processPayPalPayment(
        employee.netSalary,
        employee.email,
        'employee'
      );

      // Update employee status
      setEmployeesData(prev => prev.map(emp => 
        emp.id === employee.id 
          ? { ...emp, status: 'paid', paymentStatus: 'paid', lastPaid: new Date() }
          : emp
      ));

      setSnackbar({
        open: true,
        message: `Payment of LKR ${employee.netSalary.toLocaleString()} successfully sent to ${employee.name} via PayPal`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to process payment for ${employee.name}`,
        severity: 'error'
      });
    }
  };

  // Pay all selected employees in bulk
  const handlePayAllEmployees = async () => {
    const employeesToPay = selectedEmployees.length > 0 
      ? employeesData.filter(emp => selectedEmployees.includes(emp.id))
      : employeesData.filter(emp => emp.status === 'pending' && !emp.paymentBlocked);

    if (employeesToPay.length === 0) {
      setSnackbar({
        open: true,
        message: 'No employees eligible for payment',
        severity: 'warning'
      });
      return;
    }

    const totalAmount = employeesToPay.reduce((sum, emp) => sum + emp.netSalary, 0);
    
    if (window.confirm(`Process bulk payment of LKR ${totalAmount.toLocaleString()} for ${employeesToPay.length} employees?`)) {
      try {
        setPaymentProcessing(true);
        
        // Process payments in parallel
        const paymentPromises = employeesToPay.map(emp => 
          processPayPalPayment(emp.netSalary, emp.email, 'employee')
        );
        
        await Promise.all(paymentPromises);

        // Update all employee statuses
        setEmployeesData(prev => prev.map(emp => 
          employeesToPay.find(e => e.id === emp.id)
            ? { ...emp, status: 'paid', paymentStatus: 'paid', lastPaid: new Date() }
            : emp
        ));

        setSelectedEmployees([]);
        setSnackbar({
          open: true,
          message: `Bulk payment successful! LKR ${totalAmount.toLocaleString()} paid to ${employeesToPay.length} employees`,
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Bulk payment failed. Please try again.',
          severity: 'error'
        });
      }
    }
  };

  // Block/Unblock employee payment
  const handleTogglePaymentBlock = (employeeId) => {
    setEmployeesData(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, paymentBlocked: !emp.paymentBlocked }
        : emp
    ));
    
    const employee = employeesData.find(emp => emp.id === employeeId);
    setSnackbar({
      open: true,
      message: `Payment ${employee.paymentBlocked ? 'unblocked' : 'blocked'} for ${employee.name}`,
      severity: 'info'
    });
  };

  // Remove employee (soft delete)
  const handleRemoveEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      setEmployeesData(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, status: 'resigned', paymentBlocked: true }
          : emp
      ));
      
      const employee = employeesData.find(emp => emp.id === employeeId);
      setSnackbar({
        open: true,
        message: `${employee.name} has been marked as resigned`,
        severity: 'info'
      });
    }
  };

  // Pay supplier bill
  const handlePaySupplier = async (bill) => {
    try {
      const paymentResult = await processPayPalPayment(
        bill.amount,
        `${bill.supplier.toLowerCase().replace(/\s+/g, '')}@company.com`,
        'supplier'
      );

      // Update bill status
      setSuppliersData(prev => prev.map(b => 
        b.id === bill.id 
          ? { ...b, status: 'paid', paidAt: new Date() }
          : b
      ));

      setSnackbar({
        open: true,
        message: `Payment of LKR ${bill.amount.toLocaleString()} successfully sent to ${bill.supplier} via PayPal`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to process payment to ${bill.supplier}`,
        severity: 'error'
      });
    }
  };

  // Add new bill
  const handleAddBill = () => {
    if (!newBill.supplier || !newBill.amount || !newBill.dueDate) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    const bill = {
      id: `BILL-${Date.now()}`,
      supplier: newBill.supplier,
      amount: parseFloat(newBill.amount),
      dueDate: newBill.dueDate,
      description: newBill.description,
      status: 'pending',
      daysOverdue: 0,
      createdAt: new Date()
    };

    setSuppliersData(prev => [...prev, bill]);
    setNewBill({ supplier: '', amount: '', dueDate: '', description: '', status: 'pending' });
    setShowAddBillDialog(false);
    
    setSnackbar({
      open: true,
      message: `Bill for ${bill.supplier} added successfully`,
      severity: 'success'
    });
  };

  // Handle employee selection for bulk operations
  const handleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAllEmployees = () => {
    const eligibleEmployees = employeesData.filter(emp => emp.status === 'pending' && !emp.paymentBlocked);
    setSelectedEmployees(
      selectedEmployees.length === eligibleEmployees.length 
        ? [] 
        : eligibleEmployees.map(emp => emp.id)
    );
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#64748b';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          {payload.map((item, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: item.color, fontSize: '12px' }}
            >
              {item.name}: LKR {item.value?.toLocaleString()}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(financialMetrics.totalRevenue),
      change: '+12.5%',
      trend: 'up',
      icon: <AttachMoney />,
      color: '#10b981'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(financialMetrics.totalExpenses),
      change: '+8.2%',
      trend: 'up',
      icon: <Receipt />,
      color: '#ef4444'
    },
    {
      title: 'Net Profit',
      value: formatCurrency(financialMetrics.netProfit),
      change: '+18.7%',
      trend: 'up',
      icon: <TrendingUp />,
      color: '#1e3a8a'
    },
    {
      title: 'Cash Balance',
      value: formatCurrency(financialMetrics.cashBalance),
      change: '+5.4%',
      trend: 'up',
      icon: <AccountBalance />,
      color: '#8b5cf6'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#1e3a8a' }} />
      </Box>
    );
  }

  const renderDashboard = () => (
    <Box>
      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: `${metric.color}15`,
                      borderRadius: '12px',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Box sx={{ color: metric.color, display: 'flex' }}>
                      {metric.icon}
                    </Box>
                  </Box>
                  <Chip
                    icon={metric.trend === 'up' ? <ArrowUpward sx={{ fontSize: '14px' }} /> : <ArrowDownward sx={{ fontSize: '14px' }} />}
                    label={metric.change}
                    size="small"
                    sx={{
                      backgroundColor: metric.trend === 'up' ? '#dcfce7' : '#fee2e2',
                      color: metric.trend === 'up' ? '#166534' : '#dc2626',
                      fontWeight: 'bold',
                      fontSize: '11px'
                    }}
                  />
                </Box>
                
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1e293b',
                    mb: 1,
                    fontSize: '28px'
                  }}
                >
                  {metric.value}
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontWeight: 'medium'
                  }}
                >
                  {metric.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales vs Expenses Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#1e293b',
                mb: 3
              }}
            >
              Sales vs Expenses Trend
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `LKR ${(value/1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#1e3a8a"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                  name="Sales"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#expensesGradient)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Financial Reports Summary */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: '#1e293b'
                }}
              >
                Quick Reports
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<Assessment />}
                  variant="outlined"
                  sx={{ 
                    color: '#1e3a8a',
                    borderColor: '#1e3a8a',
                    '&:hover': {
                      backgroundColor: '#e3f2fd'
                    }
                  }}
                >
                  View Reports
                </Button>
                <Button
                  size="small"
                  startIcon={<Download />}
                  sx={{ color: '#1e3a8a' }}
                >
                  Export
                </Button>
              </Box>
            </Box>

            {/* P&L Summary */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1e3a8a' }}>
                Profit & Loss (Current Month)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Revenue:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                  {formatCurrency(financialMetrics.totalRevenue)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Expenses:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                  {formatCurrency(financialMetrics.totalExpenses)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Net Income:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                  {formatCurrency(financialMetrics.totalRevenue - financialMetrics.totalExpenses)}
                </Typography>
              </Box>
            </Box>

            {/* Cash Flow Chart */}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
              Cash Flow Trend
            </Typography>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={salesTrendData}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value) => [`LKR ${value.toLocaleString()}`, '']}
                  labelStyle={{ color: '#1e3a8a' }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#10b981" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderBills = () => (
    <Box>
      {/* Bills Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              borderRadius: '16px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Overdue Bills
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(suppliersData.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0))}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {suppliersData.filter(b => b.status === 'overdue').length} bills overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: '16px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Pending Payments
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(suppliersData.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0))}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {suppliersData.filter(b => b.status === 'pending').length} bills pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
              color: 'white',
              borderRadius: '16px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Balance Sheet
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(financialMetrics.cashBalance + financialMetrics.totalRevenue)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Assets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bills Table */}
      <Paper
        sx={{
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
              Supplier Bills & Payment Reminders
            </Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => setShowAddBillDialog(true)}
              sx={{
                backgroundColor: '#1e3a8a',
                '&:hover': { backgroundColor: '#1e40af' }
              }}
            >
              Add Bill
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliersData.map((bill) => (
                <TableRow key={bill.id} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Business sx={{ fontSize: '16px', color: '#64748b', mr: 1 }} />
                      {bill.supplier}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(bill.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(bill.dueDate).toLocaleDateString('en-IN')}
                    </Typography>
                    {bill.status === 'overdue' && (
                      <Typography variant="caption" sx={{ color: '#ef4444' }}>
                        {bill.daysOverdue} days overdue
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bill.status.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(bill.status)}15`,
                        color: getStatusColor(bill.status),
                        fontWeight: 'bold',
                        fontSize: '11px'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Payment />}
                      variant="outlined"
                      onClick={() => handlePaySupplier(bill)}
                      disabled={paymentProcessing || bill.status === 'paid'}
                      sx={{
                        borderColor: '#1e3a8a',
                        color: '#1e3a8a',
                        fontSize: '12px'
                      }}
                    >
                      {bill.status === 'paid' ? 'Paid' : 'Pay via PayPal'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderPayroll = () => (
    <Box>
      {/* Payroll Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
              color: 'white',
              borderRadius: '16px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Total Employees
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {employeesData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '16px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Total Gross Pay
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(employeesData.reduce((sum, emp) => sum + emp.salary, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              borderRadius: '16px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Net Payable
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(employeesData.reduce((sum, emp) => sum + emp.salary, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: '16px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Pending Payments
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {employeesData.filter(emp => emp.paymentStatus === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Table */}
      <Paper
        sx={{
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
              Employee Payroll Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                startIcon={<PaymentsOutlined />}
                variant="contained"
                onClick={handlePayAllEmployees}
                disabled={paymentProcessing || employeesData.filter(emp => emp.status === 'pending' && !emp.paymentBlocked).length === 0}
                sx={{
                  backgroundColor: '#10b981',
                  '&:hover': { backgroundColor: '#059669' }
                }}
              >
                {paymentProcessing ? 'Processing...' : `Pay All (${employeesData.filter(emp => emp.status === 'pending' && !emp.paymentBlocked).length})`}
              </Button>
              <Button
                startIcon={<Add />}
                variant="contained"
                onClick={() => setShowEmployeeDialog(true)}
                sx={{
                  backgroundColor: '#1e3a8a',
                  '&:hover': { backgroundColor: '#1e40af' }
                }}
              >
                Add Employee
              </Button>
            </Box>
          </Box>
          
          {selectedEmployees.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {selectedEmployees.length} employee(s) selected for bulk payment. 
              Total: LKR {employeesData.filter(emp => selectedEmployees.includes(emp.id)).reduce((sum, emp) => sum + emp.netSalary, 0).toLocaleString()}
            </Alert>
          )}
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                  <Checkbox
                    checked={selectedEmployees.length === employeesData.filter(emp => emp.status === 'pending' && !emp.paymentBlocked).length && employeesData.filter(emp => emp.status === 'pending' && !emp.paymentBlocked).length > 0}
                    indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < employeesData.filter(emp => emp.status === 'pending' && !emp.paymentBlocked).length}
                    onChange={handleSelectAllEmployees}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Base Salary</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Net Salary</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employeesData.map((employee) => (
                <TableRow key={employee.id} sx={{ 
                  '&:hover': { backgroundColor: '#f8fafc' },
                  opacity: employee.status === 'resigned' ? 0.6 : 1
                }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleEmployeeSelection(employee.id)}
                      disabled={employee.status !== 'pending' || employee.paymentBlocked}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 2,
                          backgroundColor: employee.status === 'resigned' ? '#64748b' : '#1e3a8a',
                          fontSize: '12px'
                        }}
                      >
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {employee.name}
                          {employee.paymentBlocked && (
                            <Block sx={{ fontSize: '16px', color: '#ef4444', ml: 1, verticalAlign: 'middle' }} />
                          )}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {employee.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency(employee.baseSalary)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                      {formatCurrency(employee.netSalary)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Chip
                        label={employee.status.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(employee.status)}15`,
                          color: getStatusColor(employee.status),
                          fontWeight: 'bold',
                          fontSize: '11px'
                        }}
                      />
                      {employee.paymentBlocked && (
                        <Chip
                          label="BLOCKED"
                          size="small"
                          sx={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            fontWeight: 'bold',
                            fontSize: '10px'
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {employee.status === 'pending' && !employee.paymentBlocked && (
                        <Button
                          size="small"
                          startIcon={<Payment />}
                          variant="outlined"
                          onClick={() => handlePayEmployee(employee)}
                          disabled={paymentProcessing}
                          sx={{
                            borderColor: '#1e3a8a',
                            color: '#1e3a8a',
                            fontSize: '12px'
                          }}
                        >
                          Pay via PayPal
                        </Button>
                      )}
                      
                      {employee.status !== 'resigned' && (
                        <Tooltip title={employee.paymentBlocked ? 'Unblock Payment' : 'Block Payment'}>
                          <IconButton
                            size="small"
                            onClick={() => handleTogglePaymentBlock(employee.id)}
                            sx={{ color: employee.paymentBlocked ? '#10b981' : '#ef4444' }}
                          >
                            {employee.paymentBlocked ? <CheckCircle /> : <Block />}
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Remove Employee">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveEmployee(employee.id)}
                          sx={{ color: '#ef4444' }}
                          disabled={employee.status === 'resigned'}
                        >
                          <PersonOff />
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
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Horizontal Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '16px',
              color: '#64748b',
              '&.Mui-selected': {
                color: '#1e3a8a',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1e3a8a',
              height: 3
            }
          }}
        >
          <Tab 
            label="Dashboard" 
            icon={<Dashboard />} 
            iconPosition="start"
            sx={{ mr: 2 }}
          />
          <Tab 
            label="Bills & Payments" 
            icon={<Receipt />} 
            iconPosition="start"
            sx={{ mr: 2 }}
          />
          <Tab 
            label="Payroll" 
            icon={<People />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {renderDashboard()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderBills()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderPayroll()}
      </TabPanel>

      {/* Add Bill Dialog */}
      <Dialog 
        open={showAddBillDialog} 
        onClose={() => setShowAddBillDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#1e3a8a', color: 'white', fontWeight: 'bold' }}>
          Add New Bill
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Supplier Name *"
                value={newBill.supplier}
                onChange={(e) => setNewBill({ ...newBill, supplier: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount (LKR) *"
                type="number"
                value={newBill.amount}
                onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date *"
                type="date"
                value={newBill.dueDate}
                onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newBill.description}
                onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowAddBillDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddBill}
            sx={{
              backgroundColor: '#1e3a8a',
              '&:hover': { backgroundColor: '#1e40af' }
            }}
          >
            Add Bill
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog 
        open={showEmployeeDialog} 
        onClose={() => setShowEmployeeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#1e3a8a', color: 'white', fontWeight: 'bold' }}>
          Add New Employee
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee Name *"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position *"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Salary (LKR) *"
                type="number"
                value={newEmployee.baseSalary}
                onChange={(e) => setNewEmployee({ ...newEmployee, baseSalary: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newEmployee.paymentBlocked}
                    onChange={(e) => setNewEmployee({ ...newEmployee, paymentBlocked: e.target.checked })}
                  />
                }
                label="Block Payments"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowEmployeeDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Add employee logic here
              const employee = {
                id: `EMP-${Date.now()}`,
                name: newEmployee.name,
                position: newEmployee.position,
                baseSalary: parseFloat(newEmployee.baseSalary),
                netSalary: parseFloat(newEmployee.baseSalary) * 0.9, // 10% deduction for taxes
                email: newEmployee.email,
                status: 'pending',
                paymentStatus: 'pending',
                paymentBlocked: newEmployee.paymentBlocked,
                lastPaid: null
              };
              
              setEmployeesData(prev => [...prev, employee]);
              setNewEmployee({ name: '', position: '', baseSalary: '', email: '', paymentBlocked: false, status: 'active' });
              setShowEmployeeDialog(false);
              
              setSnackbar({
                open: true,
                message: `Employee ${employee.name} added successfully`,
                severity: 'success'
              });
            }}
            sx={{
              backgroundColor: '#1e3a8a',
              '&:hover': { backgroundColor: '#1e40af' }
            }}
          >
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
