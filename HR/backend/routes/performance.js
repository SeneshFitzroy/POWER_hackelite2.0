const express = require('express');
const { getFirestore } = require('../config/firebase');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// @desc    Get all performance reviews
// @route   GET /api/performance
// @access  Private
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    const { employeeId, reviewType, status, reviewPeriod } = req.query;
    
    let query = db.collection('performance_reviews');
    
    // Apply filters
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    
    if (reviewType) {
      query = query.where('reviewType', '==', reviewType);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (reviewPeriod) {
      query = query.where('reviewPeriod', '==', reviewPeriod);
    }
    
    // Order by creation date (most recent first)
    query = query.orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get performance reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance reviews'
    });
  }
});

// @desc    Get single performance review
// @route   GET /api/performance/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('performance_reviews').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Performance review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get performance review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance review'
    });
  }
});

// @desc    Create new performance review
// @route   POST /api/performance
// @access  Private
router.post('/', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('reviewPeriod').matches(/^\d{4}-\d{2}$/).withMessage('Review period must be in YYYY-MM format'),
  body('reviewType').isIn(['quarterly', 'annual', 'probation', 'promotion']).withMessage('Invalid review type'),
  body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5')
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
    
    // Check if review already exists for this employee and period
    const existingReview = await db.collection('performance_reviews')
      .where('employeeId', '==', req.body.employeeId)
      .where('reviewPeriod', '==', req.body.reviewPeriod)
      .where('reviewType', '==', req.body.reviewType)
      .get();
    
    if (!existingReview.empty) {
      return res.status(400).json({
        success: false,
        message: 'Performance review already exists for this period'
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
    
    const reviewData = {
      ...req.body,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      reviewerId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('performance_reviews').add(reviewData);
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...reviewData },
      message: 'Performance review created successfully'
    });
  } catch (error) {
    console.error('Create performance review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create performance review'
    });
  }
});

// @desc    Update performance review
// @route   PUT /api/performance/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('performance_reviews').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Performance review not found'
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
      message: 'Performance review updated successfully'
    });
  } catch (error) {
    console.error('Update performance review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update performance review'
    });
  }
});

// @desc    Delete performance review
// @route   DELETE /api/performance/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('performance_reviews').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Performance review not found'
      });
    }
    
    await docRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'Performance review deleted successfully'
    });
  } catch (error) {
    console.error('Delete performance review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete performance review'
    });
  }
});

// @desc    Get performance analytics for an employee
// @route   GET /api/performance/analytics/:employeeId
// @access  Private
router.get('/analytics/:employeeId', async (req, res) => {
  try {
    const db = getFirestore();
    const { employeeId } = req.params;
    
    // Get all reviews for the employee
    const reviewsSnapshot = await db.collection('performance_reviews')
      .where('employeeId', '==', employeeId)
      .orderBy('reviewPeriod', 'asc')
      .get();
    
    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No performance reviews found for this employee'
      });
    }
    
    // Calculate analytics
    const analytics = {
      totalReviews: reviews.length,
      averageRating: reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length,
      latestRating: reviews[reviews.length - 1].overallRating,
      ratingTrend: [],
      kpiAnalytics: {},
      improvementAreas: [],
      strengths: []
    };
    
    // Calculate rating trend
    analytics.ratingTrend = reviews.map(review => ({
      period: review.reviewPeriod,
      rating: review.overallRating,
      reviewType: review.reviewType
    }));
    
    // Analyze KPIs if available
    if (reviews[0].kpis) {
      const kpiNames = reviews[0].kpis.map(kpi => kpi.name);
      
      kpiNames.forEach(kpiName => {
        const kpiScores = reviews
          .map(review => {
            const kpi = review.kpis?.find(k => k.name === kpiName);
            return kpi ? kpi.rating : null;
          })
          .filter(score => score !== null);
        
        if (kpiScores.length > 0) {
          analytics.kpiAnalytics[kpiName] = {
            average: kpiScores.reduce((sum, score) => sum + score, 0) / kpiScores.length,
            latest: kpiScores[kpiScores.length - 1],
            trend: kpiScores
          };
        }
      });
    }
    
    // Extract common improvement areas and strengths
    const allImprovements = reviews.map(r => r.areasForImprovement).filter(Boolean);
    const allStrengths = reviews.map(r => r.strengths).filter(Boolean);
    
    analytics.improvementAreas = [...new Set(allImprovements.flatMap(text => 
      text.split(',').map(item => item.trim()).filter(Boolean)
    ))];
    
    analytics.strengths = [...new Set(allStrengths.flatMap(text => 
      text.split(',').map(item => item.trim()).filter(Boolean)
    ))];
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance analytics'
    });
  }
});

// @desc    Get performance statistics
// @route   GET /api/performance/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const db = getFirestore();
    
    const reviewsSnapshot = await db.collection('performance_reviews').get();
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    
    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length : 0,
      byStatus: {
        draft: reviews.filter(r => r.status === 'draft').length,
        pending: reviews.filter(r => r.status === 'pending').length,
        completed: reviews.filter(r => r.status === 'completed').length
      },
      byType: {
        quarterly: reviews.filter(r => r.reviewType === 'quarterly').length,
        annual: reviews.filter(r => r.reviewType === 'annual').length,
        probation: reviews.filter(r => r.reviewType === 'probation').length,
        promotion: reviews.filter(r => r.reviewType === 'promotion').length
      },
      ratingDistribution: {
        1: reviews.filter(r => r.overallRating === 1).length,
        2: reviews.filter(r => r.overallRating === 2).length,
        3: reviews.filter(r => r.overallRating === 3).length,
        4: reviews.filter(r => r.overallRating === 4).length,
        5: reviews.filter(r => r.overallRating === 5).length
      }
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get performance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance statistics'
    });
  }
});

// @desc    Submit employee self-assessment
// @route   POST /api/performance/:id/self-assessment
// @access  Private
router.post('/:id/self-assessment', [
  body('employeeComments').notEmpty().withMessage('Employee comments are required'),
  body('selfRating').optional().isInt({ min: 1, max: 5 }).withMessage('Self rating must be between 1 and 5')
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
    const docRef = db.collection('performance_reviews').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Performance review not found'
      });
    }
    
    const updateData = {
      employeeComments: req.body.employeeComments,
      selfRating: req.body.selfRating,
      employeeSelfAssessmentDate: new Date().toISOString(),
      status: 'completed', // Mark as completed when employee submits
      updatedAt: new Date().toISOString()
    };
    
    await docRef.update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Self-assessment submitted successfully'
    });
  } catch (error) {
    console.error('Submit self-assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit self-assessment'
    });
  }
});

// @desc    Get pending reviews for employees
// @route   GET /api/performance/pending-employee-reviews
// @access  Private
router.get('/pending-employee-reviews', async (req, res) => {
  try {
    const db = getFirestore();
    
    const pendingReviews = await db.collection('performance_reviews')
      .where('status', '==', 'pending')
      .get();
    
    const reviews = pendingReviews.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get pending employee reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending employee reviews'
    });
  }
});

module.exports = router;