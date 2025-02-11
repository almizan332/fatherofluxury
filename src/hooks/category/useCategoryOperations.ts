
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/components/category/types";

export function useCategoryOperations(categories: Category[], setCategories: (categories: Category[]) => void) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuthError = () => {
    toast({
      title: "Unauthorized",
      description: "You must be an admin to perform this action",
      variant: "destructive",
    });
    navigate("/login");
    return false;
  };

  const addCategory = async (newCategory: { name: string; image_url: string; gradient: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user?.email !== 'homeincome08@gmail.com') {
      return handleAuthError();
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user?.email !== 'homeincome08@gmail.com') {
      return handleAuthError();
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user?.email !== 'homeincome08@gmail.com') {
      return handleAuthError();
    }

    try {
      // First, delete all products in this category
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('category_id', id);

      if (productsError) throw productsError;

      // Then delete the category
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (categoryError) throw categoryError;

      setCategories(categories.filter((cat) => cat.id !== id));
      toast({
        title: "Success",
        description: "Category and associated products deleted successfully",
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

  const deleteAllCategories = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user?.email !== 'homeincome08@gmail.com') {
      return handleAuthError();
    }

    try {
      // First, delete all products
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .neq('id', '');  // This deletes all products

      if (productsError) throw productsError;

      // Then delete all categories
      const { error: categoriesError } = await supabase
        .from('categories')
        .delete()
        .neq('id', '');  // This deletes all categories

      if (categoriesError) throw categoriesError;

      setCategories([]);
      toast({
        title: "Success",
        description: "All categories and products have been deleted",
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting all categories:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete all categories",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    addCategory,
    updateCategory,
    deleteCategory,
    deleteAllCategories,
  };
}
