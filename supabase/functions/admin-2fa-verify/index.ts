import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyCodeRequest {
  email: string;
  code: string;
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
    const { email, code }: VerifyCodeRequest = await req.json();
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

    // Hash the provided code
    const codeHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(code + Deno.env.get('HASH_SALT'))
    );
    const hashArray = Array.from(new Uint8Array(codeHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Find valid verification code
    const { data: validCodes } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('admin_email', email)
      .eq('code_hash', hashHex)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .limit(1);

    if (!validCodes || validCodes.length === 0) {
      // Log failed attempt
      await supabase
        .from('login_attempts')
        .insert({
          ip_address: clientIP,
          admin_email: email,
          attempt_type: '2fa',
          success: false
        });

      // Check failed attempts in last 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const { data: recentFailures } = await supabase
        .from('login_attempts')
        .select('id')
        .eq('ip_address', clientIP)
        .eq('admin_email', email)
        .eq('attempt_type', '2fa')
        .eq('success', false)
        .gte('created_at', fifteenMinutesAgo.toISOString());

      if (recentFailures && recentFailures.length >= 3) {
        // Block IP for 15 minutes
        const blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await supabase
          .from('login_attempts')
          .insert({
            ip_address: clientIP,
            admin_email: email,
            attempt_type: '2fa',
            success: false,
            blocked_until: blockedUntil.toISOString()
          });

        return new Response(
          JSON.stringify({ 
            error: 'Too many failed attempts. IP blocked for 15 minutes.',
            blockedUntil: blockedUntil.toISOString()
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', validCodes[0].id);

    // Log successful attempt
    await supabase
      .from('login_attempts')
      .insert({
        ip_address: clientIP,
        admin_email: email,
        attempt_type: '2fa',
        success: true
      });

    // Clean up expired codes
    await supabase.rpc('cleanup_expired_codes');

    return new Response(
      JSON.stringify({ success: true, verified: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in admin-2fa-verify:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);