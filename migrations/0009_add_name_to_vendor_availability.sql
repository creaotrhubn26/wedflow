-- Add optional name field to vendor_availability table
ALTER TABLE "vendor_availability" ADD COLUMN IF NOT EXISTS "name" text;
