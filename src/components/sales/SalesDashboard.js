import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  People,
  ShoppingCart,
  Add,
  AccountBalance,
  CreditCard,
  MonetizationOn
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

// Clean Chart Component
const SimpleChart = ({ data, title, type = 'bar' }) => (
  <Box sx={{ 
    height: 170, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '2px dashed #d1d5db',
    color: '#6b7280'
  }}>
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" color="#6b7280" fontWeight="600">
        {title}
      </Typography>
      <Typography variant="body2" color="#9ca3af" sx={{ mt: 1 }}>
        Chart placeholder
      </Typography>
    </Box>
  </Box>
);

// Professional Stats Card - Clean Design
const StatsCard = ({ title, value, icon, color = '#2563eb', trend }) => (
  <Card sx={{ 
    height: '120px',
    backgroundColor: color,
    color: '#ffffff',
    borderRadius: '8px',
    border: `2px solid ${color === '#ffffff' ? '#000000' : color}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
  }}>
    <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#ffffff">
            {value}
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ 
          p: 1, 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
      {trend && (
        <Typography variant="caption" color="rgba(255,255,255,0.8)" sx={{ fontSize: '11px' }}>
          {trend}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function SalesDashboard({ dateFilter }) {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    method: 'cash',
    description: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [dateFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on filter
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'daily':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate.setDate(now.getDate() - 30);
          break;
        default:
          startDate.setHours(0, 0, 0, 0);
      }

      // Load sales data
      const salesQuery = query(
        collection(db, 'sales'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );
      
      const salesSnapshot = await getDocs(salesQuery);
      const sales = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load payment records
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate statistics
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const uniqueCustomers = new Set(sales.map(sale => sale.customerId)).size;
      
      setSalesData({
        totalSales,
        totalOrders: totalSales,
        totalCustomers: uniqueCustomers,
        totalRevenue
      });

      setPaymentRecords(payments.slice(0, 10)); // Latest 10 payments

      // Mock top customers and products (replace with real data)
      setTopCustomers([
        { name: 'John Doe', total: 15000, orders: 12 },
        { name: 'Jane Smith', total: 12000, orders: 8 },
        { name: 'Mike Johnson', total: 9500, orders: 6 }
      ]);

      setTopProducts([
        { name: 'Paracetamol', sold: 150, revenue: 7500 },
        { name: 'Aspirin', sold: 120, revenue: 6000 },
        { name: 'Vitamin C', sold: 90, revenue: 4500 }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    try {
      setLoading(true);
      
      const paymentData = {
        ...newPayment,
        amount: parseFloat(newPayment.amount),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'payments'), paymentData);
      
      setShowPaymentDialog(false);
      setNewPayment({
        amount: '',
        method: 'cash',
        description: '',
        customerName: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toLocaleString() || '0.00'}`;
  };

  return (
    <Box sx={{ p: 0, backgroundColor: '#f8f9fa' }}>
      {/* Stats Cards Row */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Sales"
            value={salesData.totalSales}
            icon={<TrendingUp sx={{ color: '#ffffff', fontSize: 24 }} />}
            color="#2563eb"
            trend="+12% from last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Revenue"
            value={formatCurrency(salesData.totalRevenue)}
            icon={<AttachMoney sx={{ color: '#ffffff', fontSize: 24 }} />}
            color="#000000"
            trend="+8% from last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Customers"
            value={salesData.totalCustomers}
            icon={<People sx={{ color: '#ffffff', fontSize: 24 }} />}
            color="#2563eb"
            trend="+15% from last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Orders"
            value={salesData.totalOrders}
            icon={<ShoppingCart sx={{ color: '#ffffff', fontSize: 24 }} />}
            color="#64748b"
            trend="+5% from last period"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={1.5}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 1.5, 
            height: 260,
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            borderRadius: 2 
          }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 1.5, color: '#000000' }}>
              Sales Report - {dateFilter.toUpperCase()}
            </Typography>
            <SimpleChart data={[]} title="Sales Trends" type="line" />
          </Paper>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 1.5, 
            height: 260,
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            borderRadius: 2 
          }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 1.5, color: '#000000' }}>
              Payment Methods
            </Typography>
            <SimpleChart data={[]} title="Payment Distribution" type="pie" />
            
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOn sx={{ color: '#2563eb', mr: 1, fontSize: 18 }} />
                  <Typography variant="body2" color="#000000" fontWeight="500">Cash</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600" color="#2563eb">60%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCard sx={{ color: '#000000', mr: 1, fontSize: 18 }} />
                  <Typography variant="body2" color="#000000" fontWeight="500">Card</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600" color="#000000">30%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ color: '#64748b', mr: 1, fontSize: 18 }} />
                  <Typography variant="body2" color="#000000" fontWeight="500">Bank</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600" color="#64748b">10%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ 
            p: 1.5, 
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            borderRadius: 2 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6" fontWeight="600" color="#000000">
                Recent Payments
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowPaymentDialog(true)}
                size="small"
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#1d4ed8'
                  }
                }}
              >
                Record Payment
              </Button>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1.5 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1.5 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1.5 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1.5 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentRecords.map((payment, index) => (
                    <TableRow key={payment.id || index} sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' },
                      '&:hover': { backgroundColor: '#e2e8f0' },
                      transition: 'background-color 0.2s ease'
                    }}>
                      <TableCell sx={{ color: '#000000', py: 1.5 }}>{payment.customerName}</TableCell>
                      <TableCell sx={{ color: '#2563eb', fontWeight: 'bold', py: 1.5 }}>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip 
                          label={payment.method} 
                          size="small"
                          sx={{
                            backgroundColor: payment.method === 'cash' ? '#2563eb' : 
                                           payment.method === 'card' ? '#000000' : '#64748b',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            borderRadius: '12px'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', py: 1.5 }}>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5, color: '#000000' }}>
              Top Customers
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1 }}>Total Spent</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1 }}>Orders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#000000', py: 1 }}>{customer.name}</TableCell>
                      <TableCell sx={{ color: '#2563eb', fontWeight: 'bold', py: 1 }}>{formatCurrency(customer.total)}</TableCell>
                      <TableCell sx={{ color: '#000000', py: 1 }}>{customer.orders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5, color: '#000000' }}>
              Top Selling Products
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1 }}>Units Sold</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1 }}>Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000', py: 1 }}>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#000000', py: 1 }}>{product.name}</TableCell>
                      <TableCell sx={{ color: '#000000', py: 1 }}>{product.sold}</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 'bold', py: 1 }}>{formatCurrency(product.revenue)}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip 
                          label="Excellent" 
                          sx={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontWeight: 'bold'
                          }}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Recording Dialog */}
      <Dialog 
        open={showPaymentDialog} 
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#2563eb', 
          color: 'white', 
          fontWeight: 600,
          py: 2
        }}>
          Record New Payment
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: '#ffffff' }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={newPayment.customerName}
                onChange={(e) => setNewPayment({ ...newPayment, customerName: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#000000',
                    },
                    '&:hover fieldset': {
                      borderColor: '#333333',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                    '&.Mui-focused': {
                      color: '#000000',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#000000',
                    },
                    '&:hover fieldset': {
                      borderColor: '#333333',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                    '&.Mui-focused': {
                      color: '#000000',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#000000',
                  },
                  '&:hover fieldset': {
                    borderColor: '#333333',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000000',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#000000',
                  '&.Mui-focused': {
                    color: '#000000',
                  },
                },
              }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#ffffff',
                        border: '1px solid #000000',
                        '& .MuiMenuItem-root': {
                          color: '#000000',
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#000000',
                            color: '#ffffff'
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Credit/Debit Card</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newPayment.date}
                onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#000000',
                    },
                    '&:hover fieldset': {
                      borderColor: '#333333',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                    '&.Mui-focused': {
                      color: '#000000',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newPayment.description}
                onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#000000',
                    },
                    '&:hover fieldset': {
                      borderColor: '#333333',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                    '&.Mui-focused': {
                      color: '#000000',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: '#ffffff' }}>
          <Button 
            onClick={() => setShowPaymentDialog(false)}
            sx={{ 
              color: '#666666',
              border: '1px solid #cccccc',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#999999'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPayment}
            disabled={loading || !newPayment.amount || !newPayment.customerName}
            sx={{
              backgroundColor: '#000000',
              color: '#ffffff',
              fontWeight: 'bold',
              border: '2px solid #000000',
              '&:hover': {
                backgroundColor: '#333333',
                borderColor: '#333333'
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
                color: '#666666',
                borderColor: '#cccccc'
              }
            }}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
