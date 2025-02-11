
export interface Product {
  id: string;
  name: string;
  category_id: string;
  description: string;
  preview_image: string;
  gallery_images: string[];
  created_at: string;
  updated_at: string;
  flylink_url?: string | null;
  alibaba_url?: string | null;
  dhgate_url?: string | null;
  video_urls?: string[] | null;
}

export interface CategoryImages {
  [key: string]: string[];
}
