
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "./types";
import { uploadCategoryImage } from "@/utils/categoryImageUpload";

interface CategoryOperationsProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  onSuccess?: () => void;
}

export function CategoryOperations({ categories, setCategories, onSuccess }: CategoryOperationsProps) {
  const [newCategory, setNewCategory] = useState({
    name: "",
    image_url: "",
    gradient: "from-purple-500 to-pink-500"
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      try {
        setSelectedImage(file);
        const imageUrl = await uploadCategoryImage(file);
        setNewCategory(prev => ({ ...prev, image_url: imageUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddCategory = async () => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!newCategory.image_url) {
      toast({
        title: "Error",
        description: "Please upload a category image",
        variant: "destructive",
      });
      return;
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
      setNewCategory({
        name: "",
        image_url: "",
        gradient: "from-purple-500 to-pink-500"
      });
      setSelectedImage(null);
      
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    if (!isAdmin) {
      navigate("/login");
      return;
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

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isAdmin) {
      navigate("/login");
      return;
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
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  return {
    newCategory,
    setNewCategory,
    selectedImage,
    handleImageUpload,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    isAdmin,
  };
}
