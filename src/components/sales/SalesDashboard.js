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
// Add Recharts imports
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

// Format number with commas
const formatNumber = (num) => {
  if (typeof num === 'string' && num.includes('LKR')) {
    return num;
  }
  if (typeof num === 'number') {
    return num.toLocaleString();
  }
  return num;
};

// Clean Professional Chart Component
const CleanChart = ({ data, title, type = 'bar', height = 200 }) => {
  // Format data for charts
  const formattedData = data.map((item, index) => ({
    ...item,
    name: item.name || item.date || `Item ${index + 1}`
  }));

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#1e3a8a" />
        </BarChart>
      </ResponsiveContainer>
    );
  } else if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
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
};

// Simple Pie Chart Component for Payment Methods
const PaymentPieChart = ({ paymentStats }) => {
  const total = paymentStats.cash + paymentStats.card + paymentStats.bank;
  
  if (total === 0) {
    return (
      <Box sx={{ 
        height: 200, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#6b7280'
      }}>
        <Typography variant="body2">No payment data available</Typography>
      </Box>
    );
  }

  // Prepare data for pie chart
  const data = [
    { name: 'Cash', value: paymentStats.cash, color: '#1e3a8a' },
    { name: 'Card', value: paymentStats.card, color: '#059669' },
    { name: 'Bank', value: paymentStats.bank, color: '#7c3aed' }
  ];

  // Filter out zero values to avoid rendering issues
  const filteredData = data.filter(item => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Professional Stats Card matching the design
const ProfessionalStatsCard = ({ title, value, icon, bgColor, iconColor, trend }) => {
  // Format number with commas locally
  const formatNumber = (num) => {
    if (typeof num === 'string' && num.includes('LKR')) {
      return num;
    }
    if (typeof num === 'number') {
      return num.toLocaleString();
    }
    return num;
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2.5,
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box 
          sx={{ 
            p: 1.25, 
            backgroundColor: iconColor, 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px'
          }}
        >
          {icon}
        </Box>
      </Box>
      
      <Box sx={{ mt: 'auto' }}>
        <Typography 
          variant="h5" 
          fontWeight="700" 
          color="#1f2937" 
          sx={{ 
            mb: 0.5,
            fontSize: '1.5rem',
            lineHeight: 1.2
          }}
        >
          {typeof value === 'string' && value.includes('LKR') ? value : formatNumber(value)}
        </Typography>
        <Typography 
          variant="body2" 
          color="#6b7280" 
          fontWeight="500"
          sx={{
            fontSize: '0.875rem'
          }}
        >
          {title}
        </Typography>
      </Box>
      
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
          <TrendingUp sx={{ color: '#10b981', fontSize: 14, mr: 0.5 }} />
          <Typography variant="caption" color="#10b981" fontWeight="600">
            {trend}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

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
  const [recentSales, setRecentSales] = useState([]);
  const [paymentStats, setPaymentStats] = useState({ cash: 0, card: 0, bank: 0 });
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);
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

      // Load sales data - FIXED: Use 'transactions' collection which is what POS uses
      const salesQuery = query(
        collection(db, 'transactions'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );
      
      const salesSnapshot = await getDocs(salesQuery);
      const sales = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load payment records - FIXED: Remove problematic not-equals query
      const paymentsQuery = query(
        collection(db, 'transactions'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      // FIXED: Filter payments in JavaScript instead of using Firestore query
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(payment => payment.paymentMethod != null); // Filter in JavaScript

      // Calculate statistics
      const totalSales = sales.length;
      // FIXED: Use 'total' field which is what POS transactions use
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || sale.netTotal || 0), 0);
      // FIXED: Use customer identification from POS transactions
      const uniqueCustomers = new Set(sales.map(sale => 
        sale.customerId || sale.customerNIC || sale.patientNIC || sale.customerName
      )).size;
      
      setSalesData({
        totalSales,
        totalOrders: totalSales,
        totalCustomers: uniqueCustomers,
        totalRevenue
      });

      // Calculate top customers from real sales data
      const customerTotals = {};
      sales.forEach(sale => {
        // FIXED: Use multiple possible customer identifiers from POS
        const customerId = sale.customerId || sale.customerNIC || sale.patientNIC || 'Walk-in Customer';
        const customerName = sale.customerName || 'Walk-in Customer';
        
        if (customerId) {
          customerTotals[customerId] = customerTotals[customerId] || {
            name: customerName,
            total: 0,
            orders: 0
          };
          // FIXED: Use correct total field
          customerTotals[customerId].total += sale.total || sale.netTotal || 0;
          customerTotals[customerId].orders += 1;
        }
      });
      
      const topCustomersData = Object.values(customerTotals)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Calculate top products from real sales data  
      const productTotals = {};
      sales.forEach(sale => {
        // FIXED: Use items array from POS transactions
        if (sale.items) {
          sale.items.forEach(item => {
            const productId = item.medicineId || item.id || item.productId;
            if (productId) {
              productTotals[productId] = productTotals[productId] || {
                name: item.name,
                sold: 0,
                revenue: 0
              };
              productTotals[productId].sold += item.quantity || 1;
              // FIXED: Calculate revenue correctly
              productTotals[productId].revenue += (item.quantity || 1) * (item.unitPrice || item.price || item.sellingPrice || 0);
            }
          });
        }
      });
      
      const topProductsData = Object.values(productTotals)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate payment method statistics
      const paymentMethodStats = { cash: 0, card: 0, bank: 0, total: 0 };
      payments.forEach(payment => {
        // FIXED: Use paymentMethod field from POS
        const method = payment.paymentMethod || 'cash';
        // Convert method to lowercase for consistency
        const normalizedMethod = method.toLowerCase();
        paymentMethodStats[normalizedMethod] = (paymentMethodStats[normalizedMethod] || 0) + 1;
        paymentMethodStats.total++;
      });

      // Calculate percentages with proper handling
      const totalPayments = paymentMethodStats.total;
      const paymentPercentages = {
        cash: totalPayments > 0 ? Math.round((paymentMethodStats.cash / totalPayments) * 100) : 0,
        card: totalPayments > 0 ? Math.round((paymentMethodStats.card / totalPayments) * 100) : 0,
        bank: totalPayments > 0 ? Math.round((paymentMethodStats.bank / totalPayments) * 100) : 0
      };

      // Prepare chart data
      // Revenue chart data (grouped by date)
      const revenueByDate = {};
      sales.forEach(sale => {
        if (sale.createdAt) {
          const date = new Date(sale.createdAt.toDate()).toLocaleDateString();
          revenueByDate[date] = (revenueByDate[date] || 0) + (sale.total || sale.netTotal || 0);
        }
      });
      
      const revenueChartData = Object.entries(revenueByDate)
        .map(([date, value]) => ({ name: date, value }))
        .slice(-7); // Last 7 days

      // Sales chart data (grouped by date)
      const salesByDate = {};
      sales.forEach(sale => {
        if (sale.createdAt) {
          const date = new Date(sale.createdAt.toDate()).toLocaleDateString();
          salesByDate[date] = (salesByDate[date] || 0) + 1;
        }
      });
      
      const salesChartData = Object.entries(salesByDate)
        .map(([date, value]) => ({ name: date, value }))
        .slice(-7); // Last 7 days

      setPaymentRecords(payments.slice(0, 10)); // Latest 10 payments
      setTopCustomers(topCustomersData);
      setTopProducts(topProductsData);
      setRecentSales(sales.slice(0, 5)); // Latest 5 sales
      setPaymentStats(paymentPercentages);
      setRevenueChartData(revenueChartData);
      setSalesChartData(salesChartData);

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
    if (!amount) return 'LKR 0.00';
    
    // Format large numbers with K or M suffix
    if (amount >= 1000000) {
      return `LKR ${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `LKR ${(amount / 1000).toFixed(2)}K`;
    }
    
    return `LKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function for full currency values (without abbreviation)
  const formatCurrencyFull = (amount) => {
    return `LKR ${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;
  };

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header Section - Removed */}

      {/* Stats Cards Row - Improved design */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ProfessionalStatsCard
            title="Total Sales"
            value={salesData.totalSales}
            icon={<TrendingUp sx={{ color: '#ffffff', fontSize: 24 }} />}
            bgColor="#fef2f2"
            iconColor="#ef4444"
            trend="+12% from yesterday"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProfessionalStatsCard
            title="Total Orders"
            value={salesData.totalOrders}
            icon={<ShoppingCart sx={{ color: '#ffffff', fontSize: 24 }} />}
            bgColor="#fff7ed"
            iconColor="#f97316"
            trend="+8% from yesterday"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProfessionalStatsCard
            title="Revenue"
            value={formatCurrency(salesData.totalRevenue)}
            icon={<AttachMoney sx={{ color: '#ffffff', fontSize: 24 }} />}
            bgColor="#f0fdf4"
            iconColor="#22c55e"
            trend="+15% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProfessionalStatsCard
            title="Customers"
            value={salesData.totalCustomers}
            icon={<People sx={{ color: '#ffffff', fontSize: 24 }} />}
            bgColor="#f0f9ff"
            iconColor="#1e3a8a"
            trend="+5% from last week"
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
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px', 
              mb: 2,
              border: '1px solid #e2e8f0'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="#64748b">
                  Total Revenue
                </Typography>
                <Chip 
                  label="LKR" 
                  size="small"
                  sx={{
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#16a34a">
                {formatCurrency(salesData.totalRevenue).replace('LKR ', '')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="#10b981" fontWeight="medium">
                  +15% from last month
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#1f2937" sx={{ mb: 2 }}>
                Revenue Trend
              </Typography>
              <CleanChart data={revenueChartData} title="Revenue" type="bar" height={150} />
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#1e3a8a', borderRadius: '50%', mr: 1 }} />
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

        {/* Payment Recording (Pie Chart) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 3 }}>
              Payment Methods
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px', 
              mb: 2,
              border: '1px solid #e2e8f0'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="#64748b">
                  Total Transactions
                </Typography>
                <Chip 
                  label={salesData.totalSales} 
                  size="small"
                  sx={{
                    backgroundColor: '#dbeafe',
                    color: '#1e3a8a',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e3a8a">
                {salesData.totalSales}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="#10b981" fontWeight="medium">
                  +5% from last week
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <PaymentPieChart paymentStats={paymentStats} />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: '#1e3a8a', 
                    borderRadius: '50%', 
                    mr: 1 
                  }} />
                  <Typography variant="body2" color="#1f2937" fontWeight="500">Cash</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight="600" color="#1e3a8a">{paymentStats.cash}%</Typography>
                  <Typography variant="caption" color="#9ca3af">
                    {Math.round((paymentStats.cash/100) * salesData.totalSales) || 0} transactions
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: '#059669', 
                    borderRadius: '50%', 
                    mr: 1 
                  }} />
                  <Typography variant="body2" color="#1f2937" fontWeight="500">Card</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight="600" color="#059669">{paymentStats.card}%</Typography>
                  <Typography variant="caption" color="#9ca3af">
                    {Math.round((paymentStats.card/100) * salesData.totalSales) || 0} transactions
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: '#7c3aed', 
                    borderRadius: '50%', 
                    mr: 1 
                  }} />
                  <Typography variant="body2" color="#1f2937" fontWeight="500">Bank</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight="600" color="#7c3aed">{paymentStats.bank}%</Typography>
                  <Typography variant="caption" color="#9ca3af">
                    {Math.round((paymentStats.bank/100) * salesData.totalSales) || 0} transactions
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sales Reports */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <Typography variant="h6" fontWeight="bold" color="#1f2937" sx={{ mb: 3 }}>
              Sales Reports
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px', 
              mb: 2,
              border: '1px solid #e2e8f0'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="#64748b">
                  Daily Sales
                </Typography>
                <Chip 
                  label={salesData.totalSales} 
                  size="small"
                  sx={{
                    backgroundColor: '#dbeafe',
                    color: '#1e3a8a',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e3a8a">
                {salesData.totalSales}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="#10b981" fontWeight="medium">
                  +12% from yesterday
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="#64748b">
                  Revenue
                </Typography>
                <Chip 
                  label="LKR" 
                  size="small"
                  sx={{
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#16a34a">
                {formatCurrency(salesData.totalRevenue).replace('LKR ', '')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="#10b981" fontWeight="medium">
                  +8% from yesterday
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#1f2937" sx={{ mb: 2 }}>
                Sales Trend
              </Typography>
              <CleanChart data={salesChartData} title="Sales" type="line" height={150} />
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
            <Box>
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          backgroundColor: index === 0 ? '#fef2f2' : 
                                         index === 1 ? '#fff7ed' : 
                                         index === 2 ? '#f0fdf4' : '#f1f5f9',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mr: 1
                        }}>
                          <Typography 
                            variant="caption" 
                            fontWeight="bold" 
                            color={index === 0 ? '#ef4444' : 
                                   index === 1 ? '#f97316' : 
                                   index === 2 ? '#22c55e' : '#64748b'}
                          >
                            {index + 1}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium" color="#1f2937">
                          {product.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" color="#1e3a8a">
                        {formatCurrencyFull(product.revenue)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ backgroundColor: '#e5e7eb', height: 6, borderRadius: 3, overflow: 'hidden', flex: 1 }}>
                        <Box 
                          sx={{ 
                            backgroundColor: index === 0 ? '#ef4444' : 
                                           index === 1 ? '#f97316' : 
                                           index === 2 ? '#22c55e' : '#1e3a8a', 
                            height: '100%', 
                            width: `${Math.min((product.revenue / (topProducts[0]?.revenue || 1)) * 100, 100)}%`,
                            borderRadius: 3 
                          }} 
                        />
                      </Box>
                      <Typography variant="caption" color="#6b7280" sx={{ ml: 1 }}>
                        {product.sold || 0} sold
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    backgroundColor: '#f3f4f6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <TrendingUp sx={{ color: '#9ca3af', fontSize: 24 }} />
                  </Box>
                  <Typography variant="body2" color="#6b7280">
                    No product sales data available
                  </Typography>
                  <Typography variant="caption" color="#9ca3af" display="block" sx={{ mt: 1 }}>
                    Top selling products will appear here
                  </Typography>
                </Box>
              )}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="#1f2937">
                Recent Activity
              </Typography>
              <Chip 
                label={`${recentSales.length} activities`} 
                size="small"
                sx={{
                  backgroundColor: '#e0f2fe',
                  color: '#0ea5e9',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            <Box>
              {recentSales.length > 0 ? (
                recentSales.map((sale, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      py: 2.5,
                      px: 2,
                      mb: 1.5,
                      backgroundColor: index % 2 === 0 ? '#f8fafc' : '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#f0f9ff',
                        transform: 'translateX(5px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        border: '1px solid #bae6fd'
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: '12px', 
                      backgroundColor: sale.paymentMethod === 'card' ? '#dcfce7' : 
                                     sale.paymentMethod === 'bank' ? '#ede9fe' : '#e0f2fe', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2,
                      mt: 0.5
                    }}>
                      <ShoppingCart sx={{ 
                        color: sale.paymentMethod === 'card' ? '#16a34a' : 
                               sale.paymentMethod === 'bank' ? '#7c3aed' : '#0ea5e9', 
                        fontSize: 22 
                      }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold" color="#1f2937" sx={{ mb: 0.5 }}>
                            New Sale Transaction
                          </Typography>
                          <Chip 
                            label={sale.paymentMethod ? sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1) : 'Cash'} 
                            size="small"
                            sx={{
                              backgroundColor: sale.paymentMethod === 'card' ? '#dcfce7' : 
                                             sale.paymentMethod === 'bank' ? '#ede9fe' : '#e0f2fe',
                              color: sale.paymentMethod === 'card' ? '#16a34a' : 
                                     sale.paymentMethod === 'bank' ? '#7c3aed' : '#0ea5e9',
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              height: '22px'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" fontWeight="bold" color="#1e3a8a" sx={{ fontSize: '1.1rem' }}>
                          {formatCurrencyFull(sale.total || sale.netTotal || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" color="#475569" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <People sx={{ fontSize: 16, mr: 0.5, color: '#94a3b8' }} />
                            {sale.customerName || 'Walk-in Customer'}
                          </Typography>
                          <Typography variant="caption" color="#94a3b8" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ 
                              backgroundColor: '#f1f5f9', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: '6px',
                              fontWeight: 'medium'
                            }}>
                              {sale.id ? `#${sale.id.substring(0, 6)}` : 'N/A'}
                            </Typography>
                            <Box sx={{ mx: 1 }}>•</Box>
                            {sale.items ? `${sale.items.length} items` : 'N/A'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="#94a3b8" sx={{ textAlign: 'right' }}>
                          {sale.createdAt ? new Date(sale.createdAt.toDate()).toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 'Unknown time'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: '16px', 
                    backgroundColor: '#f1f5f9', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <ShoppingCart sx={{ color: '#94a3b8', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" color="#64748b" fontWeight="600" sx={{ mb: 1 }}>
                    No Recent Activity
                  </Typography>
                  <Typography variant="body2" color="#94a3b8" sx={{ maxWidth: 300, margin: '0 auto' }}>
                    Sales transactions will appear here once customers make purchases
                  </Typography>
                </Box>
              )}
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
