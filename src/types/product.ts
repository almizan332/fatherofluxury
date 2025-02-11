
export interface Product {
  id: string;
  name: string;
  category_id: string;
  description: string;
  preview_image: string;
  gallery_images: string[];
  created_at: string;
  updated_at: string;
}

export interface CategoryImages {
  [key: string]: string[];
}
