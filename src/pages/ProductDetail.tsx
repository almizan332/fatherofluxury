
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
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">
      <Navbar />
      <main className="container mx-auto py-4 flex-grow max-w-[1400px] px-4">
        <div>
          <div className="mb-4">
            <nav className="text-sm text-gray-400">
              <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / {product.name}
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Gallery */}
            <div className="w-full">
              <ProductGallery product={product} />
            </div>

            {/* Right Column - Product Info */}
            <div className="w-full">
              <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Shipping & Customer Assistance</h2>
                  <div className="space-y-2 text-gray-300">
                    <p>Delivery Time: Orders are processed within 3-5 working days, and the product will be delivered to you within 15-20 working days.</p>
                    
                    <div className="mt-4">
                      <h3 className="font-medium">Quality Assurance:</h3>
                      <p>If there are quality issues with the product, please contact our customer service team. We will provide a free replacement to ensure your satisfaction. Moreover, if there are any remaining defects, we guarantee a free refund or a replacement of the product.</p>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-medium">Track Your Order:</h3>
                      <p>Easily monitor your shipment's status by visiting https://www.17track.net</p>
                    </div>
                    
                    <p className="mt-4">We are committed to providing you with a smooth shopping experience and top-quality service. Please feel free to reach out for any assistance!</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">How to Buy</h2>
                  <div className="space-y-4">
                    <p>👉 Watch this step-by-step video tutorial:</p>
                    <p><a href="#" className="text-blue-400 hover:underline">How to Buy - Click Here</a></p>
                  </div>
                </div>

                <div className="space-y-2">
                  {product.flylink_url && (
                    <a 
                      href={product.flylink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full py-3 bg-[#3897F0] hover:bg-[#3897F0]/90 text-white rounded-md"
                    >
                      Buy on Flylink
                    </a>
                  )}
                  
                  {product.alibaba_url && (
                    <a 
                      href={product.alibaba_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full py-3 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white rounded-md"
                    >
                      Buy on Alibaba
                    </a>
                  )}
                  
                  {product.dhgate_url && (
                    <a 
                      href={product.dhgate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full py-3 bg-[#00B96B] hover:bg-[#00B96B]/90 text-white rounded-md"
                    >
                      Buy on DHgate
                    </a>
                  )}
                  
                  <button
                    onClick={() => window.open('https://t.me/yourchannelname', '_blank')}
                    className="flex items-center justify-center w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                  >
                    Chat With Us
                  </button>
                  
                  <button
                    onClick={() => window.open('#', '_blank')}
                    className="flex items-center justify-center w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
                  >
                    How To Buy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <RelatedProducts products={relatedProducts} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
