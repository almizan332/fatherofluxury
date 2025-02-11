
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

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      let productData = null;
      
      // Check if id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isUUID = uuidRegex.test(id);

      if (isUUID) {
        // Try UUID search first if it's a valid UUID format
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .maybeSingle();
          
        if (!error) productData = data;
      }

      // If not found by UUID, try searching by row number
      if (!productData) {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .range(parseInt(id) - 1, parseInt(id) - 1)
          .maybeSingle();

        if (!error) productData = data;
      }

      if (productData) {
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
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading product details...</p>
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
