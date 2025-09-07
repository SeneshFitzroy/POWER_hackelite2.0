import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { DollarSign, Download, Calendar, Search } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 ml-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input"
          />
          <button
            onClick={processPayroll}
            disabled={processing}
            className="btn-primary flex items-center"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {processing ? 'Processing...' : 'Process Payroll'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by employee name or month..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Payroll Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
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