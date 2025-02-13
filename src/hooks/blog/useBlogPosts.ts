
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  created_at: string;
}

export const useBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const { toast } = useToast();

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

  const handleDelete = async (id: string) => {
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
  };

  const handleBulkDelete = async () => {
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
  };

  const handleSave = async (postData: Omit<BlogPost, 'id' | 'created_at'>, editingId?: string) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingId);

        if (error) throw error;

        setBlogPosts(posts => 
          posts.map(post => post.id === editingId ? { ...post, ...postData } : post)
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
      return true;
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  return {
    blogPosts,
    selectedPosts,
    setSelectedPosts,
    handleDelete,
    handleBulkDelete,
    handleSave,
  };
};
