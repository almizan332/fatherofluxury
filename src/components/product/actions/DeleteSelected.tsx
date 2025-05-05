
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteSelectedProps {
  selectedProducts: string[];
  onDeleteSelected: (productIds: string[]) => void;
}

const DeleteSelected = ({ selectedProducts, onDeleteSelected }: DeleteSelectedProps) => {
  if (selectedProducts.length === 0) return null;

  return (
    <Button 
      variant="destructive" 
      onClick={() => onDeleteSelected(selectedProducts)}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete ({selectedProducts.length})
    </Button>
  );
};

export default DeleteSelected;
