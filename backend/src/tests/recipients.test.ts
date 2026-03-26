import request from 'supertest';
import app from '../index';
import { sequelize } from '../models';

describe('Recipient Management', () => {
  let authToken: string;

  beforeAll(async () => {
    await sequelize.authenticate();

    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `recipient-test-${Date.now()}@example.com`,
        name: 'Recipient Test User',
        password: 'password123',
      });

    authToken = registerResponse.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/recipients', () => {
    it('should create a new recipient successfully', async () => {
      const response = await request(app)
        .post('/api/recipients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: `new-recipient-${Date.now()}@example.com`,
          name: 'New Recipient',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBeDefined();
      expect(response.body.data.name).toBe('New Recipient');
      expect(response.body.data.id).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const uniqueEmail = `duplicate-${Date.now()}@example.com`;

      // Create first recipient
      await request(app)
        .post('/api/recipients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: uniqueEmail,
          name: 'First Recipient',
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/recipients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: uniqueEmail,
          name: 'Second Recipient',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/recipients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
          name: 'Test Recipient',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing name', async () => {
      const response = await request(app)
        .post('/api/recipients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: `test-${Date.now()}@example.com`,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject creation without authentication', async () => {
      const response = await request(app)
        .post('/api/recipients')
        .send({
          email: `test-${Date.now()}@example.com`,
          name: 'Test Recipient',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/recipients', () => {
    beforeAll(async () => {
      // Create some test recipients
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/recipients')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            email: `list-test-${i}-${Date.now()}@example.com`,
            name: `List Test Recipient ${i}`,
          });
      }
    });

    it('should list recipients with default pagination', async () => {
      const response = await request(app)
        .get('/api/recipients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThan(0);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.offset).toBe(0);
    });

    it('should support custom pagination', async () => {
      const response = await request(app)
        .get('/api/recipients?limit=2&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.offset).toBe(0);
    });

    it('should support search by email', async () => {
      const uniqueEmail = `search-test-${Date.now()}@example.com`;
      await request(app)
        .post('/api/recipients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: uniqueEmail,
          name: 'Search Test',
        });

      const response = await request(app)
        .get(`/api/recipients?search=${uniqueEmail}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].email).toBe(uniqueEmail);
    });

    it('should support search by name', async () => {
      const uniqueName = `Unique Name ${Date.now()}`;
      await request(app)
        .post('/api/recipients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: `unique-${Date.now()}@example.com`,
          name: uniqueName,
        });

      const response = await request(app)
        .get(`/api/recipients?search=${encodeURIComponent(uniqueName)}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toBe(uniqueName);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/recipients');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/recipients/:id', () => {
    let recipientId: number;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/recipients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: `get-by-id-${Date.now()}@example.com`,
          name: 'Get By ID Test',
        });

      recipientId = response.body.data.id;
    });

    it('should get a recipient by ID', async () => {
      const response = await request(app)
        .get(`/api/recipients/${recipientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(recipientId);
      expect(response.body.data.name).toBe('Get By ID Test');
    });

    it('should return 404 for non-existent recipient', async () => {
      const response = await request(app)
        .get('/api/recipients/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should require authentication', async () => {
      const response = await request(app).get(`/api/recipients/${recipientId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
