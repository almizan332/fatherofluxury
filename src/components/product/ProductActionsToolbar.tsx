
import { Category } from "@/components/category/types";
import TemplateDownload from "./actions/TemplateDownload";
import DeleteSelected from "./actions/DeleteSelected";
import AddProduct from "./actions/AddProduct";
import ImportCSV from "./actions/ImportCSV";

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
  return (
    <div className="flex gap-2">
      <TemplateDownload />
      <DeleteSelected 
        selectedProducts={selectedProducts}
        onDeleteSelected={onDeleteSelected}
      />
      <AddProduct 
        categories={categories}
        onProductSave={onProductSave}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
      <ImportCSV
        categories={categories}
        onProductSave={onProductSave}
      />
    </div>
  );
};

