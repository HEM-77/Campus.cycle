import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface DeviceUpdate {
  device_id: string;
  rfid_tag?: string;
  latitude?: number;
  longitude?: number;
  battery_level?: number;
  signal_strength?: number;
  distance?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      device_id, 
      rfid_tag,
      latitude, 
      longitude, 
      battery_level, 
      signal_strength,
      distance = 0
    } = await req.json() as DeviceUpdate;

    // Validate required fields
    if (!device_id) {
      throw new Error('Device ID is required');
    }

    // Get cycle information
    const { data: cycle, error: cycleError } = await supabase
      .from('cycles')
      .select('cycles.id, cycles.owner_id')
      .eq('device_id', device_id)
      .single();

    if (cycleError) throw cycleError;

    // Handle RFID tag scan
    if (rfid_tag) {
      await supabase
        .from('tracking_logs')
        .insert({
          cycle_id: cycle.id,
          event_type: 'RFID_SCAN',
          data: { rfid_tag }
        });
    }

    // Handle location update
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      const updates: any = {
        last_location: `POINT(${longitude} ${latitude})`,
        last_updated: new Date().toISOString(),
      };

      if (typeof battery_level === 'number') {
        updates.battery_level = battery_level;
      }

      if (typeof signal_strength === 'number') {
        updates.signal_strength = signal_strength;
      }

      // Update cycle location and status
      const { error: updateError } = await supabase
        .from('cycles')
        .update(updates)
        .eq('id', cycle.id);

      if (updateError) throw updateError;

      // Log the location update with distance
      await supabase
        .from('tracking_logs')
        .insert({
          cycle_id: cycle.id,
          event_type: 'LOCATION_UPDATE',
          location: `POINT(${longitude} ${latitude})`,
          distance: distance,
          data: {
            latitude,
            longitude,
            battery_level,
            signal_strength
          }
        });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing device update:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});