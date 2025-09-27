import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Helper function to sanitize and handle image URLs
const sanitizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove any quotes that might be in the URL
  let cleanUrl = url.replace(/['"]/g, '').trim();
  
  // Fix DigitalOcean Spaces URL format - remove incorrect .com subdomain
  if (cleanUrl.includes('digitaloceanspaces.com')) {
    // Fix incorrect URL format: fatherofluxury.com.sgp1.digitaloceanspaces.com -> fatherofluxury.sgp1.digitaloceanspaces.com
    cleanUrl = cleanUrl.replace(/([^.]+)\.com\.([^.]+\.digitaloceanspaces\.com)/, '$1.$2');
    
    try {
      // Ensure proper URL encoding for special characters
      const urlObj = new URL(cleanUrl);
      // Reconstruct with properly encoded pathname
      cleanUrl = `${urlObj.protocol}//${urlObj.host}${encodeURI(urlObj.pathname)}${urlObj.search}${urlObj.hash}`;
    } catch (error) {
      console.log('URL parsing failed, using cleaned URL:', cleanUrl);
    }
  }
  
  return cleanUrl;
};

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
          src={sanitizeImageUrl(product.thumbnail)} 
          alt={product.title} 
          className="w-full h-32 object-cover rounded"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('ProductCard image failed to load:', product.thumbnail);
            e.currentTarget.src = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80';
          }}
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