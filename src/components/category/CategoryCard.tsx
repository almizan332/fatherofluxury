
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { Category } from "./types";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
}

const CategoryCard = ({ category, onEdit, onDelete, isAdmin }: CategoryCardProps) => {
  return (
    <Link to={`/dashboard/category/${category.name}`} className="block w-full">
      <Card className="p-4 flex flex-col hover:shadow-xl transition-all duration-300 border border-purple-100">
        <div className="relative aspect-video mb-4 rounded-md overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/60 to-pink-500/60" />
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-purple-900 truncate">{category.name}</h3>
            <p className="text-sm text-purple-600">
              {category.productCount} Products
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(category);
                }}
                className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(category.id);
                }}
                className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default CategoryCard;
