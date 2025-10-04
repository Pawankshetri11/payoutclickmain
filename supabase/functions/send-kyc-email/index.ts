import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KYCEmailData {
  userEmail: string
  userName: string
  status: 'verified' | 'rejected'
  rejectionReason?: string
}

const getEmailTemplate = (data: KYCEmailData) => {
  const { userName, status, rejectionReason } = data
  
  if (status === 'verified') {
    return {
      subject: `🎉 KYC Verification Approved - Welcome to PayoutClick!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 KYC Approved!</h1>
            <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">Your account is now fully verified</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Congratulations ${userName}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Your KYC (Know Your Customer) verification has been successfully approved. You now have full access to all PayoutClick features!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">What's unlocked for you:</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li>✅ Unlimited task submissions</li>
                <li>✅ Higher paying premium tasks</li>
                <li>✅ Fast withdrawal processing</li>
                <li>✅ Priority customer support</li>
                <li>✅ Bonus and referral programs</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('FRONTEND_URL')}/user/tasks" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Start Earning Now →
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              Welcome to the PayoutClick family! 
              <br>
              <a href="mailto:support@payoutclick.com" style="color: #3b82f6;">Contact support</a> if you need any help.
            </p>
          </div>
        </div>
      `
    }
  } else {
    return {
      subject: `❌ KYC Verification Rejected - Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">KYC Verification Rejected</h1>
            <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Action required to complete verification</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Unfortunately, we were unable to verify your KYC documents at this time. Please review the information below and resubmit your documents.
            </p>
            
            ${rejectionReason ? `
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <h3 style="color: #991b1b; margin-top: 0; font-size: 16px;">Rejection Reason:</h3>
                <p style="color: #7f1d1d; margin-bottom: 0;">${rejectionReason}</p>
              </div>
            ` : ''}
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Required Documents:</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li>📄 Clear, high-resolution government-issued ID</li>
                <li>📄 Proof of address (utility bill, bank statement)</li>
                <li>🤳 Selfie holding your ID document</li>
                <li>✅ All text must be clearly readable</li>
                <li>✅ Documents must be valid and not expired</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('FRONTEND_URL')}/user/kyc" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Resubmit KYC Documents →
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              Need help with KYC verification? 
              <br>
              <a href="mailto:support@payoutclick.com" style="color: #3b82f6;">Contact our support team</a>
            </p>
          </div>
        </div>
      `
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: KYCEmailData = await req.json()
    const emailTemplate = getEmailTemplate(data)
    
    // Call the main send-email function
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization') ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.userEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        type: data.status === 'verified' ? 'kyc_approved' : 'kyc_rejected',
        data: data
      })
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send KYC email')
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})