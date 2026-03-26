import { Model, DataTypes, Optional, Association } from 'sequelize';
import sequelize from '../config/database';
import Campaign from './Campaign';
import Recipient from './Recipient';

// Campaign recipient status enum
export type CampaignRecipientStatus = 'pending' | 'sent' | 'failed';

// CampaignRecipient attributes interface
export interface CampaignRecipientAttributes {
  id: number;
  campaign_id: number;
  recipient_id: number;
  sent_at: Date | null;
  opened_at: Date | null;
  status: CampaignRecipientStatus;
  created_at: Date;
}

// Optional fields for creation
export interface CampaignRecipientCreationAttributes
  extends Optional<CampaignRecipientAttributes, 'id' | 'sent_at' | 'opened_at' | 'status' | 'created_at'> {}

// CampaignRecipient model class
class CampaignRecipient
  extends Model<CampaignRecipientAttributes, CampaignRecipientCreationAttributes>
  implements CampaignRecipientAttributes
{
  public id!: number;
  public campaign_id!: number;
  public recipient_id!: number;
  public sent_at!: Date | null;
  public opened_at!: Date | null;
  public status!: CampaignRecipientStatus;
  public created_at!: Date;

  // Associations
  public readonly campaign?: Campaign;
  public readonly recipient?: Recipient;

  public static associations: {
    campaign: Association<CampaignRecipient, Campaign>;
    recipient: Association<CampaignRecipient, Recipient>;
  };
}

CampaignRecipient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'campaigns',
        key: 'id',
      },
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'recipients',
        key: 'id',
      },
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'sent', 'failed']],
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'campaign_recipients',
    timestamps: false,
  }
);

export default CampaignRecipient;
