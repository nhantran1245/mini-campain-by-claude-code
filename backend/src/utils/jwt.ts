import jwt from 'jsonwebtoken';
import { AuthenticationError } from './errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export interface JwtPayload {
  userId: number;
  email: string;
}

/**
 * Sign a JWT token with user data
 */
export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Verify and decode JWT token
 * @throws AuthenticationError if token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    }
    throw new AuthenticationError('Token verification failed');
  }
};
