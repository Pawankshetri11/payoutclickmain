import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WithdrawalEmailData {
  userEmail: string
  userName: string
  amount: number
  status: 'approved' | 'rejected'
  withdrawalId: string
  rejectionReason?: string
}

const getEmailTemplate = (data: WithdrawalEmailData) => {
  const { userName, amount, status, withdrawalId, rejectionReason } = data
  
  if (status === 'approved') {
    return {
      subject: `✅ Withdrawal Approved - $${amount}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Withdrawal Approved! 🎉</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Great news! Your withdrawal request has been approved and processed.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Withdrawal ID:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${withdrawalId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #10b981; font-weight: bold;">$${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Status:</strong></td>
                  <td style="padding: 10px 0; text-align: right;"><span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 14px;">Approved</span></td>
                </tr>
              </table>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              The funds should appear in your account within 1-3 business days depending on your payment method.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              Thank you for using PayoutClick! 
              <br>
              <a href="mailto:support@payoutclick.com" style="color: #3b82f6;">Contact support</a> if you have any questions.
            </p>
          </div>
        </div>
      `
    }
  } else {
    return {
      subject: `❌ Withdrawal Request Rejected - $${amount}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Withdrawal Rejected</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We regret to inform you that your withdrawal request has been rejected.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Withdrawal ID:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${withdrawalId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">$${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Status:</strong></td>
                  <td style="padding: 10px 0; text-align: right;"><span style="background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 20px; font-size: 14px;">Rejected</span></td>
                </tr>
              </table>
            </div>
            
            ${rejectionReason ? `
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <h3 style="color: #991b1b; margin-top: 0; font-size: 16px;">Rejection Reason:</h3>
                <p style="color: #7f1d1d; margin-bottom: 0;">${rejectionReason}</p>
              </div>
            ` : ''}
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Please review the reason above and ensure all requirements are met before submitting a new withdrawal request.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              Need help? 
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
    const data: WithdrawalEmailData = await req.json()
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
        type: data.status === 'approved' ? 'withdrawal_success' : 'withdrawal_failed',
        data: data
      })
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send withdrawal email')
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})