import request from 'supertest';
import app from '../index';
import { sequelize } from '../models';
import CampaignRecipient from '../models/CampaignRecipient';

describe('Email Sending Integration', () => {
  let authToken: string;
  let recipientId: number;

  beforeAll(async () => {
    await sequelize.authenticate();

    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `email-test-${Date.now()}@example.com`,
        name: 'Email Test User',
        password: 'password123',
      });

    authToken = registerResponse.body.data.token;

    // Create a test recipient
    const recipientResponse = await request(app)
      .post('/api/recipients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: `recipient-${Date.now()}@example.com`,
        name: 'Test Recipient',
      });

    recipientId = recipientResponse.body.data.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Campaign Sending Flow', () => {
    it('should send campaign and update status to sending', async () => {
      // Create a campaign with recipient
      const campaignResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Send Test Campaign',
          subject: 'Test Subject',
          body: 'Test email body',
          recipient_ids: [recipientId],
        });

      const campaignId = campaignResponse.body.data.id;

      // Send the campaign
      const sendResponse = await request(app)
        .post(`/api/campaigns/${campaignId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(sendResponse.status).toBe(200);
      expect(sendResponse.body.success).toBe(true);
      expect(sendResponse.body.data.status).toBe('sending');

      // Wait a bit for async processing to start
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify campaign recipients are being processed
      const recipients = await CampaignRecipient.findAll({
        where: { campaign_id: campaignId },
      });

      expect(recipients.length).toBeGreaterThan(0);
      // Initially they should be pending or being processed
      expect(recipients[0].status).toMatch(/pending|sent|failed/);
    });

    it('should update campaign status to sent after processing', async () => {
      // Create a campaign with recipient
      const campaignResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Status Update Test',
          subject: 'Status Test',
          body: 'Status test body',
          recipient_ids: [recipientId],
        });

      const campaignId = campaignResponse.body.data.id;

      // Send the campaign
      await request(app)
        .post(`/api/campaigns/${campaignId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      // Wait for processing to complete (with buffer for async operations)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check campaign status - should be 'sent' after processing
      const statusResponse = await request(app)
        .get(`/api/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.body.data.status).toBe('sent');
    });

    it('should update recipient statuses during sending', async () => {
      // Create a campaign with recipient
      const campaignResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Recipient Status Test',
          subject: 'Recipient Test',
          body: 'Recipient test body',
          recipient_ids: [recipientId],
        });

      const campaignId = campaignResponse.body.data.id;

      // Send the campaign
      await request(app)
        .post(`/api/campaigns/${campaignId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check recipient statuses
      const recipients = await CampaignRecipient.findAll({
        where: { campaign_id: campaignId },
      });

      expect(recipients.length).toBe(1);
      // Should be either sent or failed (90% success rate in simulation)
      expect(['sent', 'failed']).toContain(recipients[0].status);

      // If sent, sent_at should be set
      if (recipients[0].status === 'sent') {
        expect(recipients[0].sent_at).not.toBeNull();
      }
    });

    it('should calculate stats correctly after sending', async () => {
      // Create a campaign with recipient
      const campaignResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Stats Test Campaign',
          subject: 'Stats Test',
          body: 'Stats test body',
          recipient_ids: [recipientId],
        });

      const campaignId = campaignResponse.body.data.id;

      // Send the campaign
      await request(app)
        .post(`/api/campaigns/${campaignId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get stats
      const statsResponse = await request(app)
        .get(`/api/campaigns/${campaignId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.data.total).toBe(1);
      
      // Should have either 1 sent or 1 failed (90% success rate)
      const stats = statsResponse.body.data;
      expect(stats.sent + stats.failed).toBe(1);
      
      // Send rate should be either 100% or 0%
      expect([0, 100]).toContain(stats.send_rate);
    });
  });
});
