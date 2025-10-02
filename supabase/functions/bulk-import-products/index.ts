import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Parse media links (semicolon or comma separated)
function parseMediaLinks(input: string): string[] {
  if (!input || typeof input !== 'string') return [];
  
  // Split by semicolon or comma, filter out empty strings
  return input
    .split(/[;,]/)
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

// Helper to convert empty strings to null
function toNull(s: string): string | null {
  return s && s.trim() !== '' ? s.trim() : null;
}

// Validate required fields
function validateRow(row: Record<string, string>, rowIndex: number): string | null {
  if (!row['Product Name'] || row['Product Name'].trim() === '') {
    return `Row ${rowIndex}: Product Name is required`;
  }
  if (!row['First Image'] || row['First Image'].trim() === '') {
    return `Row ${rowIndex}: First Image is required`;
  }
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get form data with file
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read file content
    const text = await file.text();
    
    // Parse CSV manually to handle multi-line descriptions
    const lines: string[] = [];
    let currentLine = '';
    let insideQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    
    // Add the last line if it exists
    if (currentLine.trim()) {
      lines.push(currentLine);
    }

    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ error: 'CSV file must contain headers and at least one data row' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse headers
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Validate required headers
    const requiredHeaders = ['Product Name', 'First Image'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required headers: ${missingHeaders.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('CSV Headers:', headers);
    console.log(`Processing ${lines.length - 1} data rows`);

    // Process data in batches
    const BATCH_SIZE = 50;
    const dataLines = lines.slice(1); // Skip header row
    
    let insertedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Process batches
    for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
      const batch = dataLines.slice(i, Math.min(i + BATCH_SIZE, dataLines.length));
      const productsToInsert: any[] = [];

      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j + 2; // +2 because: +1 for header row, +1 for 1-based indexing
        const line = batch[j];

        // Parse CSV line handling quoted values
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let k = 0; k < line.length; k++) {
          const char = line[k];

          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim().replace(/^"|"$/g, ''));
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim().replace(/^"|"$/g, ''));

        // Create row object
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });

        // Validate row
        const validationError = validateRow(row, rowIndex);
        if (validationError) {
          errors.push(validationError);
          skippedCount++;
          continue;
        }

        // Map to product data with flexible header matching
        const productName = row['Product Name'] || row['product_name'] || '';
        const flylink = toNull(row['FlyLink'] || row['flylink'] || row['Flylinking URL'] || '');
        const alibabaUrl = toNull(row['Alibaba URL'] || row['alibaba_url'] || '');
        const dhgateUrl = toNull(row['DHgate URL'] || row['dhgate_url'] || '');
        const category = toNull(row['Category'] || row['category'] || '');
        const description = toNull(row['Description'] || row['description'] || '');
        const firstImage = toNull(row['First Image'] || row['first_image'] || '');
        const mediaLinksStr = row['Media Links'] || row['media_links'] || '';
        const mediaLinks = parseMediaLinks(mediaLinksStr);

        // Generate slug
        const slug = productName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        productsToInsert.push({
          product_name: productName,
          title: productName,
          slug: slug,
          flylink: flylink,
          alibaba_url: alibabaUrl,
          dhgate_url: dhgateUrl,
          category: category,
          description: description,
          first_image: firstImage,
          media_links: mediaLinks.length > 0 ? mediaLinks : null,
          status: 'published'
        });
      }

      // Insert batch
      if (productsToInsert.length > 0) {
        try {
          const { data, error } = await supabase
            .from('products')
            .insert(productsToInsert)
            .select();

          if (error) {
            console.error('Batch insert error:', error);
            
            // Try inserting individually to identify which rows failed
            for (const product of productsToInsert) {
              const { error: individualError } = await supabase
                .from('products')
                .insert([product]);

              if (individualError) {
                errors.push(`Failed to insert "${product.product_name}": ${individualError.message}`);
                skippedCount++;
              } else {
                insertedCount++;
              }
            }
          } else {
            insertedCount += data.length;
            console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Inserted ${data.length} products`);
          }
        } catch (error: any) {
          console.error('Batch insert exception:', error);
          errors.push(`Batch insert failed: ${error.message}`);
          skippedCount += productsToInsert.length;
        }
      }
    }

    console.log(`Import complete: ${insertedCount} inserted, ${skippedCount} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        totalRows: dataLines.length,
        insertedCount,
        skippedCount,
        errors: errors.slice(0, 10) // Return first 10 errors
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Import function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Import failed',
        totalRows: 0,
        insertedCount: 0,
        skippedCount: 0,
        errors: [error.message]
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
