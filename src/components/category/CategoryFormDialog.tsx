
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
          <DialogTitle>
            {editingCategory ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              placeholder="Category name"
              value={editingCategory ? editingCategory.name : newCategory.name}
              onChange={(e) => onCategoryChange(e.target.value, 'name')}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-500">Category Image</label>
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
          <Button onClick={onSubmit}>
            {editingCategory ? "Update Category" : "Add Category"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
