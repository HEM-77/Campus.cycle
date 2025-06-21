/*
  # Enable PostGIS Extension
  
  1. Changes
    - Enables the PostGIS extension to support geographic functions
    - Required for st_makeline and other geographic operations
    
  2. Impact
    - Adds support for geographic data types and functions
    - Enables spatial queries and operations
*/

-- Enable the PostGIS extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify the extension is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    RAISE EXCEPTION 'PostGIS extension is not enabled';
  END IF;
END
$$;