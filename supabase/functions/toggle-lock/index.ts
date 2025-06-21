import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { device_id, lock_state } = await req.json();

    // Update cycle lock status
    const { data: cycle, error: cycleError } = await supabase
      .from('cycles')
      .update({
        is_locked: lock_state,
        last_updated: new Date().toISOString(),
      })
      .eq('device_id', device_id)
      .select('cycles.id, cycles.is_locked')
      .single();

    if (cycleError) throw cycleError;

    // Log the lock toggle event
    await supabase
      .from('tracking_logs')
      .insert({
        cycle_id: cycle.id,
        event_type: 'LOCK_TOGGLE',
        data: { is_locked: lock_state }
      });

    return new Response(
      JSON.stringify({ success: true, is_locked: lock_state }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});