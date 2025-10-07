import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  type: 'withdrawal_success' | 'withdrawal_failed' | 'kyc_approved' | 'kyc_rejected' | 'welcome' | 'manual'
  data?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const emailRequest: EmailRequest = await req.json()
    
    // Initialize Resend (you'll need to add RESEND_API_KEY to your Supabase secrets)
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PayoutClick <noreply@payoutclick.com>',
        to: [emailRequest.to],
        subject: emailRequest.subject,
        html: emailRequest.html,
      }),
    })

    if (!resendResponse.ok) {
      throw new Error(`Failed to send email: ${resendResponse.statusText}`)
    }

    const result = await resendResponse.json()

    // Log email sent to database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseClient
      .from('email_logs')
      .insert({
        recipient: emailRequest.to,
        subject: emailRequest.subject,
        type: emailRequest.type,
        status: 'sent',
        external_id: result.id
      })

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})