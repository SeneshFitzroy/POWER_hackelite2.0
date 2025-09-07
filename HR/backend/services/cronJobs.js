const cron = require('node-cron');
const { getFirestore } = require('../config/firebase');
const { sendNotificationEmail } = require('./emailService');

const startCronJobs = () => {
  console.log('🕐 Starting cron jobs...');

  // Check for expiring licenses daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🔍 Checking for expiring licenses...');
    await checkExpiringLicenses();
  });

  // Check probation periods daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('🔍 Checking probation periods...');
    await checkProbationPeriods();
  });

  // Generate monthly reports on the 1st of each month at 8 AM
  cron.schedule('0 8 1 * *', async () => {
    console.log('📊 Generating monthly reports...');
    await generateMonthlyReports();
  });

  // Backup data weekly on Sundays at 2 AM
  cron.schedule('0 2 * * 0', async () => {
    console.log('💾 Creating weekly backup...');
    await createWeeklyBackup();
  });
};

const checkExpiringLicenses = async () => {
  try {
    const db = getFirestore();
    
    // Get licenses expiring in the next 30 days
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
    
    if (expiringLicenses.length > 0 || expiredLicenses.length > 0) {
      // Create notification record
      const notification = {
        type: 'license_alert',
        title: 'License Expiry Alert',
        message: `${expiringLicenses.length} license(s) expiring soon, ${expiredLicenses.length} license(s) expired`,
        data: {
          expiring: expiringLicenses.length,
          expired: expiredLicenses.length,
          expiringLicenses: expiringLicenses.map(l => ({
            employeeName: l.employeeName,
            licenseType: l.licenseType,
            expiryDate: l.expiryDate
          })),
          expiredLicenses: expiredLicenses.map(l => ({
            employeeName: l.employeeName,
            licenseType: l.licenseType,
            expiryDate: l.expiryDate
          }))
        },
        createdAt: new Date().toISOString(),
        read: false
      };
      
      await db.collection('notifications').add(notification);
      
      // Send email notification (if email service is configured)
      try {
        await sendNotificationEmail(
          'hr@pharmacy.com', // Replace with actual HR email
          'License Expiry Alert',
          `${expiringLicenses.length} license(s) are expiring within 30 days and ${expiredLicenses.length} license(s) have expired. Please review and take necessary action.`
        );
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
      
      console.log(`📧 License alert created: ${expiringLicenses.length} expiring, ${expiredLicenses.length} expired`);
    }
  } catch (error) {
    console.error('Error checking expiring licenses:', error);
  }
};

const checkProbationPeriods = async () => {
  try {
    const db = getFirestore();
    
    // Get employees on probation
    const employeesSnapshot = await db.collection('employees')
      .where('status', '==', 'probation')
      .get();
    
    const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const employeesForReview = employees.filter(employee => {
      if (!employee.startDate) return false;
      
      const startDate = new Date(employee.startDate);
      const today = new Date();
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      
      return daysSinceStart >= 90; // 3 months probation period
    });
    
    if (employeesForReview.length > 0) {
      // Create notification for probation reviews
      const notification = {
        type: 'probation_review',
        title: 'Probation Review Required',
        message: `${employeesForReview.length} employee(s) have completed their probation period and need review`,
        data: {
          employees: employeesForReview.map(emp => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            startDate: emp.startDate,
            role: emp.role
          }))
        },
        createdAt: new Date().toISOString(),
        read: false
      };
      
      await db.collection('notifications').add(notification);
      
      console.log(`👥 Probation review alert created for ${employeesForReview.length} employees`);
    }
  } catch (error) {
    console.error('Error checking probation periods:', error);
  }
};

const generateMonthlyReports = async () => {
  try {
    const db = getFirestore();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthStr = lastMonth.toISOString().slice(0, 7); // YYYY-MM format
    
    // Generate attendance report
    const attendanceSnapshot = await db.collection('attendance')
      .where('date', '>=', `${monthStr}-01`)
      .where('date', '<=', `${monthStr}-31`)
      .get();
    
    const attendanceData = attendanceSnapshot.docs.map(doc => doc.data());
    
    // Generate payroll report
    const payrollSnapshot = await db.collection('payrolls')
      .where('month', '==', monthStr)
      .get();
    
    const payrollData = payrollSnapshot.docs.map(doc => doc.data());
    
    // Generate performance report
    const performanceSnapshot = await db.collection('performance_reviews')
      .where('reviewPeriod', '==', monthStr)
      .get();
    
    const performanceData = performanceSnapshot.docs.map(doc => doc.data());
    
    // Create monthly report document
    const monthlyReport = {
      month: monthStr,
      generatedAt: new Date().toISOString(),
      attendance: {
        totalRecords: attendanceData.length,
        presentDays: attendanceData.filter(a => a.status === 'present').length,
        absentDays: attendanceData.filter(a => a.status === 'absent').length,
        lateDays: attendanceData.filter(a => a.status === 'late').length,
        averageHours: attendanceData.length > 0 
          ? attendanceData.reduce((sum, a) => sum + (a.hoursWorked || 0), 0) / attendanceData.length 
          : 0
      },
      payroll: {
        employeesProcessed: payrollData.length,
        totalGrossSalary: payrollData.reduce((sum, p) => sum + (p.grossSalary || 0), 0),
        totalNetSalary: payrollData.reduce((sum, p) => sum + (p.netSalary || 0), 0),
        totalDeductions: payrollData.reduce((sum, p) => sum + (p.totalDeductions || 0), 0)
      },
      performance: {
        reviewsCompleted: performanceData.length,
        averageRating: performanceData.length > 0 
          ? performanceData.reduce((sum, p) => sum + (p.overallRating || 0), 0) / performanceData.length 
          : 0
      }
    };
    
    await db.collection('monthly_reports').add(monthlyReport);
    
    console.log(`📊 Monthly report generated for ${monthStr}`);
  } catch (error) {
    console.error('Error generating monthly reports:', error);
  }
};

const createWeeklyBackup = async () => {
  try {
    const db = getFirestore();
    
    // This is a simplified backup - in production, you'd use Firebase's export functionality
    const collections = ['employees', 'attendance', 'payrolls', 'licenses', 'performance_reviews'];
    const backupData = {};
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      backupData[collectionName] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    
    const backup = {
      createdAt: new Date().toISOString(),
      collections: Object.keys(backupData),
      recordCounts: Object.keys(backupData).reduce((acc, key) => {
        acc[key] = backupData[key].length;
        return acc;
      }, {}),
      // In production, you'd store the actual data in cloud storage
      // data: backupData
    };
    
    await db.collection('backups').add(backup);
    
    console.log(`💾 Weekly backup created with ${Object.values(backup.recordCounts).reduce((a, b) => a + b, 0)} total records`);
  } catch (error) {
    console.error('Error creating weekly backup:', error);
  }
};

module.exports = {
  startCronJobs,
  checkExpiringLicenses,
  checkProbationPeriods,
  generateMonthlyReports,
  createWeeklyBackup
};