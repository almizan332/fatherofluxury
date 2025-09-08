
export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  affiliate_link?: string | null;
  thumbnail?: string | null;
  status: 'draft' | 'published';
  created_at: string | null;
  updated_at: string | null;
  product_images?: ProductImage[];
  // Legacy fields for compatibility
  name?: string;
  preview_image?: string;
  gallery_images?: string[];
  video_urls?: string[];
  flylink_url?: string;
  dhgate_url?: string;
  alibaba_url?: string;
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
