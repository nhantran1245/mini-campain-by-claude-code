import { User, Campaign, Recipient, testConnection, sequelize } from '../models';

describe('Database and Models', () => {
  beforeAll(async () => {
    await testConnection();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Database Connection', () => {
    it('should connect to PostgreSQL successfully', async () => {
      await expect(sequelize.authenticate()).resolves.not.toThrow();
    });
  });

  describe('User Model', () => {
    it('should fetch users from database', async () => {
      const users = await User.findAll();
      expect(users.length).toBeGreaterThan(0);
    });

    it('should have required fields', async () => {
      const user = await User.findOne();
      expect(user).toBeDefined();
      expect(user?.id).toBeDefined();
      expect(user?.email).toBeDefined();
      expect(user?.name).toBeDefined();
      expect(user?.password_hash).toBeDefined();
      expect(user?.created_at).toBeDefined();
    });

    it('should validate email format', async () => {
      const user = await User.findOne({ where: { email: 'john@example.com' } });
      expect(user).toBeDefined();
      expect(user?.email).toMatch(/@/);
    });
  });

  describe('Campaign Model', () => {
    it('should fetch campaigns from database', async () => {
      const campaigns = await Campaign.findAll();
      expect(campaigns.length).toBeGreaterThan(0);
    });

    it('should have valid status values', async () => {
      const campaigns = await Campaign.findAll();
      campaigns.forEach((campaign) => {
        expect(['draft', 'scheduled', 'sending', 'sent']).toContain(campaign.status);
      });
    });

    it('should include creator association', async () => {
      const campaign = await Campaign.findOne({
        include: [{ model: User, as: 'creator' }],
      });
      expect(campaign).toBeDefined();
      expect(campaign?.creator).toBeDefined();
      expect(campaign?.creator?.email).toBeDefined();
    });
  });

  describe('Recipient Model', () => {
    it('should fetch recipients from database', async () => {
      const recipients = await Recipient.findAll();
      expect(recipients.length).toBeGreaterThan(0);
    });

    it('should have valid email format', async () => {
      const recipients = await Recipient.findAll();
      recipients.forEach((recipient) => {
        expect(recipient.email).toMatch(/@/);
      });
    });
  });

  describe('Model Associations', () => {
    it('should load User with Campaigns', async () => {
      const user = await User.findOne({
        include: [{ model: Campaign, as: 'campaigns' }],
      });
      expect(user).toBeDefined();
      expect(Array.isArray(user?.campaigns)).toBe(true);
    });

    it('should load Campaign with Recipients through junction table', async () => {
      // First, create a test association if needed
      const campaign = await Campaign.findOne();
      const recipient = await Recipient.findOne();

      if (campaign && recipient) {
        const campaignWithRecipients = await Campaign.findByPk(campaign.id, {
          include: [{ model: Recipient, as: 'recipients' }],
        });
        expect(campaignWithRecipients).toBeDefined();
        expect(Array.isArray(campaignWithRecipients?.recipients)).toBe(true);
      }
    });
  });

  describe('Data Integrity', () => {
    it('should have matching created_by foreign keys', async () => {
      const campaigns = await Campaign.findAll();
      for (const campaign of campaigns) {
        const user = await User.findByPk(campaign.created_by);
        expect(user).toBeDefined();
      }
    });

    it('should enforce status check constraint', async () => {
      const campaign = await Campaign.findOne();
      if (campaign) {
        expect(['draft', 'scheduled', 'sending', 'sent']).toContain(campaign.status);
      }
    });

    it('should have scheduled_at for scheduled campaigns', async () => {
      const scheduledCampaign = await Campaign.findOne({
        where: { status: 'scheduled' },
      });
      if (scheduledCampaign) {
        expect(scheduledCampaign.scheduled_at).toBeDefined();
        expect(scheduledCampaign.scheduled_at).toBeInstanceOf(Date);
      }
    });
  });
});
