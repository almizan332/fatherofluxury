
import { useState } from "react";
import CategoryCard from "./category/CategoryCard";
import CategoryFormDialog from "./category/CategoryFormDialog";
import CategoryActions from "./category/CategoryActions";
import { useCategories } from "@/hooks/useCategories";
import { CategoryOperations } from "./category/CategoryOperations";
import { Category } from "./category/types";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

const CategoryManagement = () => {
  const { categories, setCategories, isLoading, fetchCategories } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    newCategory,
    setNewCategory,
    handleImageUpload,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleDeleteAllCategories,
    isAdmin,
  } = CategoryOperations({ 
    categories, 
    setCategories,
    onSuccess: () => setDialogOpen(false)
  });

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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text animate-gradient-text">
            Category Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Create and manage your product categories
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <CategoryActions 
            isAdmin={isAdmin} 
            onAddClick={() => setDialogOpen(true)} 
          />
          {isAdmin && categories.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Categories</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all categories and their associated products. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllCategories} className="bg-red-600 hover:bg-red-700">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={(category) => {
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
        onSubmit={editingCategory ? () => handleUpdateCategory(editingCategory) : handleAddCategory}
      />
    </div>
  );
};

export default CategoryManagement;
