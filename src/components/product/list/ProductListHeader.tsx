
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download, FileSpreadsheet } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface ProductListHeaderProps {
  selectedProducts: string[];
  onDownloadTemplate: (e: React.MouseEvent) => void;
  onDeleteSelected: () => void;
  onOpenAddDialog: (e: React.MouseEvent) => void;
  isDialogOpen: boolean;
  onFileUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isImporting?: boolean;
}

const ProductListHeader = ({
  selectedProducts,
  onDownloadTemplate,
  onDeleteSelected,
  onOpenAddDialog,
  isDialogOpen,
  onFileUploadChange,
  isImporting = false,
}: ProductListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Product Management</h1>
        {selectedProducts.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {selectedProducts.length} products selected
          </p>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={onDownloadTemplate} className="bg-white/50">
          <Download className="h-4 w-4 mr-2" />
          Template
        </Button>
        
        {selectedProducts.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={onDeleteSelected}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedProducts.length})
          </Button>
        )}
        
        <Dialog open={isDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={onOpenAddDialog} className="bg-green-600 hover:bg-green-700">
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
            disabled={isImporting}
          />
          <Button variant="outline" className="bg-blue-50 hover:bg-blue-100" disabled={isImporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {isImporting ? "Importing..." : "Import CSV"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductListHeader;
