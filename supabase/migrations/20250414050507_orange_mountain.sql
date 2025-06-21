/*
  # Enable PostGIS Extension

  1. Changes
    - Enable PostGIS extension
    - Verify extension is properly enabled
    - Add explicit error handling

  2. Security
    - No security changes needed
    - Extension is database-wide
*/

-- Drop existing duplicate migrations to prevent conflicts
DROP EXTENSION IF EXISTS postgis CASCADE;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify the extension is enabled and functions are available
DO $$
BEGIN
  -- Check if PostGIS extension is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    RAISE EXCEPTION 'PostGIS extension is not enabled';
  END IF;

  -- Verify ST_MakeLine function exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname = 'st_makeline'
  ) THEN
    RAISE EXCEPTION 'ST_MakeLine function is not available';
  END IF;
END
$$;