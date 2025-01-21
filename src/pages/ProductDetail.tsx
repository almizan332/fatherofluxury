import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingCart, ExternalLink, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const ProductDetail = () => {
  const { id } = useParams();

  // This would come from an API in a real app
  const product = {
    id,
    title: `YY${id}`,
    category: "Category 1", // Added category
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
    description: '🚚 Presys is Free Shipping 🚚 🚚\n\n💫 How to Order 💫\nChoose a Code from the Photo and send "Pictures + Code + Size(if Needed)" with a Message to the Seller.',
    deliveryTime: "Order Processing: 3-5 working days. Delivery: 15-20 working days.",
    trackingInfo: "Track your parcel with the provided logistics tracking number at www.17track.net",
    telegramChannel: "https://t.me/alistore/GOAQ16FQMJZ",
    discordChannel: "https://discord.gg/FKPUY1KRB",
    liveChat: "https://t.me/tmstore0",
    reviews: "@tmstore_reviews"
  };

  // Mock related products data (in real app, this would be filtered by category)
  const relatedProducts = Array.from({ length: 8 }).map((_, index) => ({
    id: Number(id) + index + 1,
    title: `YY${Number(id) + index + 1}`,
    image: `https://images.unsplash.com/photo-${[
      '1649972904349-6e44c42644a7',
      '1488590528505-98d2b5aba04b',
      '1518770660439-4636190af475',
      '1461749280684-dccba630e2f6',
    ][index % 4]}?auto=format&fit=crop&w=400&q=80`,
    category: product.category,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
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

          {/* Related Products Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 border-t border-gray-800 pt-16"
          >
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="transform transition-all duration-300"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-gray-900/50 border-gray-800">
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-gray-200">{relatedProduct.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">{relatedProduct.category}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        </main>
      </ScrollArea>
    </div>
  );
};

export default ProductDetail;