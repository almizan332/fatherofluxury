
import { CategoryImages, Product } from "@/types/product";

const categoryImages: CategoryImages = {
  Smartphones: [
    '1567581573103-17c45c86d948',
    '1511707171634-5f897ff02aa9',
    '1523206389153-c012fa067a6b',
    '1592434475716-7798d425d2e6',
    '1605170439002-42b4e777de60',
  ],
  Laptops: [
    '1496181133206-80ce9b88a853',
    '1525547719571-a2d4ac8945e2',
    '1504707748692-34f7c6d5c385',
    '1531297484001-80022131f5a1',
    '1498050108023-c5249f4df085',
  ],
  default: [
    '1649972904349-6e44c42644a7',
    '1488590528505-98d2b5aba04b',
    '1518770660439-4636190af475',
    '1461749280684-dccba630e2f6',
    '1486312338219-ce68d2c6f44d',
  ],
};

export const generateProducts = (count: number, category: string): Product[] => {
  const images = categoryImages[category] || categoryImages.default;
  const now = new Date().toISOString();

  return Array.from({ length: count }).map((_, index) => ({
    id: `${index + 1}`,
    title: `${category} ${381 + index}`,
    slug: `${category.toLowerCase()}-${381 + index}`,
    description: "",
    status: "published" as const,
    thumbnail: `https://images.unsplash.com/photo-${images[index % images.length]}?auto=format&fit=crop&w=400&q=80`,
    created_at: now,
    updated_at: now,
    // Legacy compatibility fields
    name: `${category} ${381 + index}`,
    category_id: "",
    preview_image: `https://images.unsplash.com/photo-${images[index % images.length]}?auto=format&fit=crop&w=400&q=80`,
    gallery_images: []
  }));
};
