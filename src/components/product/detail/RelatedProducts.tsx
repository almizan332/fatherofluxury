
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { sanitizeImageUrl, FALLBACK_IMAGE_URL } from "@/utils/imageUrlHelper";

interface RelatedProductsProps {
  products: Product[];
}

export const RelatedProducts = ({ products }: RelatedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="h-1 w-12 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
        <h2 className="text-3xl font-bold">Related Products</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="group">
            <Card className="overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={sanitizeImageUrl(product.first_image || product.preview_image || '') || FALLBACK_IMAGE_URL}
                    alt={product.product_name || product.title || product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE_URL;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2 text-sm group-hover:text-primary transition-colors duration-300">
                    {product.product_name || product.title || product.name}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
