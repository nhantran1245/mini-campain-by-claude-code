import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token and extract payload
    const payload = verifyToken(token);
    
    // Attach user info to request
    req.user = payload;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware - attaches user if token is present but doesn't throw if missing
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      req.user = payload;
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};
