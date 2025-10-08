
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
                <Card className="overflow-hidden hover:shadow-[var(--shadow-elegant)] transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50 hover:border-[hsl(var(--luxury-gold))]/30 h-full flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                    <Link to={`/blog/${post.id}`} className="flex-1 flex flex-col">
                      <div className="p-6 flex-1 flex flex-col">
                        <time className="text-xs text-muted-foreground/80 font-medium tracking-wide uppercase mb-3 block">
                          {new Date(post.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </time>
                        <h2 className="text-2xl font-bold mb-3 tracking-tight leading-tight line-clamp-2 group-hover:text-[hsl(var(--luxury-gold))] transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground text-base leading-relaxed line-clamp-3 flex-1 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="pt-3 border-t border-border/30">
                          <span className="text-sm text-[hsl(var(--luxury-gold))] font-semibold tracking-wide uppercase">
                            Read More →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {filteredPosts.length === 0 && (
              <div className="col-span-full text-center py-16">
                <h3 className="text-2xl text-muted-foreground font-medium">No blog posts found</h3>
                <p className="text-muted-foreground/70 mt-2">Try adjusting your search terms</p>
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
