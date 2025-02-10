
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ExternalLink, ShoppingCart, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductDetail = () => {
  const product = {
    id: 1,
    title: "LV $60",
    description: "LV Bag 1:1 Good Quality Size: 26x19cm Material: Artificial leather Packing in an original box Code number: LB7317S",
    images: [
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    ],
    price: "$60",
    links: {
      flylink: "https://flylink.com",
      alibaba: "https://alibaba.com",
      dhgate: "https://dhgate.com",
    },
    relatedProducts: [
      {
        id: 2,
        title: "CC $65",
        image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
        price: "$65"
      },
    ]
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-4 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <nav className="text-sm text-gray-400">
              <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / {product.title}
            </nav>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Carousel className="w-full">
                <CarouselContent>
                  {product.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square relative">
                        <img
                          src={image}
                          alt={`${product.title} - View ${index + 1}`}
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
                {product.images.map((image, index) => (
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
                <h1 className="text-3xl font-bold mb-1">{product.title}</h1>
                <p className="text-2xl text-primary mb-2">{product.price}</p>
                <p className="text-gray-400">{product.description}</p>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600" 
                  size="lg"
                  onClick={() => window.open(product.links.flylink, '_blank')}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy on Flylink
                </Button>
                
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600" 
                  size="lg"
                  onClick={() => window.open(product.links.alibaba, '_blank')}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy on Alibaba
                </Button>
                
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600" 
                  size="lg"
                  onClick={() => window.open(product.links.dhgate, '_blank')}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy on DHgate
                </Button>
                
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

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {product.relatedProducts.map((relatedProduct) => (
                <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{relatedProduct.title}</h3>
                        <p className="text-primary">{relatedProduct.price}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;

