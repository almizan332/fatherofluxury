
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
  if (!url) return '';
  
  // Remove any quotes that might be in the URL
  let cleanUrl = url.replace(/['"]/g, '').trim();
  
  // Ensure URL starts with https
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  // For DigitalOcean Spaces URLs, we need to handle spaces and special characters carefully
  // The browser will automatically encode the URL when making the request
  // We just need to make sure spaces are replaced with %20
  if (cleanUrl.includes('digitaloceanspaces.com')) {
    // Simple approach: just replace spaces with %20, let the browser handle the rest
    cleanUrl = cleanUrl.replace(/ /g, '%20');
  }
  
  return cleanUrl;
};

export const ProductGallery = ({ product }: ProductGalleryProps) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const allMedia = getAllMedia(product);
  console.log('ProductGallery - All media:', allMedia);
  console.log('ProductGallery - Selected index:', selectedMediaIndex);
  console.log('ProductGallery - Current media:', allMedia[selectedMediaIndex]);

  return (
    <div className="space-y-8">
      {/* Main Image Display - Made larger and more cinematic */}
      <div 
        className="aspect-[16/10] lg:aspect-[5/3] relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-2xl cursor-pointer group"
        onClick={() => setIsGalleryOpen(true)}
      >
        {allMedia.length > 0 && allMedia[selectedMediaIndex] ? (
          allMedia[selectedMediaIndex].type === 'video' ? (
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
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  console.error('Main gallery image failed to load:', allMedia[selectedMediaIndex].url);
                  // Show fallback instead of hiding
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTEwIDkwTDE1MCA5MEwxMTAgMTEwTDEyMCAxNTBMMTAwIDEzMEw4MCAxNTBMOTAgMTEwTDUwIDkwTDkwIDkwTDEwMCA1MFoiIGZpbGw9IiNjY2MiLz4KPHR4ZSB4PSIxMDAiIHk9IjE3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
                }}
                onLoad={() => {
                  console.log('Main gallery image loaded successfully:', allMedia[selectedMediaIndex].url);
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
          )
        ) : (
          // Fallback when no images are available
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
      </div>

      {/* Thumbnail Carousel for Mobile - Made bigger */}
      <div className="block md:hidden">
        <Carousel className="w-full">
          <CarouselContent>
            {allMedia.slice(0, 100).map((media, index) => (
                <CarouselItem key={index} className="basis-1/2.5">
                 <div
                   onClick={() => {
                     console.log('Mobile thumbnail clicked:', index, media);
                     setSelectedMediaIndex(index);
                   }}
                   className={`aspect-square relative rounded-xl overflow-hidden cursor-pointer shadow-lg transform transition-all duration-300 hover:scale-105 ${
                     selectedMediaIndex === index 
                       ? 'ring-4 ring-primary border-3 border-primary scale-105 shadow-xl' 
                       : 'border-2 border-gray-200 hover:border-primary/50'
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
                        console.log('Mobile thumbnail failed to load:', media.url);
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

      {/* Thumbnail Grid for Desktop - Made bigger and more stylish */}
      <div className="hidden md:grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6 max-h-[600px] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-gradient-to-br from-gray-50/50 to-white rounded-2xl border border-gray-100">
        {allMedia.slice(0, 100).map((media, index) => (
          <div
            key={index}
            onClick={() => {
              console.log('Desktop thumbnail clicked:', index, media);
              setSelectedMediaIndex(index);
            }}
            className={`aspect-square relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl ${
              selectedMediaIndex === index 
                ? 'ring-4 ring-primary border-3 border-primary scale-110 shadow-2xl z-10' 
                : 'border-2 border-gray-200 hover:border-primary/50 shadow-lg'
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
                    console.log('Desktop thumbnail failed to load:', media.url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
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
        product={product}
      />
    </div>
  );
};

export const getAllMedia = (product: Product): MediaType[] => {
  const media: MediaType[] = [];
  
  // Add first image if available
  if (product.first_image) {
    const cleanUrl = sanitizeImageUrl(product.first_image);
    console.log('Adding first image:', { original: product.first_image, clean: cleanUrl });
    media.push({ 
      type: 'image', 
      url: cleanUrl
    });
  }
  
  // Add media links if available
  if (product.media_links && Array.isArray(product.media_links)) {
    product.media_links.forEach((url, index) => {
      if (url) {
        const cleanUrl = sanitizeImageUrl(url);
        console.log(`Adding media link ${index}:`, { original: url, clean: cleanUrl });
        media.push({ type: 'image', url: cleanUrl });
      }
    });
  }
  
  // Add legacy preview image if available (for compatibility)
  if (product.preview_image) {
    const cleanUrl = sanitizeImageUrl(product.preview_image);
    console.log('Adding preview image:', { original: product.preview_image, clean: cleanUrl });
    media.push({ 
      type: 'image', 
      url: cleanUrl
    });
  }
  
  // Add legacy gallery images if available (for compatibility)
  if (product.gallery_images && Array.isArray(product.gallery_images)) {
    product.gallery_images.forEach((url, index) => {
      if (url) {
        const cleanUrl = sanitizeImageUrl(url);
        console.log(`Adding gallery image ${index}:`, { original: url, clean: cleanUrl });
        media.push({ type: 'image', url: cleanUrl });
      }
    });
  }
  
  // Add videos if available
  if (product.video_urls && Array.isArray(product.video_urls)) {
    product.video_urls.forEach((url, index) => {
      if (url) {
        console.log(`Adding video ${index}:`, url);
        media.push({ type: 'video', url });
      }
    });
  }
  
  console.log('getAllMedia result:', media);
  return media;
};
