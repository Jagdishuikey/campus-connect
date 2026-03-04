import jwt from 'jsonwebtoken';

// Verify JWT Token Middleware
export const verifyTokenMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: error.message
    });
  }
};

// Check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User is not authenticated'
    });
  }
  next();
};
