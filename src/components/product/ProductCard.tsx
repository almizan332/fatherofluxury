
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
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
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium line-clamp-2">{product.title}</h3>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm font-semibold text-purple-500">
                  ${product.price}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(product.dateAdded).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
