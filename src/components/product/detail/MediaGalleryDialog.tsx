
import { GalleryDialog } from "./gallery/GalleryDialog";
import { MediaType } from "@/types/product";
import { Product } from "@/types/product";

interface MediaGalleryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allMedia: MediaType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  product: Product;
}

export const MediaGalleryDialog = (props: MediaGalleryDialogProps) => {
  return <GalleryDialog {...props} />;
};
