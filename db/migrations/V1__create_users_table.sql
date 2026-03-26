-- V1: Create users table
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
