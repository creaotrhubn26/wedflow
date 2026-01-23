-- Hair & Makeup Planning Tables
CREATE TABLE IF NOT EXISTS "couple_hair_makeup_appointments" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "stylist_name" TEXT NOT NULL,
  "service_type" TEXT NOT NULL,
  "appointment_type" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT,
  "location" TEXT,
  "notes" TEXT,
  "completed" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_hair_makeup_looks" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "look_type" TEXT NOT NULL,
  "image_url" TEXT,
  "notes" TEXT,
  "is_favorite" BOOLEAN DEFAULT FALSE,
  "is_selected" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_hair_makeup_timeline" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL UNIQUE REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "consultation_booked" BOOLEAN DEFAULT FALSE,
  "consultation_date" TEXT,
  "trial_booked" BOOLEAN DEFAULT FALSE,
  "trial_date" TEXT,
  "look_selected" BOOLEAN DEFAULT FALSE,
  "look_selected_date" TEXT,
  "wedding_day_booked" BOOLEAN DEFAULT FALSE,
  "budget" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_hair_makeup_appointments_couple" ON "couple_hair_makeup_appointments"("couple_id");
CREATE INDEX IF NOT EXISTS "idx_hair_makeup_looks_couple" ON "couple_hair_makeup_looks"("couple_id");

-- Transport Planning Tables
CREATE TABLE IF NOT EXISTS "couple_transport_bookings" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "vehicle_type" TEXT NOT NULL,
  "provider_name" TEXT,
  "vehicle_description" TEXT,
  "pickup_time" TEXT,
  "pickup_location" TEXT,
  "dropoff_time" TEXT,
  "dropoff_location" TEXT,
  "driver_name" TEXT,
  "driver_phone" TEXT,
  "price" INTEGER DEFAULT 0,
  "notes" TEXT,
  "confirmed" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_transport_timeline" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL UNIQUE REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "bride_car_booked" BOOLEAN DEFAULT FALSE,
  "groom_car_booked" BOOLEAN DEFAULT FALSE,
  "guest_shuttle_booked" BOOLEAN DEFAULT FALSE,
  "getaway_car_booked" BOOLEAN DEFAULT FALSE,
  "all_confirmed" BOOLEAN DEFAULT FALSE,
  "budget" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_transport_bookings_couple" ON "couple_transport_bookings"("couple_id");

-- Flowers/Florist Planning Tables
CREATE TABLE IF NOT EXISTS "couple_flower_appointments" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "florist_name" TEXT NOT NULL,
  "appointment_type" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT,
  "location" TEXT,
  "notes" TEXT,
  "completed" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_flower_selections" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "item_type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "image_url" TEXT,
  "quantity" INTEGER DEFAULT 1,
  "estimated_price" INTEGER DEFAULT 0,
  "is_confirmed" BOOLEAN DEFAULT FALSE,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_flower_timeline" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL UNIQUE REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "florist_selected" BOOLEAN DEFAULT FALSE,
  "florist_selected_date" TEXT,
  "consultation_done" BOOLEAN DEFAULT FALSE,
  "consultation_date" TEXT,
  "mockup_approved" BOOLEAN DEFAULT FALSE,
  "mockup_approved_date" TEXT,
  "delivery_confirmed" BOOLEAN DEFAULT FALSE,
  "budget" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_flower_appointments_couple" ON "couple_flower_appointments"("couple_id");
CREATE INDEX IF NOT EXISTS "idx_flower_selections_couple" ON "couple_flower_selections"("couple_id");

-- Catering Planning Tables
CREATE TABLE IF NOT EXISTS "couple_catering_tastings" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "caterer_name" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT,
  "location" TEXT,
  "notes" TEXT,
  "rating" INTEGER,
  "completed" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_catering_menu" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "course_type" TEXT NOT NULL,
  "dish_name" TEXT NOT NULL,
  "description" TEXT,
  "is_vegetarian" BOOLEAN DEFAULT FALSE,
  "is_vegan" BOOLEAN DEFAULT FALSE,
  "is_gluten_free" BOOLEAN DEFAULT FALSE,
  "is_selected" BOOLEAN DEFAULT FALSE,
  "price_per_person" INTEGER DEFAULT 0,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_catering_dietary_needs" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "guest_name" TEXT NOT NULL,
  "dietary_type" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_catering_timeline" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL UNIQUE REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "caterer_selected" BOOLEAN DEFAULT FALSE,
  "caterer_selected_date" TEXT,
  "tasting_completed" BOOLEAN DEFAULT FALSE,
  "tasting_date" TEXT,
  "menu_finalized" BOOLEAN DEFAULT FALSE,
  "menu_finalized_date" TEXT,
  "guest_count_confirmed" BOOLEAN DEFAULT FALSE,
  "guest_count" INTEGER DEFAULT 0,
  "budget" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_catering_tastings_couple" ON "couple_catering_tastings"("couple_id");
CREATE INDEX IF NOT EXISTS "idx_catering_menu_couple" ON "couple_catering_menu"("couple_id");
CREATE INDEX IF NOT EXISTS "idx_catering_dietary_couple" ON "couple_catering_dietary_needs"("couple_id");

-- Wedding Cake Planning Tables
CREATE TABLE IF NOT EXISTS "couple_cake_tastings" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "bakery_name" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT,
  "location" TEXT,
  "flavors_to_try" TEXT,
  "notes" TEXT,
  "rating" INTEGER,
  "completed" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_cake_designs" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "image_url" TEXT,
  "tiers" INTEGER DEFAULT 3,
  "flavor" TEXT,
  "filling" TEXT,
  "frosting" TEXT,
  "style" TEXT,
  "estimated_price" INTEGER DEFAULT 0,
  "estimated_servings" INTEGER,
  "is_favorite" BOOLEAN DEFAULT FALSE,
  "is_selected" BOOLEAN DEFAULT FALSE,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "couple_cake_timeline" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" VARCHAR NOT NULL UNIQUE REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "bakery_selected" BOOLEAN DEFAULT FALSE,
  "bakery_selected_date" TEXT,
  "tasting_completed" BOOLEAN DEFAULT FALSE,
  "tasting_date" TEXT,
  "design_finalized" BOOLEAN DEFAULT FALSE,
  "design_finalized_date" TEXT,
  "deposit_paid" BOOLEAN DEFAULT FALSE,
  "delivery_confirmed" BOOLEAN DEFAULT FALSE,
  "budget" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_cake_tastings_couple" ON "couple_cake_tastings"("couple_id");
CREATE INDEX IF NOT EXISTS "idx_cake_designs_couple" ON "couple_cake_designs"("couple_id");
