import sequelize, { testConnection } from '../config/database';
import User from './User';
import Campaign from './Campaign';
import Recipient from './Recipient';
import CampaignRecipient from './CampaignRecipient';

// Define associations between models

// User -> Campaign (One-to-Many)
User.hasMany(Campaign, {
  foreignKey: 'created_by',
  as: 'campaigns',
});

Campaign.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// Campaign <-> Recipient (Many-to-Many through CampaignRecipient)
Campaign.belongsToMany(Recipient, {
  through: CampaignRecipient,
  foreignKey: 'campaign_id',
  otherKey: 'recipient_id',
  as: 'recipients',
});

Recipient.belongsToMany(Campaign, {
  through: CampaignRecipient,
  foreignKey: 'recipient_id',
  otherKey: 'campaign_id',
  as: 'campaigns',
});

// Direct associations for CampaignRecipient
Campaign.hasMany(CampaignRecipient, {
  foreignKey: 'campaign_id',
  as: 'campaignRecipients',
});

CampaignRecipient.belongsTo(Campaign, {
  foreignKey: 'campaign_id',
  as: 'campaign',
});

Recipient.hasMany(CampaignRecipient, {
  foreignKey: 'recipient_id',
  as: 'campaignRecipients',
});

CampaignRecipient.belongsTo(Recipient, {
  foreignKey: 'recipient_id',
  as: 'recipient',
});

// Export models and database instance
export { sequelize, testConnection, User, Campaign, Recipient, CampaignRecipient };

// Export a function to initialize database (for testing purposes)
export const initDatabase = async (): Promise<void> => {
  await testConnection();
  // Note: We don't call sequelize.sync() because Flyway manages migrations
  console.log('📦 All models loaded successfully');
};

export default {
  sequelize,
  testConnection,
  initDatabase,
  User,
  Campaign,
  Recipient,
  CampaignRecipient,
};
