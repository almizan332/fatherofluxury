
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PublicCategoryGrid from "@/components/category/PublicCategoryGrid";
import SEO from "@/components/SEO";

const Categories = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Shop Categories — FlyLink Hidden Links & Yupoo"
        description="Explore all FlyLink and Yupoo replica product categories: bags, watches, sneakers, apparel and accessories from trusted sellers."
        canonical="/categories"
      />
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
