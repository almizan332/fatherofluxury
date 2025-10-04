
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BlogPost } from "@/hooks/blog/useBlogPosts";

interface BlogPostCardProps {
  post: BlogPost;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const BlogPostCard = ({ post, isSelected, onSelect, onEdit, onDelete, isAdmin }: BlogPostCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative h-full"
    >
      {isAdmin && onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-background/80 backdrop-blur-sm border-2 data-[state=checked]:bg-[hsl(var(--luxury-gold))] data-[state=checked]:border-[hsl(var(--luxury-gold))]"
          />
        </div>
      )}
      
      <Card className={`overflow-hidden h-full transition-all duration-500 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-[var(--shadow-luxury)] hover:border-[hsl(var(--luxury-gold))]/30 hover:-translate-y-2 ${isSelected ? 'ring-2 ring-[hsl(var(--luxury-gold))] shadow-[var(--shadow-luxury)]' : ''}`}>
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(post)}
                  className="h-9 w-9 p-0 bg-background/90 backdrop-blur-sm hover:bg-[hsl(var(--luxury-gold))]/20 hover:text-[hsl(var(--luxury-gold))] border border-border/50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="h-9 w-9 p-0 bg-destructive/90 backdrop-blur-sm hover:bg-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(var(--luxury-gold))]/30 to-transparent" />
              <time className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                {new Date(post.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </time>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(var(--luxury-gold))]/30 to-transparent" />
            </div>
            
            <h2 className="text-xl font-bold mb-3 line-clamp-2 tracking-tight group-hover:text-[hsl(var(--luxury-gold))] transition-colors duration-300">
              {post.title}
            </h2>
            
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
              {post.excerpt}
            </p>
            
            <div className="pt-4 border-t border-border/30">
              <span className="text-xs text-[hsl(var(--luxury-gold))] font-semibold tracking-wider uppercase">
                Read More →
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlogPostCard;
