import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { useParams } from "react-router-dom";

const BlogPost = () => {
  const { id } = useParams();

  // This would typically come from an API
  const post = {
    title: "The Future of E-commerce",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    date: "March 15, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    author: "John Doe"
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden bg-gray-900/50 border-gray-800">
              <div className="aspect-video relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4 gradient-text">{post.title}</h1>
                <div className="flex items-center space-x-4 text-gray-400 mb-6">
                  <span className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {post.date}
                  </span>
                  <span className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readTime}
                  </span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {post.content}
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-sm text-gray-400">
                    Written by <span className="text-purple-400">{post.author}</span>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </main>
      </ScrollArea>
    </div>
  );
};

export default BlogPost;