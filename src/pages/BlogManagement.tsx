
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogPostForm from "@/components/blog/BlogPostForm";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  read_time: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  created_at: string;
}

const BlogManagement = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const { toast } = useToast();

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    }
  };

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

  const handleDelete = async (id: string) => {
    handleAction(async () => {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setBlogPosts(posts => posts.filter(post => post.id !== id));
        setSelectedPosts(selected => selected.filter(postId => postId !== id));
        toast({
          title: "Blog post deleted",
          description: "The blog post has been successfully deleted.",
        });
      } catch (error: any) {
        console.error('Error deleting blog post:', error);
        toast({
          title: "Error",
          description: "Failed to delete blog post",
          variant: "destructive",
        });
      }
    });
  };

  const handleBulkDelete = async () => {
    handleAction(async () => {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .in('id', selectedPosts);

        if (error) throw error;

        setBlogPosts(posts => posts.filter(post => !selectedPosts.includes(post.id)));
        setSelectedPosts([]);
        toast({
          title: "Posts deleted",
          description: `${selectedPosts.length} posts have been successfully deleted.`,
        });
      } catch (error: any) {
        console.error('Error deleting blog posts:', error);
        toast({
          title: "Error",
          description: "Failed to delete blog posts",
          variant: "destructive",
        });
      }
    });
  };

  const handleBulkEdit = () => {
    handleAction(() => {
      setBlogPosts(posts => 
        posts.map(post => 
          selectedPosts.includes(post.id) 
            ? { ...post, category: "Edited Category" }
            : post
        )
      );
      toast({
        title: "Posts updated",
        description: `${selectedPosts.length} posts have been successfully updated.`,
      });
      setSelectedPosts([]);
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

  const handleSave = async (postData: Omit<BlogPost, 'id' | 'created_at'>) => {
    handleAction(async () => {
      try {
        if (editingPost) {
          const { error } = await supabase
            .from('blog_posts')
            .update(postData)
            .eq('id', editingPost.id);

          if (error) throw error;

          setBlogPosts(posts => 
            posts.map(post => post.id === editingPost.id ? { ...post, ...postData } : post)
          );
          toast({
            title: "Blog post updated",
            description: "The blog post has been successfully updated.",
          });
        } else {
          const { data, error } = await supabase
            .from('blog_posts')
            .insert([postData])
            .select();

          if (error) throw error;
          if (data) {
            setBlogPosts(posts => [...posts, data[0]]);
            toast({
              title: "Blog post created",
              description: "The new blog post has been successfully created.",
            });
          }
        }
        setIsAddDialogOpen(false);
        setEditingPost(null);
      } catch (error: any) {
        console.error('Error saving blog post:', error);
        toast({
          title: "Error",
          description: "Failed to save blog post",
          variant: "destructive",
        });
      }
    });
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
            {/* Sidebar content from Dashboard */}
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
                        onSave={handleSave}
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
              <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label htmlFor="selectAll" className="text-sm">
                    Select All ({selectedPosts.length}/{filteredPosts.length})
                  </label>
                </div>

                {selectedPosts.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkEdit}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Bulk Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {selectedPosts.length} selected posts. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBulkDelete}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            )}

            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    isSelected={selectedPosts.includes(post.id)}
                    onSelect={() => togglePostSelection(post.id)}
                    onEdit={(post) => {
                      handleAction(() => {
                        setEditingPost(post);
                        setIsAddDialogOpen(true);
                      });
                    }}
                    onDelete={handleDelete}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BlogManagement;
