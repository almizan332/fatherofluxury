
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/components/category/types";

export function useCategoryMutations(categories: Category[], setCategories: (categories: Category[]) => void) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const addCategory = async (newCategory: { name: string; image_url: string; gradient: string }) => {
    if (!isAdmin) {
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
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCategory = async (category: Category) => {
    if (!isAdmin) {
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
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!isAdmin) {
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
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
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
