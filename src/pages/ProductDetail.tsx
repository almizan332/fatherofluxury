import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ExternalLink } from "lucide-react";
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
      // Add more images as needed
    ],
    price: "$60",
    relatedProducts: [
      {
        id: 2,
        title: "CC $65",
        image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
        price: "$65"
      },
      // Add more related products
    ]
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <nav className="text-sm text-gray-400">
              <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / {product.title}
            </nav>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

              <div className="grid grid-cols-4 gap-2 mt-4">
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

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                <p className="text-2xl text-primary mb-4">{product.price}</p>
                <p className="text-gray-400">{product.description}</p>
              </div>

              <div className="space-y-4">
                <Button className="w-full" size="lg">Buy on Dhgate</Button>
                <Button variant="outline" className="w-full" size="lg">Get Payment Links</Button>
                <Button variant="secondary" className="w-full" size="lg">Chat With Us</Button>
                <Button variant="ghost" className="w-full" size="lg">How To Buy</Button>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
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