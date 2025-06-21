/*
  # Initial Schema Setup for CampusCycle

  1. Extensions
    - Enable PostGIS for geographical data types

  2. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `roll_number` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `cycles`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references profiles)
      - `model` (text)
      - `color` (text)
      - `device_id` (text, unique)
      - `is_locked` (boolean)
      - `last_location` (geography)
      - `last_updated` (timestamp)

    - `tracking_logs`
      - `id` (uuid, primary key)
      - `cycle_id` (uuid, references cycles)
      - `event_type` (text)
      - `location` (geography)
      - `data` (jsonb)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  roll_number text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create cycles table
CREATE TABLE IF NOT EXISTS cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  model text NOT NULL,
  color text NOT NULL,
  device_id text UNIQUE NOT NULL,
  is_locked boolean DEFAULT true,
  last_location geography(Point, 4326),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cycles"
  ON cycles
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own cycles"
  ON cycles
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own cycles"
  ON cycles
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create tracking_logs table
CREATE TABLE IF NOT EXISTS tracking_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid REFERENCES cycles ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('LOCATION_UPDATE', 'LOCK_TOGGLE', 'MOTION_DETECTED')),
  location geography(Point, 4326),
  data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracking_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read logs of their cycles"
  ON tracking_logs
  FOR SELECT
  TO authenticated
  USING (
    cycle_id IN (
      SELECT id FROM cycles WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert logs for their cycles"
  ON tracking_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    cycle_id IN (
      SELECT id FROM cycles WHERE owner_id = auth.uid()
    )
  );

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS cycles_owner_id_idx ON cycles(owner_id);
CREATE INDEX IF NOT EXISTS tracking_logs_cycle_id_idx ON tracking_logs(cycle_id);
CREATE INDEX IF NOT EXISTS tracking_logs_created_at_idx ON tracking_logs(created_at);