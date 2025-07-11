import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, image, type } = await req.json();

    if (type === 'image' && image && deepseekApiKey) {
      // Handle image-based product search using DeepSeek
      return await handleImageSearch(supabase, image, deepseekApiKey);
    } else if (type === 'text' && message) {
      // Handle text-based queries
      return await handleTextQuery(supabase, message);
    }

    return new Response(
      JSON.stringify({ response: "I'm here to help! You can ask about products or upload an image to find similar items." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chatbot-response function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', response: "Sorry, I'm having trouble right now. Please try again later." }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleImageSearch(supabase: any, image: string, deepseekApiKey: string) {
  try {
    // Use DeepSeek to analyze the image and extract product features
    const imageAnalysis = await analyzeImageWithDeepSeek(image, deepseekApiKey);
    
    // Search for similar products based on the analysis
    const products = await searchSimilarProducts(supabase, imageAnalysis);

    if (products.length > 0) {
      const productLinks = products.slice(0, 3).map(product => 
        `• ${product.name} - View details: ${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com')}/product/${product.id}`
      ).join('\n');

      return new Response(
        JSON.stringify({ 
          response: `I found ${products.length} similar product${products.length > 1 ? 's' : ''}:\n\n${productLinks}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          response: "Sorry, I couldn't find any similar products for this image. Try browsing our categories or contact our support team for assistance!" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in image search:', error);
    return new Response(
      JSON.stringify({ 
        response: "Sorry, I couldn't process this image right now. Please try again later or describe what you're looking for!" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function analyzeImageWithDeepSeek(image: string, apiKey: string) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-vl-7b-chat',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and extract key product features like: category, color, style, material, brand if visible, and main characteristics. Return a brief description focusing on searchable attributes.'
              },
              {
                type: 'image_url',
                image_url: { url: image }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error analyzing image with DeepSeek:', error);
    return 'general product';
  }
}

async function searchSimilarProducts(supabase: any, analysis: string) {
  try {
    // Extract keywords from the analysis
    const keywords = analysis.toLowerCase().split(' ').filter(word => 
      word.length > 3 && !['this', 'that', 'with', 'from', 'have', 'been', 'they', 'were'].includes(word)
    );

    if (keywords.length === 0) {
      // Fallback to recent products
      const { data, error } = await supabase
        .from('products')
        .select('id, name, preview_image, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    }

    // Search products using text similarity
    const { data, error } = await supabase
      .from('products')
      .select('id, name, preview_image, description, created_at')
      .or(keywords.map(keyword => `name.ilike.%${keyword}%,description.ilike.%${keyword}%`).join(','))
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchSimilarProducts:', error);
    return [];
  }
}

async function handleTextQuery(supabase: any, message: string) {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Handle product search queries
    if (lowerMessage.includes('product') || lowerMessage.includes('find') || lowerMessage.includes('search')) {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, preview_image')
        .or(`name.ilike.%${message}%,description.ilike.%${message}%`)
        .limit(3);

      if (!error && data && data.length > 0) {
        const productList = data.map(product => 
          `• ${product.name} - View: ${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com')}/product/${product.id}`
        ).join('\n');

        return new Response(
          JSON.stringify({ 
            response: `I found these products for you:\n\n${productList}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle category queries
    if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
      const { data, error } = await supabase
        .from('categories')
        .select('name, product_count')
        .order('product_count', { ascending: false })
        .limit(5);

      if (!error && data && data.length > 0) {
        const categoryList = data.map(cat => 
          `• ${cat.name} (${cat.product_count || 0} products)`
        ).join('\n');

        return new Response(
          JSON.stringify({ 
            response: `Here are our top categories:\n\n${categoryList}\n\nYou can browse any category by visiting our website!` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Default responses for common queries
    const responses = {
      greeting: "Hello! I'm here to help you find products. You can ask about specific items, browse categories, or upload an image to find similar products!",
      help: "I can help you:\n• Find specific products\n• Browse categories\n• Search by uploading images\n• Answer questions about our inventory\n\nWhat would you like to do?",
      default: "I'm here to help you find the perfect products! You can describe what you're looking for, ask about categories, or upload an image to find similar items."
    };

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return new Response(
        JSON.stringify({ response: responses.greeting }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (lowerMessage.includes('help')) {
      return new Response(
        JSON.stringify({ response: responses.help }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ response: responses.default }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in handleTextQuery:', error);
    return new Response(
      JSON.stringify({ 
        response: "I'm here to help! Please feel free to ask about our products or upload an image to find similar items." 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}