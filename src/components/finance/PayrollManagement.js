import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Alert,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Payment,
  People,
  AccountBalance,
  Calculate,
  Download,
  Edit,
  Visibility,
  CheckCircle,
  Schedule,
  AttachMoney,
  TrendingUp,
  Person
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payroll-tabpanel-${index}`}
      aria-labelledby={`payroll-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function PayrollManagement({ dateFilter }) {
  const [activeTab, setActiveTab] = useState(0);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Employee data - will be loaded from Firebase
  const employees = [];

  // Payroll summary data
  const payrollSummary = {
    totalEmployees: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
    pendingPayments: 0,
    processedPayments: 0
  };

  // Department-wise salary distribution
  const departmentSalaryData = [];

  // Monthly payroll trends
  const payrollTrends = [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
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

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: '#1e3a8a',
              mb: 1
            }}
          >
            Payroll Management
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              fontSize: '16px'
            }}
          >
            Manage employee salaries, benefits, and payroll processing
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<Add />}
            variant="outlined"
            onClick={() => setShowEmployeeDialog(true)}
            sx={{
              borderColor: '#64748b',
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#64748b',
                color: 'white'
              }
            }}
          >
            Add Employee
          </Button>
          <Button
            startIcon={<Calculate />}
            variant="contained"
            onClick={() => setShowPayrollDialog(true)}
            sx={{
              backgroundColor: '#1e3a8a',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#1e40af'
              }
            }}
          >
            Process Payroll
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Employees
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {payrollSummary.totalEmployees}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Gross Pay
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(payrollSummary.totalGrossPay)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Deductions
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(payrollSummary.totalDeductions)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Tax + Insurance + PF
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Net Payable
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(payrollSummary.totalNetPay)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                After deductions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content with Tabs */}
      <Paper
        sx={{
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'medium',
                fontSize: '14px',
                textTransform: 'none',
                py: 2,
                px: 3,
                color: '#64748b',
                '&.Mui-selected': {
                  color: '#1e3a8a',
                  fontWeight: 'bold'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1e3a8a',
                height: '3px'
              }
            }}
          >
            <Tab
              icon={<People sx={{ fontSize: '20px' }} />}
              iconPosition="start"
              label="Employee List"
            />
            <Tab
              icon={<Payment sx={{ fontSize: '20px' }} />}
              iconPosition="start"
              label="Payroll Processing"
            />
            <Tab
              icon={<TrendingUp sx={{ fontSize: '20px' }} />}
              iconPosition="start"
              label="Payroll Analytics"
            />
          </Tabs>
        </Box>

        {/* Employee List Tab */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Department</TableCell>
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
                            width: 40,
                            height: 40,
                            mr: 2,
                            backgroundColor: '#1e3a8a',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {employee.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            ID: {employee.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.position}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.department}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#1e3a8a',
                          color: '#1e3a8a',
                          fontSize: '11px'
                        }}
                      />
                    </TableCell>
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
                        label={employee.paymentStatus.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(employee.paymentStatus)}15`,
                          color: getStatusColor(employee.paymentStatus),
                          fontWeight: 'bold',
                          fontSize: '11px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" sx={{ color: '#1e3a8a' }}>
                          <Visibility sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#64748b' }}>
                          <Edit sx={{ fontSize: '16px' }} />
                        </IconButton>
                        {employee.paymentStatus !== 'paid' && (
                          <IconButton size="small" sx={{ color: '#10b981' }}>
                            <Payment sx={{ fontSize: '16px' }} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Payroll Processing Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" icon={<Schedule />}>
              Payroll for September 2024 is ready for processing. Review all employee details before final approval.
            </Alert>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                  Payroll Summary
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Gross Pay:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(payrollSummary.totalGrossPay)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Deductions:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                      -{formatCurrency(payrollSummary.totalDeductions)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Net Payable:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                      {formatCurrency(payrollSummary.totalNetPay)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Processing Progress: {payrollSummary.processedPayments}/{payrollSummary.totalEmployees}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(payrollSummary.processedPayments / payrollSummary.totalEmployees) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#10b981'
                      }
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Payment />}
                  sx={{
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#1e40af'
                    }
                  }}
                >
                  Process All Payments
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                  Quick Actions
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Download />}
                      sx={{
                        borderColor: '#64748b',
                        color: '#64748b',
                        justifyContent: 'flex-start',
                        '&:hover': {
                          backgroundColor: '#64748b',
                          color: 'white'
                        }
                      }}
                    >
                      Download Payslips
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Calculate />}
                      sx={{
                        borderColor: '#64748b',
                        color: '#64748b',
                        justifyContent: 'flex-start',
                        '&:hover': {
                          backgroundColor: '#64748b',
                          color: 'white'
                        }
                      }}
                    >
                      Generate Tax Reports
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AccountBalance />}
                      sx={{
                        borderColor: '#64748b',
                        color: '#64748b',
                        justifyContent: 'flex-start',
                        '&:hover': {
                          backgroundColor: '#64748b',
                          color: 'white'
                        }
                      }}
                    >
                      Bank Transfer File
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Payroll Analytics Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            {/* Department Salary Distribution */}
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                  Department-wise Salary Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentSalaryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="department" 
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
                      dataKey="totalSalary" 
                      fill="#1e3a8a" 
                      name="Total Salary"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Payroll Trends */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  height: '100%'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                  Employee Count by Department
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={departmentSalaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="employees"
                    >
                      {departmentSalaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Monthly Payroll Trends */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                  Monthly Payroll Trends
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={payrollTrends}>
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
                    <Line
                      type="monotone"
                      dataKey="grossPay"
                      stroke="#1e3a8a"
                      strokeWidth={3}
                      name="Gross Pay"
                      dot={{ fill: '#1e3a8a', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="netPay"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Net Pay"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="deductions"
                      stroke="#ef4444"
                      strokeWidth={3}
                      name="Deductions"
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}
