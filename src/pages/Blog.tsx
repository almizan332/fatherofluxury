import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    id: 1,
    title: "The Future of Technology",
    excerpt: "Exploring upcoming trends in tech and their impact on daily life...",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    category: "Technology",
    date: "2024-03-15",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Artificial Intelligence in 2024",
    excerpt: "How AI is transforming industries and creating new opportunities...",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    category: "AI",
    date: "2024-03-14",
    readTime: "8 min read"
  },
  // Add more blog posts here
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <ScrollArea className="flex-grow">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-8"
          >
            Blog Posts
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <Link to={`/blog/${post.id}`} key={post.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="transform transition-all duration-300"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-gray-900/50 border-gray-800">
                    <CardContent className="p-0">
                      <div className="relative aspect-video">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-blue-400">{post.category}</span>
                          <span className="text-xs text-gray-400">{post.readTime}</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                        <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                        <div className="text-xs text-gray-500">{post.date}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </main>
      </ScrollArea>

      <Footer />
    </div>
  );
};

export default Blog;
