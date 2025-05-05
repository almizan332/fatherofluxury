
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ProductFormDialog from "../ProductFormDialog";
import { Category } from "@/components/category/types";

interface AddProductProps {
  categories: Category[];
  onProductSave: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

const AddProduct = ({ 
  categories, 
  onProductSave, 
  isDialogOpen, 
  setIsDialogOpen 
}: AddProductProps) => {
  return (
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
  );
};

export default AddProduct;
