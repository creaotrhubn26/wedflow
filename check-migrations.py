#!/usr/bin/env python3
"""Quick migration verification script"""
import psycopg2

DB_URL = "postgresql://neondb_owner:npg_JVAyo1K2buMD@ep-holy-smoke-ag04fz9v-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(DB_URL, connect_timeout=5)
    cursor = conn.cursor()
    
    # Check columns
    cursor.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'vendor_products'
          AND column_name IN ('track_inventory', 'available_quantity', 'reserved_quantity', 'booking_buffer');
    """)
    cols = [r[0] for r in cursor.fetchall()]
    
    # Check table
    cursor.execute("SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'vendor_availability');")
    table_exists = cursor.fetchone()[0]
    
    print(f"✅ Inventory columns: {len(cols)}/4")
    print(f"✅ vendor_availability table: {'YES' if table_exists else 'NO'}")
    
    if len(cols) == 4 and table_exists:
        print("\n🎉 Both migrations completed successfully!")
    else:
        print("\n⚠️  Migrations incomplete. Run: python3 run-migrations.py")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
    print("\nRun migrations with: python3 run-migrations.py")
