
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Category } from "./types";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: Category | null;
  newCategory: {
    name: string;
    image: string;
    gradient: string;
  };
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (value: string, field: 'name') => void;
  onSubmit: () => void;
}

const CategoryFormDialog = ({
  open,
  onOpenChange,
  editingCategory,
  newCategory,
  onImageUpload,
  onCategoryChange,
  onSubmit,
}: CategoryFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4 md:mx-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-purple-700">Category Name</label>
            <Input
              placeholder="Enter category name"
              value={editingCategory ? editingCategory.name : newCategory.name}
              onChange={(e) => onCategoryChange(e.target.value, 'name')}
              className="border-purple-200 focus:border-purple-500"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-purple-700">Category Image</label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="flex items-center gap-2 px-4 py-2 border border-purple-200 rounded-md cursor-pointer hover:bg-purple-50 text-purple-700"
              >
                <Image className="h-4 w-4" />
                Upload Image
              </label>
            </div>
            {(editingCategory?.image || newCategory.image) && (
              <div className="relative w-full h-32 rounded-md overflow-hidden border border-purple-200">
                <img
                  src={editingCategory ? editingCategory.image : newCategory.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <Button 
            onClick={onSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {editingCategory ? "Update Category" : "Add Category"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
