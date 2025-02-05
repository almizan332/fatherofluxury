import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryManagement from "@/components/CategoryManagement";

const Categories = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <ScrollArea className="flex-grow">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold gradient-text mb-8"
          >
            Categories
          </motion.h1>

          <CategoryManagement />
        </main>
      </ScrollArea>
      <Footer />
    </div>
  );
};

export default Categories;