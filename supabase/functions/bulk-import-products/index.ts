import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseMediaLinks(input: string) {
  if (!input?.trim()) return null;
  // Handle both semicolon and comma separated links
  const separator = input.includes(';') ? ';' : ',';
  return input
    .split(separator)
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
    
    // Special parsing for the specific CSV format with multi-line descriptions
    const lines = text.split('\n');
    const rows = [];
    
    // Add header row
    if (lines.length > 0) {
      const headerLine = lines[0];
      const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
      rows.push(headers);
    }
    
    let i = 1; // Skip header
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }
      
      // Parse the main product line
      const fields = [];
      let currentField = '';
      let inQuotes = false;
      let fieldIndex = 0;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
          if (inQuotes && fieldIndex === 5) {
            // Starting description field - we'll handle multi-line
            currentField = '';
          }
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
          fieldIndex++;
        } else {
          currentField += char;
        }
      }
      
      // If we're in quotes at end of line, it means description continues
      if (inQuotes && fieldIndex === 5) {
        // Collect multi-line description
        let description = currentField;
        i++;
        
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (!nextLine) {
            description += '\n';
            i++;
            continue;
          }
          
          // Check if this line contains the image URL (digitaloceanspaces.com)
          if (nextLine.includes('digitaloceanspaces.com')) {
            // This line contains the image and media links
            // Find where the description ends (look for closing quote before the URL)
            const parts = nextLine.split(',');
            let descriptionEnd = '';
            let imageStart = 0;
            
            for (let p = 0; p < parts.length; p++) {
              if (parts[p].includes('digitaloceanspaces.com')) {
                imageStart = p;
                break;
              } else {
                if (descriptionEnd) descriptionEnd += ',';
                descriptionEnd += parts[p];
              }
            }
            
            // Clean up description end
            descriptionEnd = descriptionEnd.replace(/["]/g, '').trim();
            if (descriptionEnd) {
              description += '\n' + descriptionEnd;
            }
            
            // Add description to fields
            fields.push(description.trim());
            
            // Add first image
            const firstImage = parts[imageStart] ? parts[imageStart].trim() : '';
            fields.push(firstImage);
            
            // Add media links (semicolon separated)
            const mediaLinks = parts.slice(imageStart + 1).join(',');
            fields.push(mediaLinks);
            
            break;
          } else {
            // Continue building description
            description += '\n' + nextLine;
            i++;
          }
        }
      } else {
        // Regular single-line processing
        fields.push(currentField.trim());
      }
      
      // Make sure we have 8 fields
      while (fields.length < 8) {
        fields.push('');
      }
      
      if (fields.length > 0 && fields[0]) {
        rows.push(fields);
      }
      
      i++;
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