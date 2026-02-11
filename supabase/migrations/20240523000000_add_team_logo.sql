
-- Add logo columns to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_config JSONB;
