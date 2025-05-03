
import { useState } from "react";
import { Product } from "@/types/product";
import { MediaGalleryDialog } from "./MediaGalleryDialog";
import { MediaType } from "@/types/product";
import { ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  product: Product;
}

export const ProductGallery = ({ product }: ProductGalleryProps) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Normalize gallery images - handle potential string format issues
  const allMedia = getAllMedia(product);

  return (
    <div className="space-y-4">
      <div 
        className="aspect-square relative rounded-lg overflow-hidden bg-white border border-gray-200 cursor-pointer group"
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
          <>
            <img
              src={allMedia[selectedMediaIndex].url}
              alt={`${product.name} - View ${selectedMediaIndex + 1}`}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/80 rounded-full p-3">
                <ZoomIn className="h-6 w-6 text-gray-800" />
              </div>
            </div>

            {/* Product Code Overlay - Only shown on first image */}
            {selectedMediaIndex === 0 && product.name.includes("LV") && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
                103257-2
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {allMedia.slice(0, 10).map((media, index) => (
          <div
            key={index}
            onClick={() => {
              setSelectedMediaIndex(index);
            }}
            className={`aspect-square relative rounded-lg overflow-hidden cursor-pointer group border ${
              selectedMediaIndex === index ? 'border-primary ring-2 ring-primary' : 'border-gray-200'
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
              <>
                <img
                  src={media.url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Show product code on thumbnails if applicable */}
                {product.name.includes("LV") && media.url.includes("103257") && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 rounded text-xs">
                    103257
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-6 pt-4 border-t border-gray-200">Photos & Videos</h2>

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
  const media = [];
  
  // Add the preview image first
  if (product.preview_image) {
    media.push({ type: 'image', url: normalizeImageUrl(product.preview_image) });
  }
  
  // Add gallery images
  if (product.gallery_images && Array.isArray(product.gallery_images)) {
    product.gallery_images.forEach(url => {
      if (url) {
        // Handle quoted strings and normalize URL
        media.push({ type: 'image', url: normalizeImageUrl(url) });
      }
    });
  }
  
  // Add videos
  if (product.video_urls && Array.isArray(product.video_urls)) {
    product.video_urls.forEach(url => {
      if (url) {
        media.push({ type: 'video', url });
      }
    });
  }
  
  return media;
};

// Helper function to normalize image URLs (remove quotes if present)
const normalizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove surrounding quotes if present
  if ((url.startsWith('"') && url.endsWith('"')) || 
      (url.startsWith("'") && url.endsWith("'"))) {
    return url.slice(1, -1);
  }
  
  return url;
};
