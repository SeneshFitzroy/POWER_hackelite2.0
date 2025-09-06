const express = require('express');
const { getFirestore } = require('../config/firebase');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// @desc    Get all licenses
// @route   GET /api/licenses
// @access  Private
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const { employeeId, licenseType, status, expiring } = req.query;
    
    let query = db.collection('licenses');
    
    // Apply filters
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    
    if (licenseType) {
      query = query.where('licenseType', '==', licenseType);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    let licenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter expiring licenses if requested
    if (expiring === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      licenses = licenses.filter(license => {
        const expiryDate = new Date(license.expiryDate);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
      });
    }
    
    res.status(200).json({
      success: true,
      count: licenses.length,
      data: licenses
    });
  } catch (error) {
    console.error('Get licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch licenses'
    });
  }
});

// @desc    Get single license
// @route   GET /api/licenses/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('licenses').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch license'
    });
  }
});

// @desc    Create new license
// @route   POST /api/licenses
// @access  Private
router.post('/', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('licenseType').notEmpty().withMessage('License type is required'),
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('issuedDate').isISO8601().withMessage('Valid issued date is required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('issuingAuthority').notEmpty().withMessage('Issuing authority is required')
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
    
    // Check if license number already exists
    const existingLicense = await db.collection('licenses')
      .where('licenseNumber', '==', req.body.licenseNumber)
      .get();
    
    if (!existingLicense.empty) {
      return res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    }
    
    // Get employee details
    const employeeDoc = await db.collection('employees').doc(req.body.employeeId).get();
    if (!employeeDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const employee = employeeDoc.data();
    
    const licenseData = {
      ...req.body,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('licenses').add(licenseData);
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...licenseData },
      message: 'License created successfully'
    });
  } catch (error) {
    console.error('Create license error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create license'
    });
  }
});

// @desc    Update license
// @route   PUT /api/licenses/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('licenses').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
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
      message: 'License updated successfully'
    });
  } catch (error) {
    console.error('Update license error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update license'
    });
  }
});

// @desc    Delete license
// @route   DELETE /api/licenses/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('licenses').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }
    
    await docRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'License deleted successfully'
    });
  } catch (error) {
    console.error('Delete license error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete license'
    });
  }
});

// @desc    Get expiring licenses
// @route   GET /api/licenses/expiring/:days
// @access  Private
router.get('/expiring/:days', async (req, res) => {
  try {
    const db = getFirestore();
    const days = parseInt(req.params.days) || 30;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const snapshot = await db.collection('licenses').get();
    const licenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const expiringLicenses = licenses.filter(license => {
      const expiryDate = new Date(license.expiryDate);
      return expiryDate <= futureDate && expiryDate >= new Date();
    });
    
    res.status(200).json({
      success: true,
      count: expiringLicenses.length,
      data: expiringLicenses
    });
  } catch (error) {
    console.error('Get expiring licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring licenses'
    });
  }
});

// @desc    Get expired licenses
// @route   GET /api/licenses/expired
// @access  Private
router.get('/expired', async (req, res) => {
  try {
    const db = getFirestore();
    
    const snapshot = await db.collection('licenses').get();
    const licenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const expiredLicenses = licenses.filter(license => {
      const expiryDate = new Date(license.expiryDate);
      return expiryDate < new Date();
    });
    
    res.status(200).json({
      success: true,
      count: expiredLicenses.length,
      data: expiredLicenses
    });
  } catch (error) {
    console.error('Get expired licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expired licenses'
    });
  }
});

// @desc    Verify license with NMRA (mock implementation)
// @route   POST /api/licenses/:id/verify
// @access  Private
router.post('/:id/verify', async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('licenses').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }
    
    const license = doc.data();
    
    // Mock NMRA verification (in real implementation, you'd call NMRA API)
    const verificationResult = {
      isValid: true,
      verifiedAt: new Date().toISOString(),
      verificationSource: 'NMRA',
      status: 'active',
      message: 'License verified successfully'
    };
    
    // Update license with verification info
    await db.collection('licenses').doc(req.params.id).update({
      lastVerified: verificationResult.verifiedAt,
      verificationStatus: verificationResult.status,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      data: verificationResult,
      message: 'License verification completed'
    });
  } catch (error) {
    console.error('Verify license error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify license'
    });
  }
});

// @desc    Get license statistics
// @route   GET /api/licenses/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const db = getFirestore();
    
    const snapshot = await db.collection('licenses').get();
    const licenses = snapshot.docs.map(doc => doc.data());
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const stats = {
      total: licenses.length,
      active: licenses.filter(l => l.status === 'active').length,
      inactive: licenses.filter(l => l.status === 'inactive').length,
      suspended: licenses.filter(l => l.status === 'suspended').length,
      expired: licenses.filter(l => new Date(l.expiryDate) < today).length,
      expiring: licenses.filter(l => {
        const expiryDate = new Date(l.expiryDate);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
      }).length,
      byType: licenses.reduce((acc, license) => {
        acc[license.licenseType] = (acc[license.licenseType] || 0) + 1;
        return acc;
      }, {}),
      byAuthority: licenses.reduce((acc, license) => {
        acc[license.issuingAuthority] = (acc[license.issuingAuthority] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get license stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch license statistics'
    });
  }
});

module.exports = router;