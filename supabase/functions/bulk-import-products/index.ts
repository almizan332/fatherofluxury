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
  
  // Check for First Image field specifically (matching template)
  const hasFirstImage = row['First Image']?.trim();
  
  // Log detailed validation info for first few rows
  if (rowIndex < 3) {
    console.log(`=== Row ${rowIndex + 1} Validation Debug ===`);
    console.log('All columns:', Object.keys(row));
    console.log('Row data:', row);
    console.log('First Image value:', hasFirstImage || 'EMPTY');
    console.log('=====================================');
  }
  
  // For template compatibility, just require First Image field to have a value
  if (!hasFirstImage) {
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
      
      // Handle both comma and tab delimited CSV, also handle mixed delimiters
      let delimiter = ',';
      if (row.includes('\t')) {
        delimiter = '\t';
      }
      
      // Handle cases where there might be mixed delimiters or special characters
      const cells = [];
      let inQuotes = false;
      let currentCell = '';
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if ((char === delimiter || char === ',' || char === '\t') && !inQuotes) {
          cells.push(currentCell.trim().replace(/"/g, ''));
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim().replace(/"/g, ''));
      
      return cells.filter(cell => cell.length > 0);
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
    
    // Enhanced logging for debugging
    console.log('=== CSV IMPORT DEBUG START ===');
    console.log('Total CSV headers found:', headers.length);
    console.log('CSV headers:', headers);
    console.log('First few data rows:', rows.slice(1, 4).map((row, i) => `Row ${i+1}: ${row.slice(0, 3)}`));
    console.log('================================');
    
    // More flexible header validation - check for key required headers
    const requiredHeaders = ['Product Name'];
    const expectedHeaders = ['Product Name', 'FlyLink', 'Alibaba URL', 'DHgate URL', 'Category', 'Description', 'First Image', 'Media Links'];
    
    const missingRequired = requiredHeaders.filter(req => 
      !headers.some(h => h.toLowerCase().includes(req.toLowerCase()))
    );
    
    const hasFirstImageHeader = headers.some(h => h.toLowerCase().includes('first image'));
    
    if (missingRequired.length > 0) {
      return new Response(JSON.stringify({ 
        error: `Missing required headers: ${missingRequired.join(', ')}`,
        receivedHeaders: headers,
        expectedHeaders: expectedHeaders,
        hint: 'Please use the downloaded template format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!hasFirstImageHeader) {
      return new Response(JSON.stringify({ 
        error: 'Missing First Image header',
        receivedHeaders: headers,
        expectedHeaders: expectedHeaders,
        hint: 'Please use the downloaded template format with First Image column'
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
        
        // Log first row mapping for debugging
        if (i === 0) {
          console.log(`Mapping header "${trimmedHeader}" with value "${value ? value.substring(0, 50) + '...' : 'EMPTY'}"`);
        }
        
        // Map similar headers to expected format with more flexible matching
        const lowerHeader = trimmedHeader.toLowerCase();
        
        if (lowerHeader.includes('product name') || lowerHeader.includes('name') || lowerHeader === 'product_name') {
          rowData['Product Name'] = value;
        } else if (lowerHeader.includes('flylink') || lowerHeader.includes('fly_link')) {
          rowData['FlyLink'] = value;
        } else if (lowerHeader.includes('alibaba') || lowerHeader.includes('alibaba_url')) {
          rowData['Alibaba URL'] = value;
        } else if (lowerHeader.includes('dhgate') || lowerHeader.includes('dhgate_url')) {
          rowData['DHgate URL'] = value;
        } else if (lowerHeader.includes('category')) {
          rowData['Category'] = value;
        } else if (lowerHeader.includes('description')) {
          rowData['Description'] = value;
        } else if (lowerHeader.includes('first image') || 
                   lowerHeader.includes('first_image') ||
                   lowerHeader.includes('firstimage') ||
                   lowerHeader === 'image' ||
                   lowerHeader === 'thumbnail' ||
                   lowerHeader.includes('main_image') ||
                   lowerHeader.includes('primary_image')) {
          rowData['First Image'] = value;
        } else if (lowerHeader.includes('media links') || 
                   lowerHeader.includes('media_links') ||
                   lowerHeader.includes('medialinks') ||
                   lowerHeader === 'media' ||
                   lowerHeader === 'gallery' ||
                   lowerHeader.includes('additional_images') ||
                   lowerHeader.includes('extra_images')) {
          rowData['Media Links'] = value;
        } else {
          // Keep original header name for any unmapped columns
          rowData[trimmedHeader] = value;
        }
      });

      // Validate after header mapping
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
          category: rowData['Category'] || 'Uncategorized',
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