
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import BlogPostForm from "@/components/blog/BlogPostForm";
import { BlogPost } from "@/hooks/blog/useBlogPosts";
import { useBlogPosts } from "@/hooks/blog/useBlogPosts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BlogPostFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { handleSave } = useBlogPosts();
  const [loading, setLoading] = useState(!!id);
  const [postData, setPostData] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPostData(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
        navigate("/admin/blog-management");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, toast, navigate]);

  const onSave = async (postData: Omit<BlogPost, 'id' | 'created_at'>) => {
    const success = await handleSave(postData, id);
    if (success) {
      toast({
        title: "Success",
        description: id ? "Blog post updated successfully" : "Blog post created successfully",
      });
      navigate("/admin/blog-management");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
              initialData={postData}
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
