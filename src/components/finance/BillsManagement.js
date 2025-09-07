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
  Alert,
  Badge,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Payment,
  Schedule,
  Warning,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Visibility,
  NotificationsActive,
  AttachMoney,
  Receipt,
  Business
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bills-tabpanel-${index}`}
      aria-labelledby={`bills-tab-${index}`}
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

export default function BillsManagement({ dateFilter }) {
  const [activeTab, setActiveTab] = useState(0);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample data for supplier bills
  const supplierBills = [
    {
      id: 'BILL-001',
      supplier: 'MedSupply Corp',
      billNumber: 'SUP-2024-001',
      amount: 125000,
      dueDate: '2024-09-15',
      status: 'overdue',
      category: 'Inventory',
      description: 'Medical supplies - Q3 order'
    },
    {
      id: 'BILL-002',
      supplier: 'PharmaTech Ltd',
      billNumber: 'PT-2024-089',
      amount: 85000,
      dueDate: '2024-09-20',
      status: 'pending',
      category: 'Inventory',
      description: 'Pharmaceutical products'
    },
    {
      id: 'BILL-003',
      supplier: 'Office Solutions',
      billNumber: 'OS-2024-156',
      amount: 15000,
      dueDate: '2024-09-25',
      status: 'pending',
      category: 'Office Supplies',
      description: 'Stationery and office equipment'
    },
    {
      id: 'BILL-004',
      supplier: 'TechCorp Services',
      billNumber: 'TC-2024-045',
      amount: 45000,
      dueDate: '2024-09-18',
      status: 'paid',
      category: 'Technology',
      description: 'Software licenses and maintenance'
    }
  ];

  // Sample payment reminders data
  const paymentReminders = [
    {
      id: 'REM-001',
      supplier: 'MedSupply Corp',
      amount: 125000,
      dueDate: '2024-09-15',
      daysOverdue: 2,
      priority: 'high'
    },
    {
      id: 'REM-002',
      supplier: 'Utility Company',
      amount: 28000,
      dueDate: '2024-09-16',
      daysOverdue: 1,
      priority: 'medium'
    },
    {
      id: 'REM-003',
      supplier: 'PharmaTech Ltd',
      amount: 85000,
      dueDate: '2024-09-20',
      daysOverdue: 0,
      priority: 'low'
    }
  ];

  // Payment status distribution
  const paymentStatusData = [
    { name: 'Paid', value: 45, count: 12, color: '#10b981' },
    { name: 'Pending', value: 35, count: 8, color: '#f59e0b' },
    { name: 'Overdue', value: 20, count: 5, color: '#ef4444' }
  ];

  // Monthly payment trends
  const paymentTrends = [
    { month: 'Jul', paid: 285000, pending: 95000 },
    { month: 'Aug', paid: 320000, pending: 125000 },
    { month: 'Sep', paid: 180000, pending: 255000 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPending = supplierBills
    .filter(bill => bill.status === 'pending' || bill.status === 'overdue')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const totalOverdue = supplierBills
    .filter(bill => bill.status === 'overdue')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const totalPaid = supplierBills
    .filter(bill => bill.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);

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
            Bills & Payments
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              fontSize: '16px'
            }}
          >
            Manage supplier bills, vendor payments, and payment reminders
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setShowBillDialog(true)}
            sx={{
              backgroundColor: '#1e3a8a',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#1e40af'
              }
            }}
          >
            Add Bill
          </Button>
          <Button
            startIcon={<Payment />}
            variant="outlined"
            onClick={() => setShowPaymentDialog(true)}
            sx={{
              borderColor: '#1e3a8a',
              color: '#1e3a8a',
              '&:hover': {
                backgroundColor: '#1e3a8a',
                color: 'white'
              }
            }}
          >
            Record Payment
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                <Warning sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Overdue Bills
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(totalOverdue)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {supplierBills.filter(bill => bill.status === 'overdue').length} bills overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Pending Bills
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(totalPending)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {supplierBills.filter(bill => bill.status === 'pending').length} bills pending
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
                <CheckCircle sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Paid This Month
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(totalPaid)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {supplierBills.filter(bill => bill.status === 'paid').length} bills paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>

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
                <NotificationsActive sx={{ fontSize: '24px', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Active Reminders
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {paymentReminders.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Payment reminders set
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
              icon={<Receipt sx={{ fontSize: '20px' }} />}
              iconPosition="start"
              label="Supplier Bills"
            />
            <Tab
              icon={<Payment sx={{ fontSize: '20px' }} />}
              iconPosition="start"
              label="Payment Reminders"
            />
            <Tab
              icon={<Assessment sx={{ fontSize: '20px' }} />}
              iconPosition="start"
              label="Payment Analytics"
            />
          </Tabs>
        </Box>

        {/* Supplier Bills Tab */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Bill Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supplierBills.map((bill) => (
                  <TableRow key={bill.id} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {bill.billNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {bill.description}
                      </Typography>
                    </TableCell>
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
                        {formatDate(bill.dueDate)}
                      </Typography>
                      {bill.status === 'overdue' && (
                        <Typography variant="caption" sx={{ color: '#ef4444' }}>
                          {Math.abs(getDaysUntilDue(bill.dueDate))} days overdue
                        </Typography>
                      )}
                      {bill.status === 'pending' && getDaysUntilDue(bill.dueDate) <= 7 && (
                        <Typography variant="caption" sx={{ color: '#f59e0b' }}>
                          Due in {getDaysUntilDue(bill.dueDate)} days
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
                      <Chip
                        label={bill.category}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#64748b',
                          color: '#64748b',
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
                        {bill.status !== 'paid' && (
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

        {/* Payment Reminders Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning" icon={<NotificationsActive />}>
              You have {paymentReminders.filter(r => r.priority === 'high').length} high-priority payment reminders requiring immediate attention.
            </Alert>
          </Box>

          <Grid container spacing={3}>
            {paymentReminders.map((reminder) => (
              <Grid item xs={12} md={6} lg={4} key={reminder.id}>
                <Card
                  sx={{
                    borderRadius: '12px',
                    border: `2px solid ${getPriorityColor(reminder.priority)}20`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={reminder.priority.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: `${getPriorityColor(reminder.priority)}15`,
                          color: getPriorityColor(reminder.priority),
                          fontWeight: 'bold',
                          fontSize: '10px'
                        }}
                      />
                      <Badge
                        badgeContent={reminder.daysOverdue || 'DUE'}
                        color={reminder.daysOverdue > 0 ? 'error' : 'warning'}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }
                        }}
                      >
                        <Schedule sx={{ color: '#64748b' }} />
                      </Badge>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1e3a8a' }}>
                      {reminder.supplier}
                    </Typography>

                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                      {formatCurrency(reminder.amount)}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                      Due: {formatDate(reminder.dueDate)}
                    </Typography>

                    {reminder.daysOverdue > 0 && (
                      <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {reminder.daysOverdue} days overdue
                        </Typography>
                      </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          backgroundColor: getPriorityColor(reminder.priority),
                          color: 'white',
                          fontSize: '12px',
                          '&:hover': {
                            backgroundColor: getPriorityColor(reminder.priority),
                            opacity: 0.8
                          }
                        }}
                      >
                        Pay Now
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#64748b',
                          color: '#64748b',
                          fontSize: '12px'
                        }}
                      >
                        Snooze
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Payment Analytics Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            {/* Payment Status Distribution */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                  Payment Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value}% (${props.payload.count} bills)`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <Box sx={{ mt: 2 }}>
                  {paymentStatusData.map((item, index) => (
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
                        <Typography variant="body2" sx={{ fontSize: '12px' }}>
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {item.count} bills
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Monthly Payment Trends */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                  Monthly Payment Trends
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={paymentTrends}>
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
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                      labelStyle={{ color: '#1e3a8a' }}
                    />
                    <Bar 
                      dataKey="paid" 
                      fill="#10b981" 
                      name="Paid"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="pending" 
                      fill="#f59e0b" 
                      name="Pending"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}
