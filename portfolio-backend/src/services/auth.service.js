const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Generate JWT tokens
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
  // Find user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if user is active
  if (!user.is_active) {
    throw new ApiError(401, 'Account is deactivated');
  }

  // Compare password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token to database
  await supabase
    .from('users')
    .update({ 
      refresh_token: refreshToken,
      last_login: new Date().toISOString()
    })
    .eq('id', user.id);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, role, avatar_url, is_active')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new ApiError(401, 'User not found');
  }

  if (!user.is_active) {
    throw new ApiError(401, 'Account is deactivated');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Update refresh token in database
  await supabase
    .from('users')
    .update({ refresh_token: refreshToken })
    .eq('id', user.id);

  return { accessToken, refreshToken, user };
};

/**
 * Logout user
 */
const logoutUser = async (userId) => {
  await supabase
    .from('users')
    .update({ refresh_token: null })
    .eq('id', userId);

  return { message: 'Logged out successfully' };
};

/**
 * Create admin user (for initial setup)
 */
const createAdminUser = async (email, password, name) => {
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email,
      password: hashedPassword,
      name,
      role: 'admin'
    })
    .select('id, email, name, role, created_at')
    .single();

  if (error) {
    throw new ApiError(500, 'Failed to create user');
  }

  return user;
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('password')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify current password
  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  const { error: updateError } = await supabase
    .from('users')
    .update({ password: hashedPassword, refresh_token: null })
    .eq('id', userId);

  if (updateError) {
    throw new ApiError(500, 'Failed to update password');
  }

  return { message: 'Password changed successfully' };
};

/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, role, avatar_url, created_at, last_login')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updates) => {
  const allowedUpdates = ['name', 'avatar_url'];
  const filteredUpdates = {};

  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(filteredUpdates)
    .eq('id', userId)
    .select('id, email, name, role, avatar_url, created_at')
    .single();

  if (error) {
    throw new ApiError(500, 'Failed to update profile');
  }

  return user;
};

module.exports = {
  generateTokens,
  hashPassword,
  comparePassword,
  loginUser,
  refreshAccessToken,
  logoutUser,
  createAdminUser,
  changePassword,
  getUserProfile,
  updateUserProfile
};