-- Migration: Add multi-event-type support
-- Adds eventType and eventCategory to couple_profiles (default: wedding/personal for existing users)
-- Adds applicableEventTypes to vendor_categories for event-type filtering

-- 1. Add event_type and event_category to couple_profiles
ALTER TABLE "couple_profiles"
  ADD COLUMN IF NOT EXISTS "event_type" text DEFAULT 'wedding',
  ADD COLUMN IF NOT EXISTS "event_category" text DEFAULT 'personal';

-- 2. Set existing records to wedding/personal
UPDATE "couple_profiles"
  SET "event_type" = 'wedding', "event_category" = 'personal'
  WHERE "event_type" IS NULL;

-- 3. Add applicable_event_types array to vendor_categories
ALTER TABLE "vendor_categories"
  ADD COLUMN IF NOT EXISTS "applicable_event_types" text[];

-- 4. Seed applicable event types for existing vendor categories
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','anniversary','engagement','baby_shower','corporate_event','conference','product_launch','gala'] WHERE "name" = 'Fotograf';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','anniversary','corporate_event','conference','product_launch','gala'] WHERE "name" = 'Videograf';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','anniversary','engagement','gala'] WHERE "name" = 'Blomster';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','anniversary','engagement','baby_shower','corporate_event','conference','seminar','team_building','product_launch','gala'] WHERE "name" = 'Catering';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','anniversary','engagement','corporate_event','gala'] WHERE "name" = 'Musikk';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','anniversary','engagement','baby_shower','corporate_event','conference','seminar','team_building','product_launch','gala'] WHERE "name" = 'Venue';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','baby_shower'] WHERE "name" = 'Kake';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','corporate_event','conference','gala','product_launch'] WHERE "name" = 'Planlegger';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','gala'] WHERE "name" = 'Hår & Makeup';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','corporate_event','gala'] WHERE "name" = 'Transport';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','anniversary','engagement','corporate_event','gala'] WHERE "name" = 'Invitasjoner';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','anniversary','corporate_event','team_building','gala'] WHERE "name" = 'Underholdning';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','anniversary','engagement','corporate_event','gala','product_launch'] WHERE "name" = 'Dekorasjon';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','baby_shower'] WHERE "name" = 'Konfektyrer';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','birthday','anniversary','corporate_event','gala','product_launch'] WHERE "name" = 'Bar & Drikke';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','confirmation','birthday','corporate_event','gala'] WHERE "name" = 'Fotoboks';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','engagement'] WHERE "name" = 'Ringer';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding'] WHERE "name" = 'Drakt & Dress';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding','conference','corporate_event','gala'] WHERE "name" = 'Overnatting';
UPDATE "vendor_categories" SET "applicable_event_types" = ARRAY['wedding'] WHERE "name" = 'Husdyr';
