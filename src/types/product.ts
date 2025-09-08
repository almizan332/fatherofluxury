
export interface Product {
  id: string;
  product_name: string;
  flylink: string | null;
  alibaba_url: string | null;
  dhgate_url: string | null;
  category: string;
  description: string | null;
  first_image: string;
  media_links: string[] | null;
  created_at: string | null;
  // Legacy fields for compatibility
  title?: string;
  slug?: string;
  affiliate_link?: string | null;
  thumbnail?: string | null;
  status?: 'draft' | 'published';
  updated_at?: string | null;
  product_images?: ProductImage[];
  name?: string;
  preview_image?: string;
  gallery_images?: string[];
  video_urls?: string[];
  flylink_url?: string;
  categories?: any;
  category_id?: string;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  url: string;
  position: number;
  created_at?: string;
}

export interface CategoryImages {
  [key: string]: string[];
}

export interface MediaType {
  type: 'image' | 'video';
  url: string;
}
