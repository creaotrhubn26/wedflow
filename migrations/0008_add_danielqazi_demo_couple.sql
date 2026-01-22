INSERT INTO couple_profiles (email, display_name, password) 
VALUES (
  'danielqazi89@gmail.com',
  'Demo Brudepar - Daniel',
  '$2a$10$ZHMd8Z5Q4CVH.feEQyMXlOHl10jGUNnre5GuOsr13wexYsIkgF2/q'
) ON CONFLICT (email) DO NOTHING;
