
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadCategoryImage } from "@/utils/categoryImageUpload";

export function useImageUpload() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return null;
    }

    try {
      setSelectedImage(file);
      const imageUrl = await uploadCategoryImage(file);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      
      return imageUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      setSelectedImage(null);
      return null;
    }
  };

  return {
    selectedImage,
    setSelectedImage,
    handleImageUpload,
  };
}
