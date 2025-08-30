
export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  affiliate_link?: string | null;
  thumbnail?: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  position: number;
  created_at: string;
}

export interface CategoryImages {
  [key: string]: string[];
}

export interface MediaType {
  type: 'image' | 'video';
  url: string;
}
