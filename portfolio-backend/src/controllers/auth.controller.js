const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Login controller
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * Refresh token controller
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await authService.refreshAccessToken(userId);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  });
});

/**
 * Logout controller
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await authService.logoutUser(userId);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

/**
 * Change password
 * PUT /api/auth/password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters'
    });
  }

  await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please login again.'
  });
});

/**
 * Create admin user (for initial setup)
 * POST /api/auth/setup
 */
const setupAdmin = asyncHandler(async (req, res) => {
  // Check if any admin exists
  const { data: existingAdmins } = await require('../config/database').supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1);

  if (existingAdmins && existingAdmins.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Admin user already exists. Setup is not allowed.'
    });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and name are required'
    });
  }

  const user = await authService.createAdminUser(email, password, name);

  res.status(201).json({
    success: true,
    message: 'Admin user created successfully',
    data: user
  });
});

module.exports = {
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  setupAdmin
};