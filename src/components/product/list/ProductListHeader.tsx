
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download, FileSpreadsheet } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface ProductListHeaderProps {
  selectedProducts: string[];
  onDownloadTemplate: (e: React.MouseEvent) => void;
  onDeleteSelected: (e: React.MouseEvent) => void;
  onOpenAddDialog: (e: React.MouseEvent) => void;
  isDialogOpen: boolean;
  onFileUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductListHeader = ({
  selectedProducts,
  onDownloadTemplate,
  onDeleteSelected,
  onOpenAddDialog,
  isDialogOpen,
  onFileUploadChange,
}: ProductListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Product Management</h1>
      <div className="flex gap-2">
        <Button onClick={onDownloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
        
        {selectedProducts.length > 0 && (
          <Button variant="destructive" onClick={onDeleteSelected}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedProducts.length})
          </Button>
        )}
        
        <Dialog open={isDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={onOpenAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
        </Dialog>
        
        <div className="relative">
          <input
            type="file"
            accept=".csv"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={onFileUploadChange}
          />
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import from CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductListHeader;
