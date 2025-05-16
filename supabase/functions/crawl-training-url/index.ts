
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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
      
    console.log(`Starting to crawl URL: ${url}`);
    
    try {
      // Actually fetch and process the webpage
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      console.log(`Successfully fetched HTML content (${html.length} bytes)`);
      
      // Parse the HTML to extract text content
      const parser = new DOMParser();
      const document = parser.parseFromString(html, "text/html");
      
      if (!document) {
        throw new Error("Failed to parse HTML document");
      }
      
      // Extract text from relevant elements (ignoring scripts, styles, etc.)
      const bodyElement = document.querySelector("body");
      if (!bodyElement) {
        throw new Error("Could not find body element in the document");
      }
      
      // Remove script and style tags first
      bodyElement.querySelectorAll("script, style, noscript, iframe, svg").forEach(el => el.remove());
      
      // Get text content from paragraphs, headings, lists, etc.
      const textElements = bodyElement.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, td, th, div, span, a");
      let textContent = "";
      
      textElements.forEach(el => {
        const text = el.textContent.trim();
        if (text) {
          textContent += text + "\n";
        }
      });
      
      // Clean up the extracted text
      textContent = textContent
        .replace(/\s+/g, " ")
        .replace(/\n+/g, "\n")
        .trim();
      
      console.log(`Extracted ${textContent.length} characters of text content`);
      
      // Store the extracted content
      await supabaseClient
        .from('chatbot_training_content')
        .insert({
          url,
          content: textContent,
          source_type: 'webpage',
          status: 'active'
        });
      
      // Update status to completed
      await supabaseClient
        .from('chatbot_training_urls')
        .update({ status: 'completed' })
        .eq('url', url);
      
      console.log(`Completed processing URL: ${url}`);

    } catch (crawlError) {
      console.error(`Error crawling URL ${url}:`, crawlError);
      await supabaseClient
        .from('chatbot_training_urls')
        .update({ 
          status: 'error',
          error_message: String(crawlError).substring(0, 255)
        })
        .eq('url', url);
      throw crawlError;
    }

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
    console.error("Error in crawl-training-url function:", error);
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
