
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/blog/useBlogPosts";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { blogPosts } = useBlogPosts();

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <ScrollArea className="flex-grow">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold gradient-text animate-gradient-text"
            >
              Blog Posts
            </motion.h1>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gray-900/50 border-gray-800">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <Link to={`/blog/${post.id}`}>
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                        <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                        <div className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {filteredPosts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl text-gray-500">No blog posts found</h3>
              </div>
            )}
          </div>
        </main>
      </ScrollArea>

      <Footer />
    </div>
  );
};

export default Blog;
