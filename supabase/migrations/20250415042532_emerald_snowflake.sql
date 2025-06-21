/*
  # Add RFID event type to tracking logs
  
  1. Changes
    - Add RFID_SCAN to valid event types for tracking_logs
    
  2. Purpose
    - Enable tracking of RFID tag scans
    - Maintain audit trail of access attempts
*/

-- Update the event_type check constraint
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
  'GEOFENCE_BREACH',
  'RFID_SCAN'
));