
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Edit, Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<null | typeof blogPosts[0]>(null);
  const { toast } = useToast();

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setBlogPosts(posts => posts.filter(post => post.id !== id));
    toast({
      title: "Blog post deleted",
      description: "The blog post has been successfully deleted.",
    });
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <ScrollArea className="flex-grow">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold"
            >
              Blog Posts
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gray-900/50 border-gray-800">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingPost(post);
                            setIsAddDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(post.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Link to={`/blog/${post.id}`}>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-blue-400">{post.category}</span>
                          <span className="text-xs text-gray-400">{post.readTime}</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                        <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                        <div className="text-xs text-gray-500">{post.date}</div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </main>
      </ScrollArea>

      <Footer />
    </div>
  );
};

interface BlogPostFormProps {
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const BlogPostForm = ({ initialData, onSave, onCancel }: BlogPostFormProps) => {
  const [formData, setFormData] = useState(initialData || {
    title: "",
    excerpt: "",
    content: "",
    image: "",
    category: "",
    readTime: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="readTime">Read Time</Label>
            <Input
              id="readTime"
              value={formData.readTime}
              onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoTitle">SEO Title</Label>
          <Input
            id="seoTitle"
            value={formData.seoTitle}
            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoDescription">SEO Description</Label>
          <Textarea
            id="seoDescription"
            value={formData.seoDescription}
            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoKeywords">SEO Keywords</Label>
          <Input
            id="seoKeywords"
            value={formData.seoKeywords}
            onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
            placeholder="Comma-separated keywords"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Post
        </Button>
      </div>
    </form>
  );
};

export default Blog;
