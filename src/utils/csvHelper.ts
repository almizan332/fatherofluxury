
import { Product } from "@/types/product";

export const parseCSVFile = async (file: File): Promise<Partial<Product>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',').map(header => header.trim());
        
        console.log("CSV headers:", headers);
        
        const products: Partial<Product>[] = rows
          .slice(1) // Skip header row
          .filter(row => row.trim()) // Skip empty rows
          .map((row, rowIndex) => {
            const values = row.split(',').map(value => value.trim());
            const product: Partial<Product> = {};
            
            headers.forEach((header, index) => {
              const value = values[index];
              
              // Skip empty values except for URLs which can be optional
              if ((!value || value === '') && 
                  !header.includes('URL')) return;
              
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
                  // Handle gallery images with semicolon separators
                  if (value) {
                    product.gallery_images = value.split(';')
                      .map(url => url.trim())
                      .filter(url => url && url.length > 0);
                    console.log(`Row ${rowIndex + 2} Gallery images:`, product.gallery_images);
                  } else {
                    product.gallery_images = [];
                  }
                  break;
                case 'Flylink URL':
                  // Only set if not empty
                  if (value && value.trim()) product.flylink_url = value.trim();
                  break;
                case 'Alibaba URL':
                  // Only set if not empty
                  if (value && value.trim()) product.alibaba_url = value.trim();
                  break;
                case 'DHgate URL':
                  // Only set if not empty
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

export const validateProducts = (products: Partial<Product>[]): string[] => {
  const errors: string[] = [];
  
  products.forEach((product, index) => {
    if (!product.name) {
      errors.push(`Row ${index + 2}: Product name is required`);
    }
  });
  
  return errors;
};
