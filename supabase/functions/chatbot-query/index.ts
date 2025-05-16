
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

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
    // Using the API key you provided
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY') || 'sk-a8db5c1e34fb4fc39972d5748e9d4740';
    if (!apiKey) {
      throw new Error("DeepSeek API key not configured");
    }

    const { query, imageUrl } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error("Invalid query parameter");
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // For image searches
    let productResults = null;
    if (imageUrl) {
      console.log("Image search requested with URL:", imageUrl);
      try {
        // Here we would ideally use AI image analysis to find similar products
        // For this demo, we'll just fetch some products to simulate the functionality
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, preview_image, description')
          .limit(3);
          
        if (productsError) throw productsError;
        
        productResults = products;
        console.log("Found products:", productResults.length);
      } catch (err) {
        console.error("Error searching products by image:", err);
      }
    }
    
    console.log("Processing query:", query);
    
    // Get training content to add context
    const { data: trainingContent, error: contentError } = await supabase
      .from('chatbot_training_content')
      .select('content')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (contentError) {
      console.error("Error fetching training content:", contentError);
    }
    
    // Get custom prompts
    const { data: customPrompts, error: promptsError } = await supabase
      .from('chatbot_custom_prompts')
      .select('content, role')
      .eq('status', 'active');
      
    if (promptsError) {
      console.error("Error fetching custom prompts:", promptsError);
    }
    
    // Prepare system message and context
    let systemMessage = 'You are a helpful assistant that provides accurate and concise information based on the training data. If you don\'t know the answer, say so clearly without making up information.';
    
    if (imageUrl) {
      systemMessage = 'You are a helpful shopping assistant that helps find products based on images. Be concise and specific when describing products.';
    }
    
    // Add bot rules/limits from custom prompts if available
    const systemPrompts = customPrompts?.filter(prompt => prompt.role === 'system') || [];
    if (systemPrompts.length > 0) {
      systemMessage += '\n\n' + systemPrompts.map(p => p.content).join('\n\n');
    }
    
    // Prepare messages array for the API
    const messages = [
      {
        role: 'system',
        content: systemMessage
      }
    ];
    
    // Add context from training content if available
    if (trainingContent && trainingContent.length > 0) {
      let context = "Here is some information that might be relevant:\n\n";
      trainingContent.forEach(item => {
        // Limit context size to avoid token limits
        if (context.length < 4000) {
          context += item.content.substring(0, 800) + "\n\n";
        }
      });
      
      messages.push({
        role: 'system',
        content: context
      });
    }
    
    // Add user message
    messages.push({
      role: 'user',
      content: productResults ? 
        `The user uploaded an image and wants to find similar products. Here are some potential matches from our store: ${JSON.stringify(productResults)}. Please respond with a helpful message about these products that might match their image search.` :
        query
    });
    
    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("DeepSeek API error:", response.status, errorData || response.statusText);
      throw new Error(`DeepSeek API returned status ${response.status}: ${errorData?.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected response format:", data);
      throw new Error("Received invalid response format from DeepSeek API");
    }
    
    console.log("Received response from DeepSeek API");
    
    // For image searches, add links to the products
    let responseContent = data.choices[0].message.content || "Sorry, I'm not able to process your request right now.";
    
    if (productResults && productResults.length > 0) {
      responseContent += "\n\nHere are links to the products I found:";
      productResults.forEach((product: any, index: number) => {
        responseContent += `\n${index + 1}. [${product.name}](/product/${product.id})`;
      });
    }
    
    return new Response(
      JSON.stringify({ 
        response: responseContent,
        products: productResults
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error in chatbot-query function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unknown error occurred",
        details: String(error)
      }),
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
