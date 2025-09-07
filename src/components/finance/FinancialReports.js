import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  Assessment,
  AccountBalance,
  TrendingUp,
  Download,
  Print,
  Share,
  DateRange
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

export default function FinancialReports({ dateFilter }) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sample P&L Data
  const profitLossData = {
    revenue: {
      sales: 595000,
      serviceRevenue: 85000,
      otherIncome: 15000,
      total: 695000
    },
    expenses: {
      costOfGoodsSold: 298000,
      salaries: 125000,
      rent: 35000,
      utilities: 28000,
      marketing: 42000,
      depreciation: 18000,
      otherExpenses: 22000,
      total: 568000
    },
    netIncome: 127000
  };

  // Sample Balance Sheet Data
  const balanceSheetData = {
    assets: {
      currentAssets: {
        cash: 485000,
        accountsReceivable: 125000,
        inventory: 280000,
        prepaidExpenses: 25000,
        total: 915000
      },
      fixedAssets: {
        equipment: 350000,
        furniture: 85000,
        vehicles: 125000,
        accumulatedDepreciation: -95000,
        total: 465000
      },
      totalAssets: 1380000
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: 95000,
        shortTermLoans: 45000,
        accruedExpenses: 28000,
        total: 168000
      },
      longTermLiabilities: {
        longTermLoans: 285000,
        total: 285000
      },
      totalLiabilities: 453000
    },
    equity: {
      ownerEquity: 800000,
      retainedEarnings: 127000,
      total: 927000
    }
  };

  // Sample Cash Flow Data
  const cashFlowData = {
    operating: {
      netIncome: 127000,
      depreciation: 18000,
      accountsReceivableChange: -15000,
      inventoryChange: -25000,
      accountsPayableChange: 12000,
      total: 117000
    },
    investing: {
      equipmentPurchase: -45000,
      total: -45000
    },
    financing: {
      loanRepayment: -25000,
      ownerWithdrawal: -30000,
      total: -55000
    },
    netCashFlow: 17000,
    beginningCash: 468000,
    endingCash: 485000
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString()}`;
  };

  const TableRowStyled = ({ label, amount, isTotal = false, isSubtotal = false, indent = 0 }) => (
    <TableRow
      sx={{
        backgroundColor: isTotal ? '#f8fafc' : 'transparent',
        borderTop: isTotal ? '2px solid #1e3a8a' : 'none'
      }}
    >
      <TableCell
        sx={{
          pl: 2 + indent,
          fontWeight: isTotal ? 'bold' : isSubtotal ? 'medium' : 'normal',
          fontSize: isTotal ? '16px' : '14px',
          color: isTotal ? '#1e3a8a' : '#374151'
        }}
      >
        {label}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          fontWeight: isTotal ? 'bold' : isSubtotal ? 'medium' : 'normal',
          fontSize: isTotal ? '16px' : '14px',
          color: amount < 0 ? '#ef4444' : isTotal ? '#1e3a8a' : '#374151'
        }}
      >
        {amount < 0 ? `(${formatCurrency(amount)})` : formatCurrency(amount)}
      </TableCell>
    </TableRow>
  );

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
            Financial Reports
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              fontSize: '16px'
            }}
          >
            Comprehensive financial statements and analysis
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<Download />}
            variant="outlined"
            sx={{
              borderColor: '#1e3a8a',
              color: '#1e3a8a',
              '&:hover': {
                backgroundColor: '#1e3a8a',
                color: 'white'
              }
            }}
          >
            Export
          </Button>
          <Button
            startIcon={<Print />}
            variant="outlined"
            sx={{
              borderColor: '#64748b',
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#64748b',
                color: 'white'
              }
            }}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Report Tabs */}
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
            onChange={handleTabChange}
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
              icon={<Assessment sx={{ fontSize: '20px' }} />}
              iconPosition="start"
              label="Profit & Loss"
            />
            <Tab
              icon={<AccountBalance sx={{ fontSize: '20px' }} />}
              iconPosition="start"
              label="Balance Sheet"
            />
            <Tab
              icon={<TrendingUp sx={{ fontSize: '20px' }} />}
              iconPosition="start"
              label="Cash Flow"
            />
          </Tabs>
        </Box>

        {/* Profit & Loss Statement */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                Profit & Loss Statement
              </Typography>
              <Chip
                icon={<DateRange sx={{ fontSize: '16px' }} />}
                label={`Period: ${dateFilter.toUpperCase()}`}
                variant="outlined"
                sx={{ borderColor: '#1e3a8a', color: '#1e3a8a' }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Account</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Revenue Section */}
                  <TableRowStyled label="REVENUE" amount={0} isSubtotal />
                  <TableRowStyled label="Sales Revenue" amount={profitLossData.revenue.sales} indent={1} />
                  <TableRowStyled label="Service Revenue" amount={profitLossData.revenue.serviceRevenue} indent={1} />
                  <TableRowStyled label="Other Income" amount={profitLossData.revenue.otherIncome} indent={1} />
                  <TableRowStyled label="Total Revenue" amount={profitLossData.revenue.total} isSubtotal />
                  
                  <TableRow><TableCell colSpan={2} sx={{ py: 1 }}></TableCell></TableRow>
                  
                  {/* Expenses Section */}
                  <TableRowStyled label="EXPENSES" amount={0} isSubtotal />
                  <TableRowStyled label="Cost of Goods Sold" amount={profitLossData.expenses.costOfGoodsSold} indent={1} />
                  <TableRowStyled label="Salaries & Benefits" amount={profitLossData.expenses.salaries} indent={1} />
                  <TableRowStyled label="Rent" amount={profitLossData.expenses.rent} indent={1} />
                  <TableRowStyled label="Utilities" amount={profitLossData.expenses.utilities} indent={1} />
                  <TableRowStyled label="Marketing" amount={profitLossData.expenses.marketing} indent={1} />
                  <TableRowStyled label="Depreciation" amount={profitLossData.expenses.depreciation} indent={1} />
                  <TableRowStyled label="Other Expenses" amount={profitLossData.expenses.otherExpenses} indent={1} />
                  <TableRowStyled label="Total Expenses" amount={profitLossData.expenses.total} isSubtotal />
                  
                  <TableRow><TableCell colSpan={2} sx={{ py: 1 }}></TableCell></TableRow>
                  
                  {/* Net Income */}
                  <TableRowStyled label="NET INCOME" amount={profitLossData.netIncome} isTotal />
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Balance Sheet */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                Balance Sheet
              </Typography>
              <Chip
                icon={<DateRange sx={{ fontSize: '16px' }} />}
                label={`As of: ${new Date().toLocaleDateString()}`}
                variant="outlined"
                sx={{ borderColor: '#1e3a8a', color: '#1e3a8a' }}
              />
            </Box>

            <Grid container spacing={4}>
              {/* Assets */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                  ASSETS
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRowStyled label="CURRENT ASSETS" amount={0} isSubtotal />
                      <TableRowStyled label="Cash & Cash Equivalents" amount={balanceSheetData.assets.currentAssets.cash} indent={1} />
                      <TableRowStyled label="Accounts Receivable" amount={balanceSheetData.assets.currentAssets.accountsReceivable} indent={1} />
                      <TableRowStyled label="Inventory" amount={balanceSheetData.assets.currentAssets.inventory} indent={1} />
                      <TableRowStyled label="Prepaid Expenses" amount={balanceSheetData.assets.currentAssets.prepaidExpenses} indent={1} />
                      <TableRowStyled label="Total Current Assets" amount={balanceSheetData.assets.currentAssets.total} isSubtotal />
                      
                      <TableRow><TableCell colSpan={2} sx={{ py: 0.5 }}></TableCell></TableRow>
                      
                      <TableRowStyled label="FIXED ASSETS" amount={0} isSubtotal />
                      <TableRowStyled label="Equipment" amount={balanceSheetData.assets.fixedAssets.equipment} indent={1} />
                      <TableRowStyled label="Furniture & Fixtures" amount={balanceSheetData.assets.fixedAssets.furniture} indent={1} />
                      <TableRowStyled label="Vehicles" amount={balanceSheetData.assets.fixedAssets.vehicles} indent={1} />
                      <TableRowStyled label="Accumulated Depreciation" amount={balanceSheetData.assets.fixedAssets.accumulatedDepreciation} indent={1} />
                      <TableRowStyled label="Total Fixed Assets" amount={balanceSheetData.assets.fixedAssets.total} isSubtotal />
                      
                      <TableRowStyled label="TOTAL ASSETS" amount={balanceSheetData.assets.totalAssets} isTotal />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Liabilities & Equity */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e3a8a' }}>
                  LIABILITIES & EQUITY
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRowStyled label="CURRENT LIABILITIES" amount={0} isSubtotal />
                      <TableRowStyled label="Accounts Payable" amount={balanceSheetData.liabilities.currentLiabilities.accountsPayable} indent={1} />
                      <TableRowStyled label="Short-term Loans" amount={balanceSheetData.liabilities.currentLiabilities.shortTermLoans} indent={1} />
                      <TableRowStyled label="Accrued Expenses" amount={balanceSheetData.liabilities.currentLiabilities.accruedExpenses} indent={1} />
                      <TableRowStyled label="Total Current Liabilities" amount={balanceSheetData.liabilities.currentLiabilities.total} isSubtotal />
                      
                      <TableRow><TableCell colSpan={2} sx={{ py: 0.5 }}></TableCell></TableRow>
                      
                      <TableRowStyled label="LONG-TERM LIABILITIES" amount={0} isSubtotal />
                      <TableRowStyled label="Long-term Loans" amount={balanceSheetData.liabilities.longTermLiabilities.longTermLoans} indent={1} />
                      <TableRowStyled label="Total Long-term Liabilities" amount={balanceSheetData.liabilities.longTermLiabilities.total} isSubtotal />
                      
                      <TableRowStyled label="Total Liabilities" amount={balanceSheetData.liabilities.totalLiabilities} isSubtotal />
                      
                      <TableRow><TableCell colSpan={2} sx={{ py: 0.5 }}></TableCell></TableRow>
                      
                      <TableRowStyled label="OWNER'S EQUITY" amount={0} isSubtotal />
                      <TableRowStyled label="Owner's Equity" amount={balanceSheetData.equity.ownerEquity} indent={1} />
                      <TableRowStyled label="Retained Earnings" amount={balanceSheetData.equity.retainedEarnings} indent={1} />
                      <TableRowStyled label="Total Equity" amount={balanceSheetData.equity.total} isSubtotal />
                      
                      <TableRowStyled label="TOTAL LIABILITIES & EQUITY" amount={balanceSheetData.liabilities.totalLiabilities + balanceSheetData.equity.total} isTotal />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Cash Flow Statement */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                Cash Flow Statement
              </Typography>
              <Chip
                icon={<DateRange sx={{ fontSize: '16px' }} />}
                label={`Period: ${dateFilter.toUpperCase()}`}
                variant="outlined"
                sx={{ borderColor: '#1e3a8a', color: '#1e3a8a' }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Cash Flow Activity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Operating Activities */}
                  <TableRowStyled label="OPERATING ACTIVITIES" amount={0} isSubtotal />
                  <TableRowStyled label="Net Income" amount={cashFlowData.operating.netIncome} indent={1} />
                  <TableRowStyled label="Depreciation" amount={cashFlowData.operating.depreciation} indent={1} />
                  <TableRowStyled label="Change in Accounts Receivable" amount={cashFlowData.operating.accountsReceivableChange} indent={1} />
                  <TableRowStyled label="Change in Inventory" amount={cashFlowData.operating.inventoryChange} indent={1} />
                  <TableRowStyled label="Change in Accounts Payable" amount={cashFlowData.operating.accountsPayableChange} indent={1} />
                  <TableRowStyled label="Net Cash from Operating Activities" amount={cashFlowData.operating.total} isSubtotal />
                  
                  <TableRow><TableCell colSpan={2} sx={{ py: 1 }}></TableCell></TableRow>
                  
                  {/* Investing Activities */}
                  <TableRowStyled label="INVESTING ACTIVITIES" amount={0} isSubtotal />
                  <TableRowStyled label="Purchase of Equipment" amount={cashFlowData.investing.equipmentPurchase} indent={1} />
                  <TableRowStyled label="Net Cash from Investing Activities" amount={cashFlowData.investing.total} isSubtotal />
                  
                  <TableRow><TableCell colSpan={2} sx={{ py: 1 }}></TableCell></TableRow>
                  
                  {/* Financing Activities */}
                  <TableRowStyled label="FINANCING ACTIVITIES" amount={0} isSubtotal />
                  <TableRowStyled label="Loan Repayment" amount={cashFlowData.financing.loanRepayment} indent={1} />
                  <TableRowStyled label="Owner Withdrawal" amount={cashFlowData.financing.ownerWithdrawal} indent={1} />
                  <TableRowStyled label="Net Cash from Financing Activities" amount={cashFlowData.financing.total} isSubtotal />
                  
                  <TableRow><TableCell colSpan={2} sx={{ py: 1 }}></TableCell></TableRow>
                  
                  {/* Summary */}
                  <TableRowStyled label="NET CHANGE IN CASH" amount={cashFlowData.netCashFlow} isTotal />
                  <TableRowStyled label="Cash at Beginning of Period" amount={cashFlowData.beginningCash} />
                  <TableRowStyled label="CASH AT END OF PERIOD" amount={cashFlowData.endingCash} isTotal />
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}
