
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import ChatbotWidget from "@/components/ChatbotWidget";

// Increased to show more products per page
const ITEMS_PER_PAGE = 120;

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0); 
  const { toast } = useToast();
  
  useEffect(() => {
    fetchProducts();
    fetchTotalCount();
  }, []);

  const fetchTotalCount = async () => {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      if (count !== null) {
        setTotalCount(count);
      }
    } catch (error: any) {
      console.error('Error fetching product count:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      // Use pagination to fetch only the products for the current page
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) {
        throw error;
      }

      if (data) {
        setProducts(data);
        if (data.length === 0 && currentPage === 1) {
          toast({
            title: "No products found",
            description: "There are currently no products to display.",
            duration: 3000,
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "There was an error loading the products.",
        variant: "destructive",
      });
    }
  };
  
  // Update fetchProducts when page changes
  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for unlimited pagination
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    if (totalPages > 0) {
      range.push(1);
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always show last page if there are multiple pages
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Add ellipsis where there are gaps
    for (let i = 0; i < uniqueRange.length; i++) {
      if (i === 0) {
        rangeWithDots.push(uniqueRange[i]);
      } else if (uniqueRange[i] - uniqueRange[i - 1] === 2) {
        rangeWithDots.push(uniqueRange[i - 1] + 1);
        rangeWithDots.push(uniqueRange[i]);
      } else if (uniqueRange[i] - uniqueRange[i - 1] !== 1) {
        rangeWithDots.push('...');
        rangeWithDots.push(uniqueRange[i]);
      } else {
        rangeWithDots.push(uniqueRange[i]);
      }
    }

    return rangeWithDots;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <ScrollArea className="flex-grow">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 gradient-text"
          >
            Latest Products ({totalCount} products)
          </motion.h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {products.map((product, index) => (
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

          {totalPages > 1 && (
            <div className="mt-8 mb-12 overflow-x-auto">
              <Pagination>
                <PaginationContent className="flex-wrap justify-center gap-1">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} text-sm`}
                    />
                  </PaginationItem>
                  
                  {getVisiblePages().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === '...' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          className="text-sm"
                          isActive={currentPage === page}
                          onClick={() => handlePageChange(page as number)}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} text-sm`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </main>
      </ScrollArea>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default Index;
