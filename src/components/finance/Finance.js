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
  CircularProgress
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
  DateRange
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

      // Set other data
      setEmployeesData([
        {
          id: 'EMP-001',
          name: 'System Admin',
          email: 'admin@coreerp.com',
          department: 'Administration',
          position: 'Administrator',
          salary: 50000,
          baseSalary: 50000,
          netSalary: 45000,
          joinDate: new Date('2024-01-15').toISOString(),
          paymentStatus: 'paid',
          status: 'paid'
        },
        {
          id: 'EMP-002',
          name: 'John Doe',
          email: 'john@coreerp.com',
          department: 'Pharmacy',
          position: 'Pharmacist',
          salary: 45000,
          baseSalary: 45000,
          netSalary: 40500,
          joinDate: new Date('2024-02-01').toISOString(),
          paymentStatus: 'pending',
          status: 'pending'
        },
        {
          id: 'EMP-003',
          name: 'Jane Smith',
          email: 'jane@coreerp.com',
          department: 'Sales',
          position: 'Sales Manager',
          salary: 40000,
          baseSalary: 40000,
          netSalary: 36000,
          joinDate: new Date('2024-03-01').toISOString(),
          paymentStatus: 'paid',
          status: 'paid'
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

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
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
              {item.name}: ₹{item.value?.toLocaleString()}
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
                  tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
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
              <Button
                size="small"
                startIcon={<Download />}
                sx={{ color: '#1e3a8a' }}
              >
                Export
              </Button>
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
                  formatter={(value) => [`₹${value.toLocaleString()}`, '']}
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

        <Grid size={{ xs: 12, md: 4 }}>
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

        <Grid size={{ xs: 12, md: 4 }}>
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
                      sx={{
                        borderColor: '#1e3a8a',
                        color: '#1e3a8a',
                        fontSize: '12px'
                      }}
                    >
                      Pay Now
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
        <Grid size={{ xs: 12, md: 3 }}>
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

        <Grid size={{ xs: 12, md: 3 }}>
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

        <Grid size={{ xs: 12, md: 3 }}>
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

        <Grid size={{ xs: 12, md: 3 }}>
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
            <Button
              startIcon={<Add />}
              variant="contained"
              sx={{
                backgroundColor: '#1e3a8a',
                '&:hover': { backgroundColor: '#1e40af' }
              }}
            >
              Process Payroll
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
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
                <TableRow key={employee.id} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 2,
                          backgroundColor: '#1e3a8a',
                          fontSize: '12px'
                        }}
                      >
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {employee.name}
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
                  </TableCell>
                  <TableCell>
                    {employee.status !== 'paid' && (
                      <Button
                        size="small"
                        startIcon={<Payment />}
                        variant="outlined"
                        sx={{
                          borderColor: '#1e3a8a',
                          color: '#1e3a8a',
                          fontSize: '12px'
                        }}
                      >
                        Pay
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderReports = () => (
    <Box>
      <Grid container spacing={3}>
        {/* Financial Reports Summary */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              height: '100%'
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
              Profit & Loss Statement
            </Typography>

            {/* P&L Detailed */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, backgroundColor: '#f0fdf4', borderRadius: '8px', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#15803d' }}>
                    Revenue
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Sales Revenue:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(financialMetrics.totalRevenue)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Other Income:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(0)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total Revenue:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#15803d' }}>
                      {formatCurrency(financialMetrics.totalRevenue)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, backgroundColor: '#fef2f2', borderRadius: '8px', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#dc2626' }}>
                    Expenses
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Operating Expenses:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(financialMetrics.totalExpenses)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Payroll:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(employeesData.reduce((sum, emp) => sum + emp.salary, 0))}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total Expenses:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                      {formatCurrency(financialMetrics.totalExpenses + employeesData.reduce((sum, emp) => sum + emp.salary, 0))}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Net Income */}
            <Box sx={{ p: 2, backgroundColor: '#eff6ff', borderRadius: '8px', mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e40af' }}>
                  Net Income:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e40af' }}>
                  {formatCurrency(financialMetrics.totalRevenue - (financialMetrics.totalExpenses + employeesData.reduce((sum, emp) => sum + emp.salary, 0)))}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Balance Sheet */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              height: '100%'
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
              Balance Sheet Summary
            </Typography>

            {/* Assets */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                Assets
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Cash & Bank:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(financialMetrics.cashBalance)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Accounts Receivable:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(financialMetrics.totalRevenue * 0.1)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total Assets:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                  {formatCurrency(financialMetrics.cashBalance + (financialMetrics.totalRevenue * 0.1))}
                </Typography>
              </Box>
            </Box>

            {/* Liabilities */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#dc2626' }}>
                Liabilities
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Accounts Payable:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(suppliersData.reduce((sum, bill) => sum + bill.amount, 0))}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Accrued Expenses:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(employeesData.filter(emp => emp.paymentStatus === 'pending').reduce((sum, emp) => sum + emp.salary, 0))}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total Liabilities:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                  {formatCurrency(suppliersData.reduce((sum, bill) => sum + bill.amount, 0) + 
                    employeesData.filter(emp => emp.paymentStatus === 'pending').reduce((sum, emp) => sum + emp.salary, 0))}
                </Typography>
              </Box>
            </Box>

            {/* Equity */}
            <Box sx={{ p: 2, backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#15803d' }}>
                Owner's Equity
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Net Worth:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#15803d' }}>
                  {formatCurrency((financialMetrics.cashBalance + (financialMetrics.totalRevenue * 0.1)) - 
                    (suppliersData.reduce((sum, bill) => sum + bill.amount, 0) + 
                    employeesData.filter(emp => emp.paymentStatus === 'pending').reduce((sum, emp) => sum + emp.salary, 0)))}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e3a8a', mb: 1 }}>
          Finance Module
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Comprehensive financial management and analytics
        </Typography>
      </Box>

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
            sx={{ mr: 2 }}
          />
          <Tab 
            label="Financial Reports" 
            icon={<BarChart />} 
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
      <TabPanel value={activeTab} index={3}>
        {renderReports()}
      </TabPanel>
    </Box>
  );
}
