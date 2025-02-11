
import { supabase } from "@/integrations/supabase/client";

export const uploadCategoryImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('category-images')
    .upload(fileName, file);

  if (error) throw error;

  return supabase.storage.from('category-images').getPublicUrl(fileName).data.publicUrl;
};
