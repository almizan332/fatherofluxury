
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { MediaType } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

interface MediaGalleryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allMedia: MediaType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  product: Product;
}

export const MediaGalleryDialog = ({
  isOpen,
  onOpenChange,
  allMedia,
  selectedIndex,
  setSelectedIndex,
  product,
}: MediaGalleryDialogProps) => {
  const navigateGallery = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedIndex(prev => (prev === 0 ? allMedia.length - 1 : prev - 1));
    } else {
      setSelectedIndex(prev => (prev === allMedia.length - 1 ? 0 : prev + 1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') navigateGallery('prev');
    if (e.key === 'ArrowRight') navigateGallery('next');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] h-[95vh] p-0 bg-black/95"
        onKeyDown={handleKeyDown}
      >
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50">
          <X className="h-8 w-8 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="relative h-full flex flex-col">
          {/* Main Image Display */}
          <div className="flex-1 relative flex items-center justify-center p-8">
            {allMedia[selectedIndex]?.type === 'video' ? (
              <video
                src={allMedia[selectedIndex].url}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={allMedia[selectedIndex].url}
                alt={`${product.name} - View ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Navigation Buttons */}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={() => navigateGallery('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="h-8 w-8 text-white" />
                </button>
                <button
                  onClick={() => navigateGallery('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ArrowRight className="h-8 w-8 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allMedia.length > 1 && (
            <div className="p-4 bg-black/50">
              <div className="grid grid-cols-8 gap-2 max-w-full overflow-x-auto">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedIndex === index ? 'border-white' : 'border-transparent'
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
                      <img
                        src={media.url}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
