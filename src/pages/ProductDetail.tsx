
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { useToast } from "@/components/ui/use-toast";
import { ProductGallery } from "@/components/product/detail/ProductGallery";
import { ProductInfo } from "@/components/product/detail/ProductInfo";
import { RelatedProducts } from "@/components/product/detail/RelatedProducts";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      
      // First try UUID lookup
      let { data: productData, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .maybeSingle();

      // If not found by UUID, try name-based lookup
      if (!productData && !error) {
        const { data: nameProductData, error: nameError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .ilike('name', id?.replace(/-/g, ' '))
          .maybeSingle();

        if (nameError) throw nameError;
        productData = nameProductData;
      }

      if (error) throw error;

      if (productData) {
        console.log('Found product:', productData);
        setProduct(productData);
        
        if (productData.category_id) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', productData.category_id)
            .neq('id', productData.id)
            .limit(6);

          if (relatedError) throw relatedError;
          setRelatedProducts(relatedData || []);
        }
      } else {
        toast({
          title: "Product not found",
          description: "The requested product could not be found.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / {product.name}
            </nav>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProductGallery product={product} />
            <ProductInfo product={product} />
          </div>

          <RelatedProducts products={relatedProducts} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
