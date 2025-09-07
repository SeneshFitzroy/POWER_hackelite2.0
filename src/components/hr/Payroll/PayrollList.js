import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Container,
  IconButton,
  Chip
} from '@mui/material';
import {
  AttachMoney,
  GetApp,
  CalendarToday,
  Search,
  PlayArrow
} from '@mui/icons-material';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import toast from 'react-hot-toast';

const PayrollList = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch employees
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);

      // Fetch payrolls
      const payrollsSnapshot = await getDocs(
        query(collection(db, 'payrolls'), orderBy('createdAt', 'desc'))
      );
      const payrollData = payrollsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayrolls(payrollData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const processPayroll = async () => {
    if (!selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    setProcessing(true);
    try {
      const activeEmployees = employees.filter(emp => emp.status === 'active');
      const payrollBatch = [];

      for (const employee of activeEmployees) {
        const baseSalary = employee.salary || 0;
        const overtimeHours = 0; // This would come from attendance data
        const overtimePay = overtimeHours * (200 / 60); // 200 LKR per 30 minutes
        
        // Calculate deductions (EPF/ETF - typical rates in Sri Lanka)
        const epfEmployee = baseSalary * 0.08; // 8% employee contribution
        const epfEmployer = baseSalary * 0.12; // 12% employer contribution
        const etf = baseSalary * 0.03; // 3% ETF

        const grossSalary = baseSalary + overtimePay;
        const totalDeductions = epfEmployee;
        const netSalary = grossSalary - totalDeductions;

        const payrollRecord = {
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          month: selectedMonth,
          baseSalary,
          overtimeHours,
          overtimePay,
          grossSalary,
          epfEmployee,
          epfEmployer,
          etf,
          totalDeductions,
          netSalary,
          status: 'processed',
          createdAt: new Date().toISOString(),
          processedBy: 'current-user' // This would be the logged-in user
        };

        payrollBatch.push(payrollRecord);
      }

      // Save all payroll records
      for (const record of payrollBatch) {
        await addDoc(collection(db, 'payrolls'), record);
      }

      toast.success(`Payroll processed for ${payrollBatch.length} employees`);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast.error('Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const generatePayslip = (payroll) => {
    // This would generate a PDF payslip
    toast.success('Payslip generated successfully');
  };

  const filteredPayrolls = payrolls.filter(payroll => {
    if (!searchTerm) return true;
    return payroll.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payroll.month.includes(searchTerm);
  });

  const groupedPayrolls = filteredPayrolls.reduce((acc, payroll) => {
    const month = payroll.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(payroll);
    return acc;
  }, {});

  const MetricCard = ({ title, value, icon, color }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${color}25`
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '50%',
              backgroundColor: `${color}20`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            color: color,
            mb: 1 
          }}
        >
          {value}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 'medium'
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              color: '#1e3a8a'
            }}
          >
            Payroll Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              type="month"
              size="small"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2 
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={processing ? <PlayArrow /> : <AttachMoney />}
              onClick={processPayroll}
              disabled={processing}
              sx={{
                backgroundColor: '#1e3a8a',
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: '#1d4ed8'
                }
              }}
            >
              {processing ? 'Processing...' : 'Process Payroll'}
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by employee name or month..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { border: 'none' }
              }
            }}
          />
        </Paper>
      </Box>

      {/* Payroll Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Employees"
            value={payrollStats.totalEmployees}
            icon={<AttachMoney sx={{ fontSize: 28 }} />}
            color="#1e3a8a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="This Month Processed"
            value={payrollStats.thisMonthProcessed}
            icon={<CalendarToday sx={{ fontSize: 28 }} />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Payout"
            value={`LKR ${payrollStats.totalPayout.toLocaleString()}`}
            icon={<AttachMoney sx={{ fontSize: 28 }} />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Months Processed"
            value={payrollStats.monthsProcessed}
            icon={<CalendarToday sx={{ fontSize: 28 }} />}
            color="#ef4444"
          />
        </Grid>
      </Grid>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month Processed</p>
              <p className="text-2xl font-bold text-gray-900">
                {groupedPayrolls[selectedMonth]?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payout</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR {(groupedPayrolls[selectedMonth]?.reduce((sum, p) => sum + p.netSalary, 0) || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Months Processed</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedPayrolls).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Records */}
      <div className="space-y-6">
        {Object.entries(groupedPayrolls).map(([month, monthPayrolls]) => (
          <div key={month} className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {new Date(month + '-01').toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </h3>
                <div className="text-sm text-gray-500">
                  {monthPayrolls.length} employees • LKR {monthPayrolls.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overtime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gross Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthPayrolls.map((payroll) => (
                    <tr key={payroll.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payroll.employeeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">LKR {payroll.baseSalary.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payroll.overtimeHours}h • LKR {payroll.overtimePay.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">LKR {payroll.grossSalary.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">LKR {payroll.totalDeductions.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">LKR {payroll.netSalary.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => generatePayslip(payroll)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedPayrolls).length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll records</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by processing payroll for the selected month.
          </p>
        </div>
      )}
    </div>
  );
};

export default PayrollList;