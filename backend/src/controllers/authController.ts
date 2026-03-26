import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { RegisterInput, LoginInput } from '../validators/authValidators';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, name, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      name,
      password_hash,
    });

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};
