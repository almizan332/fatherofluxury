
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubCategoryProducts } from "@/hooks/useSubCategoryProducts";
import { SubCategorySearch } from "@/components/subcategory/SubCategorySearch";
import { SubCategoryPagination } from "@/components/subcategory/SubCategoryPagination";

const ITEMS_PER_PAGE = 120;

const SubCategory = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { products, loading } = useSubCategoryProducts(category);
  const { toast } = useToast();

  // Get search query from URL parameters
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);

    // Show toast when no results found for search
    if (query && query.length > 2) {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      );
      
      if (results.length === 0) {
        toast({
          title: "No products found",
          description: `No products found matching "${query}"`,
          variant: "destructive",
        });
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayCategory = category === 'all' ? 'All' : category;
  const displayTitle = searchQuery 
    ? `Search Results for "${searchQuery}"` 
    : `${displayCategory} Products`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <ScrollArea className="flex-grow">
        <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            <SubCategorySearch
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              productCount={filteredProducts.length}
              categoryName={searchQuery ? `Search: "${searchQuery}"` : displayCategory}
            />

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="text-muted-foreground mt-4">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? `No products found matching "${searchQuery}"` : "No products found in this category."}
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {paginatedProducts.map((product, index) => (
                  <Link to={`/product/${product.id}`} key={product.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
                      whileHover={{ scale: 1.02 }}
                      className="transform transition-all duration-300"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-gray-900/50 border-gray-800 h-full">
                        <CardContent className="p-0 h-full flex flex-col">
                          <div className="aspect-square relative overflow-hidden">
                            <img
                              src={product.preview_image || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80'}
                              alt={product.name}
                              className="w-full h-full object-cover object-center"
                              loading="lazy"
                              style={{ 
                                minHeight: '100%',
                                maxHeight: '100%'
                              }}
                            />
                          </div>
                          <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-200 line-clamp-2 mb-2">{product.name}</h3>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-400">
                                {new Date(product.created_at).toLocaleDateString()}
                              </p>
                              <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                                View
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

            {filteredProducts.length > ITEMS_PER_PAGE && (
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
