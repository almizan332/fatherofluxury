
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { Category } from "@/components/category/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProductBasicInfo from "./form/ProductBasicInfo";
import ImageUploadField from "./form/ImageUploadField";

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

  const handleProductChange = (updates: Partial<Product>) => {
    setNewProduct({ ...newProduct, ...updates });
  };

  const handlePreviewImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      handleProductChange({ preview_image: imageUrl });
    }
  };

  const handleGalleryImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const files = Array.from(event.target.files || []);
    setGalleryImageFiles(files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    handleProductChange({ gallery_images: imageUrls });
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
        <ProductBasicInfo
          product={newProduct}
          categories={categories}
          onProductChange={handleProductChange}
        />
        <ImageUploadField
          id="previewImage"
          label="Preview Image"
          value={newProduct.preview_image}
          onChange={handlePreviewImageUpload}
        />
        <ImageUploadField
          id="galleryImages"
          label="Gallery Images"
          multiple
          value={newProduct.gallery_images}
          onChange={handleGalleryImagesUpload}
        />
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
