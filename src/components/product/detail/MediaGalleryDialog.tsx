
import { X, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { MediaType } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

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
      setSelectedIndex((prev: number) => prev === 0 ? allMedia.length - 1 : prev - 1);
    } else {
      setSelectedIndex((prev: number) => prev === allMedia.length - 1 ? 0 : prev + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-black/95">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50">
          <X className="h-8 w-8 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] h-full">
          <div className="relative flex flex-col h-full">
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
            </div>

            {/* Thumbnails Grid */}
            <div className="p-4 bg-black/50">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-w-full overflow-x-auto">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "relative aspect-square w-full overflow-hidden rounded-md border-2",
                      selectedIndex === index ? "border-blue-500" : "border-transparent"
                    )}
                  >
                    {media.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-black border-b-6 border-b-transparent ml-1" />
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
          </div>

          {/* Product Info Panel */}
          <div className="hidden md:block bg-zinc-900 h-full p-8 overflow-y-auto text-white">
            <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
            
            {product.description && (
              <div className="text-gray-300 whitespace-pre-wrap mb-6">
                {product.description}
              </div>
            )}

            <div className="space-y-3">
              {product.flylink_url && (
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600" 
                  size="lg"
                  onClick={() => window.open(product.flylink_url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buy on Flylink
                </Button>
              )}
              
              {product.alibaba_url && (
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600" 
                  size="lg"
                  onClick={() => window.open(product.alibaba_url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buy on Alibaba
                </Button>
              )}
              
              {product.dhgate_url && (
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600" 
                  size="lg"
                  onClick={() => window.open(product.dhgate_url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buy on DHgate
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
