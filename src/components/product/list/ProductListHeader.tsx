
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download, Upload } from "lucide-react";
import TemplateDownload from "../actions/TemplateDownload";

interface ProductListHeaderProps {
  selectedProducts: string[];
  onDownloadTemplate: (e: React.MouseEvent) => void;
  onDeleteSelected: (e: React.MouseEvent) => void;
  onOpenAddDialog: (e: React.MouseEvent) => void;
  isDialogOpen: boolean;
  onFileUploadChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your products and inventory
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <TemplateDownload />
          
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={onFileUploadChange}
            />
            <Button variant="outline" className="bg-white/50">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>
          
          <Button onClick={onOpenAddDialog} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          
          {selectedProducts.length > 0 && (
            <Button
              variant="destructive"
              onClick={onDeleteSelected}
              className="ml-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedProducts.length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListHeader;
