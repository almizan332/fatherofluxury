
import { MediaType } from "@/types/product";

interface GalleryMediaDisplayProps {
  media: MediaType;
  productName: string;
  selectedIndex: number;
  isZoomed: boolean;
  zoomLevel: number;
  handleZoom: () => void;
}

// Helper function to sanitize and handle DigitalOcean Spaces URLs
const sanitizeImageUrl = (url: string): string => {
  // Remove any quotes that might be in the URL
  let cleanUrl = url.replace(/['"]/g, '');
  
  // Handle DigitalOcean Spaces URLs - but avoid double encoding
  if (cleanUrl.includes('digitaloceanspaces.com')) {
    // Check if the URL is already encoded (contains %20 etc)
    const isAlreadyEncoded = cleanUrl.includes('%20') || cleanUrl.includes('%24') || cleanUrl.includes('%25');
    
    if (!isAlreadyEncoded) {
      // Only encode if not already encoded
      const urlParts = cleanUrl.split('/');
      if (urlParts.length > 3) {
        const domain = urlParts.slice(0, 3).join('/');
        const pathParts = urlParts.slice(3);
        // Encode each path segment but preserve forward slashes
        const encodedPath = pathParts.map(part => encodeURIComponent(part)).join('/');
        cleanUrl = `${domain}/${encodedPath}`;
      }
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
  
  // Sanitize the media URL
  const sanitizedUrl = sanitizeImageUrl(media.url);
  
  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center transition-transform duration-300 ${
        isZoomed ? 'cursor-move' : 'cursor-zoom-in'
      }`}
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
            console.log('Video failed to load:', sanitizedUrl);
          }}
        />
      ) : (
        <img
          src={sanitizedUrl}
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          onLoad={() => {
            console.log('Image loaded successfully:', sanitizedUrl);
          }}
          onError={(e) => {
            console.log('Image failed to load:', sanitizedUrl);
            // Show a fallback or placeholder
            e.currentTarget.style.opacity = '0.5';
          }}
        />
      )}
    </div>
  );
};
