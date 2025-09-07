import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  AccountBalance,
  Assessment,
  MoreVert,
  ArrowUpward,
  ArrowDownward
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

export default function FinanceDashboard({ dateFilter }) {
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Sample data - replace with real data from Firebase
  const salesData = [
    { month: 'Jan', sales: 85000, expenses: 45000, profit: 40000 },
    { month: 'Feb', sales: 92000, expenses: 48000, profit: 44000 },
    { month: 'Mar', sales: 78000, expenses: 52000, profit: 26000 },
    { month: 'Apr', sales: 105000, expenses: 55000, profit: 50000 },
    { month: 'May', sales: 110000, expenses: 58000, profit: 52000 },
    { month: 'Jun', sales: 125000, expenses: 62000, profit: 63000 }
  ];

  const expenseBreakdown = [
    { name: 'Inventory', value: 45, color: '#1e3a8a' },
    { name: 'Salaries', value: 25, color: '#3b82f6' },
    { name: 'Utilities', value: 15, color: '#60a5fa' },
    { name: 'Marketing', value: 10, color: '#93c5fd' },
    { name: 'Others', value: 5, color: '#dbeafe' }
  ];

  const cashFlowData = [
    { date: 'Week 1', inflow: 28000, outflow: 15000 },
    { date: 'Week 2', inflow: 32000, outflow: 18000 },
    { date: 'Week 3', inflow: 25000, outflow: 22000 },
    { date: 'Week 4', inflow: 38000, outflow: 20000 }
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

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#1e3a8a',
            mb: 1
          }}
        >
          Finance Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#64748b',
            fontSize: '16px'
          }}
        >
          Financial overview and key performance indicators
        </Typography>
      </Box>

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
                  <IconButton size="small">
                    <MoreVert sx={{ fontSize: '18px', color: '#64748b' }} />
                  </IconButton>
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
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      fontWeight: 'medium'
                    }}
                  >
                    {metric.title}
                  </Typography>
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1e293b',
                    mb: 1
                  }}
                >
                  Sales vs Expenses Trend
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b'
                  }}
                >
                  Monthly comparison of revenue and expenses
                </Typography>
              </Box>
              <Chip
                label={dateFilter.toUpperCase()}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#1e3a8a',
                  color: '#1e3a8a',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
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

        {/* Expense Breakdown */}
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#1e293b',
                mb: 1
              }}
            >
              Expense Breakdown
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mb: 3
              }}
            >
              Current month distribution
            </Typography>
            
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>

            <Box sx={{ mt: 2 }}>
              {expenseBreakdown.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: item.color,
                        borderRadius: '3px',
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '12px', color: '#64748b' }}>
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {item.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Cash Flow Chart */}
        <Grid item xs={12}>
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
                mb: 1
              }}
            >
              Cash Flow Analysis
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mb: 3
              }}
            >
              Weekly cash inflow vs outflow comparison
            </Typography>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cashFlowData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
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
                <Bar 
                  dataKey="inflow" 
                  fill="#10b981" 
                  name="Cash Inflow"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="outflow" 
                  fill="#ef4444" 
                  name="Cash Outflow"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
