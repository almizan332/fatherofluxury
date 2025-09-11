import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseMediaLinks(input: string) {
  if (!input?.trim()) return null;
  return input
    .split(';')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

function toNull(s: string) {
  const trimmed = (s ?? '').trim();
  return trimmed.length ? trimmed : null;
}

function validateRow(row: Record<string, string>, rowIndex: number) {
  const errors = [];
  
  if (!row['Product Name']?.trim()) {
    errors.push(`Row ${rowIndex + 1}: Product Name is required`);
  }
  
  if (!row['Category']?.trim()) {
    errors.push(`Row ${rowIndex + 1}: Category is required`);
  }
  
  if (!row['First Image']?.trim()) {
    errors.push(`Row ${rowIndex + 1}: First Image is required`);
  }
  
  return errors;
}

serve(async (req) => {
  console.log('Request received:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, ping: "pong" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const text = await file.text();
    console.log('File content preview:', text.substring(0, 200));
    
    const rows = text.split('\n').map(row => {
      if (!row.trim()) return [];
      
      // Handle both comma and tab delimited CSV
      const delimiter = row.includes('\t') ? '\t' : ',';
      const cells = [];
      let inQuotes = false;
      let currentCell = '';
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          cells.push(currentCell.trim());
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim());
      
      return cells;
    }).filter(row => row.length > 0);
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Empty CSV file' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (rows.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Empty CSV file or no valid rows found' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const headers = rows[0].map(h => h.trim().replace(/"/g, ''));
    console.log('Headers received:', headers);
    
    // More flexible header validation - check for key required headers
    const requiredHeaders = ['Product Name', 'Category', 'First Image'];
    const missingRequired = requiredHeaders.filter(req => 
      !headers.some(h => h.toLowerCase().includes(req.toLowerCase()))
    );
    
    if (missingRequired.length > 0) {
      return new Response(JSON.stringify({ 
        error: `Missing required headers: ${missingRequired.join(', ')}`,
        receivedHeaders: headers,
        hint: 'Headers should include: Product Name, Category, First Image'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = {
      totalRows: rows.length - 1,
      insertedCount: 0,
      skippedCount: 0,
      errors: [] as string[]
    };

    const dataRows = rows.slice(1).filter(row => row.some(cell => cell.trim()));

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowData: Record<string, string> = {};
      
      // Map headers to expected format with flexible matching
      headers.forEach((header, index) => {
        const trimmedHeader = header.trim().replace(/"/g, '');
        let value = (row[index] || '').trim().replace(/"/g, '');
        
        // Map similar headers to expected format
        if (trimmedHeader.toLowerCase().includes('product name') || trimmedHeader.toLowerCase() === 'name') {
          rowData['Product Name'] = value;
        } else if (trimmedHeader.toLowerCase().includes('flylink')) {
          rowData['FlyLink'] = value;
        } else if (trimmedHeader.toLowerCase().includes('alibaba')) {
          rowData['Alibaba URL'] = value;
        } else if (trimmedHeader.toLowerCase().includes('dhgate')) {
          rowData['DHgate URL'] = value;
        } else if (trimmedHeader.toLowerCase().includes('category')) {
          rowData['Category'] = value;
        } else if (trimmedHeader.toLowerCase().includes('description')) {
          rowData['Description'] = value;
        } else if (trimmedHeader.toLowerCase().includes('first image') || trimmedHeader.toLowerCase().includes('image')) {
          rowData['First Image'] = value;
        } else if (trimmedHeader.toLowerCase().includes('media links') || trimmedHeader.toLowerCase().includes('media')) {
          rowData['Media Links'] = value;
        } else {
          rowData[trimmedHeader] = value;
        }
      });

      const validationErrors = validateRow(rowData, i);
      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
        result.skippedCount++;
        continue;
      }

      try {
        const productData = {
          product_name: rowData['Product Name'] || '',
          flylink: toNull(rowData['FlyLink']),
          alibaba_url: toNull(rowData['Alibaba URL']),
          dhgate_url: toNull(rowData['DHgate URL']),
          category: rowData['Category'] || '',
          description: toNull(rowData['Description']),
          first_image: rowData['First Image'] || '',
          media_links: parseMediaLinks(rowData['Media Links']),
          title: rowData['Product Name'] || '',
          slug: (rowData['Product Name'] || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          status: 'published'
        };

        console.log(`Processing row ${i + 1}:`, productData);

        const { error } = await supabaseClient
          .from('products')
          .insert(productData);

        if (error) {
          result.errors.push(`Row ${i + 1}: Database error - ${error.message}`);
          result.skippedCount++;
        } else {
          result.insertedCount++;
        }
      } catch (error: any) {
        result.errors.push(`Row ${i + 1}: ${error.message || 'Unknown error'}`);
        result.skippedCount++;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Import failed';
    console.error('Error details:', errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})