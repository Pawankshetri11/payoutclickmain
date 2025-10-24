import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 Impersonate function called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error('❌ Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get JWT from authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('📋 Auth header present:', !!authHeader);
    console.log('📋 Auth header value (first 50 chars):', authHeader?.substring(0, 50));
    
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ 
          error: 'No authorization header provided',
          hint: 'Make sure you are logged in as admin'
        }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JWT token
    const jwt = authHeader.replace('Bearer ', '');
    console.log('🔑 JWT token length:', jwt.length);
    console.log('🔑 JWT preview:', jwt.substring(0, 20) + '...');
    
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify the JWT and get user with service role
    console.log('🔍 Verifying JWT...');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(jwt);
    
    console.log('👤 User verification result:', { 
      userId: user?.id, 
      userEmail: user?.email,
      error: userError?.message 
    });
    
    if (userError || !user) {
      console.error('❌ Auth verification failed:', userError?.message);
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized - Invalid or expired token',
          details: userError?.message,
          hint: 'Please refresh the page and try again'
        }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Authenticated user:', user.id);

    // Verify admin role
    console.log('🔍 Checking admin role for user:', user.id);
    const { data: role, error: roleError } = await adminClient
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    console.log('📋 Role check result:', { role, roleError });

    if (roleError) {
      console.error('❌ Error checking admin role:', roleError);
      return new Response(
        JSON.stringify({ 
          error: 'Error verifying admin access',
          details: roleError.message,
          hint: 'Make sure user_roles table exists and has proper RLS policies'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!role) {
      console.error('❌ User is not admin:', user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Forbidden - Admin access required',
          details: 'No admin role found for this user',
          hint: 'Run the admin setup SQL to create admin role for your user'
        }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin verified');

    const body = await req.json();
    const userId = body.userId;
    const email = body.email;
    const redirectTo = body.redirectTo;

    console.log('📝 Request data:', { userId, email, redirectTo });

    let targetEmail = email as string | undefined;
    if (!targetEmail && userId) {
      console.log('🔍 Fetching user email for ID:', userId);
      const { data: target, error: targetErr } = await adminClient.auth.admin.getUserById(userId);
      if (targetErr) {
        console.error('❌ Error getting user:', targetErr);
        return new Response(
          JSON.stringify({ error: 'Target user not found', details: targetErr.message }), 
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!target?.user?.email) {
        console.error('❌ User has no email');
        return new Response(
          JSON.stringify({ error: 'User has no email' }), 
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      targetEmail = target.user.email as string;
      console.log('✅ Found email:', targetEmail);
    }

    if (!targetEmail) {
      console.error('❌ No email provided');
      return new Response(
        JSON.stringify({ error: 'No email provided' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔗 Generating magic link for:', targetEmail);
    
    // Use the provided redirectTo or default to /user
    const finalRedirectTo = redirectTo || `${new URL(req.url).origin}/user`;
    console.log('📍 Redirect URL:', finalRedirectTo);

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetEmail,
      options: { 
        redirectTo: finalRedirectTo
      },
    });

    if (linkError) {
      console.error('❌ Error generating link:', linkError);
      return new Response(
        JSON.stringify({ error: linkError.message || 'Failed to generate link' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!linkData?.properties?.action_link) {
      console.error('❌ No action link generated');
      return new Response(
        JSON.stringify({ error: 'No action link generated' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Magic link generated successfully');
    return new Response(
      JSON.stringify({ url: linkData.properties.action_link }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('💥 Exception:', e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
