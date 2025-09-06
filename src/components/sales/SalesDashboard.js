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

// Clean Chart Component with larger size
const SimpleChart = ({ data, title, type = 'bar' }) => (
  <Box sx={{ 
    height: 320, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f8fafb',
    borderRadius: '8px',
    border: '2px dashed #d1d5db',
    color: '#6b7280'
  }}>
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" color="#6b7280" fontWeight="600">
        {title}
      </Typography>
      <Typography variant="body1" color="#9ca3af" sx={{ mt: 1 }}>
        Chart visualization area
      </Typography>
    </Box>
  </Box>
);

// Compact Stats Card for better space utilization
const CompactStatsCard = ({ title, value, icon, color = '#2563eb', trend }) => (
  <Card sx={{ 
    height: '90px',
    backgroundColor: color,
    color: '#ffffff',
    borderRadius: '12px',
    border: `2px solid ${color}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    }
  }}>
    <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ 
        p: 1, 
        backgroundColor: 'rgba(255,255,255,0.2)', 
        borderRadius: '8px',
        mr: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" fontWeight="bold" color="#ffffff" sx={{ lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ fontWeight: '500', fontSize: '12px' }}>
          {title}
        </Typography>
        {trend && (
          <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontSize: '10px' }}>
            {trend}
          </Typography>
        )}
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
    <Box sx={{ p: 0, backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      {/* Compact Stats Row */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <CompactStatsCard
            title="Total Sales"
            value={salesData.totalSales}
            icon={<TrendingUp sx={{ color: '#ffffff', fontSize: 20 }} />}
            color="#2563eb"
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CompactStatsCard
            title="Revenue"
            value={formatCurrency(salesData.totalRevenue)}
            icon={<AttachMoney sx={{ color: '#ffffff', fontSize: 20 }} />}
            color="#000000"
            trend="+8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CompactStatsCard
            title="Customers"
            value={salesData.totalCustomers}
            icon={<People sx={{ color: '#ffffff', fontSize: 20 }} />}
            color="#2563eb"
            trend="+15%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CompactStatsCard
            title="Orders"
            value={salesData.totalOrders}
            icon={<ShoppingCart sx={{ color: '#ffffff', fontSize: 20 }} />}
            color="#64748b"
            trend="+5%"
          />
        </Grid>
      </Grid>

      {/* Main Dashboard Layout - Charts First */}
      <Grid container spacing={2}>
        {/* Primary Sales Chart - Large */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 2, 
            height: 400,
            backgroundColor: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e293b' }}>
                Sales Analytics - {dateFilter.toUpperCase()}
              </Typography>
              <Chip 
                label="Live Data" 
                size="small" 
                sx={{ 
                  backgroundColor: '#10b981', 
                  color: '#ffffff',
                  fontWeight: 'bold'
                }} 
              />
            </Box>
            <SimpleChart data={[]} title="Sales Performance Trends" type="line" />
          </Paper>
        </Grid>

        {/* Revenue Breakdown Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 2, 
            height: 400,
            backgroundColor: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
              Revenue Breakdown
            </Typography>
            <SimpleChart data={[]} title="Revenue Distribution" type="pie" />
            
            {/* Revenue Summary */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, p: 1, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#2563eb', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2" color="#1e293b" fontWeight="600">Product Sales</Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold" color="#2563eb">65%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, p: 1, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#000000', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2" color="#1e293b" fontWeight="600">Services</Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold" color="#000000">25%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#64748b', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2" color="#1e293b" fontWeight="600">Other</Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold" color="#64748b">10%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Trends Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 2, 
            height: 350,
            backgroundColor: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
              Monthly Performance
            </Typography>
            <SimpleChart data={[]} title="Monthly Sales Comparison" type="bar" />
          </Paper>
        </Grid>

        {/* Payment Methods Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 2, 
            height: 350,
            backgroundColor: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
              Payment Methods
            </Typography>
            <SimpleChart data={[]} title="Payment Distribution" type="doughnut" />
          </Paper>
        </Grid>

        {/* Data Tables Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 2, 
            backgroundColor: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b">
                Recent Transactions
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
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#1d4ed8'
                  }
                }}
              >
                Add Payment
              </Button>
            </Box>
            
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f8fafc' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f8fafc' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f8fafc' }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f8fafc' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f8fafc' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentRecords.map((payment, index) => (
                    <TableRow key={payment.id || index} hover>
                      <TableCell sx={{ color: '#1e293b', fontWeight: '500' }}>{payment.customerName || `Customer ${index + 1}`}</TableCell>
                      <TableCell sx={{ color: '#2563eb', fontWeight: 'bold' }}>{formatCurrency(payment.amount || Math.floor(Math.random() * 10000))}</TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.method || ['Cash', 'Card', 'Bank'][index % 3]} 
                          size="small"
                          sx={{
                            backgroundColor: index % 3 === 0 ? '#2563eb' : index % 3 === 1 ? '#000000' : '#64748b',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            borderRadius: 2
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Completed" 
                          size="small"
                          sx={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            borderRadius: 2
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Add sample data if no records */}
                  {paymentRecords.length === 0 && Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ color: '#1e293b', fontWeight: '500' }}>Customer {index + 1}</TableCell>
                      <TableCell sx={{ color: '#2563eb', fontWeight: 'bold' }}>{formatCurrency(Math.floor(Math.random() * 10000))}</TableCell>
                      <TableCell>
                        <Chip 
                          label={['Cash', 'Card', 'Bank'][index % 3]} 
                          size="small"
                          sx={{
                            backgroundColor: index % 3 === 0 ? '#2563eb' : index % 3 === 1 ? '#000000' : '#64748b',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            borderRadius: 2
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Completed" 
                          size="small"
                          sx={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            borderRadius: 2
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

        {/* Top Performers Sidebar */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Top Customers */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2, 
                backgroundColor: '#ffffff',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                  Top Customers
                </Typography>
                <Box>
                  {topCustomers.map((customer, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1,
                      backgroundColor: '#f8fafc',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0'
                    }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" color="#1e293b">
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          {customer.orders} orders
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" color="#2563eb">
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
                p: 2, 
                backgroundColor: '#ffffff',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                  Top Products
                </Typography>
                <Box>
                  {topProducts.map((product, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1,
                      backgroundColor: '#f8fafc',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0'
                    }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" color="#1e293b">
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          {product.sold} units sold
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" color="#10b981">
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
