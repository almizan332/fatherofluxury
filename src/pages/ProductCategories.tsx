
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import CategoryFormDialog from "@/components/category/CategoryFormDialog";
import { useImageUpload } from "@/hooks/category/useImageUpload";

const ProductCategories = () => {
  const [newCategory, setNewCategory] = useState({ name: "", image_url: "", gradient: "from-purple-500 to-pink-500" });
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { categories, isLoading, fetchCategories } = useCategories();
  const { handleImageUpload } = useImageUpload();

  const handleAddCategory = async () => {
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
      const { error } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategory.name,
            image_url: newCategory.image_url,
            gradient: newCategory.gradient,
          }
        ]);

      if (error) throw error;

      await fetchCategories();
      setDialogOpen(false);
      setNewCategory({ name: "", image_url: "", gradient: "from-purple-500 to-pink-500" });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async (category: any) => {
    if (!category.name.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          image_url: category.image_url,
          gradient: category.gradient,
        })
        .eq('id', category.id);

      if (error) throw error;

      await fetchCategories();
      setDialogOpen(false);
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = await handleImageUpload(e);
    if (imageUrl) {
      if (editingCategory) {
        setEditingCategory({ ...editingCategory, image_url: imageUrl });
      } else {
        setNewCategory({ ...newCategory, image_url: imageUrl });
      }
    }
  };

  const handleCategoryChange = (value: string, field: 'name') => {
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [field]: value });
    } else {
      setNewCategory({ ...newCategory, [field]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-60`} />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Products: {category.product_count || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCategory(category);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No categories found. Add your first category above.
        </div>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingCategory={editingCategory}
        newCategory={newCategory}
        onImageUpload={onImageUpload}
        onCategoryChange={handleCategoryChange}
        onSubmit={editingCategory ? () => handleEditCategory(editingCategory) : handleAddCategory}
      />
    </div>
  );
};

export default ProductCategories;
