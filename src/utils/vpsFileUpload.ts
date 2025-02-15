
import { supabase } from "@/integrations/supabase/client";

export const uploadFileToVPS = async (file: File) => {
  if (!file) throw new Error("No file provided");

  const fileExt = file.name.split('.').pop();
  // Added timestamp to make filename more unique
  const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
  
  // Upload to temp location in Supabase first
  const { data, error } = await supabase.storage
    .from('temp_uploads')
    .upload(`public/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Storage error:', error);
    throw error;
  }

  // Get the temporary URL
  const { data: { publicUrl } } = supabase.storage
    .from('temp_uploads')
    .getPublicUrl(`public/${fileName}`);

  if (!publicUrl) {
    throw new Error("Failed to get public URL for uploaded image");
  }

  // TODO: Here you would implement the logic to move the file to your VPS
  // For now, we'll return the temporary Supabase URL
  return publicUrl;
};
