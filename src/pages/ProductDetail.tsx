
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductGallery } from "@/components/product/detail/ProductGallery";
import ProductInfo from "@/components/product/detail/ProductInfo";
import { RelatedProducts } from "@/components/product/detail/RelatedProducts";
import { useProductDetail } from "@/hooks/useProductDetail";

const ProductDetail = () => {
  const { id } = useParams();
  const { product, relatedProducts, isLoading, error } = useProductDetail(id);
  const { toast } = useToast();

  // Show error toast if there was an error loading
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse">
            <p className="text-lg">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <p className="text-lg">Product not found</p>
          <Link to="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-4 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <nav className="text-sm text-gray-400">
              <Link to="/">Home</Link> / 
              <Link to="/categories" className="mx-1">Categories</Link> /
              {product.categories && (
                <Link to={`/category/${product.categories.name}`} className="mx-1">
                  {product.categories.name}
                </Link>
              )} / 
              <span className="ml-1">{product.name}</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <ProductGallery product={product} />
            </div>
            <div className="lg:col-span-1">
              <ProductInfo product={product} />
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <RelatedProducts products={relatedProducts} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
