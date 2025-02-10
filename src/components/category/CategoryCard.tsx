
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
    <Link to={`/category/${category.name}`} className="block w-full">
      <Card className="p-4 flex flex-col hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-video mb-4 rounded-md overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-60`} />
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{category.name}</h3>
            <p className="text-sm text-gray-500">
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
                className="h-8 w-8 p-0"
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
                className="h-8 w-8 p-0"
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
