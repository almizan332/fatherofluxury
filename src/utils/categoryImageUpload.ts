import { uploadFileToVPS } from "./vpsFileUpload";

/**
 * Upload a category image directly to DigitalOcean Spaces (no Supabase Storage).
 */
export const uploadCategoryImage = async (file: File) => {
  if (!file) throw new Error("No file provided");
  const result = await uploadFileToVPS(file);
  if (!result?.url) throw new Error("Failed to get public URL for uploaded image");
  return result.url;
};
