-- Photographer planning tables
CREATE TABLE IF NOT EXISTS couple_photographer_sessions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id VARCHAR NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  duration TEXT,
  photographer_name TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS couple_photographer_shots (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id VARCHAR NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_selected BOOLEAN DEFAULT false,
  priority INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS couple_photographer_timeline (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id VARCHAR NOT NULL UNIQUE REFERENCES couple_profiles(id) ON DELETE CASCADE,
  photographer_selected BOOLEAN DEFAULT false,
  session_booked BOOLEAN DEFAULT false,
  contract_signed BOOLEAN DEFAULT false,
  deposit_paid BOOLEAN DEFAULT false,
  budget INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Videographer planning tables
CREATE TABLE IF NOT EXISTS couple_videographer_sessions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id VARCHAR NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  duration TEXT,
  videographer_name TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS couple_videographer_deliverables (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id VARCHAR NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  format TEXT,
  duration TEXT,
  is_confirmed BOOLEAN DEFAULT false,
  delivery_date TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS couple_videographer_timeline (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id VARCHAR NOT NULL UNIQUE REFERENCES couple_profiles(id) ON DELETE CASCADE,
  videographer_selected BOOLEAN DEFAULT false,
  session_booked BOOLEAN DEFAULT false,
  contract_signed BOOLEAN DEFAULT false,
  deposit_paid BOOLEAN DEFAULT false,
  budget INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Music/DJ planning tables
CREATE TABLE IF NOT EXISTS couple_music_performances (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id VARCHAR NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  duration TEXT,
  musician_name TEXT,
  performance_type TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS couple_music_setlists (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id VARCHAR NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  songs TEXT,
  genre TEXT,
  duration TEXT,
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS couple_music_timeline (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id VARCHAR NOT NULL UNIQUE REFERENCES couple_profiles(id) ON DELETE CASCADE,
  musician_selected BOOLEAN DEFAULT false,
  setlist_discussed BOOLEAN DEFAULT false,
  contract_signed BOOLEAN DEFAULT false,
  deposit_paid BOOLEAN DEFAULT false,
  budget INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
