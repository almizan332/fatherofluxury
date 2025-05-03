
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
                  // Use semicolons as separators for gallery images since commas are used for CSV fields
                  product.gallery_images = value ? value.split(';').map(url => url.trim()).filter(url => url.length > 0) : [];
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
  });
  
  return errors;
};
