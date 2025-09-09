import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseMediaLinks(input) {
  if (!input?.trim()) return null;
  return input
    .split(';')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

function toNull(s) {
  const trimmed = (s ?? '').trim();
  return trimmed.length ? trimmed : null;
}

function validateRow(row, rowIndex) {
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

app.post('/api/import-csv', async (req, res) => {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const text = fs.readFileSync(file.filepath, 'utf8');
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
      return res.status(400).json({ error: 'Empty CSV file' });
    }

    const expectedHeaders = ['Product Name', 'FlyLink', 'Alibaba URL', 'DHgate URL', 'Category', 'Description', 'First Image', 'Media Links'];
    const headers = rows[0];
    
    // Validate headers
    const headerMismatch = expectedHeaders.some((expected, index) => headers[index]?.trim() !== expected);
    if (headerMismatch) {
      return res.status(400).json({ 
        error: `Invalid headers. Expected: ${expectedHeaders.join(', ')}` 
      });
    }

    const result = {
      totalRows: rows.length - 1,
      insertedCount: 0,
      skippedCount: 0,
      errors: []
    };

    const dataRows = rows.slice(1).filter(row => row.some(cell => cell.trim()));

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowData = {};
      
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
      } catch (error) {
        result.errors.push(`Row ${i + 1}: ${error.message || 'Unknown error'}`);
        result.skippedCount++;
      }
    }

    res.json(result);

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: error.message || 'Import failed' 
    });
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});