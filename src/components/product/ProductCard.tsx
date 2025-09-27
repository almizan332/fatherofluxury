import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index: number;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
}

const ProductCard = ({ product, onDelete, showDeleteButton }: ProductCardProps) => {
  return (
    <Card className="p-4 space-y-2">
      {product.thumbnail && (
        <img 
          src={product.thumbnail} 
          alt={product.title} 
          className="w-full h-32 object-cover rounded" 
        />
      )}
      <h3 className="font-medium text-sm truncate">{product.title}</h3>
      <p className="text-xs text-muted-foreground truncate">
        {product.description || "No description"}
      </p>
      {showDeleteButton && onDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      )}
    </Card>
  );
};

export default ProductCard;