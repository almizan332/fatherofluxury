import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCodeRequest {
  email: string;
  method: 'email' | 'sms';
  phone?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, method, phone }: SendCodeRequest = await req.json();
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown';

    // Check if IP is blocked
    const { data: blockedAttempts } = await supabase
      .from('login_attempts')
      .select('blocked_until')
      .eq('ip_address', clientIP)
      .eq('admin_email', email)
      .gte('blocked_until', new Date().toISOString())
      .limit(1);

    if (blockedAttempts && blockedAttempts.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'IP temporarily blocked due to multiple failed attempts',
          blockedUntil: blockedAttempts[0].blocked_until
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(code + Deno.env.get('HASH_SALT'))
    );
    const hashArray = Array.from(new Uint8Array(codeHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store verification code (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await supabase
      .from('verification_codes')
      .insert({
        admin_email: email,
        code_hash: hashHex,
        method,
        expires_at: expiresAt.toISOString()
      });

    // Send code via chosen method
    if (method === 'email') {
      // Use existing email function or Resend
      const { error: emailError } = await supabase.functions.invoke('send-2fa-email', {
        body: { email, code }
      });
      
      if (emailError) {
        throw new Error('Failed to send email');
      }
    } else if (method === 'sms' && phone) {
      // Send SMS via Twilio
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        throw new Error('Twilio credentials not configured');
      }

      const smsResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: phone,
            From: twilioPhoneNumber,
            Body: `Your Father of Luxury admin verification code: ${code}. Valid for 5 minutes.`
          })
        }
      );

      if (!smsResponse.ok) {
        throw new Error('Failed to send SMS');
      }
    }

    return new Response(
      JSON.stringify({ success: true, method }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in admin-2fa-send:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);