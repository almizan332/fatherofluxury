
import { useState } from "react";
import { Product } from "@/types/product";
import { MediaGalleryDialog } from "./MediaGalleryDialog";
import { MediaType } from "@/types/product";
import { ZoomIn } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductGalleryProps {
  product: Product;
}

// Helper function to sanitize and handle DigitalOcean Spaces URLs
const sanitizeImageUrl = (url: string): string => {
  // Remove any quotes that might be in the URL
  let cleanUrl = url.replace(/['"]/g, '');
  
  // Handle DigitalOcean Spaces URLs - ensure proper encoding
  if (cleanUrl.includes('digitaloceanspaces.com')) {
    // Split the URL to encode only the path part after the domain
    const urlParts = cleanUrl.split('/');
    if (urlParts.length > 3) {
      const domain = urlParts.slice(0, 3).join('/');
      const pathParts = urlParts.slice(3);
      // Encode each path segment but preserve forward slashes
      const encodedPath = pathParts.map(part => encodeURIComponent(part)).join('/');
      cleanUrl = `${domain}/${encodedPath}`;
    }
  }
  
  return cleanUrl;
};

export const ProductGallery = ({ product }: ProductGalleryProps) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const allMedia = getAllMedia(product);

  return (
    <div className="space-y-6">
      {/* Main Image Display */}
      <div 
        className="aspect-square relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg cursor-pointer group"
        onClick={() => setIsGalleryOpen(true)}
      >
        {allMedia.length > 0 && allMedia[selectedMediaIndex]?.type === 'video' ? (
          <video
            src={allMedia[selectedMediaIndex].url}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          />
        ) : allMedia.length > 0 ? (
          <>
            <img
              src={allMedia[selectedMediaIndex].url}
              alt={`${product.name} - View ${selectedMediaIndex + 1}`}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                console.log('Image failed to load:', allMedia[selectedMediaIndex].url);
                // Optionally set a fallback image
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                <ZoomIn className="h-8 w-8 text-gray-800" />
              </div>
            </div>

            {/* Product Code Overlay - Extract from product name */}
            {selectedMediaIndex === 0 && product.name && (
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg">
                {product.name.split(' ')[0]}
              </div>
            )}
          </>
        ) : (
          // Fallback when no images are available
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
      </div>

      {/* Thumbnail Carousel for Mobile */}
      <div className="block md:hidden">
        <Carousel className="w-full">
          <CarouselContent>
            {allMedia.slice(0, 100).map((media, index) => (
              <CarouselItem key={index} className="basis-1/4">
                <div
                  onClick={() => setSelectedMediaIndex(index)}
                  className={`aspect-square relative rounded-md overflow-hidden cursor-pointer ${
                    selectedMediaIndex === index 
                      ? 'ring-2 ring-primary border border-primary' 
                      : 'border border-gray-200'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="relative w-full h-full bg-gray-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-white border-b-4 border-b-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Thumbnail failed to load:', media.url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>

      {/* Thumbnail Grid for Desktop */}
      <div className="hidden md:grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {allMedia.slice(0, 100).map((media, index) => (
          <div
            key={index}
            onClick={() => {
              setSelectedMediaIndex(index);
            }}
            className={`aspect-square relative rounded-lg overflow-hidden cursor-pointer group transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg ${
              selectedMediaIndex === index 
                ? 'ring-2 ring-primary border border-primary scale-105 shadow-md z-10' 
                : 'border border-gray-200'
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
                    <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-black border-b-4 border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={media.url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    console.log('Grid thumbnail failed to load:', media.url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-8 pt-4 border-t border-gray-200">Photos & Videos</h2>

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
  
  // Add preview image if available
  if (product.preview_image) {
    media.push({ 
      type: 'image', 
      url: sanitizeImageUrl(product.preview_image)
    });
  }
  
  // Add gallery images if available
  if (product.gallery_images && Array.isArray(product.gallery_images)) {
    product.gallery_images.forEach(url => {
      if (url) {
        // Clean up the URL and handle DigitalOcean Spaces URLs
        const cleanUrl = sanitizeImageUrl(url);
        media.push({ type: 'image', url: cleanUrl });
      }
    });
  }
  
  // Add videos if available
  if (product.video_urls && Array.isArray(product.video_urls)) {
    product.video_urls.forEach(url => {
      if (url) {
        media.push({ type: 'video', url });
      }
    });
  }
  
  // If no media was found, add an empty array to prevent undefined errors
  return media;
};
