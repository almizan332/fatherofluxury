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

  const handleAction = (action: () => void) => {
    if (!isAdmin) {
      navigate("/login");
      toast({
        title: "Authentication Required",
        description: "Please log in as an admin to perform this action.",
      });
      return;
    }
    action();
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
            onCreatePost={() => handleAction(() => navigate("/dashboard/blog-management/add-blog"))}
            onEdit={(post) => handleAction(() => navigate(`/dashboard/blog-management/edit/${post.id}`))}
            onDelete={(id) => handleAction(() => handleDelete(id))}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BlogManagement;
