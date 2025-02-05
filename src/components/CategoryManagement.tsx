import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create a temporary URL for preview
      const imageUrl = URL.createObjectURL(file);
      setNewCategory(prev => ({ ...prev, image: imageUrl }));
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

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter((cat) => cat.id !== id));
    toast({
      title: "Success",
      description: "Category deleted successfully",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6">
            <Plus className="h-4 w-4 mr-2" />
            Add New Category
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
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
                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-100"
                >
                  <Image className="h-4 w-4" />
                  Upload Image
                </label>
              </div>
              {newCategory.image && (
                <div className="relative w-full h-32">
                  <img
                    src={newCategory.image}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="relative aspect-video mb-4">
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover rounded-md"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-60 rounded-md`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{category.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {category.productCount} Products
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;