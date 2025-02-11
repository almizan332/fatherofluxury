
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";

interface RelatedProductsProps {
  products: Product[];
}

export const RelatedProducts = ({ products }: RelatedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id}>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={product.preview_image || ''}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2">{product.name}</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
