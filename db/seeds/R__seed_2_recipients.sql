-- Repeatable: Seed demo recipients
-- Delete existing demo recipients
DELETE FROM recipients WHERE email LIKE '%@demo.com';

-- Insert demo recipients (15 total for realistic testing)
INSERT INTO recipients (email, name) VALUES
  ('alice.johnson@demo.com', 'Alice Johnson'),
  ('bob.williams@demo.com', 'Bob Williams'),
  ('charlie.brown@demo.com', 'Charlie Brown'),
  ('diana.prince@demo.com', 'Diana Prince'),
  ('eve.anderson@demo.com', 'Eve Anderson'),
  ('frank.martin@demo.com', 'Frank Martin'),
  ('grace.lee@demo.com', 'Grace Lee'),
  ('henry.davis@demo.com', 'Henry Davis'),
  ('iris.wilson@demo.com', 'Iris Wilson'),
  ('jack.moore@demo.com', 'Jack Moore'),
  ('karen.taylor@demo.com', 'Karen Taylor'),
  ('liam.jackson@demo.com', 'Liam Jackson'),
  ('mia.white@demo.com', 'Mia White'),
  ('noah.harris@demo.com', 'Noah Harris'),
  ('olivia.clark@demo.com', 'Olivia Clark')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE recipients IS 'Demo recipients for testing campaign functionality';
