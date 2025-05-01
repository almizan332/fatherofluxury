
import { X, ArrowLeft, ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
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
      setSelectedIndex((prev: number) => prev === 0 ? allMedia.length - 1 : prev - 1);
    } else {
      setSelectedIndex((prev: number) => prev === allMedia.length - 1 ? 0 : prev + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl h-[95vh] p-0 bg-black/95">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50">
          <X className="h-8 w-8 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Left Navigation Button */}
          <button
            onClick={() => navigateGallery('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          {/* Media Display */}
          <div className="col-span-2 w-full h-full flex items-center justify-center p-8">
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
          </div>

          {/* Product Info Panel */}
          <div className="hidden md:block bg-white h-full p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
            
            {product.description && (
              <div className="text-gray-600 whitespace-pre-wrap mb-6">
                {product.description}
              </div>
            )}

            {/* Size chart or additional details */}
            {selectedIndex === 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Details:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Upper material: Denim</li>
                  <li>• Insole material: Cowhide</li>
                  <li>• Rubber antiskid sole</li>
                  <li>• Size: 34-41</li>
                  <li>• Code number: 103257</li>
                </ul>
              </div>
            )}

            <div className="space-y-3">
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
            </div>
          </div>

          {/* Right Navigation Button */}
          <button
            onClick={() => navigateGallery('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
          {allMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`w-2 h-2 rounded-full ${
                selectedIndex === index ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
