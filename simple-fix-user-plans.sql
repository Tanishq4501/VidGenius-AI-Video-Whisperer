-- Simple fix for user_plans table - drops and recreates with TEXT user_id
-- This avoids UUID conversion issues with Clerk

-- Drop existing table if it exists
DROP TABLE IF EXISTS user_plans CASCADE;

-- Create the table with TEXT user_id (simpler approach)
CREATE TABLE user_plans (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL, -- Using TEXT to avoid UUID issues
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