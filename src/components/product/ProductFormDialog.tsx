
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/product";
import { Category } from "@/components/category/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductFormDialogProps {
  product?: Product;
  categories: Category[];
  onSuccess: () => void;
  onClose: () => void;
}

const ProductFormDialog = ({ product, categories, onSuccess, onClose }: ProductFormDialogProps) => {
  const [newProduct, setNewProduct] = useState<Partial<Product>>(
    product || {
      name: "",
      description: "",
      preview_image: "",
      gallery_images: [],
      category_id: "",
    }
  );
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handlePreviewImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setNewProduct({ ...newProduct, preview_image: imageUrl });
    }
  };

  const handleGalleryImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const files = Array.from(event.target.files || []);
    setGalleryImageFiles(files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewProduct({ ...newProduct, gallery_images: imageUrls });
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category_id) {
      toast({
        title: "Error",
        description: "Please fill in at least the product name and category",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        category_id: newProduct.category_id,
        description: newProduct.description || '',
        preview_image: newProduct.preview_image || '',
        gallery_images: newProduct.gallery_images || [],
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;

        toast({
          title: "Product updated",
          description: "The product has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;

        toast({
          title: "Product added",
          description: "The new product has been added successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {product ? "Edit Product" : "Add New Product"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={newProduct.category_id}
            onValueChange={(value) =>
              setNewProduct({ ...newProduct, category_id: value })
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="previewImage">Preview Image</Label>
          <div className="flex items-center gap-2">
            <Input
              id="previewImage"
              type="file"
              accept="image/*"
              onChange={handlePreviewImageUpload}
              className="flex-1"
            />
            {newProduct.preview_image && (
              <img
                src={newProduct.preview_image}
                alt="Preview"
                className="w-12 h-12 object-cover rounded"
              />
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="galleryImages">Gallery Images</Label>
          <div className="flex items-center gap-2">
            <Input
              id="galleryImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImagesUpload}
              className="flex-1"
            />
          </div>
          {newProduct.gallery_images && newProduct.gallery_images.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {newProduct.gallery_images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-12 h-12 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          {product ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </DialogContent>
  );
};

export default ProductFormDialog;
