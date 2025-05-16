
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
    
    const { filePath } = await req.json();
    
    if (!filePath) {
      throw new Error('Missing file path parameter');
    }

    console.log(`Processing file: ${filePath}`);

    // Update status to processing
    await supabaseClient
      .from('chatbot_training_files')
      .update({ status: 'processing' })
      .eq('file_path', filePath);
      
    try {
      // Get file metadata to find the name
      const { data: fileData, error: fileError } = await supabaseClient
        .from('chatbot_training_files')
        .select('file_name, file_type')
        .eq('file_path', filePath)
        .single();
        
      if (fileError) throw fileError;
      
      // Download the file from storage
      const { data: fileContent, error: downloadError } = await supabaseClient
        .storage
        .from('chatbot-training')
        .download(filePath);
        
      if (downloadError) throw downloadError;
      
      // Process based on file type
      let extractedText = '';
      
      if (fileData.file_type && fileData.file_type.includes('text/')) {
        // Handle text files
        extractedText = await fileContent.text();
      } else {
        // For other file types (PDF, DOCX, etc.), we'd need specialized parsers
        // For now, just extract text from PDFs as an example
        if (fileData.file_type === 'application/pdf') {
          // In a real system, you'd use a PDF parser library
          extractedText = `Content extracted from ${fileData.file_name} (PDF parsing not fully implemented yet)`;
        } else {
          extractedText = `Content from ${fileData.file_name} (this file type is not fully supported yet)`;
        }
      }
      
      console.log(`Extracted ${extractedText.length} characters from ${fileData.file_name}`);
      
      // Store the extracted content
      await supabaseClient
        .from('chatbot_training_content')
        .insert({
          title: fileData.file_name,
          content: extractedText,
          source_type: 'file',
          source_path: filePath,
          status: 'active'
        });
      
      // Update status to completed
      await supabaseClient
        .from('chatbot_training_files')
        .update({ status: 'completed' })
        .eq('file_path', filePath);
        
      console.log(`Successfully processed file: ${filePath}`);

    } catch (processingError) {
      console.error(`Error processing file ${filePath}:`, processingError);
      await supabaseClient
        .from('chatbot_training_files')
        .update({ 
          status: 'error',
          error_message: String(processingError).substring(0, 255) 
        })
        .eq('file_path', filePath);
      throw processingError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "File processed successfully" }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error in process-training-file function:", error);
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
