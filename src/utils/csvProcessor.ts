/**
 * CSV Processor to fix multi-line description issues
 */

export function fixCsvFormat(csvContent: string): string {
  const lines = csvContent.split('\n');
  const headers = ['Product Name', 'FlyLink', 'Alibaba URL', 'DHgate URL', 'Category', 'Description', 'First Image', 'Media Links'];
  
  const products = [];
  let currentProduct: string[] = [];
  let inDescription = false;
  let descriptionBuffer = '';
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if this line starts a new product (contains FlyLink pattern)
    if (line.includes('https://s.flylinking.com/')) {
      // Save previous product if exists
      if (currentProduct.length > 0) {
        if (descriptionBuffer) {
          currentProduct[5] = descriptionBuffer.trim().replace(/\n/g, ' ');
          descriptionBuffer = '';
        }
        products.push([...currentProduct]);
      }
      
      // Start new product
      const fields = parseProductLine(line);
      currentProduct = fields;
      inDescription = false;
    } else {
      // This is continuation of description or image data
      if (currentProduct.length > 0) {
        if (line.includes('digitaloceanspaces.com') && line.includes('thumbinal')) {
          // This is the first image
          const parts = line.split(',');
          currentProduct[6] = parts[0].replace(/"/g, ''); // First image
          if (parts.length > 1) {
            currentProduct[7] = parts.slice(1).join(',').replace(/"/g, ''); // Media links
          }
        } else {
          // This is part of description
          descriptionBuffer += (descriptionBuffer ? ' ' : '') + line.replace(/"/g, '');
        }
      }
    }
  }
  
  // Add last product
  if (currentProduct.length > 0) {
    if (descriptionBuffer) {
      currentProduct[5] = descriptionBuffer.trim().replace(/\n/g, ' ');
    }
    products.push(currentProduct);
  }
  
  // Generate clean CSV
  const csvRows = [headers.join(',')];
  
  products.forEach(product => {
    const cleanProduct = product.map(field => {
      if (!field) return '';
      // Escape quotes and wrap in quotes if contains comma or newline
      const cleaned = field.toString().replace(/"/g, '""');
      return cleaned.includes(',') || cleaned.includes('\n') ? `"${cleaned}"` : cleaned;
    });
    csvRows.push(cleanProduct.join(','));
  });
  
  return csvRows.join('\n');
}

function parseProductLine(line: string): string[] {
  const result = new Array(8).fill('');
  const parts = line.split(',');
  
  if (parts.length >= 5) {
    result[0] = parts[0].replace(/"/g, ''); // Product Name
    result[1] = parts[1]; // FlyLink
    result[2] = parts[2]; // Alibaba URL
    result[3] = parts[3]; // DHgate URL
    result[4] = parts[4]; // Category
    
    // Find where description starts (after category, before first image)
    let descStart = 5;
    let descEnd = parts.length;
    
    for (let i = 5; i < parts.length; i++) {
      if (parts[i].includes('digitaloceanspaces.com') || parts[i].includes('http')) {
        descEnd = i;
        break;
      }
    }
    
    if (descEnd > descStart) {
      const desc = parts.slice(descStart, descEnd).join(',').replace(/"/g, '');
      result[5] = desc;
    }
  }
  
  return result;
}

// Sample usage function for the frontend
export function downloadCorrectedCsv(originalCsvContent: string) {
  const correctedContent = fixCsvFormat(originalCsvContent);
  const blob = new Blob([correctedContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'corrected-products.csv';
  link.click();
}