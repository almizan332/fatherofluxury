
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
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h1 className="text-3xl font-bold text-purple-800 mb-8">
              Category Management
            </h1>

            <CategoryManagement />
          </motion.div>
        </main>
      </ScrollArea>
      <Footer />
    </div>
  );
};

export default Categories;
