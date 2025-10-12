import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid code' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const sanitized = code.trim().toUpperCase();
    if (!sanitized.startsWith('REF') || sanitized.length !== 11) {
      return new Response(JSON.stringify({ referrer_id: null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const prefix = sanitized.substring(3, 11).toLowerCase();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find a profile whose user_id (without hyphens) starts with the prefix
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(10000);

    if (error) throw error;

    const match = (profiles || []).find((p: any) => {
      const id = (p.user_id || '').replace(/-/g, '').toLowerCase();
      return id.startsWith(prefix);
    });

    return new Response(JSON.stringify({ referrer_id: match?.user_id || null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err: any) {
    console.error('resolve-referral error', err);
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});