/*
  # Fix get_cycle_stats function return type

  1. Changes
    - Drop existing function
    - Create new function with updated return type and parameter name
    - Use fully qualified column names
    - Improve distance calculation logic
    
  2. Security
    - Maintain SECURITY DEFINER setting
    - Keep existing access controls
*/

-- First drop the existing function
DROP FUNCTION IF EXISTS get_cycle_stats(uuid);

-- Create the new function with updated signature and implementation
CREATE OR REPLACE FUNCTION get_cycle_stats(p_cycle_id uuid)
RETURNS TABLE (
  total_distance float8,
  total_rides bigint,
  last_location geography,
  last_updated timestamptz
) AS $$
BEGIN
  RETURN QUERY
  WITH location_data AS (
    SELECT 
      tl.location,
      tl.created_at,
      LAG(tl.location) OVER (ORDER BY tl.created_at) as prev_location
    FROM tracking_logs tl
    WHERE tl.cycle_id = p_cycle_id
    AND tl.event_type = 'LOCATION_UPDATE'
    AND tl.location IS NOT NULL
  ),
  distance_calc AS (
    SELECT 
      COALESCE(
        SUM(
          ST_Distance(
            prev_location::geography,
            location::geography
          )
        ) / 1000, -- Convert to kilometers
        0
      ) as total_distance
    FROM location_data
    WHERE prev_location IS NOT NULL
  ),
  ride_count AS (
    SELECT COUNT(DISTINCT DATE_TRUNC('day', created_at)) as total_rides
    FROM tracking_logs
    WHERE cycle_id = p_cycle_id
    AND event_type = 'LOCATION_UPDATE'
  ),
  last_known AS (
    SELECT location, created_at
    FROM tracking_logs
    WHERE cycle_id = p_cycle_id
    AND event_type = 'LOCATION_UPDATE'
    AND location IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
  )
  SELECT 
    d.total_distance,
    r.total_rides,
    l.location,
    l.created_at
  FROM distance_calc d
  CROSS JOIN ride_count r
  LEFT JOIN last_known l ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;