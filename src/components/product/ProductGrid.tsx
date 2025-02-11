
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
}

const ProductGrid = ({ products, onDelete, showDeleteButton }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          index={index} 
          onDelete={onDelete}
          showDeleteButton={showDeleteButton}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
