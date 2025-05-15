
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if this is an admin user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Not authenticated');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) throw new Error('Not authenticated');
    
    // Simple admin check - you may want a more robust role system
    const { data: isAdmin } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!isAdmin && user.email !== 'homeincome08@gmail.com') {
      throw new Error('Not authorized');
    }

    // Get the secret name
    const { name } = await req.json();
    
    if (!name) {
      throw new Error('Missing required parameters');
    }

    // Get the secret from environment variables
    // This is a redacted version for UI display
    const value = Deno.env.get(name);
    let displayValue = "";
    
    if (value) {
      // Only show first 4 and last 4 chars for API keys
      displayValue = value.length > 8 
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : "****";
    }

    return new Response(
      JSON.stringify({ value: displayValue }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
