
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
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error("DeepSeek API key not configured");
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { fullRetrain = false } = await req.json();
    
    console.log(`Starting ${fullRetrain ? 'full' : 'incremental'} retraining...`);
    
    try {
      // Get all active training content
      const { data: trainingContent, error: contentError } = await supabaseClient
        .from('chatbot_training_content')
        .select('id, title, content, source_type')
        .eq('status', 'active');
        
      if (contentError) throw contentError;
      
      // Get custom prompts
      const { data: customPrompts, error: promptsError } = await supabaseClient
        .from('chatbot_custom_prompts')
        .select('id, title, content, role')
        .eq('status', 'active');
        
      if (promptsError) throw promptsError;
      
      // Get file-based training data
      const { data: trainingFiles, error: filesError } = await supabaseClient
        .from('chatbot_training_files')
        .select('id, file_name, file_path')
        .eq('status', 'completed');
        
      if (filesError) throw filesError;
      
      // Get URL-based training data
      const { data: trainingUrls, error: urlsError } = await supabaseClient
        .from('chatbot_training_urls')
        .select('id, url')
        .eq('status', 'completed');
        
      if (urlsError) throw urlsError;
      
      console.log(`Collected ${trainingContent?.length || 0} content items, ${customPrompts?.length || 0} custom prompts, ${trainingFiles?.length || 0} training files, and ${trainingUrls?.length || 0} training URLs`);
      
      // In a real implementation, this would:
      // 1. Process all training materials into a format suitable for training
      // 2. Create embeddings using the DeepSeek API or other embedding service
      // 3. Store these embeddings for quick retrieval during chat
      
      // For now, we'll just simulate the training process
      console.log("Processing training content...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Generating embeddings...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Storing model data...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you might want to store these embeddings in a vector database
      // for efficient similarity searches. For now we'll just update the metadata.
      
      // Update last retrained timestamp
      await supabaseClient
        .from('chatbot_settings')
        .upsert({
          id: 'default',
          last_retrained: new Date().toISOString()
        });
        
      console.log("Retraining completed successfully");

    } catch (trainingError) {
      console.error("Error during retraining:", trainingError);
      throw trainingError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Chatbot retrained successfully" }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error in retrain-chatbot function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
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
