
import { supabase } from "@/integrations/supabase/client";

export const uploadFileToVPS = async (file: File | { url: string, type: string }) => {
  // Handle URL upload case from synthetic event
  if (typeof (file as any).url === 'string') {
    try {
      // If it's a URL upload, we need to send it to our DO Spaces function
      const fileUrl = (file as any).url;
      const fileType = (file as any).type || '';
      
      // Call the Supabase Edge Function to handle the DO Spaces upload
      const { data, error } = await supabase.functions.invoke('do-file-upload', {
        body: {
          url: fileUrl,
          fileType: fileType
        }
      });
      
      if (error) {
        console.error('Error calling DO upload function:', error);
        throw error;
      }
      
      return { url: data.url };
    } catch (err) {
      console.error('Error in URL upload to DO:', err);
      throw err;
    }
  }
  
  // Handle file upload case
  if (!file) throw new Error("No file provided");

  const realFile = file as File;
  if (realFile.size === 0 && realFile.name === 'remote-file') {
    throw new Error("Invalid file object");
  }
  
  const fileExt = realFile.name.split('.').pop();
  // Added timestamp to make filename more unique
  const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
  
  try {
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

    // Get the temporary URL from Supabase
    const { data: { publicUrl } } = supabase.storage
      .from('temp_uploads')
      .getPublicUrl(`public/${fileName}`);

    if (!publicUrl) {
      throw new Error("Failed to get public URL for uploaded image");
    }

    // Now call our edge function to move the file to DO Spaces
    const { data: doData, error: doError } = await supabase.functions.invoke('do-file-upload', {
      body: {
        url: publicUrl,
        fileType: realFile.type
      }
    });
    
    if (doError) {
      console.error('Error moving file to DO:', doError);
      throw doError;
    }
    
    return { url: doData.url };
  } catch (err) {
    console.error('Error in file upload process:', err);
    throw err;
  }
};
