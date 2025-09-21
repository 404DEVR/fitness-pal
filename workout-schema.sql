-- Add workout tracking table to your Supabase database
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workout_name VARCHAR(255) NOT NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL, -- in kg
  reps INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at);
CREATE INDEX IF NOT EXISTS idx_workouts_name ON workouts(workout_name);

-- Disable RLS for development (easier)
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;