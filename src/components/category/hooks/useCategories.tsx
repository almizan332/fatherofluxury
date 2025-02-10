
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Category } from "../types";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "Smartphones",
      productCount: 156,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      name: "Laptops",
      productCount: 89,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
      gradient: "from-blue-500 to-cyan-500"
    }
  ]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleAddCategory = (newCategory: Omit<Category, 'id' | 'productCount'>) => {
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

    if (!newCategory.image) {
      toast({
        title: "Error",
        description: "Please upload a category image",
        variant: "destructive",
      });
      return;
    }

    const newId = Math.max(...categories.map(cat => cat.id), 0) + 1;
    const categoryToAdd = {
      id: newId,
      name: newCategory.name,
      productCount: 0,
      image: newCategory.image,
      gradient: newCategory.gradient
    };

    setCategories([...categories, categoryToAdd]);
    toast({
      title: "Success",
      description: "Category added successfully",
    });
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    if (!updatedCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setCategories(categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
    
    toast({
      title: "Success",
      description: "Category updated successfully",
    });
  };

  const handleDeleteCategory = (id: number) => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    setCategories(categories.filter((cat) => cat.id !== id));
    toast({
      title: "Success",
      description: "Category deleted successfully",
    });
  };

  return {
    categories,
    isAdmin,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
};
