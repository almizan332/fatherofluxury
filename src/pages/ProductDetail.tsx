import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingCart, ExternalLink } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();

  // This would come from an API in a real app
  const product = {
    id,
    title: `YY${id}`,
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
      ][index % 10]}?auto=format&fit=crop&w=800&q=80`,
    })),
    description: "🚚 Presys is Free Shipping 🚚 🚚\n\n💫 How to Order 💫\nChoose a Code from the Photo and send "Pictures + Code + Size(if Needed)" with a Message to the Seller.",
    deliveryTime: "Order Processing: 3-5 working days. Delivery: 15-20 working days.",
    trackingInfo: "Track your parcel with the provided logistics tracking number at www.17track.net",
    telegramChannel: "https://t.me/alistore/GOAQ16FQMJZ",
    discordChannel: "https://discord.gg/FKPUY1KRB",
    liveChat: "https://t.me/tmstore0",
    reviews: "@tmstore_reviews"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header stays the same as Index page */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-semibold gradient-text"
          >
            Ali Hidden
          </motion.div>
          
          <nav className="hidden md:flex space-x-6 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/categories" className="hover:text-white transition-colors">Categories</a>
            <a href="/shop" className="hover:text-white transition-colors">Shop</a>
            <a href="/telegram" className="hover:text-white transition-colors">Telegram</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 w-[200px]"
              />
              <Button size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-2">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              {product.images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative aspect-square"
                >
                  <img
                    src={image.url}
                    alt={`${product.title} - Image ${image.id}`}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Product Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <div className="space-y-4 text-gray-400">
                  <p className="whitespace-pre-line">{product.description}</p>
                  <p>{product.deliveryTime}</p>
                  <p>{product.trackingInfo}</p>
                </div>

                <div className="space-y-4 pt-6">
                  <Button className="w-full" size="lg">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Payment Link
                  </Button>
                  
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat With Us
                  </Button>

                  <div className="grid grid-cols-2 gap-4">
                    <a href={product.telegramChannel} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Telegram
                      </Button>
                    </a>
                    <a href={product.discordChannel} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Discord
                      </Button>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  );
};

export default ProductDetail;
