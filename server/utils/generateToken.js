const jwt = require('jsonwebtoken');

/**
 * generateToken
 *
 * Signs a JWT containing the user's id (and optional extra payload).
 *
 * @param {string|ObjectId} id       - MongoDB user _id
 * @param {Object}          [extra]  - Additional claims to embed in the token
 * @returns {string} Signed JWT string
 */
const generateToken = (id, extra = {}) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { id: id.toString(), ...extra },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
      issuer: process.env.JWT_ISSUER || 'tourist-itinerary-api',
    }
  );
};

/**
 * generateRefreshToken
 *
 * Signs a longer-lived refresh token.
 *
 * @param {string|ObjectId} id - MongoDB user _id
 * @returns {string} Signed JWT string
 */
const generateRefreshToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { id: id.toString(), type: 'refresh' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '90d',
      issuer: process.env.JWT_ISSUER || 'tourist-itinerary-api',
    }
  );
};

/**
 * sendTokenResponse
 *
 * Convenience helper: generates a JWT, sets an HTTP-only cookie, and returns
 * a JSON response with the token and user data.
 *
 * @param {Document} user       - Mongoose User document
 * @param {number}   statusCode - HTTP status code (200 or 201)
 * @param {Object}   res        - Express response object
 * @param {string}   [message]  - Optional message to include in response
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id, { role: user.role });

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'lax',
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Strip sensitive fields
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: userObj,
    });
};

module.exports = { generateToken, generateRefreshToken, sendTokenResponse };
