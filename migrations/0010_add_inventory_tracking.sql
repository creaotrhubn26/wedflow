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
