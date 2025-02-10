
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CategoryHeaderProps {
  isAdmin: boolean;
  onAddClick: () => void;
}

const CategoryHeader = ({ isAdmin, onAddClick }: CategoryHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <h1 className="text-xl md:text-2xl font-bold text-right">Category Management</h1>
      
      {isAdmin && (
        <Button onClick={onAddClick} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add New Category
        </Button>
      )}
    </div>
  );
};

export default CategoryHeader;
