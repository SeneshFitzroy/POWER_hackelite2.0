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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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

// Professional Stats Card - Clean Design
const StatsCard = ({ title, value, icon, color = '#2563eb', trend }) => (
  <Card sx={{ 
    height: '120px',
    backgroundColor: color,
    color: '#ffffff',
    borderRadius: '8px',
    border: 'none',
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

// Clean Chart Component
const SimpleChart = ({ data, title, type = 'bar' }) => (
  <Box sx={{ 
    height: 200, 
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
        { name: 'Product A', sold: 150, revenue: 7500 },
        { name: 'Product B', sold: 120, revenue: 6000 },
        { name: 'Product C', sold: 90, revenue: 4500 }
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
    <Box sx={{ p: 0 }}>
      {/* Stats Cards Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Sales"
            value={salesData.totalSales}
            icon={<TrendingUp sx={{ color: '#ffffff', fontSize: 24 }} />}
            color="#1e3a8a"
            trend="+12% from last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Revenue"
            value={formatCurrency(salesData.totalRevenue)}
            icon={<AttachMoney sx={{ color: '#ffffff', fontSize: 24 }} />}
            color="#059669"
            trend="+8% from last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Customers"
            value={salesData.totalCustomers}
            icon={<People sx={{ color: '#ffffff', fontSize: 24 }} />}
            color="#7c3aed"
            trend="+15% from last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Orders"
            value={salesData.totalOrders}
            icon={<ShoppingCart sx={{ color: '#ffffff', fontSize: 24 }} />}
            color="#dc2626"
            trend="+5% from last period"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={2}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 280 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1f2937' }}>
              Sales Report - {dateFilter.toUpperCase()}
            </Typography>
            <SimpleChart data={[]} title="Sales Trends" type="line" />
          </Paper>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 280 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1f2937' }}>
              Payment Methods
            </Typography>
            <SimpleChart data={[]} title="Payment Distribution" type="pie" />
            
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOn sx={{ color: '#2563eb', mr: 1, fontSize: 18 }} />
                  <Typography variant="body2" color="#1f2937" fontWeight="500">Cash</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600" color="#2563eb">60%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCard sx={{ color: '#059669', mr: 1, fontSize: 18 }} />
                  <Typography variant="body2" color="#1f2937" fontWeight="500">Card</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600" color="#059669">30%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ color: '#7c3aed', mr: 1, fontSize: 18 }} />
                  <Typography variant="body2" color="#1f2937" fontWeight="500">Bank</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600" color="#7c3aed">10%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="600" color="#1f2937">
                Recent Payments
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowPaymentDialog(true)}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Record Payment
              </Button>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentRecords.map((payment, index) => (
                    <TableRow key={payment.id || index} sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                      '&:hover': { backgroundColor: '#f3f4f6' }
                    }}>
                      <TableCell sx={{ color: '#1f2937', py: 1 }}>{payment.customerName}</TableCell>
                      <TableCell sx={{ color: '#2563eb', fontWeight: 600, py: 1 }}>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip 
                          label={payment.method} 
                          size="small"
                          sx={{
                            backgroundColor: payment.method === 'cash' ? '#2563eb' : 
                                           payment.method === 'card' ? '#059669' : '#7c3aed',
                            color: '#ffffff',
                            fontWeight: 500,
                            fontSize: '11px'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280', py: 1 }}>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1f2937' }}>
              Top Customers
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Orders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#1f2937', py: 1 }}>{customer.name}</TableCell>
                      <TableCell sx={{ color: '#2563eb', fontWeight: 600, py: 1 }}>{formatCurrency(customer.total)}</TableCell>
                      <TableCell sx={{ color: '#6b7280', py: 1 }}>{customer.orders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1f2937' }}>
              Top Selling Products
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Units Sold</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#1f2937', py: 1 }}>{product.name}</TableCell>
                      <TableCell sx={{ color: '#6b7280', py: 1 }}>{product.sold}</TableCell>
                      <TableCell sx={{ color: '#2563eb', fontWeight: 600, py: 1 }}>{formatCurrency(product.revenue)}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip 
                          label="Excellent" 
                          sx={{
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            fontWeight: 500,
                            fontSize: '11px'
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
          backgroundColor: '#1e3a8a', 
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: '#ffffff' }}>
          <Button onClick={() => setShowPaymentDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPayment}
            disabled={loading || !newPayment.amount || !newPayment.customerName}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
