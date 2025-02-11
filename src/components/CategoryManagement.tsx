
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import CategoryCard from "./category/CategoryCard";
import CategoryFormDialog from "./category/CategoryFormDialog";
import { Category } from "./category/types";
import { supabase } from "@/integrations/supabase/client";

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: "",
    image_url: "",
    gradient: "from-purple-500 to-pink-500"
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      try {
        setSelectedImage(file);
        
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('category-images')
          .upload(fileName, file);

        if (error) throw error;

        const imageUrl = `${supabase.storage.from('category-images').getPublicUrl(fileName).data.publicUrl}`;
        
        if (editingCategory) {
          setEditingCategory({ ...editingCategory, image_url: imageUrl });
        } else {
          setNewCategory(prev => ({ ...prev, image_url: imageUrl }));
        }
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
      setDialogOpen(false);

      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    if (!editingCategory) return;

    if (!editingCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          image_url: editingCategory.image_url,
          gradient: editingCategory.gradient,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCategory.id)
        .select()
        .single();

      if (error) throw error;

      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? data : cat
      ));
      
      setEditingCategory(null);
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
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

  const handleCategoryChange = (value: string, field: 'name') => {
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [field]: value });
    } else {
      setNewCategory(prev => ({ ...prev, [field]: value }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-right">Category Management</h1>
        
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Category
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={(category) => {
              if (!isAdmin) {
                navigate("/login");
                return;
              }
              setEditingCategory(category);
              setDialogOpen(true);
            }}
            onDelete={handleDeleteCategory}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingCategory={editingCategory}
        newCategory={newCategory}
        onImageUpload={handleImageUpload}
        onCategoryChange={handleCategoryChange}
        onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
      />
    </div>
  );
};

export default CategoryManagement;
