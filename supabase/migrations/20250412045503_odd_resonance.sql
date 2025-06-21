/*
  # Enhanced Schema for Smart Cycle Platform

  1. Updates
    - Add device status tracking to cycles table
    - Add device metadata and firmware info
    - Enhance tracking logs with more event types
    - Add admin role and policies

  2. Changes
    - Add firmware_version to cycles
    - Add battery_level to cycles
    - Add signal_strength to cycles
    - Add more event types to tracking_logs
    - Add admin policies
*/

-- Add new columns to cycles table
ALTER TABLE cycles 
ADD COLUMN IF NOT EXISTS firmware_version text,
ADD COLUMN IF NOT EXISTS battery_level integer,
ADD COLUMN IF NOT EXISTS signal_strength integer,
ADD COLUMN IF NOT EXISTS last_sync timestamptz DEFAULT now();

-- Update tracking_logs event types
ALTER TABLE tracking_logs 
DROP CONSTRAINT IF EXISTS tracking_logs_event_type_check;

ALTER TABLE tracking_logs 
ADD CONSTRAINT tracking_logs_event_type_check 
CHECK (event_type IN (
  'LOCATION_UPDATE',
  'LOCK_TOGGLE',
  'MOTION_DETECTED',
  'BATTERY_LOW',
  'SIGNAL_LOST',
  'FIRMWARE_UPDATE',
  'TAMPER_ALERT',
  'GEOFENCE_BREACH'
));

-- Create admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies to cycles
CREATE POLICY "Admins can view all cycles"
  ON cycles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all cycles"
  ON cycles
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Add admin policies to profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add admin policies to tracking_logs
CREATE POLICY "Admins can view all logs"
  ON tracking_logs
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Create function to get cycle statistics
CREATE OR REPLACE FUNCTION get_cycle_stats(cycle_id uuid)
RETURNS TABLE (
  total_distance float,
  total_rides bigint,
  last_location geography,
  last_updated timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(
      ST_Length(
        ST_MakeLine(location ORDER BY created_at)::geography
      ) / 1000, 
      0
    ) as total_distance,
    COUNT(DISTINCT DATE(created_at)) as total_rides,
    (
      SELECT location 
      FROM tracking_logs tl2 
      WHERE tl2.cycle_id = cycle_id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) as last_location,
    (
      SELECT created_at 
      FROM tracking_logs tl3 
      WHERE tl3.cycle_id = cycle_id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) as last_updated
  FROM tracking_logs tl
  WHERE tl.cycle_id = cycle_id
  AND tl.event_type = 'LOCATION_UPDATE'
  GROUP BY cycle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;