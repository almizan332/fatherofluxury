
import { Product } from "@/types/product";

export const parseCSVFile = async (file: File): Promise<Partial<Product>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split('\t').map(header => header.trim()); // Using tab separator
        
        console.log("CSV headers:", headers);
        
        const products: Partial<Product>[] = rows
          .slice(1) // Skip header row
          .filter(row => row.trim()) // Skip empty rows
          .map((row, rowIndex) => {
            const values = row.split('\t').map(value => value.trim()); // Using tab separator
            const product: Partial<Product> = {};
            
            headers.forEach((header, index) => {
              const value = values[index];
              
              switch(header) {
                case 'Product Name':
                  if (value) product.name = value;
                  break;
                case 'Description':
                  if (value) product.description = value;
                  break;
                case 'First Image':
                case 'Preview Image URL':
                  if (value && value.trim()) {
                    // Clean and encode the URL properly for DigitalOcean Spaces
                    const cleanUrl = cleanDigitalOceanUrl(value.trim());
                    product.preview_image = cleanUrl;
                    console.log(`Row ${rowIndex + 2} Preview image:`, cleanUrl);
                  }
                  break;
                case 'Media Links':
                case 'Gallery Image URLs (comma separated)':
                  if (value && value.trim()) {
                    // Split by semicolon for your format
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
                  if (value) (product as any).category = value;
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
    if (!product.name) {
      errors.push(`Row ${index + 2}: Product name is required`);
    }
  });
  
  return errors;
};
