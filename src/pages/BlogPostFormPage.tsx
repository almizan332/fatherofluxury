
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BlogPostForm from "@/components/blog/BlogPostForm";
import { BlogPost } from "@/hooks/blog/useBlogPosts";
import { useBlogPosts } from "@/hooks/blog/useBlogPosts";

const BlogPostFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { handleSave } = useBlogPosts();

  const onSave = async (postData: Omit<BlogPost, 'id' | 'created_at'>) => {
    const success = await handleSave(postData, id);
    if (success) {
      toast({
        title: "Success",
        description: id ? "Blog post updated successfully" : "Blog post created successfully",
      });
      navigate("/dashboard/blog-management");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(240_10%_5%)] to-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/blog-management")}
            className="mb-6 hover:bg-secondary/50 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Blog Management
          </Button>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              {id ? "Edit Blog Post" : "Create New Blog Post"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {id ? "Update your luxury content" : "Share your story with the world"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-[var(--shadow-elegant)]">
          <div className="p-8 lg:p-12">
            <BlogPostForm
              initialData={null}
              onSave={onSave}
              onCancel={() => navigate("/admin/blog-management")}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BlogPostFormPage;
