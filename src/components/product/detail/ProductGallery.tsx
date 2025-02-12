
import { useState } from "react";
import { Product } from "@/types/product";
import { MediaGalleryDialog } from "./MediaGalleryDialog";
import { MainMedia } from "./MainMedia";
import { MediaThumbnail } from "./MediaThumbnail";
import { getAllMedia } from "@/utils/mediaUtils";

interface ProductGalleryProps {
  product: Product;
}

export const ProductGallery = ({ product }: ProductGalleryProps) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const allMedia = getAllMedia(product);
  console.log('Media array:', allMedia);

  return (
    <div className="space-y-2">
      {/* Main Image */}
      <MainMedia
        media={allMedia[selectedMediaIndex]}
        productName={product.name}
        onClick={() => setIsGalleryOpen(true)}
      />

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-6 gap-2">
        {allMedia.map((media, index) => (
          <MediaThumbnail
            key={index}
            media={media}
            productName={product.name}
            index={index}
            isSelected={selectedMediaIndex === index}
            onClick={() => setSelectedMediaIndex(index)}
          />
        ))}
      </div>

      <MediaGalleryDialog
        isOpen={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        allMedia={allMedia}
        selectedIndex={selectedMediaIndex}
        setSelectedIndex={setSelectedMediaIndex}
        product={product}
      />
    </div>
  );
};
