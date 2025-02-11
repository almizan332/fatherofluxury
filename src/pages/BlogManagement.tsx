
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import BlogList from "@/components/blog/BlogList";
import { useBlogPosts, BlogPost } from "@/hooks/blog/useBlogPosts";

const BlogManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const { blogPosts, handleDelete } = useBlogPosts();

  const handleCreatePost = () => {
    if (!isAdmin) {
      navigate("/login");
      toast({
        title: "Authentication Required",
        description: "Please log in as an admin to perform this action.",
      });
      return;
    }
    navigate("/dashboard/blog-management/add-blog");
  };

  const handleEditPost = (post: BlogPost) => {
    if (!isAdmin) {
      navigate("/login");
      toast({
        title: "Authentication Required",
        description: "Please log in as an admin to perform this action.",
      });
      return;
    }
    navigate(`/dashboard/blog-management/edit/${post.id}`);
  };

  const handleDeletePost = (id: string) => {
    if (!isAdmin) {
      navigate("/login");
      toast({
        title: "Authentication Required",
        description: "Please log in as an admin to perform this action.",
      });
      return;
    }
    handleDelete(id);
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
