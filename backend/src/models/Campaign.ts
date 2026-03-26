import { Model, DataTypes, Optional, Association } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import CampaignRecipient from './CampaignRecipient';

// Campaign status enum
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent';

// Campaign attributes interface
export interface CampaignAttributes {
  id: number;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduled_at: Date | null;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

// Optional fields for creation
export interface CampaignCreationAttributes
  extends Optional<CampaignAttributes, 'id' | 'status' | 'scheduled_at' | 'created_at' | 'updated_at'> {}

// Campaign model class
class Campaign extends Model<CampaignAttributes, CampaignCreationAttributes> implements CampaignAttributes {
  public id!: number;
  public name!: string;
  public subject!: string;
  public body!: string;
  public status!: CampaignStatus;
  public scheduled_at!: Date | null;
  public created_by!: number;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public readonly creator?: User;
  public readonly campaignRecipients?: CampaignRecipient[];
  public readonly recipients?: any[];

  public static associations: {
    creator: Association<Campaign, User>;
    campaignRecipients: Association<Campaign, CampaignRecipient>;
    recipients: Association<Campaign, any>;
  };
}

Campaign.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'scheduled', 'sending', 'sent']],
      },
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'campaigns',
    timestamps: false,
    hooks: {
      beforeUpdate: (campaign) => {
        campaign.updated_at = new Date();
      },
    },
  }
);

export default Campaign;
