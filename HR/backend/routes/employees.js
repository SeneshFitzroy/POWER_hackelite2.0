const express = require('express');
const { getFirestore } = require('../config/firebase');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const { status, role, search } = req.query;
    
    let query = db.collection('employees');
    
    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (role) {
      query = query.where('role', '==', role);
    }
    
    const snapshot = await query.get();
    let employees = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Apply search filter (client-side for Firestore limitations)
    if (search) {
      const searchLower = search.toLowerCase();
      employees = employees.filter(emp => 
        emp.firstName?.toLowerCase().includes(searchLower) ||
        emp.lastName?.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower) ||
        emp.employeeId?.toLowerCase().includes(searchLower)
      );
    }
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees'
    });
  }
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('employees').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee'
    });
  }
});

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private
router.post('/', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('role').notEmpty().withMessage('Role is required')
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
    
    // Check if employee ID already exists
    const existingEmployee = await db.collection('employees')
      .where('employeeId', '==', req.body.employeeId)
      .get();
    
    if (!existingEmployee.empty) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }
    
    // Check if email already exists
    const existingEmail = await db.collection('employees')
      .where('email', '==', req.body.email)
      .get();
    
    if (!existingEmail.empty) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    const employeeData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('employees').add(employeeData);
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...employeeData },
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee'
    });
  }
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('employees').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    
    res.status(200).json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee'
    });
  }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('employees').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    await docRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee'
    });
  }
});

// @desc    Get employee probation status
// @route   GET /api/employees/:id/probation
// @access  Private
router.get('/:id/probation', async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('employees').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const employee = doc.data();
    const startDate = new Date(employee.startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const probationPeriod = 90; // 3 months
    
    const probationStatus = {
      isOnProbation: employee.status === 'probation',
      daysSinceStart,
      daysRemaining: Math.max(0, probationPeriod - daysSinceStart),
      probationEndDate: new Date(startDate.getTime() + probationPeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shouldReview: daysSinceStart >= probationPeriod && employee.status === 'probation'
    };
    
    res.status(200).json({
      success: true,
      data: probationStatus
    });
  } catch (error) {
    console.error('Get probation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch probation status'
    });
  }
});

// @desc    Update employee status (confirm probation, etc.)
// @route   PATCH /api/employees/:id/status
// @access  Private
router.patch('/:id/status', [
  body('status').isIn(['active', 'inactive', 'probation']).withMessage('Invalid status')
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
    const docRef = db.collection('employees').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    await docRef.update({
      status: req.body.status,
      statusUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Employee status updated successfully'
    });
  } catch (error) {
    console.error('Update employee status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee status'
    });
  }
});

module.exports = router;