
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryFormDialog from "./category/CategoryFormDialog";
import CategoryHeader from "./category/CategoryHeader";
import CategoryList from "./category/CategoryList";
import { useCategories } from "./category/hooks/useCategories";
import { Category } from "./category/types";

const CategoryManagement = () => {
  const [newCategory, setNewCategory] = useState({
    name: "",
    image: "",
    gradient: "from-purple-500 to-pink-500"
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { categories, isAdmin, handleAddCategory, handleUpdateCategory, handleDeleteCategory } = useCategories();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      if (editingCategory) {
        setEditingCategory({ ...editingCategory, image: imageUrl });
      } else {
        setNewCategory(prev => ({ ...prev, image: imageUrl }));
      }
    }
  };

  const handleCategoryChange = (value: string, field: 'name') => {
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [field]: value });
    } else {
      setNewCategory(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    if (editingCategory) {
      handleUpdateCategory(editingCategory);
    } else {
      handleAddCategory(newCategory);
    }
    setDialogOpen(false);
    setNewCategory({
      name: "",
      image: "",
      gradient: "from-purple-500 to-pink-500"
    });
    setSelectedImage(null);
    setEditingCategory(null);
  };

  return (
    <div className="p-4 md:p-6">
      <CategoryHeader 
        isAdmin={isAdmin}
        onAddClick={() => setDialogOpen(true)}
      />

      <CategoryList
        categories={categories}
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

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingCategory={editingCategory}
        newCategory={newCategory}
        onImageUpload={handleImageUpload}
        onCategoryChange={handleCategoryChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CategoryManagement;
