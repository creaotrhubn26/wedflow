#!/bin/bash

# Database connection string
DB_URL="postgresql://neondb_owner:npg_JVAyo1K2buMD@ep-holy-smoke-ag04fz9v-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

echo "===================="
echo "Running Migration 0010: Inventory Tracking"
echo "===================="

psql "$DB_URL" <<'EOF'
-- Add inventory tracking fields to vendor_products table
ALTER TABLE vendor_products 
  ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS available_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_buffer INTEGER DEFAULT 0;

-- Add helpful comment
COMMENT ON COLUMN vendor_products.track_inventory IS 'Whether to enable inventory tracking for this product';
COMMENT ON COLUMN vendor_products.available_quantity IS 'Total quantity available (e.g., 200 chairs)';
COMMENT ON COLUMN vendor_products.reserved_quantity IS 'Quantity currently reserved in pending offers';
COMMENT ON COLUMN vendor_products.booking_buffer IS 'Safety buffer - quantity always kept available';

SELECT 'Migration 0010 completed successfully!' as status;
EOF

echo ""
echo "===================="
echo "Running Migration 0011: Vendor Availability Calendar"
echo "===================="

psql "$DB_URL" <<'EOF'
-- Add vendor availability calendar table
CREATE TABLE IF NOT EXISTS vendor_availability (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  max_bookings INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, date)
);

CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor ON vendor_availability(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_date ON vendor_availability(date);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor_date ON vendor_availability(vendor_id, date);

SELECT 'Migration 0011 completed successfully!' as status;
EOF

echo ""
echo "===================="
echo "Verifying Migrations"
echo "===================="

psql "$DB_URL" <<'EOF'
-- Check vendor_products columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'vendor_products'
  AND column_name IN ('track_inventory', 'available_quantity', 'reserved_quantity', 'booking_buffer')
ORDER BY column_name;

-- Check vendor_availability table
SELECT 
  'vendor_availability table exists: ' || 
  CASE WHEN COUNT(*) > 0 THEN 'YES' ELSE 'NO' END as status
FROM information_schema.tables
WHERE table_name = 'vendor_availability';
EOF

echo ""
echo "===================="
echo "✅ All migrations completed!"
echo "===================="
