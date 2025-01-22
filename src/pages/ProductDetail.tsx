import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const ProductDetail = () => {
  const { id } = useParams();

  const product = {
    id,
    title: `YY${id}`,
    description: '🚚 Presys is Free Shipping 🚚 🚚\n\n💫 How to Order 💫\nChoose a Code from the Photo and send "Pictures + Code + Size(if Needed)" with a Message to the Seller.',
    deliveryTime: "Order Processing: 3-5 working days. Delivery: 15-20 working days.",
    trackingInfo: "Track your parcel with the provided logistics tracking number at www.17track.net",
    telegramChannel: "https://t.me/alistore/GOAQ16FQMJZ",
    discordChannel: "https://discord.gg/FKPUY1KRB",
    liveChat: "https://t.me/tmstore0",
    reviews: "@tmstore_reviews",
    mainImage: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80",
    images: Array.from({ length: 10 }).map((_, index) => ({
      id: index + 1,
      url: `https://images.unsplash.com/photo-${[
        '1649972904349-6e44c42644a7',
        '1488590528505-98d2b5aba04b',
        '1518770660439-4636190af475',
        '1461749280684-dccba630e2f6',
        '1486312338219-ce68d2c6f44d',
        '1581091226825-a6a2a5aee158',
        '1485827404703-89b55fcc595e',
        '1526374965328-7f61d4dc18c5',
        '1531297484001-80022131f5a1',
        '1487058792275-0ad4aaf24ca7',
      ][index % 10]}?auto=format&fit=crop&w=400&q=80`,
    })),
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
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:w-1/2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
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
                    <MessageCircle className="mr-2 h-4 w-4" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.images.map((image) => (
              <div key={image.id} className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={image.url}
                  alt={`${product.title} - Image ${image.id}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Link key={index} to={`/product/${Number(id) + index + 1}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src={`https://images.unsplash.com/photo-${[
                          '1649972904349-6e44c42644a7',
                          '1488590528505-98d2b5aba04b',
                          '1518770660439-4636190af475',
                          '1461749280684-dccba630e2f6',
                        ][index]}?auto=format&fit=crop&w=400&q=80`}
                        alt={`Related Product ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">YY{Number(id) + index + 1}</h3>
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