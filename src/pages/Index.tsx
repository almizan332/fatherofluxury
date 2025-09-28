
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
import { getAnonymousClient } from "@/utils/supabaseAnonymous";

// Simple function to clean image URLs - just return as-is since they're already properly encoded
const sanitizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove any quotes and trim
  let cleanUrl = url.replace(/['"]/g, '').trim();
  
  // Ensure HTTPS for security
  if (cleanUrl.startsWith('http://')) {
    cleanUrl = cleanUrl.replace('http://', 'https://');
  }
  
  return cleanUrl;
};

const ITEMS_PER_BATCH = 120;

const Index = () => {
const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [todayPostsCount, setTodayPostsCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const { toast } = useToast();
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_BATCH);
  
  useEffect(() => {
    fetchProducts(currentPage);
    fetchStats();
  }, [currentPage]);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      console.log('Fetching products for anonymous access...');
      
      // Use single anonymous client instance
      const anonClient = getAnonymousClient();
      
      // First get the total count
      const { count } = await anonClient
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);
      
      // Calculate pagination range
      const startRange = (page - 1) * ITEMS_PER_BATCH;
      const endRange = startRange + ITEMS_PER_BATCH - 1;
      
      // Fetch products for current page
      const { data, error } = await anonClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(startRange, endRange);

      if (error) {
        console.error('Anonymous fetch error:', error);
        throw error;
      }

      if (data) {
        const typedProducts = data.map(product => ({
          ...product,
          // Map new fields to legacy fields for compatibility
          title: product.product_name,
          name: product.product_name,
          status: 'published' as const
        }));
        setProducts(typedProducts);
        console.log(`Anonymous access: loaded ${data.length} products of ${count} total`);
        console.log('First product image URL:', data[0]?.first_image);
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

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      console.log('Fetching stats for anonymous access...');
      
      // Use single anonymous client instance
      const anonClient = getAnonymousClient();
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);
      
      // Fetch today's products count
      const { count: todayProducts } = await anonClient
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString());
      
      setTodayPostsCount(todayProducts || 0);
      console.log('Anonymous stats loaded: today products =', todayProducts);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

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
            Latest Products
          </motion.h1>

          {/* Statistics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-300">Today's Products</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {statsLoading ? "..." : todayPostsCount}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-300">Total Products</p>
                    <p className="text-2xl font-bold text-green-400">
                      {loading && totalCount === 0 ? "..." : totalCount.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-300">Current Page</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {currentPage} of {totalPages}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {loading && products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          ) : (
            <>
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
                               src={sanitizeImageUrl(product.first_image) || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80'}
                               alt={product.product_name || product.title}
                               className="w-full h-full object-cover"
                               loading="lazy"
                               referrerPolicy="no-referrer"
                               onError={(e) => {
                                 // Comprehensive error logging for debugging
                                 const errorDetails = {
                                   originalSrc: e.currentTarget.src,
                                   productName: product.product_name,
                                   userAgent: navigator.userAgent,
                                   hostname: window.location.hostname,
                                   protocol: window.location.protocol,
                                   origin: window.location.origin,
                                   timestamp: new Date().toISOString(),
                                   errorType: 'IMAGE_LOAD_FAILED',
                                   // Check if it's likely a CORS issue
                                   likelyCORS: e.currentTarget.src.includes('digitaloceanspaces.com'),
                                   // Check if URL looks malformed
                                   suspiciousChars: /[^\w\-._~:/?#[\]@!$&'()*+,;=%]/.test(e.currentTarget.src)
                                 };
                                 
                                 console.error('🚨 Image Load Error - Cross-browser issue detected:', errorDetails);
                                 
                                 // Try alternative loading strategy first
                                 if (!e.currentTarget.dataset.retried && product.first_image) {
                                   e.currentTarget.dataset.retried = 'true';
                                   // Try with different approach - construct a clean URL manually
                                   const cleanUrl = product.first_image.split('/').map(part => 
                                     encodeURIComponent(decodeURIComponent(part.replace(/['"]/g, '')))
                                   ).join('/').replace(/%3A/g, ':').replace(/%2F/g, '/');
                                   
                                   console.log('🔄 Retrying with cleaned URL:', cleanUrl);
                                   e.currentTarget.src = cleanUrl;
                                   return;
                                 }
                                 
                                 // Final fallback to placeholder
                                 console.log('🎨 Using fallback placeholder image');
                                 e.currentTarget.src = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80';
                               }}
                              onLoad={() => {
                                console.log('Homepage image loaded:', product.first_image);
                              }}
                            />
                           </div>
                          <div className="p-3">
                             <h3 className="text-sm font-medium text-gray-200 line-clamp-2">{product.title}</h3>
                             <div className="flex justify-between items-center mt-2">
                               <p className="text-xs text-gray-400">
                                 {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'No date'}
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
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default Index;
