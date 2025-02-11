
import { supabase } from "@/integrations/supabase/client";

export const uploadCategoryImage = async (file: File) => {
  if (!file) throw new Error("No file provided");

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Authentication required for uploading images");
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('category_images')
    .upload(`public/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Storage error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('category_images')
    .getPublicUrl(`public/${fileName}`);

  if (!publicUrl) {
    throw new Error("Failed to get public URL for uploaded image");
  }

  return publicUrl;
};
