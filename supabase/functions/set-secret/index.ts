
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
    // Check if this is an admin user (you can customize this check)
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
    // Adjust this to match your authentication/authorization requirements
    const { data: isAdmin } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!isAdmin && user.email !== 'homeincome08@gmail.com') {
      throw new Error('Not authorized');
    }

    // Process the secret 
    const { name, value } = await req.json();
    
    if (!name || !value) {
      throw new Error('Missing required parameters');
    }

    // Store the secret using Deno's KV (Key-Value) Store
    // This is an edge function secret, not exposed to the frontend
    await Deno.env.set(name, value);

    return new Response(
      JSON.stringify({ success: true }),
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
