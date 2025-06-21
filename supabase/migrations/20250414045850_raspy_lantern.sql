/*
  # Enable PostGIS Extension
  
  1. Changes
    - Enable PostGIS extension to support geographic functions like st_makeline
    
  2. Purpose
    - Required for spatial queries and geographic data handling
    - Enables functions like st_makeline used in cycle tracking
*/

-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;