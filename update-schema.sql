-- Update existing users table to add new weight columns
-- Run this in your Supabase SQL editor

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS target_weight DECIMAL(5,2);

-- Update existing weight column to current_weight (if you have data)
UPDATE users SET current_weight = weight WHERE weight IS NOT NULL AND current_weight IS NULL;

-- Remove old weight column (optional - only if you want to clean up)
-- ALTER TABLE users DROP COLUMN IF EXISTS weight;

-- Create weight_logs table
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create indexes for weight_logs
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_logged_at ON weight_logs(logged_at);

-- Disable RLS for development (easier)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE meals DISABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs DISABLE ROW LEVEL SECURITY;