-- Add vendor availability calendar table
CREATE TABLE IF NOT EXISTS vendor_availability (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'blocked', 'limited'
  max_bookings INTEGER, -- null means unlimited (when available), required when status='limited'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, date)
);

CREATE INDEX idx_vendor_availability_vendor ON vendor_availability(vendor_id);
CREATE INDEX idx_vendor_availability_date ON vendor_availability(date);
CREATE INDEX idx_vendor_availability_vendor_date ON vendor_availability(vendor_id, date);
