
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryActionsProps {
  isAdmin: boolean;
  onAddClick: () => void;
}

const CategoryActions = ({ isAdmin, onAddClick }: CategoryActionsProps) => {
  if (!isAdmin) return null;
  
  return (
    <Button onClick={onAddClick} className="w-full md:w-auto">
      <Plus className="h-4 w-4 mr-2" />
      Add New Category
    </Button>
  );
};

export default CategoryActions;
