
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

  return (
    <div className="space-y-4">
      <div 
        className="aspect-square relative rounded-lg overflow-hidden bg-gray-900 cursor-pointer"
        onClick={() => setIsGalleryOpen(true)}
      >
        {allMedia[selectedMediaIndex]?.type === 'video' ? (
          <video
            src={allMedia[selectedMediaIndex].url}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          />
        ) : (
          <img
            src={allMedia[selectedMediaIndex].url}
            alt={`${product.name} - View ${selectedMediaIndex + 1}`}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {allMedia.map((media, index) => (
          <div
            key={index}
            onClick={() => setSelectedMediaIndex(index)}
            className={`aspect-square relative rounded-lg overflow-hidden cursor-pointer ${
              selectedMediaIndex === index ? 'ring-2 ring-primary' : ''
            }`}
          >
            {media.type === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-black border-b-8 border-b-transparent ml-1" />
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
          </div>
        ))}
      </div>

      <MediaGalleryDialog
        isOpen={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        allMedia={allMedia}
        selectedIndex={selectedMediaIndex}
        setSelectedIndex={setSelectedMediaIndex}
        productName={product.name}
      />
    </div>
  );
};

export const getAllMedia = (product: Product): MediaType[] => {
  const media = [];
  if (product.preview_image) media.push({ type: 'image', url: product.preview_image });
  if (product.gallery_images) {
    product.gallery_images.forEach(url => media.push({ type: 'image', url }));
  }
  if (product.video_urls) {
    product.video_urls.forEach(url => media.push({ type: 'video', url }));
  }
  return media;
};
