
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BlogPostForm from "@/components/blog/BlogPostForm";
import { BlogPost } from "@/hooks/blog/useBlogPosts";
import { useBlogPosts } from "@/hooks/blog/useBlogPosts";

const BlogPostFormPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleSave } = useBlogPosts();

  const onSave = async (postData: Omit<BlogPost, 'id' | 'created_at'>) => {
    const success = await handleSave(postData);
    if (success) {
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      navigate("/dashboard/blog-management");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/blog-management")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog List
        </Button>
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
      </div>

      <Card className="p-6">
        <BlogPostForm
          initialData={null}
          onSave={onSave}
          onCancel={() => navigate("/dashboard/blog-management")}
        />
      </Card>
    </div>
  );
};

export default BlogPostFormPage;
