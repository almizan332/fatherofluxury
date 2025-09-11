import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60;

const supabase = createClient(
  "https://zsptshspjdzvhgjmnjtl.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json({ ok: true, ping: "pong" }, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: corsHeaders });
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
      return NextResponse.json({ error: 'Empty CSV file' }, { status: 400, headers: corsHeaders });
    }

    const expectedHeaders = ['Product Name', 'FlyLink', 'Alibaba URL', 'DHgate URL', 'Category', 'Description', 'First Image', 'Media Links'];
    const headers = rows[0];
    
    // Validate headers
    const headerMismatch = expectedHeaders.some((expected, index) => headers[index]?.trim() !== expected);
    if (headerMismatch) {
      return NextResponse.json({ 
        error: `Invalid headers. Expected: ${expectedHeaders.join(', ')}` 
      }, { status: 400, headers: corsHeaders });
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

        const { error } = await supabase
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

    return NextResponse.json(result, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      error: error.message || 'Import failed' 
    }, { status: 500, headers: corsHeaders });
  }
}