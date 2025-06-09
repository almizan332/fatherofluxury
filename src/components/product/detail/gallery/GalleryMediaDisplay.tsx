
import { MediaType } from "@/types/product";

interface GalleryMediaDisplayProps {
  media: MediaType;
  productName: string;
  selectedIndex: number;
  isZoomed: boolean;
  zoomLevel: number;
  handleZoom: () => void;
}

// Helper function to sanitize and handle image URLs
const sanitizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove any quotes that might be in the URL
  let cleanUrl = url.replace(/['"]/g, '').trim();
  
  // Handle DigitalOcean Spaces URLs - ensure proper encoding
  if (cleanUrl.includes('digitaloceanspaces.com')) {
    try {
      // Parse the URL to handle encoding properly
      const urlObj = new URL(cleanUrl);
      // Reconstruct with properly encoded pathname
      cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    } catch (error) {
      console.log('URL parsing failed, using original:', cleanUrl);
    }
  }
  
  return cleanUrl;
};

export const GalleryMediaDisplay = ({
  media,
  productName,
  selectedIndex,
  isZoomed,
  zoomLevel,
  handleZoom
}: GalleryMediaDisplayProps) => {
  if (!media) return null;
  
  const sanitizedUrl = sanitizeImageUrl(media.url);
  
  return (
    <div 
      className={`relative transition-transform duration-300 ${isZoomed ? 'cursor-move' : 'cursor-zoom-in'} w-full h-full flex items-center justify-center`}
      style={{ 
        transform: `scale(${zoomLevel})`, 
        transformOrigin: 'center'
      }}
      onClick={handleZoom}
    >
      {media.type === 'video' ? (
        <video
          src={sanitizedUrl}
          className="max-w-full max-h-full object-contain"
          controls
          autoPlay
          playsInline
          onError={(e) => {
            console.error('Video failed to load:', sanitizedUrl);
          }}
        />
      ) : (
        <img
          src={sanitizedUrl}
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            console.error('Image failed to load:', sanitizedUrl);
            // Show a placeholder or hide the image
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', sanitizedUrl);
          }}
        />
      )}
    </div>
  );
};
