import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

// Sample data for the grid
const gridItems = [
  {
    id: 1,
    image: "/lovable-uploads/63c8eeb4-eb2d-437e-94b2-770e6b063f7a.png",
    title: "Sneakers Collection",
  },
  // Add more items as needed with the same structure
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-4 gradient-text">Ali Hidden</h1>
          <nav className="flex justify-center gap-4 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/categories" className="hover:text-white transition-colors">Categories</a>
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </nav>
        </motion.div>
      </header>

      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {Array.from({ length: 20 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="break-inside-avoid mb-4 cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <img
                  src={`https://picsum.photos/400/${Math.floor(Math.random() * 200 + 300)}`}
                  alt={`Grid item ${index + 1}`}
                  className="w-full h-auto object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-200">Item {index + 1}</h3>
                  <p className="text-xs text-gray-400 mt-1">Description for item {index + 1}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Index;