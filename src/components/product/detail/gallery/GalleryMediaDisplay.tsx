
import { MediaType } from "@/types/product";

interface GalleryMediaDisplayProps {
  media: MediaType;
  productName: string;
  selectedIndex: number;
  isZoomed: boolean;
  zoomLevel: number;
  handleZoom: () => void;
}

export const GalleryMediaDisplay = ({
  media,
  productName,
  selectedIndex,
  isZoomed,
  zoomLevel,
  handleZoom
}: GalleryMediaDisplayProps) => {
  if (!media) return null;
  
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
          src={media.url}
          className="max-w-full max-h-full object-contain"
          controls
          autoPlay
          playsInline
          onError={(e) => {
            console.log('Video failed to load:', media.url);
          }}
        />
      ) : (
        <img
          src={media.url}
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          onLoad={() => {
            console.log('Image loaded successfully:', media.url);
          }}
          onError={(e) => {
            console.log('Image failed to load:', media.url);
            // Show a fallback or placeholder
            e.currentTarget.style.opacity = '0.5';
          }}
        />
      )}
    </div>
  );
};
