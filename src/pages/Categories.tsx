
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PublicCategoryGrid from "@/components/category/PublicCategoryGrid";

const Categories = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <ScrollArea className="flex-grow">
        <main className="container mx-auto px-4 py-12">
          <PublicCategoryGrid />
        </main>
      </ScrollArea>
      <Footer />
    </div>
  );
};

export default Categories;
