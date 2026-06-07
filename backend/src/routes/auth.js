const express = require('express');
const router = express.Router();
const passport = require('passport');
const { asyncHandler } = require('../middleware');
const userService = require('../services/user');

/**
 * OAuth callback handler
 */
function handleOAuthCallback(strategy) {
  return asyncHandler(async (req, res) => {
    const { id, displayName, emails } = req.user;
    const email = emails[0]?.value;

    // Check if user exists
    let user = await userService.getUserByOAuth(strategy, id);

    // Create new user if doesn't exist
    if (!user) {
      user = await userService.createUser({
        email,
        name: displayName,
        oauthProvider: strategy,
        oauthId: id
      });
    }

    // Generate tokens
    const token = userService.generateToken(user.id);
    const refreshToken = userService.generateRefreshToken(user.id);

    // In production, redirect to frontend with token in URL or header
    res.json({
      success: true,
      data: {
        user,
        token,
        refreshToken
      }
    });
  });
}

/**
 * POST /api/v1/auth/github
 * GitHub OAuth authentication
 */
router.post('/github', passport.authenticate('github', {
  scope: ['user:email']
}), handleOAuthCallback('github'));

/**
 * POST /api/v1/auth/google
 * Google OAuth authentication
 */
router.post('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}), handleOAuthCallback('google'));

/**
 * POST /api/v1/auth/facebook
 * Facebook OAuth authentication
 */
router.post('/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}), handleOAuthCallback('facebook'));

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token is required'
      }
    });
  }

  const decoded = userService.verifyToken(refreshToken, 'refresh');

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token'
      }
    });
  }

  const newToken = userService.generateToken(decoded.userId);

  res.json({
    success: true,
    data: { token: newToken }
  });
}));

/**
 * POST /api/v1/auth/logout
 * Logout (token invalidation)
 */
router.post('/logout', (req, res) => {
  // In practice, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
