
import { supabase } from "@/integrations/supabase/client";

export const uploadFileToVPS = async (file: File | { url: string, type: string }) => {
  // Handle URL upload case from synthetic event
  if (typeof (file as any).url === 'string') {
    return (file as any).url;
  }
  
  if (!file) throw new Error("No file provided");

  // Handle file upload case
  const realFile = file as File;
  if (realFile.size === 0 && realFile.name === 'remote-file') {
    // This case should not happen as we now handle URL uploads above
    throw new Error("Invalid file object");
  }
  
  const fileExt = realFile.name.split('.').pop();
  // Added timestamp to make filename more unique
  const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
  
  // Upload to temp location in Supabase first
  const { data, error } = await supabase.storage
    .from('temp_uploads')
    .upload(`public/${fileName}`, realFile, {
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

  return publicUrl;
};
