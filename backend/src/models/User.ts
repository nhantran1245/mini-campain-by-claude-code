import { Model, DataTypes, Optional, Association } from 'sequelize';
import sequelize from '../config/database';

// User attributes interface
export interface UserAttributes {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
}

// Optional fields for creation (id and created_at are auto-generated)
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at'> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public name!: string;
  public password_hash!: string;
  public created_at!: Date;

  // Associations
  public readonly campaigns?: any[];

  public static associations: {
    campaigns: Association<User, any>;
  };

  // Timestamps
  public readonly createdAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password_hash: {
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
    tableName: 'users',
    timestamps: false,
  }
);

export default User;
