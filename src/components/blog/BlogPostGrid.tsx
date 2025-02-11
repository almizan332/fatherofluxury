
import { ScrollArea } from "@/components/ui/scroll-area";
import BlogPostCard from "./BlogPostCard";
import { BlogPost } from "@/hooks/blog/useBlogPosts";

interface BlogPostGridProps {
  posts: BlogPost[];
  selectedPosts: string[];
  onSelect: (postId: string) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const BlogPostGrid = ({
  posts,
  selectedPosts,
  onSelect,
  onEdit,
  onDelete,
  isAdmin,
}: BlogPostGridProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard
            key={post.id}
            post={post}
            isSelected={selectedPosts.includes(post.id)}
            onSelect={() => onSelect(post.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default BlogPostGrid;
