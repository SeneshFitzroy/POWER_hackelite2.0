const express = require('express');
const { getFirestore } = require('../config/firebase');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const { month, employeeId, status } = req.query;
    
    let query = db.collection('payrolls');
    
    // Apply filters
    if (month) {
      query = query.where('month', '==', month);
    }
    
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // Order by creation date (most recent first)
    query = query.orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    const payrolls = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll records'
    });
  }
});

// @desc    Get single payroll record
// @route   GET /api/payroll/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('payrolls').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get payroll record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll record'
    });
  }
});

// @desc    Process payroll for a month
// @route   POST /api/payroll/process
// @access  Private
router.post('/process', [
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
  body('employeeIds').optional().isArray().withMessage('Employee IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const db = getFirestore();
    const { month, employeeIds } = req.body;
    
    // Check if payroll already processed for this month
    const existingPayroll = await db.collection('payrolls')
      .where('month', '==', month)
      .get();
    
    if (!existingPayroll.empty && !employeeIds) {
      return res.status(400).json({
        success: false,
        message: 'Payroll already processed for this month'
      });
    }
    
    // Get active employees
    let employeesQuery = db.collection('employees').where('status', '==', 'active');
    
    if (employeeIds && employeeIds.length > 0) {
      // Process specific employees
      employeesQuery = db.collection('employees').where('__name__', 'in', employeeIds);
    }
    
    const employeesSnapshot = await employeesQuery.get();
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active employees found'
      });
    }
    
    const payrollRecords = [];
    const batch = db.batch();
    
    for (const employee of employees) {
      // Skip if already processed for this employee and month
      if (!employeeIds) {
        const existingRecord = existingPayroll.docs.find(doc => 
          doc.data().employeeId === employee.id
        );
        if (existingRecord) continue;
      }
      
      // Calculate payroll
      const baseSalary = employee.salary || 0;
      
      // Get attendance data for overtime calculation
      const attendanceSnapshot = await db.collection('attendance')
        .where('employeeId', '==', employee.id)
        .where('date', '>=', `${month}-01`)
        .where('date', '<=', `${month}-31`)
        .get();
      
      const attendanceRecords = attendanceSnapshot.docs.map(doc => doc.data());
      
      // Calculate overtime (simplified - you can enhance this logic)
      const overtimeHours = attendanceRecords.reduce((total, record) => {
        if (record.hoursWorked > 8) {
          return total + (record.hoursWorked - 8);
        }
        return total;
      }, 0);
      
      const overtimePay = overtimeHours * (200 / 0.5); // 200 LKR per 30 minutes
      
      // Calculate deductions (Sri Lankan rates)
      const epfEmployee = baseSalary * 0.08; // 8% employee EPF
      const epfEmployer = baseSalary * 0.12; // 12% employer EPF
      const etf = baseSalary * 0.03; // 3% ETF
      
      // Calculate allowances (you can add more logic here)
      const allowances = employee.allowances || 0;
      
      const grossSalary = baseSalary + overtimePay + allowances;
      const totalDeductions = epfEmployee;
      const netSalary = grossSalary - totalDeductions;
      
      const payrollRecord = {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeNumber: employee.employeeId,
        month,
        baseSalary,
        allowances,
        overtimeHours: parseFloat(overtimeHours.toFixed(2)),
        overtimePay: parseFloat(overtimePay.toFixed(2)),
        grossSalary: parseFloat(grossSalary.toFixed(2)),
        epfEmployee: parseFloat(epfEmployee.toFixed(2)),
        epfEmployer: parseFloat(epfEmployer.toFixed(2)),
        etf: parseFloat(etf.toFixed(2)),
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        netSalary: parseFloat(netSalary.toFixed(2)),
        status: 'processed',
        processedBy: req.user.uid,
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      payrollRecords.push(payrollRecord);
      
      // Add to batch
      const docRef = db.collection('payrolls').doc();
      batch.set(docRef, payrollRecord);
    }
    
    // Commit batch
    await batch.commit();
    
    res.status(201).json({
      success: true,
      data: payrollRecords,
      message: `Payroll processed for ${payrollRecords.length} employees`
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payroll'
    });
  }
});

// @desc    Update payroll record
// @route   PUT /api/payroll/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('payrolls').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    };
    
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    
    res.status(200).json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Payroll record updated successfully'
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payroll record'
    });
  }
});

// @desc    Delete payroll record
// @route   DELETE /api/payroll/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('payrolls').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    await docRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'Payroll record deleted successfully'
    });
  } catch (error) {
    console.error('Delete payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payroll record'
    });
  }
});

// @desc    Get payroll summary by month
// @route   GET /api/payroll/summary/:month
// @access  Private
router.get('/summary/:month', async (req, res) => {
  try {
    const db = getFirestore();
    const { month } = req.params;
    
    const snapshot = await db.collection('payrolls')
      .where('month', '==', month)
      .get();
    
    const payrolls = snapshot.docs.map(doc => doc.data());
    
    const summary = {
      totalEmployees: payrolls.length,
      totalGrossSalary: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
      totalNetSalary: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
      totalDeductions: payrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
      totalEPFEmployee: payrolls.reduce((sum, p) => sum + p.epfEmployee, 0),
      totalEPFEmployer: payrolls.reduce((sum, p) => sum + p.epfEmployer, 0),
      totalETF: payrolls.reduce((sum, p) => sum + p.etf, 0),
      totalOvertimePay: payrolls.reduce((sum, p) => sum + p.overtimePay, 0),
      averageSalary: payrolls.length > 0 ? payrolls.reduce((sum, p) => sum + p.netSalary, 0) / payrolls.length : 0
    };
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get payroll summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll summary'
    });
  }
});

// @desc    Generate payslip
// @route   GET /api/payroll/:id/payslip
// @access  Private
router.get('/:id/payslip', async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('payrolls').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    const payroll = doc.data();
    
    // Get employee details
    const employeeDoc = await db.collection('employees').doc(payroll.employeeId).get();
    const employee = employeeDoc.exists ? employeeDoc.data() : {};
    
    const payslip = {
      payrollId: doc.id,
      employee: {
        name: payroll.employeeName,
        employeeId: payroll.employeeNumber,
        email: employee.email,
        role: employee.role
      },
      period: payroll.month,
      earnings: {
        baseSalary: payroll.baseSalary,
        allowances: payroll.allowances || 0,
        overtimePay: payroll.overtimePay,
        grossSalary: payroll.grossSalary
      },
      deductions: {
        epf: payroll.epfEmployee,
        totalDeductions: payroll.totalDeductions
      },
      netSalary: payroll.netSalary,
      generatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: payslip
    });
  } catch (error) {
    console.error('Generate payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payslip'
    });
  }
});

module.exports = router;