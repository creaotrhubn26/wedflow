#!/usr/bin/env python3
import psycopg2
from psycopg2 import sql
import sys

# Database connection URL
DB_URL = "postgresql://neondb_owner:npg_JVAyo1K2buMD@ep-holy-smoke-ag04fz9v-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

def run_migration(cursor, migration_name, sql_commands):
    """Run a migration and report status"""
    print(f"\n{'='*60}")
    print(f"Running Migration: {migration_name}")
    print(f"{'='*60}")
    
    try:
        cursor.execute(sql_commands)
        print(f"✅ {migration_name} completed successfully!")
        return True
    except Exception as e:
        print(f"❌ Error in {migration_name}: {e}")
        return False

def verify_migrations(cursor):
    """Verify that migrations were applied"""
    print(f"\n{'='*60}")
    print("Verifying Migrations")
    print(f"{'='*60}")
    
    # Check vendor_products columns
    print("\n📋 Checking vendor_products columns...")
    cursor.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'vendor_products'
          AND column_name IN ('track_inventory', 'available_quantity', 'reserved_quantity', 'booking_buffer')
        ORDER BY column_name;
    """)
    
    columns = cursor.fetchall()
    if columns:
        print(f"   Found {len(columns)} inventory columns:")
        for col in columns:
            print(f"   - {col[0]} ({col[1]})")
    else:
        print("   ⚠️  No inventory columns found")
    
    # Check vendor_availability table
    print("\n📋 Checking vendor_availability table...")
    cursor.execute("""
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_name = 'vendor_availability';
    """)
    
    table_exists = cursor.fetchone()[0] > 0
    if table_exists:
        print("   ✅ vendor_availability table exists")
        
        # Check indexes
        cursor.execute("""
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'vendor_availability'
            ORDER BY indexname;
        """)
        indexes = cursor.fetchall()
        print(f"   Found {len(indexes)} indexes:")
        for idx in indexes:
            print(f"   - {idx[0]}")
    else:
        print("   ❌ vendor_availability table NOT found")

def main():
    """Main migration runner"""
    print(f"\n{'='*60}")
    print("PostgreSQL Migration Runner")
    print(f"{'='*60}")
    
    # Migration 0010: Inventory Tracking
    migration_0010 = """
-- Add inventory tracking fields to vendor_products table
ALTER TABLE vendor_products 
  ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS available_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_buffer INTEGER DEFAULT 0;

-- Add helpful comments
COMMENT ON COLUMN vendor_products.track_inventory IS 'Whether to enable inventory tracking for this product';
COMMENT ON COLUMN vendor_products.available_quantity IS 'Total quantity available (e.g., 200 chairs)';
COMMENT ON COLUMN vendor_products.reserved_quantity IS 'Quantity currently reserved in pending offers';
COMMENT ON COLUMN vendor_products.booking_buffer IS 'Safety buffer - quantity always kept available';
    """
    
    # Migration 0011: Vendor Availability
    migration_0011 = """
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
    """
    
    try:
        # Connect to database
        print("\n🔌 Connecting to database...")
        conn = psycopg2.connect(DB_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Connected successfully!")
        
        # Run migrations
        success = True
        success &= run_migration(cursor, "0010_add_inventory_tracking", migration_0010)
        success &= run_migration(cursor, "0011_add_vendor_availability", migration_0011)
        
        # Verify
        verify_migrations(cursor)
        
        # Close connection
        cursor.close()
        conn.close()
        
        print(f"\n{'='*60}")
        if success:
            print("✅ All migrations completed successfully!")
        else:
            print("⚠️  Some migrations had errors")
        print(f"{'='*60}\n")
        
        sys.exit(0 if success else 1)
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
