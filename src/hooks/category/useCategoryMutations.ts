
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/components/category/types";

export function useCategoryMutations(categories: Category[], setCategories: (categories: Category[]) => void) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      const isAdminUser = user?.email === 'homeincome08@gmail.com';
      setIsAdmin(isAdminUser);

      if (!user) {
        console.log('No authenticated user');
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      await checkAdminStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addCategory = async (newCategory: { name: string; image_url: string; gradient: string }) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You must be an admin to perform this action",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to perform this action",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return false;
    }

    if (!newCategory.image_url) {
      toast({
        title: "Error",
        description: "Please upload a category image",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.name,
          image_url: newCategory.image_url,
          gradient: newCategory.gradient,
        }])
        .select()
        .single();

      if (error) throw error;

      setCategories([data, ...categories]);
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCategory = async (category: Category) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You must be an admin to perform this action",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to perform this action",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          image_url: category.image_url,
          gradient: category.gradient,
          updated_at: new Date().toISOString(),
        })
        .eq('id', category.id)
        .select()
        .single();

      if (error) throw error;

      setCategories(categories.map(cat => 
        cat.id === category.id ? data : cat
      ));
      
      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You must be an admin to perform this action",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to perform this action",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter((cat) => cat.id !== id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    addCategory,
    updateCategory,
    deleteCategory,
    isAdmin,
  };
}
