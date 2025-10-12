import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      console.log('Invalid code type or missing');
      return new Response(
        JSON.stringify({ error: 'Invalid code', referrer_id: null }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      );
    }

    const sanitized = code.trim().toUpperCase();
    
    console.log('=== Resolving Referral Code ===');
    console.log('Input code:', sanitized);
    
    if (!sanitized.startsWith('REF') || sanitized.length !== 11) {
      console.log('Invalid format - must be REF + 8 chars, got length:', sanitized.length);
      return new Response(JSON.stringify({ referrer_id: null, error: 'Invalid format' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const prefix = sanitized.substring(3, 11).toLowerCase();
    console.log('Extracted prefix (8 chars after REF):', prefix);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find a profile whose user_id (without hyphens, first 8 chars) matches the prefix
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, name')
      .limit(10000);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Total profiles to check:', profiles?.length || 0);

    const match = (profiles || []).find((p: any) => {
      const id = (p.user_id || '').replace(/-/g, '').toLowerCase();
      const first8 = id.substring(0, 8);
      const matches = first8 === prefix;
      if (matches) {
        console.log('✓ MATCH FOUND!');
        console.log('  User ID:', p.user_id);
        console.log('  Name:', p.name);
        console.log('  First 8 chars (no hyphens):', first8);
        console.log('  Looking for:', prefix);
      }
      return matches;
    });

    if (!match) {
      console.log('✗ NO MATCH FOUND');
      console.log('Searched for prefix:', prefix);
      // Log a few examples for debugging
      if (profiles && profiles.length > 0) {
        console.log('Example user IDs in database:');
        profiles.slice(0, 3).forEach((p: any) => {
          const id = (p.user_id || '').replace(/-/g, '').toLowerCase();
          console.log(`  ${p.user_id} -> ${id.substring(0, 8)}`);
        });
      }
    }
    
    return new Response(JSON.stringify({ referrer_id: match?.user_id || null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err: any) {
    console.error('resolve-referral error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error', referrer_id: null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});