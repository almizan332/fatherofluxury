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
    console.log('Starting image search with DeepSeek...');
    
    // Use DeepSeek to analyze the image and extract product features
    const imageAnalysis = await analyzeImageWithDeepSeek(image, deepseekApiKey);
    console.log('DeepSeek analysis result:', imageAnalysis);
    
    // Search for similar products based on the analysis
    const products = await searchSimilarProducts(supabase, imageAnalysis);

    if (products.length > 0) {
      const topMatch = products[0];
      
      // Format the response with product name, price estimate, and link (aliHiddenProduct.com domain)
      const productUrl = `https://alihiddenproduct.com/product/${topMatch.id}`;
      
      const response = `**${topMatch.name}**\nPrice: Contact for pricing\nLink: ${productUrl}`;

      return new Response(
        JSON.stringify({ response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          response: "Sorry, I couldn't find an exact match. You may try uploading a clearer image or check our latest categories here: https://alihiddenproduct.com/categories" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in image search:', error);
    return new Response(
      JSON.stringify({ 
        response: "Sorry, I couldn't find an exact match. You may try uploading a clearer image or check our latest categories here: https://alihiddenproduct.com/categories" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function analyzeImageWithDeepSeek(image: string, apiKey: string) {
  try {
    console.log('Calling DeepSeek API for image analysis...');
    
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
                text: 'Analyze this product image. Identify: 1) Product type/category (clothing, accessories, electronics, etc.) 2) Brand if visible 3) Key features like color, material, style 4) Any text or model numbers visible. Return a concise description with these searchable keywords.'
              },
              {
                type: 'image_url',
                image_url: { url: image }
              }
            ]
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error: ${response.status} - ${errorText}`);
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || '';
    console.log('DeepSeek analysis:', analysis);
    return analysis;
  } catch (error) {
    console.error('Error analyzing image with DeepSeek:', error);
    return 'luxury product item';
  }
}

async function searchSimilarProducts(supabase: any, analysis: string) {
  try {
    console.log('Searching products with analysis:', analysis);
    
    // Extract meaningful keywords from the analysis
    const keywords = analysis.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !['the', 'and', 'this', 'that', 'with', 'from', 'have', 'been', 'they', 'were', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
      )
      .slice(0, 8); // Limit to most relevant keywords

    console.log('Extracted keywords:', keywords);

    if (keywords.length === 0) {
      // Fallback to recent products
      const { data, error } = await supabase
        .from('products')
        .select('id, name, preview_image, description, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    }

    // Create search conditions for name and description
    const searchConditions = keywords.flatMap(keyword => [
      `name.ilike.%${keyword}%`,
      `description.ilike.%${keyword}%`
    ]);

    // Search products using text similarity
    const { data, error } = await supabase
      .from('products')
      .select('id, name, preview_image, description, created_at, display_id')
      .or(searchConditions.join(','))
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error searching products:', error);
      
      // Fallback search without filtering
      const { data: fallbackData } = await supabase
        .from('products')
        .select('id, name, preview_image, description, created_at, display_id')
        .order('created_at', { ascending: false })
        .limit(5);
      
      return fallbackData || [];
    }

    console.log(`Found ${data?.length || 0} matching products`);
    return data || [];
  } catch (error) {
    console.error('Error in searchSimilarProducts:', error);
    return [];
  }
}

async function handleTextQuery(supabase: any, message: string) {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Check for external references first - reject them
    if (lowerMessage.includes('amazon') || lowerMessage.includes('ebay') || lowerMessage.includes('aliexpress') || lowerMessage.includes('temu')) {
      return new Response(
        JSON.stringify({ 
          response: "Sorry, I can only help with products available on aliHiddenProduct.com." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle product search queries
    if (lowerMessage.includes('product') || lowerMessage.includes('find') || lowerMessage.includes('search')) {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, preview_image')
        .or(`name.ilike.%${message}%,description.ilike.%${message}%`)
        .limit(3);

      if (!error && data && data.length > 0) {
        const productList = data.map((product: any) => 
          `**${product.name}**\nPrice: Contact for pricing\nLink: https://alihiddenproduct.com/product/${product.id}`
        ).join('\n\n');

        return new Response(
          JSON.stringify({ 
            response: productList 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            response: "Sorry, I couldn't find an exact match. You may try uploading a clearer image or check our latest categories here: https://alihiddenproduct.com/categories" 
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
        const categoryList = data.map((cat: any) => 
          `• ${cat.name} (${cat.product_count || 0} products)`
        ).join('\n');

        return new Response(
          JSON.stringify({ 
            response: `Here are our top categories:\n\n${categoryList}\n\nBrowse all categories: https://alihiddenproduct.com/categories` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Default responses for common queries (domain-specific)
    const responses = {
      greeting: "Hello! I can help you find products on aliHiddenProduct.com. Try searching, browsing categories, or upload an image!",
      help: "I can help you:\n• Find specific products from aliHiddenProduct.com\n• Browse categories\n• Search by uploading images\n\nWhat would you like to find?",
      default: "I'm here to help you find products on aliHiddenProduct.com. Try searching for something specific, browse categories, or upload an image!"
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