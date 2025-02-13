
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
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

      // First try UUID lookup
      if (isUUID(id!)) {
        console.log('Attempting UUID lookup for:', id);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name
            )
          `)
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        productData = data;
        console.log('UUID lookup result:', productData);
      }

      // If UUID lookup fails or id is not UUID, try name-based lookup
      if (!productData) {
        console.log('Attempting name-based lookup for:', id);
        const decodedName = decodeURIComponent(id!).replace(/-/g, ' ');
        console.log('Decoded name:', decodedName);
        
        // Try exact match first
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name
            )
          `)
          .ilike('name', decodedName)
          .maybeSingle();
        
        if (error) throw error;
        productData = data;
        
        // If exact match fails, try partial match
        if (!productData) {
          const cleanName = decodedName.replace(/[^\w\s]/g, '').trim();
          console.log('Trying partial match with cleaned name:', cleanName);
          
          const { data: partialData, error: partialError } = await supabase
            .from('products')
            .select(`
              *,
              categories (
                name
              )
            `)
            .ilike('name', `%${cleanName}%`)
            .maybeSingle();
          
          if (partialError) throw partialError;
          productData = partialData;
        }
      }

      if (productData) {
        console.log('Found product:', productData);
        setProduct(productData);
        
        // Fetch related products from the same category
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
        console.log('Product not found after all lookups');
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProductGallery product={product} />
            <ProductInfo product={product} />
          </div>

          {relatedProducts.length > 0 && (
            <RelatedProducts products={relatedProducts} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
