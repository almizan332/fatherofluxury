import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
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
    title: "Sample Product",
    description: "This is a sample product description.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    dateAdded: new Date(),
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-auto mb-4"
          />
          <p className="text-lg mb-4">{product.description}</p>
          <Button variant="primary" className="mt-4">
            Buy Now
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default ProductDetail;
