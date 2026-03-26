-- Repeatable: Seed demo users
-- Delete existing demo data (for repeatability)
DELETE FROM campaign_recipients WHERE campaign_id IN (SELECT id FROM campaigns WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@example.com'));
DELETE FROM campaigns WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@example.com');
DELETE FROM users WHERE email LIKE '%@example.com';

-- Insert demo users
-- Password for both users: password123
-- Hash generated with: bcrypt.hash('password123', 10)
INSERT INTO users (email, name, password_hash) VALUES
  ('john@example.com', 'John Doe', '$2b$10$S3IDRISHpvqKRVQKK4tH9.lGxK.HTWXiaj6u0m67jf3V5L6OBve5G'),
  ('jane@example.com', 'Jane Smith', '$2b$10$S3IDRISHpvqKRVQKK4tH9.lGxK.HTWXiaj6u0m67jf3V5L6OBve5G')
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE users IS 'Demo users: john@example.com and jane@example.com (password: password123)';
