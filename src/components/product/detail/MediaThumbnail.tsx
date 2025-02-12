
import { MediaType } from "@/types/product";

interface MediaThumbnailProps {
  media: MediaType;
  productName: string;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export const MediaThumbnail = ({ media, productName, index, isSelected, onClick }: MediaThumbnailProps) => {
  return (
    <button
      onClick={onClick}
      className={`aspect-square relative rounded-lg overflow-hidden bg-gray-900 ${
        isSelected ? 'ring-2 ring-primary' : ''
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
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={media.url}
            alt={`${productName} thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Thumbnail load error:', e);
              const img = e.target as HTMLImageElement;
              img.src = '/placeholder.svg';
            }}
          />
        </div>
      )}
    </button>
  );
};
