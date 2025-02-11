
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ShoppingCart, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { useToast } from "@/components/ui/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
      // Fetch the main product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .single();

      if (productError) throw productError;

      if (productData) {
        setProduct(productData);
        
        // Fetch related products from the same category
        if (productData.category_id) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', productData.category_id)
            .neq('id', id)
            .limit(6);

          if (relatedError) throw relatedError;
          setRelatedProducts(relatedData || []);
        }
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Carousel className="w-full">
                <CarouselContent>
                  {product.preview_image && (
                    <CarouselItem>
                      <div className="aspect-square relative">
                        <img
                          src={product.preview_image}
                          alt={`${product.name} - Preview`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  )}
                  {product.gallery_images?.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square relative">
                        <img
                          src={image}
                          alt={`${product.name} - View ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>

              <div className="grid grid-cols-4 gap-2 mt-2">
                {product.preview_image && (
                  <img
                    src={product.preview_image}
                    alt="Preview"
                    className="aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                  />
                )}
                {product.gallery_images?.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-bold mb-1">{product.name}</h1>
                <p className="text-gray-400">{product.description}</p>
              </div>

              <div className="space-y-2">
                {product.flylink_url && (
                  <Button 
                    className="w-full bg-blue-500 hover:bg-blue-600" 
                    size="lg"
                    onClick={() => window.open(product.flylink_url, '_blank')}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy on Flylink
                  </Button>
                )}
                
                {product.alibaba_url && (
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600" 
                    size="lg"
                    onClick={() => window.open(product.alibaba_url, '_blank')}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy on Alibaba
                  </Button>
                )}
                
                {product.dhgate_url && (
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600" 
                    size="lg"
                    onClick={() => window.open(product.dhgate_url, '_blank')}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy on DHgate
                  </Button>
                )}
                
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  size="lg"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat With Us
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  How To Buy
                </Button>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Related Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <img
                            src={relatedProduct.preview_image || ''}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{relatedProduct.name}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
