
import { useState } from "react";
import { Product } from "@/types/product";
import { MediaGalleryDialog } from "./MediaGalleryDialog";
import { MediaType } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
}

export const ProductGallery = ({ product }: ProductGalleryProps) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const allMedia = getAllMedia(product);

  const handleThumbnailClick = (index: number) => {
    setSelectedMediaIndex(index);
  };

  const handleMainImageClick = () => {
    setIsGalleryOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main Image/Video */}
      <div 
        className="w-full aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
        onClick={handleMainImageClick}
      >
        {allMedia[selectedMediaIndex]?.type === 'video' ? (
          <video
            src={allMedia[selectedMediaIndex].url}
            className="w-full h-full object-contain"
            controls
            playsInline
          />
        ) : (
          <img
            src={allMedia[selectedMediaIndex].url}
            alt={`${product.name} - View ${selectedMediaIndex + 1}`}
            className="w-full h-full object-contain"
          />
        )}
        <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-black/70 text-white px-4 py-2 rounded-full">
            Click to expand
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                selectedMediaIndex === index ? 'border-primary' : 'border-transparent'
              }`}
            >
              {media.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-black border-b-4 border-b-transparent ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={media.url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                />
              )}
            </button>
          ))}
        </div>
      )}

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

export const getAllMedia = (product: Product): MediaType[] => {
  const media: MediaType[] = [];

  // Handle preview image
  if (product.preview_image) {
    media.push({ type: 'image', url: product.preview_image });
  }

  // Handle gallery images
  if (product.gallery_images) {
    product.gallery_images.forEach(imageUrl => {
      media.push({ type: 'image', url: imageUrl });
    });
  }

  // Handle video URLs
  if (product.video_urls) {
    product.video_urls.forEach(videoUrl => {
      media.push({ type: 'video', url: videoUrl });
    });
  }

  return media;
};
