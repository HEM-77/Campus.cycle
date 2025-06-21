import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test the connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').single();
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, attempt);
        await delay(delayTime);
      }
    }
  }
  
  throw lastError;
}

export async function isAdmin(): Promise<boolean> {
  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      return data;
    });
    
    return result === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

interface CycleRegistrationData {
  name: string;
  model: string;
  color: string;
  device_id: string;
  user_name: string;
  roll_number: string;
}

export async function registerCycle(formData: CycleRegistrationData) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error('Authentication required');
  if (!user) throw new Error('User not found');

  const { error } = await supabase.from('cycles').insert({
    name: formData.name,
    model: formData.model,
    color: formData.color,
    device_id: formData.device_id,
    owner_id: user.id,
    user_name: formData.user_name,
    roll_number: formData.roll_number,
    last_location: 'POINT(0 0)',
    is_locked: true, // Default to locked state for safety
    battery_level: 100, // Default battery level for new devices
    status: 'active'
  });

  if (error) {
    console.error('Error registering cycle:', error);
    throw new Error(error.message);
  }
}

export async function getUserCycles() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error('Authentication required');
  if (!user) throw new Error('User not found');

  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('owner_id', user.id);

  if (error) throw error;
  return data || [];
}

export async function toggleCycleLock(cycleId: string, lockState: boolean) {
  const { error } = await supabase
    .from('cycles')
    .update({ is_locked: lockState })
    .eq('id', cycleId);

  if (error) throw error;
}

export async function getCycleStats(cycleId: string) {
  const { data, error } = await supabase
    .from('tracking_logs')
    .select('distance, created_at')
    .eq('cycle_id', cycleId);

  if (error) throw error;

  const total_distance = data?.reduce((sum, log) => sum + (log.distance || 0), 0) || 0;
  const total_rides = data?.length || 0;

  return {
    total_distance,
    total_rides
  };
}