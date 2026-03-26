-- Repeatable: Seed demo campaigns (updated for current user IDs)
-- Clear existing demo campaign data
DELETE FROM campaign_recipients WHERE campaign_id IN (
  SELECT id FROM campaigns WHERE created_by IN (
    SELECT id FROM users WHERE email LIKE '%@example.com'
  )
);
DELETE FROM campaigns WHERE created_by IN (
  SELECT id FROM users WHERE email LIKE '%@example.com'
);

-- John''s campaigns
INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Welcome Series', 'Welcome to Our Platform!', 'Welcome! We are thrilled to have you.', 'draft', u.id, NOW() - INTERVAL '7 days' FROM users u WHERE u.email = 'john@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Product Launch Q2 2026', 'Exciting New Features Coming Soon', 'We are excited to announce our Q2 2026 updates.', 'draft', u.id, NOW() - INTERVAL '5 days' FROM users u WHERE u.email = 'john@example.com';

INSERT INTO campaigns (name, subject, body, status, scheduled_at, created_by, created_at)
SELECT 'Monthly Newsletter', 'Your Monthly Update', 'Here is your monthly roundup of platform updates.', 'scheduled', NOW() + INTERVAL '2 days', u.id, NOW() - INTERVAL '4 days' FROM users u WHERE u.email = 'john@example.com';

INSERT INTO campaigns (name, subject, body, status, scheduled_at, created_by, created_at)
SELECT 'Webinar Invitation', 'Join Our Free Webinar', 'You are invited to our exclusive webinar.', 'scheduled', NOW() + INTERVAL '5 days', u.id, NOW() - INTERVAL '3 days' FROM users u WHERE u.email = 'john@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Welcome Email - March Batch', 'Welcome! Let''s Get Started', 'Thank you for signing up! Quick start guide inside.', 'sent', u.id, NOW() - INTERVAL '14 days' FROM users u WHERE u.email = 'john@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Product Update - March 2026', 'New Features Released!', 'We just released amazing updates. Check them out!', 'sent', u.id, NOW() - INTERVAL '10 days' FROM users u WHERE u.email = 'john@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Customer Feedback Survey', 'We Value Your Opinion', 'Your feedback matters! Take our 2-minute survey.', 'sent', u.id, NOW() - INTERVAL '7 days' FROM users u WHERE u.email = 'john@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Spring Sale 2026', 'Spring Sale: 30% OFF Premium Plans', 'Celebrate spring with our biggest sale. 30% off!', 'sent', u.id, NOW() - INTERVAL '20 days' FROM users u WHERE u.email = 'john@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Annual Conference 2026', 'Save the Date: Annual Marketing Conference', 'Our annual conference is coming this fall. Mark your calendar!', 'draft', u.id, NOW() - INTERVAL '2 days' FROM users u WHERE u.email = 'john@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Win-back Campaign', 'We Miss You! Come Back', 'We noticed you haven''t been active. Special offer inside!', 'draft', u.id, NOW() - INTERVAL '1 day' FROM users u WHERE u.email = 'john@example.com';

-- Jane''s campaigns
INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Internal Team Newsletter', 'Team Update - Q1 2026', 'What an amazing quarter! Check out our achievements.', 'draft', u.id, NOW() - INTERVAL '6 days' FROM users u WHERE u.email = 'jane@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Strategic Partnership', 'Partnership Announcement', 'Exciting partnership with TechCorp announced!', 'draft', u.id, NOW() - INTERVAL '4 days' FROM users u WHERE u.email = 'jane@example.com';

INSERT INTO campaigns (name, subject, body, status, scheduled_at, created_by, created_at)
SELECT 'Weekly Tips', 'This Week''s Email Marketing Tip', 'Your weekly tip: Personalization increases open rates by 26%', 'scheduled', NOW() + INTERVAL '3 days', u.id, NOW() - INTERVAL '3 days' FROM users u WHERE u.email = 'jane@example.com';

INSERT INTO campaigns (name, subject, body, status, scheduled_at, created_by, created_at)
SELECT 'Product Demo Invitation', 'See Our Platform in Action', 'Join us for a live product demonstration!', 'scheduled', NOW() + INTERVAL '7 days', u.id, NOW() - INTERVAL '2 days' FROM users u WHERE u.email = 'jane@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Welcome to Premium', 'Welcome to Premium!', 'Congratulations! You are now a Premium member.', 'sent', u.id, NOW() - INTERVAL '21 days' FROM users u WHERE u.email = 'jane@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Customer Success Story - RetailCo', 'How RetailCo Increased Sales by 300%', 'Success story: Discover how RetailCo transformed their email marketing.', 'sent', u.id, NOW() - INTERVAL '15 days' FROM users u WHERE u.email = 'jane@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Tutorial: Advanced Segmentation', 'Master Advanced Segmentation', 'Learn to use advanced segmentation like a pro in 5 minutes.', 'sent', u.id, NOW() - INTERVAL '12 days' FROM users u WHERE u.email = 'jane@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Email Marketing Report 2026', '2026 Email Marketing Trends Report', 'Our comprehensive trends report is here. Free download!', 'sent', u.id, NOW() - INTERVAL '9 days' FROM users u WHERE u.email = 'jane@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Thank You Campaign', 'Thank You for Being Amazing!', 'We wanted to take a moment to say thank you for your support.', 'draft', u.id, NOW() - INTERVAL '1 day' FROM users u WHERE u.email = 'jane@example.com';

INSERT INTO campaigns (name, subject, body, status, created_by, created_at)
SELECT 'Product Feedback Request', 'Help Us Improve', 'Your input is invaluable! Share your thoughts in our 3-minute survey.', 'draft', u.id, NOW() FROM users u WHERE u.email = 'jane@example.com';
