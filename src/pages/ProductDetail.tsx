import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ExternalLink } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductDetail = () => {
  const product = {
    id: "YY381",
    description: `🚚 Presys is Free Shipping 🚚\n\n💫 How to Order 💫\nChoose a Code from the Photo and send "Pictures + Code + Size(if Needed)" with a Message to the Seller.`,
    deliveryTime: "Order Processing: 3-5 working days. Delivery: 15-20 working days.",
    trackingInfo: "Track your parcel with the provided logistics tracking number at www.17track.net",
    telegramChannel: "https://t.me/alistore/GOAQ16FQMJZ",
    discordChannel: "https://discord.gg/FKPUY1KRB",
    liveChat: "https://t.me/tmstore0",
    reviews: "@tmstore_reviews",
    mainImage: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
    ],
    relatedProducts: [
      { id: "YY382", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80" },
      { id: "YY383", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80" },
      { id: "YY384", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80" },
      { id: "YY385", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80" },
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link to="/" className="mr-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-semibold gradient-text"
            >
              Ali Hidden
            </motion.div>
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link to="/" className="transition-colors hover:text-foreground/80">Home</Link>
            <Link to="/categories" className="transition-colors hover:text-foreground/80">Categories</Link>
            <Link to="/blog" className="transition-colors hover:text-foreground/80">Blog</Link>
            <Link to="/telegram" className="transition-colors hover:text-foreground/80">Telegram</Link>
            <Link to="/contact" className="transition-colors hover:text-foreground/80">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="container py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Image */}
          <div className="lg:w-1/2">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src={product.mainImage}
                alt={product.id}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:w-1/2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.id}</h1>
              <div className="space-y-4 text-gray-400 whitespace-pre-line">
                {product.description}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-400">
                <p>🕒 Delivery Time 🕒</p>
                <p>{product.deliveryTime}</p>
              </div>
              
              <div className="text-sm text-gray-400">
                <p>🔍 {product.trackingInfo}</p>
              </div>

              <div className="space-y-2">
                <a href={product.telegramChannel} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Join Telegram Channel
                  </Button>
                </a>
                
                <a href={product.discordChannel} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Join Discord Channel
                  </Button>
                </a>

                <a href={product.liveChat} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Live Chat
                  </Button>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="w-full">Payment Link</Button>
                <Button variant="secondary" className="w-full">How To Buy</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Images Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Photos & Videos</h2>
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {product.images.map((image, index) => (
                <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${product.id} - Image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedProducts.map((relatedProduct, index) => (
              <Link key={index} to={`/product/${relatedProduct.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src={relatedProduct.image}
                        alt={`Related Product ${relatedProduct.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{relatedProduct.id}</h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;