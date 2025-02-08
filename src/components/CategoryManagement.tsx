
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  id: number;
  name: string;
  productCount: number;
  image: string;
  gradient: string;
}

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
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create a temporary URL for preview
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

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Category Management</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] mx-4 md:mx-0">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  placeholder="Category name"
                  value={editingCategory ? editingCategory.name : newCategory.name}
                  onChange={(e) => {
                    if (editingCategory) {
                      setEditingCategory({ ...editingCategory, name: e.target.value });
                    } else {
                      setNewCategory(prev => ({ ...prev, name: e.target.value }));
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-gray-500">Category Image</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Image className="h-4 w-4" />
                    Upload Image
                  </label>
                </div>
                {(editingCategory?.image || newCategory.image) && (
                  <div className="relative w-full h-32">
                    <img
                      src={editingCategory ? editingCategory.image : newCategory.image}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4 flex flex-col">
            <div className="relative aspect-video mb-4 rounded-md overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-60`} />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{category.name}</h3>
                <p className="text-sm text-gray-500">
                  {category.productCount} Products
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;

