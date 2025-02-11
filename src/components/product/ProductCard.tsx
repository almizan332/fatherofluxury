
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: Product;
  index: number;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
}

const ProductCard = ({ product, index, onDelete, showDeleteButton }: ProductCardProps) => {
  const hasAffiliateLinks = product.flylink_url || product.alibaba_url || product.dhgate_url;
  const formatUrlSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <Link to={`/product/${formatUrlSlug(product.name)}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
        whileHover={{ scale: 1.02 }}
        className="transform transition-all duration-300 group relative"
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-purple-700/20 bg-card hover:bg-accent">
          <CardContent className="p-0">
            <div className="aspect-square relative">
              <img
                src={product.preview_image}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  {new Date(product.created_at).toLocaleDateString()}
                </p>
                {hasAffiliateLinks && (
                  <div className="flex gap-2">
                    {product.flylink_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(product.flylink_url, '_blank');
                        }}
                      >
                        Flylink
                      </Button>
                    )}
                    {product.alibaba_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(product.alibaba_url, '_blank');
                        }}
                      >
                        Alibaba
                      </Button>
                    )}
                    {product.dhgate_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(product.dhgate_url, '_blank');
                        }}
                      >
                        DHgate
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {showDeleteButton && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this product? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(product.id);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </motion.div>
    </Link>
  );
};

export default ProductCard;
