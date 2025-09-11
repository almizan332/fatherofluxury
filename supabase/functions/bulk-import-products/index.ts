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
    const rows = text.split('\n').map(row => {
      // Handle CSV parsing with proper quote handling
      const cells = [];
      let inQuotes = false;
      let currentCell = '';
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(currentCell.trim());
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim());
      
      return cells;
    });
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Empty CSV file' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const expectedHeaders = ['Product Name', 'FlyLink', 'Alibaba URL', 'DHgate URL', 'Category', 'Description', 'First Image', 'Media Links'];
    const headers = rows[0];
    
    // Validate headers
    const headerMismatch = expectedHeaders.some((expected, index) => headers[index]?.trim() !== expected);
    if (headerMismatch) {
      return new Response(JSON.stringify({ 
        error: `Invalid headers. Expected: ${expectedHeaders.join(', ')}` 
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
      
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });

      const validationErrors = validateRow(rowData, i);
      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
        result.skippedCount++;
        continue;
      }

      try {
        const productData = {
          product_name: rowData['Product Name'].trim(),
          flylink: toNull(rowData['FlyLink']),
          alibaba_url: toNull(rowData['Alibaba URL']),
          dhgate_url: toNull(rowData['DHgate URL']),
          category: rowData['Category'].trim(),
          description: toNull(rowData['Description']),
          first_image: rowData['First Image'].trim(),
          media_links: parseMediaLinks(rowData['Media Links']),
          title: rowData['Product Name'].trim(),
          slug: rowData['Product Name'].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          status: 'published'
        };

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
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Import failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})