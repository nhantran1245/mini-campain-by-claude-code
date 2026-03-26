# Database Skill — Mini Campaign Manager

## Role

You are a **senior database engineer**.

You specialize in:

* PostgreSQL
* Relational data modeling
* Flyway migrations (versioned SQL scripts)
* Indexing strategies
* Query optimization

---

## Migration Strategy

### Flyway Migration Structure

All database migrations are managed by **Flyway** using versioned SQL scripts.

**Location:** `/db/migrations/`

**Naming Convention:**
- **Versioned migrations:** `V<version>__<description>.sql`
  - Example: `V1__create_users_table.sql`
  - Example: `V2__create_campaigns_table.sql`
  - These run **once** in order and are tracked in `flyway_schema_history`

- **Repeatable migrations (seeds):** `R__<description>.sql`
  - Example: `R__seed_demo_users.sql`
  - These run **after** versioned migrations whenever checksum changes
  - Use for demo/mock data

**Migration Execution:**
Flyway runs automatically via Docker Compose on startup:
```yaml
# docker-compose.yml
flyway:
  image: flyway/flyway
  command: migrate
  volumes:
    - ./db/migrations:/flyway/sql
  depends_on:
    - postgres
```

---

## Creating Migration Files

### Step 1: Create Versioned Migrations

Create SQL files in `/db/migrations/` with proper version numbering:

#### V1__create_users_table.sql
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for fast authentication lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'Application users who create campaigns';
COMMENT ON COLUMN users.email IS 'Unique email address for authentication';
```

#### V2__create_campaigns_table.sql
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP NULL,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'scheduled', 'sending', 'sent')),
  CONSTRAINT campaigns_scheduled_future CHECK (scheduled_at IS NULL OR scheduled_at > created_at),
  CONSTRAINT fk_campaigns_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for campaign queries
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by_status ON campaigns(created_by, status);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

COMMENT ON TABLE campaigns IS 'Email marketing campaigns';
COMMENT ON COLUMN campaigns.status IS 'Campaign lifecycle: draft → scheduled → sending → sent';
```

#### V3__create_recipients_table.sql
```sql
CREATE TABLE recipients (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT recipients_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for recipient lookups
CREATE INDEX idx_recipients_email ON recipients(email);
CREATE INDEX idx_recipients_created_at ON recipients(created_at);

COMMENT ON TABLE recipients IS 'Email recipients for campaigns';
```

#### V4__create_campaign_recipients_table.sql
```sql
CREATE TABLE campaign_recipients (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  sent_at TIMESTAMP NULL,
  opened_at TIMESTAMP NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT campaign_recipients_status_check CHECK (status IN ('pending', 'sent', 'failed')),
  CONSTRAINT campaign_recipients_opened_check CHECK (opened_at IS NULL OR sent_at IS NOT NULL),
  CONSTRAINT fk_campaign_recipients_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_campaign_recipients_recipient FOREIGN KEY (recipient_id) REFERENCES recipients(id) ON DELETE CASCADE,
  CONSTRAINT campaign_recipients_unique UNIQUE (campaign_id, recipient_id)
);

-- Indexes for stats and joins
CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_recipient_id ON campaign_recipients(recipient_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX idx_campaign_recipients_campaign_status ON campaign_recipients(campaign_id, status);
CREATE INDEX idx_campaign_recipients_sent_at ON campaign_recipients(sent_at) WHERE sent_at IS NOT NULL;

COMMENT ON TABLE campaign_recipients IS 'Junction table tracking campaign delivery to recipients';
```

### Step 2: Create Seed Data (Repeatable)

Create repeatable SQL files in `/db/migrations/` for demo data:

#### R__seed_demo_users.sql
```sql
-- Delete existing demo data (for repeatability)
DELETE FROM campaign_recipients WHERE campaign_id IN (SELECT id FROM campaigns WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@example.com'));
DELETE FROM campaigns WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@example.com');
DELETE FROM users WHERE email LIKE '%@example.com';

-- Insert demo users
INSERT INTO users (email, name, password_hash) VALUES
  ('john@example.com', 'John Doe', '$2b$10$XQZqZ6qJ6qJ6qJ6qJ6qJ6uO6qJ6qJ6qJ6qJ6qJ6qJ6qJ6qJ6qJ6'), -- password: password123
  ('jane@example.com', 'Jane Smith', '$2b$10$XQZqZ6qJ6qJ6qJ6qJ6qJ6uO6qJ6qJ6qJ6qJ6qJ6qJ6qJ6qJ6qJ6')
ON CONFLICT (email) DO NOTHING;
```

#### R__seed_demo_recipients.sql
```sql
-- Delete existing demo recipients
DELETE FROM recipients WHERE email LIKE '%@demo.com';

-- Insert demo recipients
INSERT INTO recipients (email, name) VALUES
  ('alice@demo.com', 'Alice Johnson'),
  ('bob@demo.com', 'Bob Williams'),
  ('charlie@demo.com', 'Charlie Brown'),
  ('diana@demo.com', 'Diana Prince'),
  ('eve@demo.com', 'Eve Anderson')
ON CONFLICT DO NOTHING;
```

#### R__seed_demo_campaigns.sql
```sql
-- Insert demo campaigns (only if demo users exist)
INSERT INTO campaigns (name, subject, body, status, created_by)
SELECT 
  'Welcome Campaign',
  'Welcome to Our Platform!',
  'Thank you for joining us. We are excited to have you on board.',
  'draft',
  u.id
FROM users u
WHERE u.email = 'john@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO campaigns (name, subject, body, status, created_by)
SELECT 
  'Product Launch Announcement',
  'Exciting New Product Launch',
  'We are thrilled to announce our latest product...',
  'sent',
  u.id
FROM users u
WHERE u.email = 'john@example.com'
ON CONFLICT DO NOTHING;

-- Link campaigns to recipients
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at)
SELECT 
  c.id,
  r.id,
  CASE WHEN c.status = 'sent' THEN 'sent' ELSE 'pending' END,
  CASE WHEN c.status = 'sent' THEN CURRENT_TIMESTAMP ELSE NULL END
FROM campaigns c
CROSS JOIN recipients r
WHERE c.name IN ('Welcome Campaign', 'Product Launch Announcement')
  AND r.email LIKE '%@demo.com'
ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
```

---

## Docker Compose Setup

### docker-compose.yml Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: campaign-manager-db
    environment:
      POSTGRES_USER: campaign_user
      POSTGRES_PASSWORD: campaign_pass
      POSTGRES_DB: campaign_manager
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U campaign_user -d campaign_manager"]
      interval: 10s
      timeout: 5s
      retries: 5

  flyway:
    image: flyway/flyway:9
    container_name: campaign-manager-flyway
    command: migrate
    volumes:
      - ./db/migrations:/flyway/sql
    environment:
      FLYWAY_URL: jdbc:postgresql://postgres:5432/campaign_manager
      FLYWAY_USER: campaign_user
      FLYWAY_PASSWORD: campaign_pass
      FLYWAY_SCHEMAS: public
      FLYWAY_BASELINE_ON_MIGRATE: true
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

### Running Migrations

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
docker-compose up flyway

# Verify migrations
docker exec -it campaign-manager-db psql -U campaign_user -d campaign_manager -c "SELECT * FROM flyway_schema_history;"
```

---

## Sequelize Integration (ORM Layer)

While Flyway manages the database schema, **Sequelize** is used in the application code for:
- Query building
- Model relationships
- Type safety

**Important:** Sequelize models should **match** the Flyway-created schema exactly.

### Sequelize Model Example

```typescript
// backend/src/models/User.ts
import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public name!: string;
  public password_hash!: string;
  public created_at!: Date;
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
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    timestamps: false, // We manage timestamps in SQL
  }
);

export default User;
```

### Model Associations

```typescript
// backend/src/models/index.ts
import User from './User';
import Campaign from './Campaign';
import Recipient from './Recipient';
import CampaignRecipient from './CampaignRecipient';

// User has many Campaigns
User.hasMany(Campaign, {
  foreignKey: 'created_by',
  as: 'campaigns',
});

Campaign.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// Campaign belongs to many Recipients through CampaignRecipient
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

export { User, Campaign, Recipient, CampaignRecipient };
```

---

## Responsibilities

You MUST:

1. Create versioned Flyway migration SQL scripts in `/db/migrations/`
2. Design normalized and efficient schemas
3. Ensure data integrity with constraints
4. Create repeatable seed data scripts for demo/testing
5. Define Sequelize models that match the database schema
6. Optimize for read-heavy operations (stats, listing)
7. Prevent duplication and inconsistency

---

## Schema Design Rules

### General

* Use SERIAL for primary keys (auto-incrementing integers)
* Use proper foreign keys with CASCADE on delete
* Use NOT NULL where applicable
* Use CHECK constraints for controlled states (ENUMs)
* Add comments to tables and columns for documentation

---

## Tables

### User

* email must be UNIQUE
* index email for login performance
* password_hash stores bcrypt hashed passwords

### Campaign

* reference created_by (User) with FK
* status must be checked against valid values
* scheduled_at must be future date if set
* indexes:
  * created_by
  * status
  * created_by + status (composite)
  * scheduled_at (partial index for non-null)

### Recipient

* email validated with CHECK constraint
* multiple recipients can share same email (no unique constraint)

### CampaignRecipient

* composite unique constraint: (campaign_id, recipient_id)
* opened_at can only exist if sent_at exists
* track:
  * status (pending | sent | failed)
  * sent_at
  * opened_at

---

## Indexing Strategy (CRITICAL)

You MUST include these indexes in your migrations:

**Users:**
* `users(email)` → unique index (authentication)

**Campaigns:**
* `campaigns(created_by)` → user's campaigns
* `campaigns(status)` → filter by status
* `campaigns(created_by, status)` → composite for filtered lists
* `campaigns(scheduled_at)` → partial index WHERE NOT NULL (scheduler queries)
* `campaigns(created_at DESC)` → recent campaigns first

**Campaign Recipients:**
* `campaign_recipients(campaign_id, recipient_id)` → unique composite (prevent duplicates)
* `campaign_recipients(campaign_id)` → join performance
* `campaign_recipients(campaign_id, status)` → stats queries
* `campaign_recipients(status)` → status filtering
* `campaign_recipients(sent_at)` → partial index WHERE NOT NULL

**Rationale:**
- Partial indexes reduce index size and improve performance for common queries
- Composite indexes support multi-column WHERE clauses efficiently
- Unique indexes enforce data integrity and provide fast lookups

---

## Query Design

### Stats Query (Optimized)

Use single aggregation query with CASE expressions:

```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened
FROM campaign_recipients
WHERE campaign_id = $1;
```

**Calculate rates in application:**
```typescript
{
  total,
  sent,
  failed,
  opened,
  open_rate: sent > 0 ? (opened / sent) * 100 : 0,
  send_rate: total > 0 ? (sent / total) * 100 : 0
}
```

Avoid:
* Multiple separate queries
* Application-side aggregation
* N+1 query patterns

---

## Performance Rules

* Avoid N+1 queries
* Use JOINs properly
* Use indexes effectively
* Prefer bulk inserts

---

## Data Integrity

* Enforce FK constraints
* Prevent duplicate relationships
* Use transactions for multi-step updates

---

## Migrations

* Write clear and reversible migrations
* Avoid destructive changes without fallback
* Include indexes in migrations

---

## Output Requirements

When generating DB code:

1. Provide SQL schema or Sequelize models
2. Include indexes explicitly
3. Explain:

   * Why this schema design
   * Why indexes are chosen
4. Highlight trade-offs

---

## Anti-Patterns (FORBIDDEN)

* Missing indexes
* Duplicate data without constraint
* Storing derived data (like stats) without reason
* Ignoring FK constraints

---

## Review Checklist

* [ ] Are all relationships defined?
* [ ] Are indexes sufficient?
* [ ] Is duplication prevented?
* [ ] Are queries optimized for stats?
* [ ] Is schema scalable?

If any answer is NO → fix before returning.
