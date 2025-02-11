
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

const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      console.log('Fetching product with ID:', id);
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      let productData = null;
      let error = null;

      if (isUUID(id!)) {
        console.log('Attempting UUID lookup for:', id);
        const result = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .maybeSingle();
        
        productData = result.data;
        error = result.error;
        console.log('UUID lookup result:', productData, error);
      } else {
        console.log('Attempting name-based lookup for:', id);
        const decodedName = decodeURIComponent(id!.replace(/-/g, ' '));
        console.log('Decoded name:', decodedName);
        
        const result = await supabase
          .from('products')
          .select('*, categories(name)')
          .ilike('name', decodedName)
          .maybeSingle();
        
        productData = result.data;
        error = result.error;
        console.log('Name-based lookup result:', productData, error);
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
        console.log('Product not found after lookup');
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
