-- V4: Create campaign_recipients junction table
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
