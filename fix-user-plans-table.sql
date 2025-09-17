-- Migration script to fix user_plans table if it was created with wrong data type
-- Run this if you already created the table and got the UUID error

-- First, drop the existing table if it exists (WARNING: This will delete all data)
DROP TABLE IF EXISTS user_plans CASCADE;

-- Now recreate the table with correct UUID type
CREATE TABLE user_plans (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Correct UUID type for Clerk user IDs
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_user_plans_status ON user_plans(status);

-- Enable Row Level Security (RLS)
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see their own plan
CREATE POLICY "Users can view their own plan" ON user_plans
    FOR SELECT USING (user_id::text = auth.uid());

-- Create policy to allow users to update their own plan
CREATE POLICY "Users can update their own plan" ON user_plans
    FOR UPDATE USING (user_id::text = auth.uid());

-- Create policy to allow system to insert/update plans
CREATE POLICY "System can manage user plans" ON user_plans
    FOR ALL USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_plans_updated_at 
    BEFORE UPDATE ON user_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 