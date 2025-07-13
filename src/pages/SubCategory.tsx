
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubCategoryProducts } from "@/hooks/useSubCategoryProducts";
import { SubCategorySearch } from "@/components/subcategory/SubCategorySearch";
import { SubCategoryPagination } from "@/components/subcategory/SubCategoryPagination";

const SubCategory = () => {
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { products, loading, currentPage, totalPages, totalCount, handlePageChange } = useSubCategoryProducts(category);
  const { toast } = useToast();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query && filteredProducts.length === 0) {
      toast({
        title: "No products found",
        description: "Try a different search term",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <ScrollArea className="flex-grow">
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <SubCategorySearch
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              productCount={searchQuery ? filteredProducts.length : totalCount}
              categoryName={category}
            />

            {loading && products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredProducts.map((product, index) => (
                  <Link to={`/product/${product.id}`} key={product.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
                      whileHover={{ scale: 1.02 }}
                      className="transform transition-all duration-300"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-gray-900/50 border-gray-800">
                        <CardContent className="p-0">
                          <div className="aspect-square relative">
                            <img
                              src={product.preview_image || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-medium text-gray-200 line-clamp-2">{product.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-gray-400">
                                {new Date(product.created_at).toLocaleDateString()}
                              </p>
                              <Button variant="ghost" size="sm" className="text-xs">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}

            {!searchQuery && totalPages > 1 && (
              <SubCategoryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </motion.div>
        </main>
      </ScrollArea>
      <Footer />
    </div>
  );
};

export default SubCategory;
