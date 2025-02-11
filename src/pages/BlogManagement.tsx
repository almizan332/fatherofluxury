import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import BlogPostForm from "@/components/blog/BlogPostForm";
import BlogList from "@/components/blog/BlogList";
import { useBlogPosts, BlogPost } from "@/hooks/blog/useBlogPosts";

const BlogManagement = () => {
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const {
    blogPosts,
    handleDelete,
    handleSave,
  } = useBlogPosts();

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

  const onSave = async (postData: Omit<BlogPost, 'id' | 'created_at'>) => {
    const success = await handleSave(postData, editingPost?.id);
    if (success) {
      setIsAddDialogOpen(false);
      setEditingPost(null);
    }
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
            onCreatePost={() => handleAction(() => {
              setEditingPost(null);
              setIsAddDialogOpen(true);
            })}
            onEdit={(post) => handleAction(() => {
              setEditingPost(post);
              setIsAddDialogOpen(true);
            })}
            onDelete={(id) => handleAction(() => handleDelete(id))}
          />

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit' : 'Add'} Blog Post</DialogTitle>
              </DialogHeader>
              <BlogPostForm
                initialData={editingPost}
                onSave={onSave}
                onCancel={() => {
                  setIsAddDialogOpen(false);
                  setEditingPost(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BlogManagement;
