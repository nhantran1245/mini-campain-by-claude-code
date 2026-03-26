-- V3: Create recipients table
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
