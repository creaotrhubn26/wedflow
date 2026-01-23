-- Drop existing vendor_subscriptions if it exists (partial from old migration)
DROP TABLE IF EXISTS vendor_payments CASCADE;
DROP TABLE IF EXISTS vendor_usage_metrics CASCADE;
DROP TABLE IF EXISTS vendor_subscriptions CASCADE;

-- Update subscription_tiers to match current schema
ALTER TABLE subscription_tiers DROP COLUMN IF EXISTS has_custom_landing_page;
ALTER TABLE subscription_tiers DROP COLUMN IF EXISTS has_api_access;
ALTER TABLE subscription_tiers DROP COLUMN IF EXISTS has_vipps_payment_link;
ALTER TABLE subscription_tiers DROP COLUMN IF EXISTS has_custom_branding;
ALTER TABLE subscription_tiers DROP COLUMN IF EXISTS stripe_fee_percentage;
ALTER TABLE subscription_tiers DROP COLUMN IF EXISTS max_monthly_video_minutes;

-- Add new columns that exist in schema.ts but not in migration
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS max_products integer NOT NULL DEFAULT 5;
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS max_monthly_offers integer NOT NULL DEFAULT 10;
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS max_monthly_deliveries integer NOT NULL DEFAULT 5;

ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS can_send_messages boolean NOT NULL DEFAULT true;
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS can_receive_inquiries boolean NOT NULL DEFAULT true;
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS can_create_offers boolean NOT NULL DEFAULT true;
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS can_create_deliveries boolean NOT NULL DEFAULT true;
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS can_showcase_work boolean NOT NULL DEFAULT true;

ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS can_highlight_profile boolean NOT NULL DEFAULT false;
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS can_use_video_gallery boolean NOT NULL DEFAULT false;
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS has_review_badge boolean NOT NULL DEFAULT false;
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS has_multiple_categories boolean NOT NULL DEFAULT false;

-- Create vendor_subscriptions table with correct schema
CREATE TABLE vendor_subscriptions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id varchar NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  tier_id varchar NOT NULL REFERENCES subscription_tiers(id),
  
  -- Stripe subscription info
  stripe_subscription_id text,
  stripe_customer_id text,
  
  -- Status
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamp NOT NULL,
  current_period_end timestamp NOT NULL,
  cancelled_at timestamp,
  paused_until timestamp,
  
  -- Auto-renewal
  auto_renew boolean NOT NULL DEFAULT true,
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create vendor_usage_metrics table
CREATE TABLE vendor_usage_metrics (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id varchar NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  year integer NOT NULL,
  month integer NOT NULL,
  
  -- Usage counts
  photos_uploaded integer NOT NULL DEFAULT 0,
  products_created integer NOT NULL DEFAULT 0,
  offers_sent integer NOT NULL DEFAULT 0,
  deliveries_created integer NOT NULL DEFAULT 0,
  messages_sent integer NOT NULL DEFAULT 0,
  storage_used_gb integer NOT NULL DEFAULT 0,
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(vendor_id, year, month)
);

-- Create vendor_payments table
CREATE TABLE vendor_payments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id varchar NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  subscription_id varchar REFERENCES vendor_subscriptions(id),
  
  -- Vipps info (using Vipps instead of Stripe for Norwegian market)
  vipps_order_id text,
  vipps_transaction_id text,
  
  -- Amount in øre (NOK cents)
  amount_nok integer NOT NULL,
  currency text NOT NULL DEFAULT 'NOK',
  
  -- Status
  status text NOT NULL DEFAULT 'pending',
  description text,
  
  billing_period_start timestamp,
  billing_period_end timestamp,
  
  paid_at timestamp,
  failure_reason text,
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_vendor_subscriptions_vendor_id ON vendor_subscriptions(vendor_id);
CREATE INDEX idx_vendor_subscriptions_tier_id ON vendor_subscriptions(tier_id);
CREATE INDEX idx_vendor_subscriptions_status ON vendor_subscriptions(status);
CREATE INDEX idx_vendor_usage_metrics_vendor_id ON vendor_usage_metrics(vendor_id);
CREATE INDEX idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
CREATE INDEX idx_vendor_payments_status ON vendor_payments(status);
