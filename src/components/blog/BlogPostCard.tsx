
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface BlogPostCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    read_time: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    created_at: string;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit: (post: BlogPostCardProps['post']) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const BlogPostCard = ({ post, isSelected, onSelect, onEdit, onDelete, isAdmin }: BlogPostCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      {isAdmin && onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
          />
        </div>
      )}
      
      <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 bg-gray-900/50 border-gray-800 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-0">
          <div className="relative aspect-video">
            <img
              src={post.image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(post)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-400">{post.category}</span>
              <span className="text-xs text-gray-400">{post.read_time}</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
            <div className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlogPostCard;
