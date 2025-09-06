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

// Mock Chart Component (you can replace with recharts or chart.js)
const SimpleChart = ({ data, title, type = 'bar' }) => (
  <Box sx={{ 
    height: 250, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 2,
    border: '2px dashed #000000',
    color: '#000000'
  }}>
    <Typography variant="h6" color="#000000" fontWeight="bold">
      {title}
    </Typography>
  </Box>
);

const StatsCard = ({ title, value, icon, color = '#1e40af', trend }) => (
  <Card sx={{ 
    height: '100%',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    color: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(30, 64, 175, 0.3)',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
    }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'rgba(255,255,255,0.15)', 
          borderRadius: '50%', 
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="#ffffff" sx={{ letterSpacing: '0.5px' }}>
            {value}
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 0.5, fontWeight: 'bold' }}>
            {title}
          </Typography>
          {trend && (
            <Typography variant="caption" color="rgba(255,255,255,0.8)" sx={{ mt: 0.5, display: 'block' }}>
              {trend}
            </Typography>
          )}
        </Box>
      </Box>
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
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Sales"
            value={salesData.totalSales}
            icon={<TrendingUp />}
            color="#000000"
            trend="+12% from last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Revenue"
            value={formatCurrency(salesData.totalRevenue)}
            icon={<AttachMoney />}
            color="#1a1a1a"
            trend="+8% from last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Customers"
            value={salesData.totalCustomers}
            icon={<People />}
            color="#333333"
            trend="+15% from last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Orders"
            value={salesData.totalOrders}
            icon={<ShoppingCart />}
            color="#4a4a4a"
            trend="+5% from last period"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#000000' }}>
              Sales Report - {dateFilter.toUpperCase()}
            </Typography>
            <SimpleChart data={[]} title="Sales Trends Chart (LINE)" type="line" />
          </Paper>
        </Grid>

        {/* Payment Methods Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#000000' }}>
              Payment Methods
            </Typography>
            <SimpleChart data={[]} title="Payment Distribution Chart (PIE)" type="pie" />
            
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOn sx={{ color: '#000000', mr: 1 }} />
                  <Typography variant="body2" color="#000000">Cash</Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold" color="#000000">60%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCard sx={{ color: '#000000', mr: 1 }} />
                  <Typography variant="body2" color="#000000">Card</Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold" color="#000000">30%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ color: '#000000', mr: 1 }} />
                  <Typography variant="body2" color="#000000">Bank</Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold" color="#000000">10%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Payment Recording */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#000000">
                Recent Payments
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowPaymentDialog(true)}
                sx={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  border: '2px solid #000000',
                  borderRadius: '6px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#333333',
                    borderColor: '#333333'
                  }
                }}
              >
                + RECORD PAYMENT
              </Button>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentRecords.map((payment, index) => (
                    <TableRow key={payment.id || index}>
                      <TableCell sx={{ color: '#000000' }}>{payment.customerName}</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 'bold' }}>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.method} 
                          size="small"
                          sx={{
                            backgroundColor: payment.method === 'cash' ? '#000000' : 
                                           payment.method === 'card' ? '#333333' : '#666666',
                            color: '#ffffff',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#000000' }}>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#000000' }}>
              Top Customers
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Total Spent</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Orders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#000000' }}>{customer.name}</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 'bold' }}>{formatCurrency(customer.total)}</TableCell>
                      <TableCell sx={{ color: '#000000' }}>{customer.orders}</TableCell>
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
            p: 3, 
            borderRadius: 2, 
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#000000' }}>
              Top Selling Products
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Units Sold</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000000' }}>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#000000' }}>{product.name}</TableCell>
                      <TableCell sx={{ color: '#000000' }}>{product.sold}</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 'bold' }}>{formatCurrency(product.revenue)}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Excellent" 
                          sx={{
                            backgroundColor: '#000000',
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
        <DialogTitle sx={{ backgroundColor: '#000000', color: 'white', fontWeight: 'bold' }}>
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
