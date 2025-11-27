
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 120;

const Shop = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams();
  const categoryId = parseInt(id || "1");
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery === "" || 
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.product_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
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
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/categories" className="hover:text-white transition-colors">Categories</Link>
            <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
            <a href="/telegram" className="hover:text-white transition-colors">Telegram</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 w-[200px] pr-16"
              />
              <div className="absolute right-0 top-0 h-full flex items-center">
                {searchQuery && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={clearSearch}
                    className="h-full px-2 hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-full px-2">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6 gradient-text text-right"
          >
            {searchQuery ? `Search Results (${filteredProducts.length})` : `All Products (${filteredProducts.length})`}
          </motion.h1>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={clearSearch}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {paginatedProducts.map((product, index) => (
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
                              src={product.first_image || "/placeholder.svg"}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="text-sm font-medium text-gray-200 text-right line-clamp-2">{product.title}</h3>
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

              {totalPages > 1 && (
                <div className="mt-8 mb-12">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (page === 1 || page === totalPages) return true;
                          if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                          return false;
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                isActive={currentPage === page}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </main>
      </ScrollArea>
    </div>
  );
};

export default Shop;
