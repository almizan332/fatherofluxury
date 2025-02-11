
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
      flylink_url: null,
      alibaba_url: null,
      dhgate_url: null,
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
        ...(newProduct.flylink_url ? { flylink_url: newProduct.flylink_url } : { flylink_url: null }),
        ...(newProduct.alibaba_url ? { alibaba_url: newProduct.alibaba_url } : { alibaba_url: null }),
        ...(newProduct.dhgate_url ? { dhgate_url: newProduct.dhgate_url } : { dhgate_url: null }),
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
    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {product ? "Edit Product" : "Add New Product"}
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <ProductBasicInfo
            product={newProduct}
            categories={categories}
            onProductChange={handleProductChange}
          />
        </TabsContent>

        <TabsContent value="images" className="space-y-4 mt-4">
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
        </TabsContent>

        <TabsContent value="links" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="flylink">Flylink URL</Label>
              <Input
                id="flylink"
                placeholder="Enter Flylink URL"
                value={newProduct.flylink_url || ''}
                onChange={(e) => handleProductChange({ flylink_url: e.target.value || null })}
              />
            </div>
            
            <div>
              <Label htmlFor="alibaba">Alibaba URL</Label>
              <Input
                id="alibaba"
                placeholder="Enter Alibaba URL"
                value={newProduct.alibaba_url || ''}
                onChange={(e) => handleProductChange({ alibaba_url: e.target.value || null })}
              />
            </div>
            
            <div>
              <Label htmlFor="dhgate">DHgate URL</Label>
              <Input
                id="dhgate"
                placeholder="Enter DHgate URL"
                value={newProduct.dhgate_url || ''}
                onChange={(e) => handleProductChange({ dhgate_url: e.target.value || null })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {product ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </DialogContent>
  );
};

export default ProductFormDialog;
