
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  FileSpreadsheet, 
  Download, 
  Trash2
} from "lucide-react";
import ProductFormDialog from "./ProductFormDialog";
import { Category } from "@/components/category/types";
import { useToast } from "@/hooks/use-toast";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";
import { parseCSVFile, validateProducts } from "@/utils/csvHelper";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductActionsToolbarProps {
  selectedProducts: string[];
  onDeleteSelected: (productIds: string[]) => void;
  categories: Category[];
  onProductSave: () => void;
  setIsDialogOpen: (open: boolean) => void;
  isDialogOpen: boolean;
}

export const ProductActionsToolbar = ({
  selectedProducts,
  onDeleteSelected,
  categories,
  onProductSave,
  setIsDialogOpen,
  isDialogOpen
}: ProductActionsToolbarProps) => {
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
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

        // Convert gallery images from string to array if needed
        if (typeof product.gallery_images === 'string') {
          product.gallery_images = (product.gallery_images as unknown as string)
            .split(';')
            .map(url => url.trim())
            .filter(url => url.length > 0);
        }

        // Insert product into the database
        const { data, error } = await supabase
          .from('products')
          .insert([product]);

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
        description: `${successCount} products were successfully imported.`,
      });
      
      // Refresh the product list
      onProductSave();
      
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const csvRows = [
      productExcelHeaders.join(','),
      ...sampleExcelData.map(row => [
        row['Product Name'],
        row['Flylink URL'],
        row['Alibaba URL'],
        row['DHgate URL'],
        row['Category'],
        row['Description'],
        row['Preview Image URL'],
        row['Gallery Image URLs (comma separated)']
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "You can now fill in the template and import it back",
    });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={downloadExcelTemplate} variant="outline" className="bg-white/50">
        <Download className="h-4 w-4 mr-2" />
        Template
      </Button>
      {selectedProducts.length > 0 && (
        <Button 
          variant="destructive" 
          onClick={() => onDeleteSelected(selectedProducts)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete ({selectedProducts.length})
        </Button>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </DialogTrigger>
        <ProductFormDialog
          categories={categories}
          onSuccess={onProductSave}
          onClose={() => setIsDialogOpen(false)}
        />
      </Dialog>
      <div className="relative">
        <input
          type="file"
          accept=".csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileUpload}
        />
        <Button variant="outline" className="bg-white/50">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </div>
    </div>
  );
};
