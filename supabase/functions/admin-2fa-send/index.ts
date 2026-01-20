import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCodeRequest {
  email: string;
  method: 'email' | 'sms';
  phone?: string;
  carrier?: string;
}

// SMS Gateway domains for email-to-SMS
const SMS_GATEWAYS: Record<string, string> = {
  'att': 'txt.att.net',
  'verizon': 'vtext.com',
  'tmobile': 'tmomail.net',
  'sprint': 'messaging.sprintpcs.com',
  'boost': 'sms.myboostmobile.com',
  'cricket': 'sms.cricketwireless.net',
  'uscellular': 'email.uscc.net',
  'metro': 'mymetropcs.com'
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, method, phone, carrier }: SendCodeRequest = await req.json();
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown';

    console.log(`2FA request for ${email}, method: ${method}`);

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
          error: 'Too many failed attempts. Please try again later.',
          blockedUntil: blockedAttempts[0].blocked_until
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the code for storage
    const hashSalt = Deno.env.get('HASH_SALT') || 'default-salt-change-in-production';
    const codeHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(code + hashSalt)
    );
    const hashArray = Array.from(new Uint8Array(codeHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store verification code (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        admin_email: email,
        code_hash: hashHex,
        method: method,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error('Error storing verification code:', insertError);
      throw new Error('Failed to generate verification code');
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);

    // Send code via email or SMS
    if (method === 'email') {
      console.log(`Sending verification code to email: ${email}`);
      
      const emailResponse = await resend.emails.send({
        from: "Aliexpress Hidden Links <onboarding@resend.dev>",
        to: [email],
        subject: "🔐 Admin Verification Code",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; margin: 0; font-size: 24px;">🔐 Admin Verification</h1>
                <p style="color: #666; margin-top: 10px;">Aliexpress Hidden Links</p>
              </div>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello Admin,</p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Your verification code is:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 36px; font-weight: bold; letter-spacing: 10px; padding: 25px 50px; border-radius: 12px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  ${code}
                </div>
              </div>
              
              <p style="color: #e74c3c; font-size: 14px; line-height: 1.6; text-align: center; font-weight: bold;">
                ⏰ This code expires in 5 minutes
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                If you did not request this code, please ignore this email.<br>
                <strong>Never share this code with anyone.</strong>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log("Email sent successfully:", emailResponse);

    } else if (method === 'sms' && phone && carrier) {
      // Send via SMS gateway
      const gateway = SMS_GATEWAYS[carrier];
      if (!gateway) {
        throw new Error('Unsupported carrier');
      }

      const smsEmail = `${phone}@${gateway}`;
      console.log(`Sending SMS to: ${smsEmail}`);
      
      await resend.emails.send({
        from: "Aliexpress Hidden Links <onboarding@resend.dev>",
        to: [smsEmail],
        subject: "",
        text: `Your Aliexpress Hidden Links admin code: ${code}. Expires in 5 min.`,
      });

      // Update 2FA settings
      await supabase
        .from('admin_2fa_settings')
        .upsert({
          admin_email: email,
          preferred_method: 'sms',
          phone_number: phone,
          carrier: carrier,
          is_enabled: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'admin_email'
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Verification code sent via ${method}` 
      }),
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
