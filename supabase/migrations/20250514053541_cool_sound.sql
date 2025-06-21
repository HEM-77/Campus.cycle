/*
  # Add distance tracking to tracking_logs table

  1. Changes
    - Add `distance` column to `tracking_logs` table
      - Stores the distance in kilometers as a decimal number
      - Defaults to 0 for new records
      - Cannot be null to ensure data consistency

  2. Notes
    - Distance is stored in kilometers with decimal precision
    - Default value of 0 prevents null values
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracking_logs' 
    AND column_name = 'distance'
  ) THEN
    ALTER TABLE tracking_logs 
    ADD COLUMN distance decimal DEFAULT 0 NOT NULL;
  END IF;
END $$;