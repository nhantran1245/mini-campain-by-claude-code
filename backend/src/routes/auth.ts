import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/authValidators';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), register);

/**
 * POST /api/auth/login
 * Login user and receive JWT token
 */
router.post('/login', validate(loginSchema), login);

export default router;
