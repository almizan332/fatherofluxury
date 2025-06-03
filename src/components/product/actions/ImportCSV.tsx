
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

    try {
      setIsImporting(true);
      toast({
        title: "Processing CSV file",
        description: "Your file is being processed...",
      });

      // Parse the CSV file
      const parsedProducts = await parseCSVFile(file);
      
      // Validate the products
      const validationErrors = validateProducts(parsedProducts);
      
      if (validationErrors.length > 0) {
        toast({
          title: "Validation errors",
          description: `${validationErrors.length} errors found. Please fix them and try again.`,
          variant: "destructive",
        });
        console.error("Validation errors:", validationErrors);
        return;
      }

      // For each product in the parsed file
      let successCount = 0;
      for (const product of parsedProducts) {
        // Skip products without a name (required field)
        if (!product.name) {
          console.error("Skipping product without a name:", product);
          continue;
        }

        // Handle image uploads
        let uploadedPreviewImage = product.preview_image;
        let uploadedGalleryImages = product.gallery_images || [];

        // Upload preview image if it's a URL
        if (product.preview_image && product.preview_image.startsWith('http')) {
          try {
            uploadedPreviewImage = await uploadFileToVPS({
              url: product.preview_image,
              type: 'image/jpeg'
            } as any);
          } catch (error) {
            console.error("Error uploading preview image:", error);
            uploadedPreviewImage = product.preview_image; // Keep original URL as fallback
          }
        }

        // Upload gallery images if they are URLs
        if (product.gallery_images && product.gallery_images.length > 0) {
          const uploadPromises = product.gallery_images.map(async (imageUrl) => {
            if (imageUrl && imageUrl.startsWith('http')) {
              try {
                return await uploadFileToVPS({
                  url: imageUrl,
                  type: 'image/jpeg'
                } as any);
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
        if (product.category_id === undefined && (product as any).category) {
          const categoryName = (product as any).category;
          const matchingCategory = categories.find(c => 
            c.name.toLowerCase() === categoryName.toLowerCase()
          );
          
          if (matchingCategory) {
            product.category_id = matchingCategory.id;
          }
        }

        // Prepare product data for insertion
        const productData = {
          name: product.name,
          description: product.description || '',
          preview_image: uploadedPreviewImage || '',
          gallery_images: uploadedGalleryImages,
          category_id: product.category_id,
          // Only include non-empty URL fields
          ...(product.flylink_url ? { flylink_url: product.flylink_url } : {}),
          ...(product.alibaba_url ? { alibaba_url: product.alibaba_url } : {}),
          ...(product.dhgate_url ? { dhgate_url: product.dhgate_url } : {}),
        };

        // Insert product into the database
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) {
          console.error("Error inserting product:", error);
        } else {
          successCount++;
        }
      }

      // Clean up input value to allow re-uploading the same file
      event.target.value = '';
      
      // Show success toast and refresh products
      toast({
        title: "Products uploaded",
        description: `${successCount} products were successfully imported with images uploaded.`,
      });
      
      // Refresh the product list
      onProductSave();
      
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
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
      />
      <Button variant="outline" className="bg-white/50" disabled={isImporting}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        {isImporting ? "Importing..." : "Import CSV"}
      </Button>
    </div>
  );
};

export default ImportCSV;
