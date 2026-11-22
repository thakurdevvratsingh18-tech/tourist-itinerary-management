const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse, generateToken } = require('../utils/generateToken');
const { AppError } = require('../middleware/errorHandler');
const nodemailer = require('nodemailer');

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Try to send an email via nodemailer.
 * Falls back gracefully when SMTP env vars are not configured.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('[sendEmail] SMTP not configured – skipping email send.');
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'Tourist Itinerary'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

// ─── controllers ────────────────────────────────────────────────────────────

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  const { name, email, password, phone, country } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new AppError('An account with that email already exists', 409);
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone || undefined,
    country: country || undefined,
  });

  sendTokenResponse(user, 201, res, 'Registration successful');
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Include password for comparison
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  sendTokenResponse(user, 200, res, 'Login successful');
};

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  res
    .cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    })
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);

  res.status(200).json({ success: true, data: user });
};

/**
 * @desc    Update profile (name, phone, bio, country, profilePicture)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  const allowedFields = ['name', 'phone', 'bio', 'country', 'profilePicture'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No valid fields provided to update', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: 'Profile updated', data: user });
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
};

/**
 * @desc    Forgot password – generate reset token and email it
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required', 400);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // Don't reveal whether the email exists
    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    });
  }

  // Generate raw token and hash to store
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your Tourist Itinerary account.</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">
          Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
        <p>Reset URL: <a href="${resetUrl}">${resetUrl}</a></p>
      `,
      text: `Reset your password at: ${resetUrl}`,
    });
  } catch (err) {
    // Email failed – clear the token so user can retry
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.error('[forgotPassword] Email error:', err.message);
    throw new AppError('Email could not be sent. Please try again later.', 500);
  }

  res.status(200).json({
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
    // Expose token in development for easy testing
    ...(process.env.NODE_ENV === 'development' && { resetToken: rawToken }),
  });
};

/**
 * @desc    Reset password via token
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) throw new AppError('New password is required', 400);
  if (password.length < 6) throw new AppError('Password must be at least 6 characters', 400);

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
};
