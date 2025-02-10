
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import CategoryCard from "./category/CategoryCard";
import CategoryFormDialog from "./category/CategoryFormDialog";
import { Category } from "./category/types";

const CategoryManagement = () => {
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
  
  const [newCategory, setNewCategory] = useState({
    name: "",
    image: "",
    gradient: "from-purple-500 to-pink-500"
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Simulated auth check - replace with your actual auth logic
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    navigate("/login");
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAddCategory = () => {
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
    setNewCategory({
      name: "",
      image: "",
      gradient: "from-purple-500 to-pink-500"
    });
    setSelectedImage(null);
    setDialogOpen(false);

    toast({
      title: "Success",
      description: "Category added successfully",
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    if (!editingCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setCategories(categories.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    ));
    
    setEditingCategory(null);
    setDialogOpen(false);
    toast({
      title: "Success",
      description: "Category updated successfully",
    });
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter((cat) => cat.id !== id));
    toast({
      title: "Success",
      description: "Category deleted successfully",
    });
  };

  const handleCategoryChange = (value: string, field: 'name') => {
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [field]: value });
    } else {
      setNewCategory(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-right">Category Management</h1>
        
        <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add New Category
        </Button>
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
