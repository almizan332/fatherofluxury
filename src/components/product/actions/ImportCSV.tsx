
import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { parseCSVFile, validateProducts } from "@/utils/csvHelper";
import { uploadFileToVPS } from "@/utils/vpsFileUpload";
import { Category } from "@/components/category/types";

interface ImportCSVProps {
  categories: Category[];
  onProductSave: () => void;
}

const ImportCSV = ({ categories, onProductSave }: ImportCSVProps) => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImporting(true);
      console.log('Starting CSV import process...');
      
      toast({
        title: "Processing CSV file",
        description: "Your file is being processed...",
      });

      // Parse the CSV file
      const parsedProducts = await parseCSVFile(file);
      console.log('Parsed products count:', parsedProducts.length);
      
      if (parsedProducts.length === 0) {
        toast({
          title: "No products found",
          description: "The CSV file doesn't contain any valid product data",
          variant: "destructive",
        });
        return;
      }
      
      // Validate the products
      const validationErrors = validateProducts(parsedProducts);
      
      if (validationErrors.length > 0) {
        toast({
          title: "Validation errors",
          description: `${validationErrors.length} errors found: ${validationErrors.slice(0, 3).join(', ')}${validationErrors.length > 3 ? '...' : ''}`,
          variant: "destructive",
        });
        console.error("Validation errors:", validationErrors);
        return;
      }

      // Process each product
      let successCount = 0;
      let errorCount = 0;
      
      for (const [index, product] of parsedProducts.entries()) {
        try {
          console.log(`Processing product ${index + 1}/${parsedProducts.length}:`, product.name);
          
          // Skip products without a name
          if (!product.name) {
            console.log('Skipping product without name');
            continue;
          }

          // Handle image uploads
          let uploadedPreviewImage = product.preview_image || '';
          let uploadedGalleryImages = product.gallery_images || [];

          // Upload preview image if it's a URL
          if (product.preview_image && product.preview_image.startsWith('http')) {
            try {
              console.log('Uploading preview image:', product.preview_image);
              uploadedPreviewImage = await uploadFileToVPS({
                url: product.preview_image,
                type: 'image/jpeg'
              } as any);
              console.log('Preview image uploaded:', uploadedPreviewImage);
            } catch (error) {
              console.error("Error uploading preview image:", error);
              uploadedPreviewImage = product.preview_image; // Keep original URL as fallback
            }
          }

          // Upload gallery images if they are URLs
          if (product.gallery_images && product.gallery_images.length > 0) {
            console.log('Uploading gallery images:', product.gallery_images.length);
            const uploadPromises = product.gallery_images.map(async (imageUrl) => {
              if (imageUrl && imageUrl.startsWith('http')) {
                try {
                  const uploaded = await uploadFileToVPS({
                    url: imageUrl,
                    type: 'image/jpeg'
                  } as any);
                  console.log('Gallery image uploaded:', uploaded);
                  return uploaded;
                } catch (error) {
                  console.error("Error uploading gallery image:", error);
                  return imageUrl; // Keep original URL as fallback
                }
              }
              return imageUrl;
            });
            
            uploadedGalleryImages = await Promise.all(uploadPromises);
          }

          // Find category ID if the category is provided
          let categoryId = product.category_id;
          if (!categoryId && (product as any).category) {
            const categoryName = (product as any).category;
            const matchingCategory = categories.find(c => 
              c.name.toLowerCase() === categoryName.toLowerCase()
            );
            
            if (matchingCategory) {
              categoryId = matchingCategory.id;
              console.log('Found matching category:', categoryName, '->', categoryId);
            } else {
              console.log('No matching category found for:', categoryName);
            }
          }

          // Prepare product data for insertion
          const productData = {
            name: product.name,
            description: product.description || '',
            preview_image: uploadedPreviewImage,
            gallery_images: uploadedGalleryImages,
            category_id: categoryId,
            // Only include non-empty URL fields
            ...(product.flylink_url ? { flylink_url: product.flylink_url } : {}),
            ...(product.alibaba_url ? { alibaba_url: product.alibaba_url } : {}),
            ...(product.dhgate_url ? { dhgate_url: product.dhgate_url } : {}),
          };

          console.log('Inserting product data:', productData);

          // Insert product into the database
          const { error } = await supabase
            .from('products')
            .insert([productData]);

          if (error) {
            console.error("Error inserting product:", error);
            errorCount++;
          } else {
            console.log('Product inserted successfully:', product.name);
            successCount++;
          }
        } catch (productError) {
          console.error(`Error processing product ${product.name}:`, productError);
          errorCount++;
        }
      }

      // Clean up input value to allow re-uploading the same file
      event.target.value = '';
      
      // Show final result
      if (successCount > 0) {
        toast({
          title: "Import completed",
          description: `${successCount} products imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
        
        // Refresh the product list
        onProductSave();
      } else {
        toast({
          title: "Import failed",
          description: "No products were imported successfully",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('CSV import error:', error);
      toast({
        title: "Error importing CSV",
        description: error.message || "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".csv"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileUpload}
        disabled={isImporting}
      />
      <Button variant="outline" className="bg-white/50" disabled={isImporting}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        {isImporting ? "Importing..." : "Import CSV"}
      </Button>
    </div>
  );
};

export default ImportCSV;
