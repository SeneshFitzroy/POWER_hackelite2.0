const express = require('express');
const { getFirestore } = require('../config/firebase');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const { date, employeeId, startDate, endDate, status } = req.query;
    
    let query = db.collection('attendance');
    
    // Apply filters
    if (date) {
      query = query.where('date', '==', date);
    } else if (startDate && endDate) {
      query = query.where('date', '>=', startDate).where('date', '<=', endDate);
    }
    
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // Order by date (most recent first)
    query = query.orderBy('date', 'desc');
    
    const snapshot = await query.get();
    const attendance = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records'
    });
  }
});

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
router.post('/', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('status').isIn(['present', 'absent', 'late', 'half-day']).withMessage('Invalid status')
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
    const { employeeId, date, status, timeIn, timeOut, notes } = req.body;
    
    // Check if attendance already marked for this employee and date
    const existingAttendance = await db.collection('attendance')
      .where('employeeId', '==', employeeId)
      .where('date', '==', date)
      .get();
    
    if (!existingAttendance.empty) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date'
      });
    }
    
    // Get employee details
    const employeeDoc = await db.collection('employees').doc(employeeId).get();
    if (!employeeDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const employee = employeeDoc.data();
    
    // Calculate hours worked
    let hoursWorked = 0;
    if (timeIn && timeOut && status !== 'absent') {
      const start = new Date(`2000-01-01T${timeIn}`);
      const end = new Date(`2000-01-01T${timeOut}`);
      hoursWorked = (end - start) / (1000 * 60 * 60); // Convert to hours
    }
    
    const attendanceData = {
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date,
      status,
      timeIn: timeIn || null,
      timeOut: timeOut || null,
      hoursWorked: parseFloat(hoursWorked.toFixed(2)),
      notes: notes || '',
      markedBy: req.user.uid,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('attendance').add(attendanceData);
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...attendanceData },
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance'
    });
  }
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('attendance').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    const { timeIn, timeOut, status, notes } = req.body;
    
    // Recalculate hours worked if times are updated
    let hoursWorked = doc.data().hoursWorked;
    if (timeIn && timeOut && status !== 'absent') {
      const start = new Date(`2000-01-01T${timeIn}`);
      const end = new Date(`2000-01-01T${timeOut}`);
      hoursWorked = (end - start) / (1000 * 60 * 60);
    }
    
    const updateData = {
      ...req.body,
      hoursWorked: parseFloat(hoursWorked.toFixed(2)),
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    };
    
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    
    res.status(200).json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Attendance record updated successfully'
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record'
    });
  }
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('attendance').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    await docRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record'
    });
  }
});

// @desc    Get attendance summary for a date range
// @route   GET /api/attendance/summary
// @access  Private
router.get('/summary', async (req, res) => {
  try {
    const db = getFirestore();
    const { startDate, endDate, employeeId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    let query = db.collection('attendance')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate);
    
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    
    const snapshot = await query.get();
    const attendance = snapshot.docs.map(doc => doc.data());
    
    // Calculate summary statistics
    const summary = {
      totalRecords: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0),
      averageHours: 0
    };
    
    if (summary.totalRecords > 0) {
      summary.averageHours = summary.totalHours / summary.totalRecords;
    }
    
    // Group by employee if not filtering by specific employee
    let employeeSummary = {};
    if (!employeeId) {
      employeeSummary = attendance.reduce((acc, record) => {
        if (!acc[record.employeeId]) {
          acc[record.employeeId] = {
            employeeName: record.employeeName,
            present: 0,
            absent: 0,
            late: 0,
            halfDay: 0,
            totalHours: 0
          };
        }
        
        acc[record.employeeId][record.status === 'half-day' ? 'halfDay' : record.status]++;
        acc[record.employeeId].totalHours += record.hoursWorked || 0;
        
        return acc;
      }, {});
    }
    
    res.status(200).json({
      success: true,
      data: {
        summary,
        employeeSummary: Object.keys(employeeSummary).length > 0 ? employeeSummary : null,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance summary'
    });
  }
});

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private
router.post('/bulk', [
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('attendanceRecords').isArray().withMessage('Attendance records must be an array')
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
    const { date, attendanceRecords } = req.body;
    
    // Check if attendance already marked for this date
    const existingAttendance = await db.collection('attendance')
      .where('date', '==', date)
      .get();
    
    if (!existingAttendance.empty) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date'
      });
    }
    
    const batch = db.batch();
    const processedRecords = [];
    
    for (const record of attendanceRecords) {
      // Get employee details
      const employeeDoc = await db.collection('employees').doc(record.employeeId).get();
      if (!employeeDoc.exists) {
        continue; // Skip invalid employee IDs
      }
      
      const employee = employeeDoc.data();
      
      // Calculate hours worked
      let hoursWorked = 0;
      if (record.timeIn && record.timeOut && record.status !== 'absent') {
        const start = new Date(`2000-01-01T${record.timeIn}`);
        const end = new Date(`2000-01-01T${record.timeOut}`);
        hoursWorked = (end - start) / (1000 * 60 * 60);
      }
      
      const attendanceData = {
        employeeId: record.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        date,
        status: record.status,
        timeIn: record.timeIn || null,
        timeOut: record.timeOut || null,
        hoursWorked: parseFloat(hoursWorked.toFixed(2)),
        notes: record.notes || '',
        markedBy: req.user.uid,
        createdAt: new Date().toISOString()
      };
      
      const docRef = db.collection('attendance').doc();
      batch.set(docRef, attendanceData);
      processedRecords.push({ id: docRef.id, ...attendanceData });
    }
    
    await batch.commit();
    
    res.status(201).json({
      success: true,
      data: processedRecords,
      message: `Bulk attendance marked for ${processedRecords.length} employees`
    });
  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark bulk attendance'
    });
  }
});

module.exports = router;