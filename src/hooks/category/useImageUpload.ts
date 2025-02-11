
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { uploadCategoryImage } from "@/utils/categoryImageUpload";

export function useImageUpload() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
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
    isAdmin,
  };
}
