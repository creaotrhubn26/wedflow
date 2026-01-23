-- Add couple budget items table
CREATE TABLE IF NOT EXISTS "couple_budget_items" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" varchar NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "category" text NOT NULL,
  "label" text NOT NULL,
  "estimated_cost" integer NOT NULL DEFAULT 0,
  "actual_cost" integer,
  "is_paid" boolean NOT NULL DEFAULT false,
  "notes" text,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add couple budget settings table
CREATE TABLE IF NOT EXISTS "couple_budget_settings" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" varchar NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE UNIQUE,
  "total_budget" integer NOT NULL DEFAULT 0,
  "currency" text NOT NULL DEFAULT 'NOK',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add couple dress appointments table
CREATE TABLE IF NOT EXISTS "couple_dress_appointments" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" varchar NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "shop_name" text NOT NULL,
  "date" text NOT NULL,
  "time" text,
  "notes" text,
  "completed" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add couple dress favorites table
CREATE TABLE IF NOT EXISTS "couple_dress_favorites" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" varchar NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "designer" text,
  "shop" text,
  "price" integer DEFAULT 0,
  "image_url" text,
  "notes" text,
  "is_favorite" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add couple dress timeline table
CREATE TABLE IF NOT EXISTS "couple_dress_timeline" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" varchar NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE UNIQUE,
  "ordered" boolean NOT NULL DEFAULT false,
  "ordered_date" text,
  "first_fitting" boolean NOT NULL DEFAULT false,
  "first_fitting_date" text,
  "alterations" boolean NOT NULL DEFAULT false,
  "alterations_date" text,
  "final_fitting" boolean NOT NULL DEFAULT false,
  "final_fitting_date" text,
  "pickup" boolean NOT NULL DEFAULT false,
  "pickup_date" text,
  "budget" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add couple important people table
CREATE TABLE IF NOT EXISTS "couple_important_people" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" varchar NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "role" text NOT NULL,
  "phone" text,
  "email" text,
  "notes" text,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add couple photo shots table
CREATE TABLE IF NOT EXISTS "couple_photo_shots" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "couple_id" varchar NOT NULL REFERENCES "couple_profiles"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "category" text NOT NULL,
  "completed" boolean NOT NULL DEFAULT false,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_budget_items_couple" ON "couple_budget_items"("couple_id");
CREATE INDEX IF NOT EXISTS "idx_dress_appointments_couple" ON "couple_dress_appointments"("couple_id");
CREATE INDEX IF NOT EXISTS "idx_dress_favorites_couple" ON "couple_dress_favorites"("couple_id");
CREATE INDEX IF NOT EXISTS "idx_important_people_couple" ON "couple_important_people"("couple_id");
CREATE INDEX IF NOT EXISTS "idx_photo_shots_couple" ON "couple_photo_shots"("couple_id");
