import { Model, DataTypes, Optional, Association } from 'sequelize';
import sequelize from '../config/database';
import CampaignRecipient from './CampaignRecipient';

// Recipient attributes interface
export interface RecipientAttributes {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

// Optional fields for creation
export interface RecipientCreationAttributes extends Optional<RecipientAttributes, 'id' | 'created_at'> {}

// Recipient model class
class Recipient extends Model<RecipientAttributes, RecipientCreationAttributes> implements RecipientAttributes {
  public id!: number;
  public email!: string;
  public name!: string;
  public created_at!: Date;

  // Associations
  public readonly campaignRecipients?: CampaignRecipient[];

  public static associations: {
    campaignRecipients: Association<Recipient, CampaignRecipient>;
  };
}

Recipient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'recipients',
    timestamps: false,
  }
);

export default Recipient;
