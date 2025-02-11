
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const hasAffiliateLinks = product.flylink_url || product.alibaba_url || product.dhgate_url;

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
        whileHover={{ scale: 1.02 }}
        className="transform transition-all duration-300"
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
      </motion.div>
    </Link>
  );
};

export default ProductCard;
