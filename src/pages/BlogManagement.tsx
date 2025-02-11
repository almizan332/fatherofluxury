import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import BlogPostForm from "@/components/blog/BlogPostForm";
import BlogPostSelectionControls from "@/components/blog/BlogPostSelectionControls";
import BlogPostGrid from "@/components/blog/BlogPostGrid";
import { useBlogPosts, BlogPost } from "@/hooks/blog/useBlogPosts";

const BlogManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const {
    blogPosts,
    selectedPosts,
    setSelectedPosts,
    handleDelete,
    handleBulkDelete,
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

  const handleBulkEdit = () => {
    handleAction(() => {
      toast({
        title: "Bulk edit",
        description: "This feature is coming soon.",
      });
    });
  };

  const toggleSelectAll = () => {
    handleAction(() => {
      if (selectedPosts.length === filteredPosts.length) {
        setSelectedPosts([]);
      } else {
        setSelectedPosts(filteredPosts.map(post => post.id));
      }
    });
  };

  const togglePostSelection = (postId: string) => {
    handleAction(() => {
      setSelectedPosts(selected => 
        selected.includes(postId)
          ? selected.filter(id => id !== postId)
          : [...selected, postId]
      );
    });
  };

  const onSave = async (postData: Omit<BlogPost, 'id' | 'created_at'>) => {
    const success = await handleSave(postData, editingPost?.id);
    if (success) {
      setIsAddDialogOpen(false);
      setEditingPost(null);
    }
  };

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            {/* Sidebar content */}
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 p-6">
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-right w-full"
              >
                Blog Management
              </motion.h1>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Input
                    type="search"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
                
                {isAdmin && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => handleAction(() => setEditingPost(null))}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Post
                      </Button>
                    </DialogTrigger>
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
                )}
              </div>
            </div>

            {isAdmin && (
              <BlogPostSelectionControls
                selectedCount={selectedPosts.length}
                totalCount={filteredPosts.length}
                onSelectAll={toggleSelectAll}
                onBulkEdit={handleBulkEdit}
                onBulkDelete={handleBulkDelete}
              />
            )}

            <BlogPostGrid
              posts={filteredPosts}
              selectedPosts={selectedPosts}
              onSelect={togglePostSelection}
              onEdit={(post) => {
                handleAction(() => {
                  setEditingPost(post);
                  setIsAddDialogOpen(true);
                });
              }}
              onDelete={(id) => handleAction(() => handleDelete(id))}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BlogManagement;
