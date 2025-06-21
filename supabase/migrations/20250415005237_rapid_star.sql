/*
  # Add cycle statistics function
  
  1. New Functions
    - `get_cycle_stats`: Calculates total distance and rides for a cycle
      - Input: cycle_id (uuid)
      - Output: JSON object with total_distance and total_rides
  
  2. Implementation Details
    - Aggregates location data from tracking logs
    - Counts LOCATION_UPDATE events for total rides
    - Calculates distance between consecutive points
*/

CREATE OR REPLACE FUNCTION public.get_cycle_stats(cycle_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  WITH location_updates AS (
    SELECT 
      data->>'latitude' AS lat,
      data->>'longitude' AS lon,
      created_at
    FROM tracking_logs
    WHERE cycle_id = $1 
    AND event_type = 'LOCATION_UPDATE'
    ORDER BY created_at
  ),
  distance_calc AS (
    SELECT 
      COALESCE(
        SUM(
          ST_DistanceSphere(
            ST_MakePoint((lag(lon::float) OVER (ORDER BY created_at)), (lag(lat::float) OVER (ORDER BY created_at)))::geography,
            ST_MakePoint(lon::float, lat::float)::geography
          )
        ) / 1000, -- Convert to kilometers
        0
      ) as total_distance
    FROM location_updates
  )
  SELECT json_build_object(
    'total_distance', COALESCE((SELECT total_distance FROM distance_calc), 0),
    'total_rides', COALESCE((
      SELECT COUNT(*) 
      FROM tracking_logs 
      WHERE cycle_id = $1 
      AND event_type = 'LOCATION_UPDATE'
    ), 0)
  ) INTO result;

  RETURN result;
END;
$$;