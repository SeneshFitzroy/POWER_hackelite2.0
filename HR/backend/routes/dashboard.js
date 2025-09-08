const express = require('express');
const { getFirestore } = require('../config/firebase');
const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const db = getFirestore();
    
    // Get employees count
    const employeesSnapshot = await db.collection('employees').get();
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    const probationEmployees = employees.filter(emp => emp.status === 'probation');
    
    // Get licenses expiring in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const licensesSnapshot = await db.collection('licenses').get();
    const licenses = licensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const expiringLicenses = licenses.filter(license => {
      const expiryDate = new Date(license.expiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
    });
    
    const expiredLicenses = licenses.filter(license => {
      const expiryDate = new Date(license.expiryDate);
      return expiryDate < new Date();
    });
    
    // Get recent attendance (today)
    const today = new Date().toISOString().split('T')[0];
    const attendanceSnapshot = await db.collection('attendance')
      .where('date', '==', today)
      .get();
    
    const todayAttendance = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const presentToday = todayAttendance.filter(att => att.status === 'present').length;
    
    // Get pending performance reviews
    const reviewsSnapshot = await db.collection('performance_reviews')
      .where('status', '==', 'pending')
      .get();
    
    const pendingReviews = reviewsSnapshot.size;
    
    // Get payroll stats for current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const payrollSnapshot = await db.collection('payrolls')
      .where('month', '==', currentMonth)
      .get();
    
    const currentMonthPayroll = payrollSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalPayrollAmount = currentMonthPayroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    
    // Recent activities - empty by default
    const recentActivities = [];
    
    res.status(200).json({
      success: true,
      data: {
        employees: {
          total: employees.length,
          active: activeEmployees.length,
          probation: probationEmployees.length,
          inactive: employees.length - activeEmployees.length - probationEmployees.length
        },
        licenses: {
          total: licenses.length,
          active: licenses.filter(l => l.status === 'active').length,
          expiring: expiringLicenses.length,
          expired: expiredLicenses.length
        },
        attendance: {
          todayPresent: presentToday,
          todayTotal: activeEmployees.length,
          attendanceRate: activeEmployees.length > 0 ? (presentToday / activeEmployees.length * 100).toFixed(1) : 0
        },
        performance: {
          pendingReviews,
          completedThisMonth: 0 // You can calculate this based on your needs
        },
        payroll: {
          currentMonthProcessed: currentMonthPayroll.length,
          currentMonthAmount: totalPayrollAmount,
          pendingPayroll: Math.max(0, activeEmployees.length - currentMonthPayroll.length)
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// @desc    Get employee distribution by role
// @route   GET /api/dashboard/employee-distribution
// @access  Private
router.get('/employee-distribution', async (req, res) => {
  try {
    const db = getFirestore();
    
    const employeesSnapshot = await db.collection('employees').get();
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const distribution = employees.reduce((acc, emp) => {
      const role = emp.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Employee distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee distribution'
    });
  }
});

// @desc    Get attendance trends (last 7 days)
// @route   GET /api/dashboard/attendance-trends
// @access  Private
router.get('/attendance-trends', async (req, res) => {
  try {
    const db = getFirestore();
    
    // Get last 7 days
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const attendanceSnapshot = await db.collection('attendance')
        .where('date', '==', dateStr)
        .get();
      
      const dayAttendance = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const present = dayAttendance.filter(att => att.status === 'present').length;
      const late = dayAttendance.filter(att => att.status === 'late').length;
      const absent = dayAttendance.filter(att => att.status === 'absent').length;
      
      trends.push({
        date: dateStr,
        present,
        late,
        absent,
        total: present + late + absent
      });
    }
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Attendance trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance trends'
    });
  }
});

module.exports = router;