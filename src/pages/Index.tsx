
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

const ITEMS_PER_PAGE = 120;

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setProducts(data);
        if (data.length === 0) {
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
  
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            Latest Products ({products.length} products)
          </motion.h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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

          {products.length > ITEMS_PER_PAGE && (
            <div className="mt-8 mb-12 overflow-x-auto">
              <Pagination>
                <PaginationContent className="flex-wrap justify-center gap-1">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} text-sm`}
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
                            className="text-sm"
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
    </div>
  );
};

export default Index;
