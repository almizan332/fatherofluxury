
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
      className={`relative transition-transform duration-300 ${isZoomed ? 'cursor-move' : 'cursor-zoom-in'}`}
      style={{ 
        transform: `scale(${zoomLevel})`, 
        transformOrigin: 'center', 
        maxWidth: '100%',
        maxHeight: '100%'
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
        />
      ) : (
        <img
          src={media.url}
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      )}
    </div>
  );
};
