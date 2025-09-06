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

// Add beautiful animations
const styles = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// Beautiful Chart Component with gradient background
const BeautifulChart = ({ data, title, type = 'bar' }) => (
  <Box sx={{ 
    height: 280, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }
  }}>
    <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <Typography variant="h4" color="#ffffff" fontWeight="700" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ fontWeight: '300' }}>
        Interactive Chart Visualization
      </Typography>
      <Box sx={{ 
        mt: 3,
        width: 60,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 2,
        mx: 'auto'
      }} />
    </Box>
  </Box>
);

// Stunning Stats Card with glass morphism effect
const StunningStatsCard = ({ title, value, icon, gradient, trend }) => (
  <Card sx={{ 
    height: '140px',
    background: gradient,
    color: '#ffffff',
    borderRadius: '20px',
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }
  }}>
    <CardContent sx={{ p: 3, height: '100%', position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ 
          p: 1.5, 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          {icon}
        </Box>
        {trend && (
          <Chip 
            label={trend} 
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '10px',
              backdropFilter: 'blur(10px)'
            }}
          />
        )}
      </Box>
      <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mb: 1, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="body1" color="rgba(255,255,255,0.9)" sx={{ fontWeight: '500' }}>
        {title}
      </Typography>
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
    <Box sx={{ 
      p: 0, 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Beautiful Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StunningStatsCard
            title="Total Sales"
            value={salesData.totalSales}
            icon={<TrendingUp sx={{ color: '#ffffff', fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StunningStatsCard
            title="Revenue"
            value={formatCurrency(salesData.totalRevenue)}
            icon={<AttachMoney sx={{ color: '#ffffff', fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            trend="+8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StunningStatsCard
            title="Customers"
            value={salesData.totalCustomers}
            icon={<People sx={{ color: '#ffffff', fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            trend="+15%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StunningStatsCard
            title="Orders"
            value={salesData.totalOrders}
            icon={<ShoppingCart sx={{ color: '#ffffff', fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            trend="+5%"
          />
        </Grid>
      </Grid>

      {/* Stunning Dashboard Layout */}
      <Grid container spacing={3}>
        {/* Primary Analytics Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            height: 420,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  Sales Analytics
                </Typography>
                <Typography variant="body1" color="#64748b" fontWeight="500">
                  {dateFilter.toUpperCase()} Performance Overview
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label="Live" 
                  size="small" 
                  sx={{ 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    animation: 'pulse 2s infinite'
                  }} 
                />
                <Chip 
                  label="Real-time" 
                  size="small" 
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
            </Box>
            <BeautifulChart data={[]} title="Performance Trends" type="line" />
          </Paper>
        </Grid>

        {/* Revenue Insights */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            height: 420,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h5" fontWeight="bold" sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}>
              Revenue Insights
            </Typography>
            <BeautifulChart data={[]} title="Distribution" type="pie" />
          </Paper>
        </Grid>

        {/* Performance Analytics Row */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: 360,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h5" fontWeight="bold" sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}>
              Monthly Trends
            </Typography>
            <BeautifulChart data={[]} title="Growth Analysis" type="bar" />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: 360,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h5" fontWeight="bold" sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}>
              Payment Flow
            </Typography>
            <BeautifulChart data={[]} title="Transaction Methods" type="doughnut" />
          </Paper>
        </Grid>

        {/* Beautiful Data Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Recent Transactions
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowPaymentDialog(true)}
                sx={{ 
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  px: 3,
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                  }
                }}
              >
                Add Payment
              </Button>
            </Box>
            
            <TableContainer sx={{ 
              maxHeight: 320,
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)'
            }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: '#1e293b', 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderBottom: 'none'
                    }}>Customer</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: '#1e293b', 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderBottom: 'none'
                    }}>Amount</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: '#1e293b', 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderBottom: 'none'
                    }}>Method</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: '#1e293b', 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderBottom: 'none'
                    }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Sample beautiful data */}
                  {Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={index} sx={{ 
                      '&:hover': { 
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        transform: 'scale(1.01)'
                      },
                      transition: 'all 0.2s ease'
                    }}>
                      <TableCell sx={{ color: '#1e293b', fontWeight: '600', borderBottom: 'none' }}>
                        Customer {index + 1}
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {formatCurrency(Math.floor(Math.random() * 10000))}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        <Chip 
                          label={['Cash', 'Card', 'Bank'][index % 3]} 
                          size="small"
                          sx={{
                            background: index % 3 === 0 ? 
                              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                              index % 3 === 1 ? 
                              'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 
                              'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            borderRadius: '8px'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        <Chip 
                          label="Completed" 
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            borderRadius: '8px'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Beautiful Sidebar Stats */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Top Customers */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}>
                  Top Customers
                </Typography>
                <Box>
                  {topCustomers.map((customer, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      mb: 2,
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                      }
                    }}>
                      <Box>
                        <Typography variant="body1" fontWeight="bold" color="#1e293b">
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          {customer.orders} orders
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="bold" sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {formatCurrency(customer.total)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Top Products */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}>
                  Top Products
                </Typography>
                <Box>
                  {topProducts.map((product, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      mb: 2,
                      background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(67, 233, 123, 0.2)'
                      }
                    }}>
                      <Box>
                        <Typography variant="body1" fontWeight="bold" color="#1e293b">
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          {product.sold} units sold
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="bold" sx={{
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {formatCurrency(product.revenue)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
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
