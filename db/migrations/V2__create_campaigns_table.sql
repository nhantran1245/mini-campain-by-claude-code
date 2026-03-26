-- V2: Create campaigns table
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
