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

// Helper to properly encode image URLs
const sanitizeImageUrl = (url: string): string => {
  if (!url) return '';
  let cleanUrl = url.replace(/['"]/g, '').trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  if (cleanUrl.includes('digitaloceanspaces.com')) {
    try {
      const urlObj = new URL(cleanUrl);
      const pathSegments = urlObj.pathname.split('/').map(segment => 
        segment ? encodeURIComponent(decodeURIComponent(segment)) : segment
      );
      urlObj.pathname = pathSegments.join('/');
      return urlObj.toString();
    } catch (e) {
      return cleanUrl.replace(/ /g, '%20');
    }
  }
  return cleanUrl;
};

const ProductCard = ({ product, onDelete, showDeleteButton }: ProductCardProps) => {
  const imageUrl = sanitizeImageUrl(product.first_image || product.thumbnail || '');
  
  return (
    <Card className="p-4 space-y-2">
      <img 
        src={imageUrl || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80'} 
        alt={product.product_name || product.title || 'Product image'} 
        className="w-full h-32 object-cover rounded" 
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('ProductCard image failed to load:', imageUrl);
          e.currentTarget.src = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80';
        }}
      />
      <h3 className="font-medium text-sm truncate">{product.product_name || product.title}</h3>
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