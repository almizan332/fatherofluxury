
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface BlogPostCardProps {
  post: {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    date: string;
    readTime: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
  };
  onEdit: (post: BlogPostCardProps['post']) => void;
  onDelete: (id: number) => void;
}

const BlogPostCard = ({ post, onEdit, onDelete }: BlogPostCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
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
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(post)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(post.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
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
  );
};

export default BlogPostCard;
