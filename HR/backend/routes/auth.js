const express = require('express');
const { getAuth } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// @desc    Verify Firebase token and get user info
// @route   POST /api/auth/verify
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    // Verify the ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    res.status(200).json({
      success: true,
      data: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getAuth().getUser(req.user.uid);
    
    res.status(200).json({
      success: true,
      data: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        disabled: user.disabled
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// @desc    Create new user (Admin only)
// @route   POST /api/auth/create-user
// @access  Private (Admin)
router.post('/create-user', authenticateToken, async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;

    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });

    // Set custom claims for role-based access
    await getAuth().setCustomUserClaims(userRecord.uid, { role });

    res.status(201).json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user'
    });
  }
});

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/update-role/:uid
// @access  Private (Admin)
router.put('/update-role/:uid', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    // Update custom claims
    await getAuth().setCustomUserClaims(uid, { role });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/delete-user/:uid
// @access  Private (Admin)
router.delete('/delete-user/:uid', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.params;

    await getAuth().deleteUser(uid);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;