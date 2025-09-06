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

// Clean Professional Chart Component
const CleanChart = ({ data, title, type = 'bar', height = 200 }) => (
  <Box sx={{ 
    height: height, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    color: '#6b7280'
  }}>
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body1" color="#6b7280" fontWeight="500">
        {title} Chart
      </Typography>
      <Typography variant="body2" color="#9ca3af" sx={{ mt: 1 }}>
        Data visualization
      </Typography>
    </Box>
  </Box>
);

// Professional Stats Card matching the design
const ProfessionalStatsCard = ({ title, value, icon, bgColor, iconColor }) => (
  <Paper sx={{ 
    p: 2.5,
    borderRadius: '16px',
    backgroundColor: bgColor,
    border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" color="#1f2937" sx={{ mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="#6b7280" fontWeight="500">
          {title}
        </Typography>
        <Typography variant="caption" color="#10b981" fontWeight="600" sx={{ mt: 0.5, display: 'block' }}>
          +12% from yesterday
        </Typography>
      </Box>
      <Box sx={{ 
        p: 1.5, 
        backgroundColor: iconColor, 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
    </Box>
  </Paper>
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
      p: 3, 
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        {/* Removed heading as requested */}
      </Box>
      {/* Stats Cards Row - Matching the design */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ProfessionalStatsCard
            title="Total Sales"
            value="$1k"
            icon={<TrendingUp sx={{ color: '#ffffff', fontSize: 24 }} />}
            bgColor="#fef2f2"
            iconColor="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProfessionalStatsCard
            title="Total Order"
            value="300"
            icon={<ShoppingCart sx={{ color: '#ffffff', fontSize: 24 }} />}
            bgColor="#fff7ed"
            iconColor="#f97316"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProfessionalStatsCard
            title="Product Sold"
            value="5"
            icon={<AttachMoney sx={{ color: '#ffffff', fontSize: 24 }} />}
            bgColor="#f0fdf4"
            iconColor="#22c55e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProfessionalStatsCard
            title="New Customers"
            value="8"
            icon={<People sx={{ color: '#ffffff', fontSize: 24 }} />}
            bgColor="#f0f9ff"
            iconColor="#3b82f6"
          />
        </Grid>
      </Grid>

      {/* Main Dashboard Content */}
      <Grid container spacing={3}>
        {/* Total Revenue Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 3 }}>
              Total Revenue
            </Typography>
            <CleanChart title="Revenue" type="bar" height={250} />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="caption" color="#6b7280">Online Sales</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="caption" color="#6b7280">Offline Sales</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Customer Satisfaction */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 3 }}>
              Customer Satisfaction
            </Typography>
            <CleanChart title="Satisfaction" type="line" height={200} />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="#6b7280">Last Month</Typography>
                <Typography variant="h6" fontWeight="bold" color="#3b82f6">$2,004</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="#6b7280">This Month</Typography>
                <Typography variant="h6" fontWeight="bold" color="#10b981">$4,024</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Target vs Reality */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 3 }}>
              Target vs Reality
            </Typography>
            <CleanChart title="Target" type="bar" height={200} />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="#6b7280">Reality Sales</Typography>
                <Typography variant="h6" fontWeight="bold" color="#3b82f6">8,823</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="#6b7280">Target Sales</Typography>
                <Typography variant="h6" fontWeight="bold" color="#f59e0b">9,122</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 3 }}>
              Top Products
            </Typography>
            <Box sx={{ space: 2 }}>
              {[
                { name: 'Product A', sales: '$12,534', percentage: 85 },
                { name: 'Product B', sales: '$8,742', percentage: 65 },
                { name: 'Product C', sales: '$6,235', percentage: 45 },
                { name: 'Product D', sales: '$4,890', percentage: 35 }
              ].map((product, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="#1f2937">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="#3b82f6">
                      {product.sales}
                    </Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e5e7eb', height: 4, borderRadius: 2, overflow: 'hidden' }}>
                    <Box 
                      sx={{ 
                        backgroundColor: '#3b82f6', 
                        height: '100%', 
                        width: `${product.percentage}%`,
                        borderRadius: 2 
                      }} 
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 3 }}>
              Recent Activity
            </Typography>
            <Box>
              {[
                { action: 'New order placed', customer: 'John Doe', amount: '$234', time: '2 min ago' },
                { action: 'Payment received', customer: 'Jane Smith', amount: '$456', time: '5 min ago' },
                { action: 'Product updated', customer: 'System', amount: '', time: '12 min ago' },
                { action: 'Customer registered', customer: 'Mike Johnson', amount: '', time: '23 min ago' },
                { action: 'Order delivered', customer: 'Sarah Wilson', amount: '$123', time: '1 hour ago' }
              ].map((activity, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 2,
                  borderBottom: index < 4 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium" color="#1f2937">
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="#6b7280">
                      {activity.customer} {activity.amount && `• ${activity.amount}`}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="#9ca3af">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
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
