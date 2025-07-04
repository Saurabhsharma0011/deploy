-- ========================================
-- MINIMAL SOLANA TOKENS TABLE SCHEMA
-- ========================================
-- Use this to only store newly created tokens

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Core token data
  mint_address TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,

  -- Metadata
  description TEXT,
  image_url TEXT,
  metadata_uri TEXT,

  -- Creator and supply info
  creator_address TEXT NOT NULL,
  initial_supply BIGINT NOT NULL DEFAULT 0,

  -- Social media links (optional)
  website TEXT,
  twitter TEXT,
  telegram TEXT,
  discord TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger function to update `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_tokens_updated_at'
  ) THEN
    CREATE TRIGGER update_tokens_updated_at
      BEFORE UPDATE ON tokens
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read access" ON tokens FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON tokens FOR UPDATE USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON tokens TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tokens_mint ON tokens(mint_address);
CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON tokens(created_at DESC);

-- Completion Notice
DO $$
BEGIN
  RAISE NOTICE '✅ Minimal Token Table Created Without Destructive Operations!';
END $$;
