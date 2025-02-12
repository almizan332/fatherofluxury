
import { Product, MediaType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";

export const getPublicUrl = (path: string) => {
  if (!path) return '';
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.replace(/^blob:/, '');
  const trimmedPath = cleanPath.replace(/^\/+/, '');

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(trimmedPath);

  console.log('Generated public URL:', data.publicUrl);
  return data.publicUrl;
};

export const getAllMedia = (product: Product): MediaType[] => {
  const media: MediaType[] = [];

  if (product.preview_image) {
    const url = getPublicUrl(product.preview_image);
    console.log('Preview image URL:', url);
    media.push({ type: 'image', url });
  }

  if (product.gallery_images && Array.isArray(product.gallery_images)) {
    product.gallery_images.forEach(imageUrl => {
      const url = getPublicUrl(imageUrl);
      console.log('Gallery image URL:', url);
      media.push({ type: 'image', url });
    });
  }

  if (product.video_urls && Array.isArray(product.video_urls)) {
    product.video_urls.forEach(videoUrl => {
      const url = getPublicUrl(videoUrl);
      console.log('Video URL:', url);
      media.push({ type: 'video', url });
    });
  }

  return media;
};
