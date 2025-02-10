import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogPostForm from "@/components/blog/BlogPostForm";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const initialBlogPosts = [
  {
    id: 1,
    title: "The Future of Technology",
    excerpt: "Exploring upcoming trends in tech and their impact on daily life...",
    content: "Full content here...",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    category: "Technology",
    date: "2024-03-15",
    readTime: "5 min read",
    seoTitle: "The Future of Technology in 2024 | Company Name",
    seoDescription: "Discover the latest technology trends and their impact on daily life. Learn about AI, automation, and digital transformation.",
    seoKeywords: "technology trends, future tech, AI, automation"
  },
  {
    id: 2,
    title: "Artificial Intelligence in 2024",
    excerpt: "How AI is transforming industries and creating new opportunities...",
    content: "Full content here...",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    category: "AI",
    date: "2024-03-14",
    readTime: "8 min read",
    seoTitle: "AI Trends 2024: Industry Transformation | Company Name",
    seoDescription: "Explore how artificial intelligence is revolutionizing industries and creating new opportunities in 2024.",
    seoKeywords: "AI, artificial intelligence, machine learning, industry transformation"
  },
];

const BlogManagement = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<null | typeof blogPosts[0]>(null);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const { toast } = useToast();

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    navigate("/login");
    return null;
  }

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setBlogPosts(posts => posts.filter(post => post.id !== id));
    setSelectedPosts(selected => selected.filter(postId => postId !== id));
    toast({
      title: "Blog post deleted",
      description: "The blog post has been successfully deleted.",
    });
  };

  const handleBulkDelete = () => {
    setBlogPosts(posts => posts.filter(post => !selectedPosts.includes(post.id)));
    setSelectedPosts([]);
    toast({
      title: "Posts deleted",
      description: `${selectedPosts.length} posts have been successfully deleted.`,
    });
  };

  const handleBulkEdit = () => {
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
  };

  const toggleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(post => post.id));
    }
  };

  const togglePostSelection = (postId: number) => {
    setSelectedPosts(selected => 
      selected.includes(postId)
        ? selected.filter(id => id !== postId)
        : [...selected, postId]
    );
  };

  const handleSave = (postData: any) => {
    if (editingPost) {
      setBlogPosts(posts => 
        posts.map(post => post.id === editingPost.id ? { ...post, ...postData } : post)
      );
      toast({
        title: "Blog post updated",
        description: "The blog post has been successfully updated.",
      });
    } else {
      setBlogPosts(posts => [...posts, { ...postData, id: Math.max(...posts.map(p => p.id)) + 1 }]);
      toast({
        title: "Blog post created",
        description: "The new blog post has been successfully created.",
      });
    }
    setIsAddDialogOpen(false);
    setEditingPost(null);
  };

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
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingPost(null)}>
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
              </div>
            </div>

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

            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    isSelected={selectedPosts.includes(post.id)}
                    onSelect={() => togglePostSelection(post.id)}
                    onEdit={(post) => {
                      setEditingPost(post);
                      setIsAddDialogOpen(true);
                    }}
                    onDelete={handleDelete}
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
