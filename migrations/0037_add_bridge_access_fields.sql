-- Add music, coordinator, and review access fields to couple_vendor_contracts
-- Required for Fase 3 bridge: Musikk, Koordinator, Anmeldelser

ALTER TABLE couple_vendor_contracts
  ADD COLUMN IF NOT EXISTS can_view_music BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_on_music_changes BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_view_coordinators BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_view_reviews BOOLEAN DEFAULT false;
