import { Product } from "@/types/product";

export const parseCSVFile = async (file: File): Promise<Partial<Product>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',').map(header => header.trim());
        
        const products: Partial<Product>[] = rows
          .slice(1) // Skip header row
          .filter(row => row.trim()) // Skip empty rows
          .map(row => {
            const values = row.split(',').map(value => value.trim());
            const product: Partial<Product> = {};
            
            headers.forEach((header, index) => {
              const value = values[index];
              if (!value || value === '') return; // Skip empty values
              
              switch(header) {
                case 'Product Name':
                  product.name = value;
                  break;
                case 'Description':
                  product.description = value;
                  break;
                case 'Preview Image URL':
                  product.preview_image = value;
                  break;
                case 'Gallery Image URLs (comma separated)':
                  // Parse gallery images from different possible formats:
                  // 1. URLs separated by semicolons
                  // 2. URLs separated by newlines (converted to semicolons)
                  // 3. URLs wrapped in quotes and separated by commas
                  
                  if (!value) {
                    product.gallery_images = [];
                    return;
                  }
                  
                  // First, try to unwrap from quotes if present
                  let galleryData = value;
                  if (galleryData.startsWith('"') && galleryData.endsWith('"')) {
                    galleryData = galleryData.slice(1, -1);
                  }
                  
                  // Then split by separators: semicolons, newlines, or commas
                  let galleryImages: string[] = [];
                  
                  // Try to split by semicolons first
                  if (galleryData.includes(';')) {
                    galleryImages = galleryData.split(';');
                  } 
                  // Then try newlines (which would have been converted to spaces in CSV)
                  else if (galleryData.includes(' ')) {
                    galleryImages = galleryData.split(/\s+/);
                  }
                  // Otherwise, just use the value as a single image URL
                  else {
                    galleryImages = [galleryData];
                  }
                  
                  product.gallery_images = galleryImages
                    .map(url => url.trim())
                    .filter(url => url.length > 0 && url.startsWith('http'));
                  break;
                case 'Flylink URL':
                  if (value) product.flylink_url = value;
                  break;
                case 'Alibaba URL':
                  if (value) product.alibaba_url = value;
                  break;
                case 'DHgate URL':
                  if (value) product.dhgate_url = value;
                  break;
                case 'Category':
                  // This will be handled elsewhere by mapping to category_id
                  (product as any).category = value;
                  break;
              }
            });
            
            return product;
          });
        
        resolve(products);
      } catch (error) {
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
    if (!product.name) {
      errors.push(`Row ${index + 2}: Product name is required`);
    }
    
    // Validate gallery images format
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      product.gallery_images.forEach((url, imgIndex) => {
        if (typeof url !== 'string' || !url.startsWith('http')) {
          errors.push(`Row ${index + 2}: Invalid gallery image URL at position ${imgIndex + 1}`);
        }
      });
    }
  });
  
  return errors;
};

// Helper function to prepare gallery images for CSV export
export const formatGalleryImagesForCSV = (images: string[] | undefined): string => {
  if (!images || images.length === 0) return '';
  
  // Format with semicolons for CSV export
  return images.join(';');
};
