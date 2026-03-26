-- Repeatable: Seed campaign recipients relationships
-- This links campaigns to recipients with realistic statuses, sent times, and open rates

-- Clear existing relationships first (CASCADE handled by FK)
-- No need to explicitly delete as campaigns deletion cascades

-- ============================================
-- STRATEGY:
-- - Draft campaigns: All recipients in 'pending' status
-- - Scheduled campaigns: All recipients in 'pending' status
-- - Sent campaigns: Mix of 'sent' and 'failed' (90/10 ratio)
-- - Sent emails: 40% open rate with opened_at timestamp
-- ============================================

-- Helper: Get campaign IDs by name and user
DO $$
DECLARE
  john_id INTEGER;
  jane_id INTEGER;
  recipient_ids INTEGER[];
  campaign_record RECORD;
  curr_campaign_id INTEGER;
  curr_recipient_id INTEGER;
  sent_timestamp TIMESTAMP;
  should_open BOOLEAN;
BEGIN
  -- Get user IDs
  SELECT id INTO john_id FROM users WHERE email = 'john@example.com';
  SELECT id INTO jane_id FROM users WHERE email = 'jane@example.com';
  
  -- Get all recipient IDs
  SELECT ARRAY_AGG(id ORDER BY id) INTO recipient_ids FROM recipients WHERE email LIKE '%@demo.com';
  
  -- ============================================
  -- JOHN'S CAMPAIGNS
  -- ============================================
  
  -- Campaign 1 & 2 & 9 & 10: DRAFT campaigns -> all pending, select 5-8 random recipients
  FOR campaign_record IN 
    SELECT id, name FROM campaigns 
    WHERE created_by = john_id 
    AND status = 'draft'
  LOOP
    -- Assign random 5-8 recipients to each draft campaign
    FOR i IN 1..(5 + floor(random() * 4)::integer) LOOP
      curr_recipient_id := recipient_ids[1 + floor(random() * array_length(recipient_ids, 1))::integer];
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (campaign_record.id, curr_recipient_id, 'pending')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END LOOP;
  END LOOP;
  
  -- Campaign 3 & 4: SCHEDULED campaigns -> all pending, assign 8-12 recipients
  FOR campaign_record IN 
    SELECT id, name FROM campaigns 
    WHERE created_by = john_id 
    AND status = 'scheduled'
  LOOP
    -- Assign 8-12 recipients to scheduled campaigns
    FOR i IN 1..(8 + floor(random() * 5)::integer) LOOP
      curr_recipient_id := recipient_ids[1 + floor(random() * array_length(recipient_ids, 1))::integer];
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (campaign_record.id, curr_recipient_id, 'pending')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END LOOP;
  END LOOP;
  
  -- Campaign 5: SENT - Welcome Email (sent 14 days ago) -> 12 recipients
  SELECT id INTO curr_campaign_id FROM campaigns 
  WHERE created_by = john_id AND name = 'Welcome Email - March Batch';
  
  FOR i IN 1..12 LOOP
    curr_recipient_id := recipient_ids[i];
    
    -- 90% success rate
    IF random() < 0.9 THEN
      sent_timestamp := (NOW() - INTERVAL '14 days') + (random() * INTERVAL '2 hours');
      should_open := random() < 0.4; -- 40% open rate
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
      VALUES (
        curr_campaign_id, 
        curr_recipient_id, 
        'sent',
        sent_timestamp,
        CASE WHEN should_open THEN sent_timestamp + (INTERVAL '1 hour' * random() * 24) ELSE NULL END
      )
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    ELSE
      -- 10% failure rate
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (curr_campaign_id, curr_recipient_id, 'failed')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Campaign 6: SENT - Product Update (sent 10 days ago) -> 10 recipients
  SELECT id INTO curr_campaign_id FROM campaigns 
  WHERE created_by = john_id AND name = 'Product Update - March 2026';
  
  FOR i IN 1..10 LOOP
    curr_recipient_id := recipient_ids[i];
    
    IF random() < 0.9 THEN
      sent_timestamp := (NOW() - INTERVAL '10 days') + (random() * INTERVAL '2 hours');
      should_open := random() < 0.4;
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
      VALUES (
        curr_campaign_id, 
        curr_recipient_id, 
        'sent',
        sent_timestamp,
        CASE WHEN should_open THEN sent_timestamp + (INTERVAL '1 hour' * random() * 20) ELSE NULL END
      )
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    ELSE
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (curr_campaign_id, curr_recipient_id, 'failed')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Campaign 7: SENT - Customer Survey (sent 7 days ago) -> 15 recipients (all)
  SELECT id INTO curr_campaign_id FROM campaigns 
  WHERE created_by = john_id AND name = 'Customer Feedback Survey';
  
  FOREACH curr_recipient_id IN ARRAY recipient_ids LOOP
    IF random() < 0.9 THEN
      sent_timestamp := (NOW() - INTERVAL '7 days') + (random() * INTERVAL '3 hours');
      should_open := random() < 0.4;
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
      VALUES (
        curr_campaign_id, 
        curr_recipient_id, 
        'sent',
        sent_timestamp,
        CASE WHEN should_open THEN sent_timestamp + (INTERVAL '1 hour' * random() * 15) ELSE NULL END
      )
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    ELSE
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (curr_campaign_id, curr_recipient_id, 'failed')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Campaign 8: SENT - Spring Sale (sent 20 days ago) -> 13 recipients
  SELECT id INTO curr_campaign_id FROM campaigns 
  WHERE created_by = john_id AND name = 'Spring Sale 2026';
  
  FOR i IN 1..13 LOOP
    curr_recipient_id := recipient_ids[i];
    
    IF random() < 0.9 THEN
      sent_timestamp := (NOW() - INTERVAL '20 days') + (random() * INTERVAL '4 hours');
      should_open := random() < 0.4;
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
      VALUES (
        curr_campaign_id, 
        curr_recipient_id, 
        'sent',
        sent_timestamp,
        CASE WHEN should_open THEN sent_timestamp + (INTERVAL '1 hour' * random() * 48) ELSE NULL END
      )
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    ELSE
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (curr_campaign_id, curr_recipient_id, 'failed')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- ============================================
  -- JANE'S CAMPAIGNS
  -- ============================================
  
  -- Draft campaigns (11, 12, 19, 20) -> all pending
  FOR campaign_record IN 
    SELECT id, name FROM campaigns 
    WHERE created_by = jane_id 
    AND status = 'draft'
  LOOP
    FOR i IN 1..(6 + floor(random() * 4)::integer) LOOP
      curr_recipient_id := recipient_ids[1 + floor(random() * array_length(recipient_ids, 1))::integer];
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (campaign_record.id, curr_recipient_id, 'pending')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END LOOP;
  END LOOP;
  
  -- Scheduled campaigns (13, 14) -> all pending
  FOR campaign_record IN 
    SELECT id, name FROM campaigns 
    WHERE created_by = jane_id 
    AND status = 'scheduled'
  LOOP
    FOR i IN 1..(9 + floor(random() * 4)::integer) LOOP
      curr_recipient_id := recipient_ids[1 + floor(random() * array_length(recipient_ids, 1))::integer];
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (campaign_record.id, curr_recipient_id, 'pending')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END LOOP;
  END LOOP;
  
  -- Campaign 15: SENT - Welcome to Premium (sent 21 days ago) -> 8 recipients
  SELECT id INTO curr_campaign_id FROM campaigns 
  WHERE created_by = jane_id AND name = 'Welcome to Premium';
  
  FOR i IN 1..8 LOOP
    curr_recipient_id := recipient_ids[i];
    
    IF random() < 0.9 THEN
      sent_timestamp := (NOW() - INTERVAL '21 days') + (random() * INTERVAL '1 hour');
      should_open := random() < 0.4;
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
      VALUES (
        curr_campaign_id, 
        curr_recipient_id, 
        'sent',
        sent_timestamp,
        CASE WHEN should_open THEN sent_timestamp + (INTERVAL '30 minutes' * random() * 20) ELSE NULL END
      )
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    ELSE
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (curr_campaign_id, curr_recipient_id, 'failed')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Campaign 16: SENT - Case Study (sent 15 days ago) -> 14 recipients
  SELECT id INTO curr_campaign_id FROM campaigns 
  WHERE created_by = jane_id AND name = 'Customer Success Story - RetailCo';
  
  FOR i IN 1..14 LOOP
    curr_recipient_id := recipient_ids[i];
    
    IF random() < 0.9 THEN
      sent_timestamp := (NOW() - INTERVAL '15 days') + (random() * INTERVAL '3 hours');
      should_open := random() < 0.4;
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
      VALUES (
        curr_campaign_id, 
        curr_recipient_id, 
        'sent',
        sent_timestamp,
        CASE WHEN should_open THEN sent_timestamp + (INTERVAL '1 hour' * random() * 30) ELSE NULL END
      )
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    ELSE
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (curr_campaign_id, curr_recipient_id, 'failed')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Campaign 17: SENT - Tutorial (sent 12 days ago) -> 11 recipients
  SELECT id INTO curr_campaign_id FROM campaigns 
  WHERE created_by = jane_id AND name = 'Tutorial: Advanced Segmentation';
  
  FOR i IN 1..11 LOOP
    curr_recipient_id := recipient_ids[i];
    
    IF random() < 0.9 THEN
      sent_timestamp := (NOW() - INTERVAL '12 days') + (random() * INTERVAL '2 hours');
      should_open := random() < 0.4;
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
      VALUES (
        curr_campaign_id, 
        curr_recipient_id, 
        'sent',
        sent_timestamp,
        CASE WHEN should_open THEN sent_timestamp + (INTERVAL '1 hour' * random() * 24) ELSE NULL END
      )
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    ELSE
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (curr_campaign_id, curr_recipient_id, 'failed')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Campaign 18: SENT - Industry Report (sent 9 days ago) -> 15 recipients (all)
  SELECT id INTO curr_campaign_id FROM campaigns 
  WHERE created_by = jane_id AND name = 'Email Marketing Report 2026';
  
  FOREACH curr_recipient_id IN ARRAY recipient_ids LOOP
    IF random() < 0.9 THEN
      sent_timestamp := (NOW() - INTERVAL '9 days') + (random() * INTERVAL '4 hours');
      should_open := random() < 0.4;
      
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
      VALUES (
        curr_campaign_id, 
        curr_recipient_id, 
        'sent',
        sent_timestamp,
        CASE WHEN should_open THEN sent_timestamp + (INTERVAL '1 hour' * random() * 18) ELSE NULL END
      )
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    ELSE
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
      VALUES (curr_campaign_id, curr_recipient_id, 'failed')
      ON CONFLICT (campaign_id, recipient_id) DO NOTHING;
    END IF;
  END LOOP;
  
END $$;

COMMENT ON TABLE campaign_recipients IS 'Realistic campaign-recipient relationships with varied statuses, timestamps, and open rates';
