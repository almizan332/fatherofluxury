
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('Missing URL parameter');
    }

    // Update status to processing
    await supabaseClient
      .from('chatbot_training_urls')
      .update({ status: 'processing' })
      .eq('url', url);
      
    // In a real implementation, this would:
    // 1. Fetch the webpage
    // 2. Parse the HTML
    // 3. Extract text content
    // 4. Follow links within the same domain
    // 5. Create embeddings or train a model with the content
    // 6. Update the status to 'completed'
    
    // For this demo, we'll simulate crawling
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update status to completed
    await supabaseClient
      .from('chatbot_training_urls')
      .update({ status: 'completed' })
      .eq('url', url);

    return new Response(
      JSON.stringify({ success: true, message: "URL crawled successfully" }),
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
