import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../server.js'; // use same secret as authController

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];

      if (!JWT_SECRET) {
        console.error('❌ JWT_SECRET is not defined in protect middleware');
        return res.status(500).json({
          success: false,
          message: 'Server misconfiguration: JWT_SECRET missing'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

export { protect };
