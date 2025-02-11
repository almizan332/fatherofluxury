
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadCategoryImage } from "@/utils/categoryImageUpload";

export function useImageUpload() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setSelectedImage(file);
        const imageUrl = await uploadCategoryImage(file);
        return imageUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return null;
      }
    }
    return null;
  };

  return {
    selectedImage,
    setSelectedImage,
    handleImageUpload,
  };
}
