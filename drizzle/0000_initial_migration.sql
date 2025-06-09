DROP TABLE IF EXISTS thread;

-- Create thread table
CREATE TABLE thread (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
