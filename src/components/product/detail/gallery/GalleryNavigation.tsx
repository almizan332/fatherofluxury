
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryNavigationProps {
  direction: 'prev' | 'next';
  onClick: () => void;
}

export const GalleryNavigation = ({ direction, onClick }: GalleryNavigationProps) => {
  const isNext = direction === 'next';
  
  return (
    <button
      onClick={onClick}
      className={`absolute ${isNext ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 p-3 rounded-full 
        bg-black/60 hover:bg-black/80 transition-colors z-30 
        hover:scale-110 transition-transform duration-200`}
      aria-label={`${isNext ? 'Next' : 'Previous'} image`}
    >
      {isNext ? (
        <ChevronRight className="h-8 w-8 text-white" strokeWidth={2.5} />
      ) : (
        <ChevronLeft className="h-8 w-8 text-white" strokeWidth={2.5} />
      )}
    </button>
  );
};
