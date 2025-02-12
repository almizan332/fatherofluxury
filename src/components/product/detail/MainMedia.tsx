
import { MediaType } from "@/types/product";

interface MainMediaProps {
  media: MediaType;
  productName: string;
  onClick: () => void;
}

export const MainMedia = ({ media, productName, onClick }: MainMediaProps) => {
  return (
    <div 
      className="aspect-square relative rounded-lg overflow-hidden bg-gray-900 cursor-pointer group"
      onClick={onClick}
    >
      {media.type === 'video' ? (
        <video
          src={media.url}
          className="w-full h-full object-contain"
          controls
          autoPlay
          playsInline
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={media.url}
            alt={`${productName} - View`}
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error('Image load error:', e);
              const img = e.target as HTMLImageElement;
              img.src = '/placeholder.svg';
            }}
          />
        </div>
      )}
    </div>
  );
};
