
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

    toast({
      title: "CSV upload not implemented",
      description: "This feature will be implemented soon",
    });
  };

  const downloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const csvRows = [
      productExcelHeaders.join(','),
      ...sampleExcelData.map(row => [
        row['Product Name'],
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
