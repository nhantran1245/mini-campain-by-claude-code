import request from 'supertest';
import app from '../index';
import { sequelize } from '../models';

describe('Authentication', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    const testEmail = `test-${Date.now()}@example.com`;

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          name: 'Test User',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.user.name).toBe('Test User');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          name: 'Test User 2',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test-short-${Date.now()}@example.com`,
          name: 'Test User',
          password: '12345',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    const loginEmail = `login-test-${Date.now()}@example.com`;
    const loginPassword = 'password123';

    beforeAll(async () => {
      // Register a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          email: loginEmail,
          name: 'Login Test User',
          password: loginPassword,
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: loginPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(loginEmail);
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
