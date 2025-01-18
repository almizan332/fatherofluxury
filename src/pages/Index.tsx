import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// Sample product data
const products = [
  {
    id: 1,
    title: "YY381",
    image: "/lovable-uploads/4aeceda8-d735-4126-ba71-14d10308f69e.png",
    category: "Bags",
  },
  // Add more items as needed
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
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
                className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
              />
              <Button size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-2">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={`https://picsum.photos/400/400?random=${index}`}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-200">Product YY{381 + index}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-400">Category</p>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6 text-center text-sm text-gray-400">
        <p>Copyright © AliHidden.com | Developed by My Dear Younger Brother. May God Bless Him.</p>
      </footer>
    </div>
  );
};

export default Index;