
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <Navbar />
      <main className="container px-4 md:px-6 py-4 md:py-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb - Hidden on mobile for cleaner look */}
          <nav className="mb-4 md:mb-8 hidden md:flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">
              Categories
            </Link>
            {product.categories && (
              <>
                <span className="text-muted-foreground">/</span>
                <Link 
                  to={`/category/${product.categories.name}`} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {product.categories.name}
                </Link>
              </>
            )}
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>

          {/* Product Content - Mobile-First Modern Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 mb-12 md:mb-16">
            <div className="lg:sticky lg:top-8 h-fit">
              <ProductGallery product={product} />
            </div>
            <div className="order-first lg:order-last">
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 md:mt-20">
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
