import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import BlogList from "@/components/blog/BlogList";
import { useBlogPosts, BlogPost } from "@/hooks/blog/useBlogPosts";

const BlogManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { blogPosts, handleDelete } = useBlogPosts();

  const handleCreatePost = () => {
    navigate("/dashboard/blog-management/add-blog");
  };

  const handleEditPost = (post: BlogPost) => {
    navigate(`/dashboard/blog-management/edit/${post.id}`);
  };

  const handleDeletePost = (id: string) => {
    handleDelete(id);
    toast({
      title: "Success",
      description: "Blog post deleted successfully",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            {/* Sidebar content */}
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 p-6">
          <BlogList
            posts={blogPosts}
            onCreatePost={handleCreatePost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BlogManagement;
