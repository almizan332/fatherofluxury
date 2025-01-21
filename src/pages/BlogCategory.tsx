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

// Generate blog posts for the category
const generatePosts = (count: number, category: string) => {
  return Array.from({ length: count }).map((_, index) => ({
    id: index + 1,
    title: `${category} Post ${index + 1}`,
    image: `https://images.unsplash.com/photo-${[
      '1488590528505-98d2b5aba04b',
      '1518770660439-4636190af475',
      '1461749280684-dccba630e2f6',
      '1486312338219-ce68d2c6f44d',
      '1581091226825-a6a2a5aee158',
      '1485827404703-89b55fcc595e',
    ][index % 6]}?auto=format&fit=crop&w=400&q=80`,
    excerpt: `This is a brief excerpt for ${category} post ${index + 1}...`,
    dateAdded: new Date(Date.now() - Math.random() * 10000000000),
  }));
};

const ITEMS_PER_PAGE = 12;

const BlogCategory = () => {
  const { category } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Generate 36 posts (3 pages worth)
  const posts = generatePosts(36, category || "Technology");
  const sortedPosts = [...posts].sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
  
  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <a href="/telegram" className="hover:text-white transition-colors">Telegram</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="search"
                placeholder="Search posts..."
                className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 w-[200px]"
              />
              <Button size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-2">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6 gradient-text"
          >
            {category} Posts ({sortedPosts.length} articles)
          </motion.h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedPosts.map((post, index) => (
              <Link to={`/blog/post/${post.id}`} key={post.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
                  whileHover={{ scale: 1.02 }}
                  className="transform transition-all duration-300"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-gray-900/50 border-gray-800">
                    <CardContent className="p-0">
                      <div className="aspect-video relative">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-200 mb-2">{post.title}</h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            {new Date(post.dateAdded).toLocaleDateString()}
                          </p>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Read More
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>

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
        </main>
      </ScrollArea>
    </div>
  );
};

export default BlogCategory;