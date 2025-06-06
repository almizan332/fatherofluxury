
import { Product } from "@/types/product";

export const parseCSVFile = async (file: File): Promise<Partial<Product>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        
        // Split by newlines and filter out empty rows
        const rows = text.split('\n').filter(row => row.trim());
        
        if (rows.length < 2) {
          throw new Error('CSV file must have at least a header row and one data row');
        }
        
        // Parse headers - handle both tab and comma separation for flexibility
        const headerRow = rows[0];
        let headers: string[];
        
        if (headerRow.includes('\t')) {
          headers = headerRow.split('\t').map(header => header.trim());
        } else {
          headers = headerRow.split(',').map(header => header.trim());
        }
        
        console.log("CSV headers:", headers);
        
        const products: Partial<Product>[] = rows
          .slice(1) // Skip header row
          .filter(row => row.trim()) // Skip empty rows
          .map((row, rowIndex) => {
            let values: string[];
            
            // Use the same separator as headers
            if (headerRow.includes('\t')) {
              values = row.split('\t').map(value => value.trim());
            } else {
              values = row.split(',').map(value => value.trim());
            }
            
            const product: Partial<Product> = {};
            
            headers.forEach((header, index) => {
              const value = values[index] || '';
              
              switch(header) {
                case 'Product Name':
                  if (value && value.trim()) product.name = value.trim();
                  break;
                case 'Description':
                  if (value && value.trim()) product.description = value.trim();
                  break;
                case 'First Image':
                  if (value && value.trim()) {
                    const cleanUrl = cleanDigitalOceanUrl(value.trim());
                    product.preview_image = cleanUrl;
                    console.log(`Row ${rowIndex + 2} Preview image:`, cleanUrl);
                  }
                  break;
                case 'Media Links':
                  if (value && value.trim()) {
                    // Split by semicolon for media links
                    const urls = value.split(';')
                      .map(url => cleanDigitalOceanUrl(url.trim()))
                      .filter(url => url && url.length > 0);
                    product.gallery_images = urls;
                    console.log(`Row ${rowIndex + 2} Gallery images (${urls.length}):`, urls);
                  } else {
                    product.gallery_images = [];
                  }
                  break;
                case 'Flylink URL':
                case 'Flylinking URL':
                  if (value && value.trim()) product.flylink_url = value.trim();
                  break;
                case 'Alibaba URL':
                  if (value && value.trim()) product.alibaba_url = value.trim();
                  break;
                case 'DHgate URL':
                  if (value && value.trim()) product.dhgate_url = value.trim();
                  break;
                case 'Category':
                  if (value && value.trim()) (product as any).category = value.trim();
                  break;
              }
            });
            
            return product;
          });
        
        console.log("Parsed products:", products);
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

// Helper function to clean and properly encode DigitalOcean Spaces URLs
const cleanDigitalOceanUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove any quotes that might be in the URL
  let cleanUrl = url.replace(/['"]/g, '');
  
  // Handle DigitalOcean Spaces URLs - ensure proper encoding
  if (cleanUrl.includes('digitaloceanspaces.com')) {
    try {
      // Split the URL to encode only the path part after the domain
      const urlParts = cleanUrl.split('/');
      if (urlParts.length > 3) {
        const domain = urlParts.slice(0, 3).join('/');
        const pathParts = urlParts.slice(3);
        // Encode each path segment but preserve forward slashes
        const encodedPath = pathParts.map(part => {
          // Don't double-encode if already encoded
          try {
            const decoded = decodeURIComponent(part);
            return encodeURIComponent(decoded);
          } catch {
            return encodeURIComponent(part);
          }
        }).join('/');
        cleanUrl = `${domain}/${encodedPath}`;
      }
    } catch (error) {
      console.warn('Error encoding DigitalOcean URL:', error);
      // Fallback: just return the original URL
      return cleanUrl;
    }
  }
  
  return cleanUrl;
};

export const validateProducts = (products: Partial<Product>[]): string[] => {
  const errors: string[] = [];
  
  products.forEach((product, index) => {
    if (!product.name || !product.name.trim()) {
      errors.push(`Row ${index + 2}: Product name is required`);
    }
  });
  
  return errors;
};
