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

  const sidebarWidth = 260;

  const navigationItems = [
    { label: 'Dashboard', icon: <Dashboard />, index: 0 },
    { label: 'Bills & Payments', icon: <Receipt />, index: 1 },
    { label: 'Payroll', icon: <People />, index: 2 }
  ];

  // Sample data for dashboard
  const salesData = [
    { month: 'Jan', sales: 85000, expenses: 45000, profit: 40000 },
    { month: 'Feb', sales: 92000, expenses: 48000, profit: 44000 },
    { month: 'Mar', sales: 78000, expenses: 52000, profit: 26000 },
    { month: 'Apr', sales: 105000, expenses: 55000, profit: 50000 },
    { month: 'May', sales: 110000, expenses: 58000, profit: 52000 },
    { month: 'Jun', sales: 125000, expenses: 62000, profit: 63000 }
  ];

  const metrics = [
    {
      title: 'Total Revenue',
      value: '₹595,000',
      change: '+12.5%',
      trend: 'up',
      icon: <AttachMoney />,
      color: '#10b981'
    },
    {
      title: 'Total Expenses',
      value: '₹320,000',
      change: '+8.2%',
      trend: 'up',
      icon: <Receipt />,
      color: '#ef4444'
    },
    {
      title: 'Net Profit',
      value: '₹275,000',
      change: '+18.7%',
      trend: 'up',
      icon: <TrendingUp />,
      color: '#1e3a8a'
    },
    {
      title: 'Cash Balance',
      value: '₹485,000',
      change: '+5.4%',
      trend: 'up',
      icon: <AccountBalance />,
      color: '#8b5cf6'
    }
  ];

  // Sample data for bills
  const supplierBills = [
    {
      id: 'BILL-001',
      supplier: 'MedSupply Corp',
      amount: 125000,
      dueDate: '2024-09-15',
      status: 'overdue',
      daysOverdue: 2
    },
    {
      id: 'BILL-002',
      supplier: 'PharmaTech Ltd',
      amount: 85000,
      dueDate: '2024-09-20',
      status: 'pending',
      daysOverdue: 0
    },
    {
      id: 'BILL-003',
      supplier: 'Office Solutions',
      amount: 15000,
      dueDate: '2024-09-25',
      status: 'pending',
      daysOverdue: 0
    }
  ];

  // Sample payroll data
  const employees = [
    {
      id: 'EMP-001',
      name: 'Dr. Sarah Johnson',
      position: 'Senior Pharmacist',
      baseSalary: 85000,
      netSalary: 91500,
      status: 'paid'
    },
    {
      id: 'EMP-002',
      name: 'Mike Chen',
      position: 'Sales Manager',
      baseSalary: 65000,
      netSalary: 70500,
      status: 'pending'
    },
    {
      id: 'EMP-003',
      name: 'Emily Davis',
      position: 'Inventory Manager',
      baseSalary: 55000,
      netSalary: 57500,
      status: 'paid'
    }
  ];

  // P&L Data
  const profitLossData = {
    revenue: {
      sales: 595000,
      serviceRevenue: 85000,
      total: 680000
    },
    expenses: {
      costOfGoodsSold: 298000,
      salaries: 125000,
      rent: 35000,
      utilities: 28000,
      total: 486000
    },
    netIncome: 194000
  };

  // Cash Flow Data
  const cashFlowData = [
    { month: 'Jun', inflow: 580000, outflow: 420000, net: 160000 },
    { month: 'Jul', inflow: 620000, outflow: 450000, net: 170000 },
    { month: 'Aug', inflow: 595000, outflow: 430000, net: 165000 },
    { month: 'Sep', inflow: 680000, outflow: 486000, net: 194000 }
  ];

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
                  {formatCurrency(profitLossData.revenue.total)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Expenses:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                  {formatCurrency(profitLossData.expenses.total)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Net Income:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                  {formatCurrency(profitLossData.netIncome)}
                </Typography>
              </Box>
            </Box>

            {/* Cash Flow Chart */}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
              Cash Flow Trend
            </Typography>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={cashFlowData}>
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
                  dataKey="net" 
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
                {formatCurrency(supplierBills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0))}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {supplierBills.filter(b => b.status === 'overdue').length} bills overdue
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
                {formatCurrency(supplierBills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0))}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {supplierBills.filter(b => b.status === 'pending').length} bills pending
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
                ₹1,380,000
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
              {supplierBills.map((bill) => (
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
                {employees.length}
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
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.baseSalary, 0))}
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
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.netSalary, 0))}
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
                {employees.filter(emp => emp.status === 'pending').length}
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
              {employees.map((employee) => (
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

  return (
    <Box sx={{ display: 'flex', minHeight: '80vh' }}>
      {/* Left Sidebar Navigation */}
      <Box
        sx={{
          width: sidebarWidth,
          backgroundColor: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          borderRadius: '12px 0 0 12px'
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#1e3a8a',
              mb: 1
            }}
          >
            Finance Module
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b'
            }}
          >
            Financial management & analytics
          </Typography>
        </Box>

        <List sx={{ p: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.index} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => setActiveTab(item.index)}
                sx={{
                  borderRadius: '8px',
                  py: 1.5,
                  px: 2,
                  backgroundColor: activeTab === item.index ? '#1e3a8a' : 'transparent',
                  color: activeTab === item.index ? 'white' : '#64748b',
                  '&:hover': {
                    backgroundColor: activeTab === item.index ? '#1e40af' : '#e2e8f0',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 36,
                    '& .MuiSvgIcon-root': {
                      fontSize: '20px'
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '14px',
                      fontWeight: activeTab === item.index ? 'bold' : 'medium'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          borderRadius: '0 12px 12px 0',
          minHeight: '80vh'
        }}
      >
        <Box sx={{ p: 4 }}>
          <TabPanel value={activeTab} index={0}>
            {renderDashboard()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderBills()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderPayroll()}
          </TabPanel>
        </Box>
      </Box>
    </Box>
  );
}
