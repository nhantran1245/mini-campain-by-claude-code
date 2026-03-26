import request from 'supertest';
import app from '../index';
import { sequelize } from '../models';

describe('Campaign Management', () => {
  let authToken: string;
  let userId: number;
  let otherUserToken: string;
  let testRecipientId: number;

  beforeAll(async () => {
    await sequelize.authenticate();

    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `campaign-test-${Date.now()}@example.com`,
        name: 'Campaign Test User',
        password: 'password123',
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;

    // Register another user for authorization tests
    const otherUserResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `other-user-${Date.now()}@example.com`,
        name: 'Other User',
        password: 'password123',
      });

    otherUserToken = otherUserResponse.body.data.token;

    // Create a test recipient for schedule/send tests
    const { default: Recipient } = await import('../models/Recipient');
    const recipient = await Recipient.create({
      email: `test-recipient-${Date.now()}@example.com`,
      name: 'Test Recipient',
    });
    testRecipientId = recipient.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/campaigns', () => {
    it('should create a new campaign successfully', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Campaign',
          subject: 'Test Subject',
          body: 'Test email body content',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Campaign');
      expect(response.body.data.status).toBe('draft');
      expect(response.body.data.created_by).toBe(userId);
    });

    it('should reject campaign creation without authentication', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .send({
          name: 'Test Campaign',
          subject: 'Test Subject',
          body: 'Test email body content',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject campaign with missing required fields', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Campaign',
          // missing subject and body
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject campaign with past scheduled_at date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Campaign',
          subject: 'Test Subject',
          body: 'Test email body content',
          scheduled_at: pastDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should create campaign with future scheduled_at date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Scheduled Campaign',
          subject: 'Scheduled Subject',
          body: 'Scheduled email body',
          scheduled_at: futureDate.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.scheduled_at).toBeDefined();
    });
  });

  describe('GET /api/campaigns', () => {
    it('should list all campaigns for authenticated user', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThan(0);
    });

    it('should filter campaigns by status', async () => {
      const response = await request(app)
        .get('/api/campaigns?status=draft')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      response.body.data.forEach((campaign: any) => {
        expect(campaign.status).toBe('draft');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/campaigns?limit=2&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/campaigns/:id', () => {
    let campaignId: number;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Get Test Campaign',
          subject: 'Get Test',
          body: 'Get test body',
        });
      campaignId = response.body.data.id;
    });

    it('should get a campaign by ID', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(campaignId);
      expect(response.body.data.name).toBe('Get Test Campaign');
    });

    it('should reject access to another user\'s campaign', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/api/campaigns/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/campaigns/:id', () => {
    let draftCampaignId: number;
    let scheduledCampaignId: number;

    beforeAll(async () => {
      // Create a draft campaign
      const draftResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Draft for Update',
          subject: 'Draft Subject',
          body: 'Draft body',
        });
      draftCampaignId = draftResponse.body.data.id;

      // Create a scheduled campaign by directly using the database
      // Since we can't schedule without recipients, we'll just create a draft
      // and manually update its status for testing
      const scheduledResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Scheduled Campaign',
          subject: 'Scheduled Subject',
          body: 'Scheduled body',
        });
      scheduledCampaignId = scheduledResponse.body.data.id;

      // Manually update status to 'scheduled' in the database for testing
      const { default: Campaign } = await import('../models/Campaign');
      await Campaign.update(
        { status: 'scheduled' },
        { where: { id: scheduledCampaignId } }
      );
    });

    it('should update a draft campaign successfully', async () => {
      const response = await request(app)
        .patch(`/api/campaigns/${draftCampaignId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Campaign Name',
          subject: 'Updated Subject',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Campaign Name');
      expect(response.body.data.subject).toBe('Updated Subject');
    });

    it('should reject update of non-draft campaign (Business Rule)', async () => {
      const response = await request(app)
        .patch(`/api/campaigns/${scheduledCampaignId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Trying to Update Scheduled',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BUSINESS_RULE_VIOLATION');
      expect(response.body.error.message).toContain('draft');
    });

    it('should reject update without any fields', async () => {
      const response = await request(app)
        .patch(`/api/campaigns/${draftCampaignId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/campaigns/:id', () => {
    let draftCampaignId: number;
    let scheduledCampaignId: number;

    beforeAll(async () => {
      // Create a draft campaign
      const draftResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Draft for Delete',
          subject: 'Draft Subject',
          body: 'Draft body',
        });
      draftCampaignId = draftResponse.body.data.id;

      // Create another campaign and manually set to scheduled
      const scheduledResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Scheduled for Delete Test',
          subject: 'Scheduled Subject',
          body: 'Scheduled body',
        });
      scheduledCampaignId = scheduledResponse.body.data.id;

      // Manually update status to 'scheduled' in the database for testing
      const { default: Campaign } = await import('../models/Campaign');
      await Campaign.update(
        { status: 'scheduled' },
        { where: { id: scheduledCampaignId } }
      );
    });

    it('should delete a draft campaign successfully', async () => {
      const response = await request(app)
        .delete(`/api/campaigns/${draftCampaignId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify campaign is deleted
      const getResponse = await request(app)
        .get(`/api/campaigns/${draftCampaignId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('should reject delete of non-draft campaign (Business Rule)', async () => {
      const response = await request(app)
        .delete(`/api/campaigns/${scheduledCampaignId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BUSINESS_RULE_VIOLATION');
      expect(response.body.error.message).toContain('draft');
    });
  });

  describe('POST /api/campaigns/:id/schedule', () => {
    let campaignId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Be Scheduled',
          subject: 'Schedule Test',
          body: 'Schedule test body',
          recipient_ids: [testRecipientId], // Add recipient
        });
      campaignId = response.body.data.id;
    });

    it('should schedule a draft campaign with future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const response = await request(app)
        .post(`/api/campaigns/${campaignId}/schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scheduled_at: futureDate.toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('scheduled');
      expect(response.body.data.scheduled_at).toBeDefined();
    });

    it('should reject scheduling with past date (Business Rule)', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const response = await request(app)
        .post(`/api/campaigns/${campaignId}/schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scheduled_at: pastDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/campaigns/:id/send', () => {
    let campaignId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Be Sent',
          subject: 'Send Test',
          body: 'Send test body',
          recipient_ids: [testRecipientId], // Add recipient
        });
      campaignId = response.body.data.id;
    });

    it('should send a draft campaign', async () => {
      const response = await request(app)
        .post(`/api/campaigns/${campaignId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('sending');
    });

    it('should send a scheduled campaign', async () => {
      // First schedule the campaign
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      await request(app)
        .post(`/api/campaigns/${campaignId}/schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scheduled_at: futureDate.toISOString(),
        });

      // Then send it
      const response = await request(app)
        .post(`/api/campaigns/${campaignId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('sending');
    });
  });

  describe('GET /api/campaigns/:id/stats', () => {
    let campaignId: number;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Stats Test Campaign',
          subject: 'Stats Test',
          body: 'Stats test body',
        });
      campaignId = response.body.data.id;
    });

    it('should get campaign statistics', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${campaignId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('sent');
      expect(response.body.data).toHaveProperty('failed');
      expect(response.body.data).toHaveProperty('opened');
      expect(response.body.data).toHaveProperty('send_rate');
      expect(response.body.data).toHaveProperty('open_rate');
    });

    it('should return zero stats for campaign with no recipients', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${campaignId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.sent).toBe(0);
      expect(response.body.data.failed).toBe(0);
      expect(response.body.data.opened).toBe(0);
      expect(response.body.data.send_rate).toBe(0);
      expect(response.body.data.open_rate).toBe(0);
    });
  });
});
