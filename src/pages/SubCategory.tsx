
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";

const generateProducts = (count: number, category: string) => {
  // Customize product data based on category
  const categoryImages: { [key: string]: string[] } = {
    Smartphones: [
      '1567581573103-17c45c86d948',
      '1511707171634-5f897ff02aa9',
      '1523206389153-c012fa067a6b',
      '1592434475716-7798d425d2e6',
      '1605170439002-42b4e777de60',
    ],
    Laptops: [
      '1496181133206-80ce9b88a853',
      '1525547719571-a2d4ac8945e2',
      '1504707748692-34f7c6d5c385',
      '1531297484001-80022131f5a1',
      '1498050108023-c5249f4df085',
    ],
    default: [
      '1649972904349-6e44c42644a7',
      '1488590528505-98d2b5aba04b',
      '1518770660439-4636190af475',
      '1461749280684-dccba630e2f6',
      '1486312338219-ce68d2c6f44d',
    ],
  };

  const images = categoryImages[category] || categoryImages.default;

  return Array.from({ length: count }).map((_, index) => ({
    id: index + 1,
    title: `${category} ${381 + index}`,
    image: `https://images.unsplash.com/photo-${images[index % images.length]}?auto=format&fit=crop&w=400&q=80`,
    dateAdded: new Date(Date.now() - Math.random() * 10000000000),
    price: Math.floor(Math.random() * 1000) + 100,
  }));
};

const ITEMS_PER_PAGE = 20;

const SubCategory = () => {
  const { category } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const products = generateProducts(60, category || 'default');
  const sortedProducts = [...products].sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
  
  const filteredProducts = sortedProducts.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    
    if (query && filteredProducts.length === 0) {
      toast({
        title: "No products found",
        description: "Try a different search term",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <ScrollArea className="flex-grow">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-6"
          >
            <h1 className="text-2xl font-bold gradient-text">
              {category} Products
            </h1>
            <p className="text-sm text-gray-400">
              {filteredProducts.length} products found
            </p>
          </motion.div>

          <div className="relative mb-6">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full md:w-[300px] bg-background border border-purple-700/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-2">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No products found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginatedProducts.map((product, index) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
                    whileHover={{ scale: 1.02 }}
                    className="transform transition-all duration-300"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-purple-700/20 bg-card hover:bg-accent">
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-medium line-clamp-2">{product.title}</h3>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm font-semibold text-purple-500">
                              ${product.price}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(product.dateAdded).toLocaleDateString()}
                            </p>
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
            <div className="mt-8 flex justify-center">
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
        </main>
      </ScrollArea>
      <Footer />
    </div>
  );
};

export default SubCategory;
