
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

const ITEMS_PER_BATCH = 120;

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchInitialProducts();
  }, []);

  const fetchInitialProducts = async () => {
    try {
      setLoading(true);
      // First get the total count
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);
      
      // Then fetch the first batch
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })
        .range(0, ITEMS_PER_BATCH - 1);

      if (error) throw error;

      if (data) {
        setProducts(data);
        setHasMore(data.length === ITEMS_PER_BATCH && data.length < (count || 0));
        console.log(`Homepage loaded initial ${data.length} products of ${count} total`);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "There was an error loading the products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })
        .range(products.length, products.length + ITEMS_PER_BATCH - 1);

      if (error) throw error;

      if (data) {
        setProducts(prev => [...prev, ...data]);
        setHasMore(data.length === ITEMS_PER_BATCH);
        console.log(`Loaded ${data.length} more products, total: ${products.length + data.length}`);
      }
    } catch (error: any) {
      console.error('Error loading more products:', error);
      toast({
        title: "Error",
        description: "There was an error loading more products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            Latest Products ({products.length} products total)
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

          {hasMore && (
            <div className="mt-8 mb-12 text-center">
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {products.length} of {totalCount} products
              </div>
              <Button 
                onClick={loadMoreProducts}
                disabled={loading}
                size="lg"
                className="min-w-[150px]"
              >
                {loading ? "Loading..." : "Load More Products"}
              </Button>
            </div>
          )}

          {!hasMore && products.length > 0 && (
            <div className="mt-8 mb-12 text-center">
              <div className="text-sm text-muted-foreground">
                All {totalCount} products loaded
              </div>
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
