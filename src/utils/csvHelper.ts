
import { Product } from "@/types/product";

export const parseCSVFile = async (file: File): Promise<Partial<Product>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header row and one data row');
        }

        // Parse CSV with proper handling of quoted fields and tabs
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === '\t' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(header => header.replace(/"/g, '').trim());
        console.log("CSV headers:", headers);
        
        const products: Partial<Product>[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const product: Partial<Product> = {};
          
          headers.forEach((header, index) => {
            const value = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
            
            switch(header) {
              case 'Product Name':
                if (value) product.name = value;
                break;
              case 'Description':
                // Description is optional, can be empty
                product.description = value || '';
                break;
              case 'First Image':
                if (value && (value.startsWith('http') || value.startsWith('https'))) {
                  product.preview_image = value.trim();
                }
                break;
              case 'Media Links':
                if (value) {
                  // Split by semicolon and clean up each URL, preserving spaces in URLs
                  const imageUrls = value.split(';')
                    .map(url => url.trim())
                    .filter(url => url && url.length > 0 && (url.startsWith('http') || url.startsWith('https')));
                  
                  product.gallery_images = imageUrls;
                  console.log('Parsed gallery images:', imageUrls.length, 'images');
                } else {
                  product.gallery_images = [];
                }
                break;
              case 'Flylinking URL':
                if (value && (value.startsWith('http') || value.startsWith('https'))) {
                  (product as any).flylink_url = value.trim();
                }
                break;
              case 'Alibaba URL':
                // Optional field
                if (value && (value.startsWith('http') || value.startsWith('https'))) {
                  product.alibaba_url = value.trim();
                }
                break;
              case 'DHgate URL':
                // Optional field
                if (value && (value.startsWith('http') || value.startsWith('https'))) {
                  product.dhgate_url = value.trim();
                }
                break;
              case 'Category':
                if (value) (product as any).category = value;
                break;
            }
          });
          
          // Add product if it has required fields: name, category, and at least first image
          if (product.name && product.name.trim() && (product as any).category && product.preview_image) {
            console.log('Parsed product:', {
              name: product.name,
              category: (product as any).category,
              description: product.description || '(empty)',
              preview_image: product.preview_image ? 'Yes' : 'No',
              gallery_count: product.gallery_images?.length || 0
            });
            products.push(product);
          } else {
            console.log('Skipping product due to missing required fields:', {
              name: product.name ? 'Yes' : 'No',
              category: (product as any).category ? 'Yes' : 'No',
              preview_image: product.preview_image ? 'Yes' : 'No'
            });
          }
        }
        
        console.log("Total parsed products:", products.length);
        resolve(products);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const validateProducts = (products: Partial<Product>[]): string[] => {
  const errors: string[] = [];
  
  products.forEach((product, index) => {
    const rowNumber = index + 2; // +2 because we start from row 2 (after header)
    
    // Required fields validation
    if (!product.name || product.name.trim() === '') {
      errors.push(`Row ${rowNumber}: Product Name is required`);
    }
    
    if (!(product as any).category || (product as any).category.trim() === '') {
      errors.push(`Row ${rowNumber}: Category is required`);
    }
    
    if (!product.preview_image || product.preview_image.trim() === '') {
      errors.push(`Row ${rowNumber}: First Image is required`);
    }
    
    if (product.name && product.name.length > 255) {
      errors.push(`Row ${rowNumber}: Product name too long (max 255 characters)`);
    }
    
    // Validate image URLs
    if (product.preview_image && !product.preview_image.startsWith('http')) {
      errors.push(`Row ${rowNumber}: First Image URL must be a valid HTTP/HTTPS URL`);
    }
    
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      product.gallery_images.forEach((url, imgIndex) => {
        if (url && !url.startsWith('http')) {
          errors.push(`Row ${rowNumber}: Media Link ${imgIndex + 1} URL must be a valid HTTP/HTTPS URL`);
        }
      });
    }
  });
  
  return errors;
};
