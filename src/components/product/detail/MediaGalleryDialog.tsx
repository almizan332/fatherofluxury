
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { MediaType } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Reset zoom when changing images
  useEffect(() => {
    setIsZoomed(false);
    setZoomLevel(1);
  }, [selectedIndex]);

  const navigateGallery = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedIndex((prev: number) => prev === 0 ? allMedia.length - 1 : prev - 1);
    } else {
      setSelectedIndex((prev: number) => prev === allMedia.length - 1 ? 0 : prev + 1);
    }
  };

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
    setZoomLevel(isZoomed ? 1 : 2);
  };

  const handleZoomSlider = (value: number[]) => {
    setZoomLevel(value[0]);
    setIsZoomed(value[0] > 1);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (e.key === 'ArrowLeft') {
        navigateGallery('prev');
      } else if (e.key === 'ArrowRight') {
        navigateGallery('next');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl h-[95vh] p-0 bg-black/95">
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full bg-white/10 hover:bg-white/20 p-2 z-50 transition-all"
        >
          <X className="h-6 w-6 text-white" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Left Navigation Button */}
          <button
            onClick={() => navigateGallery('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10 hover:scale-110 transition-transform duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          {/* Media Display */}
          <div className="col-span-2 w-full h-full flex items-center justify-center p-8 overflow-hidden">
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

            {/* Zoom controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm p-2 rounded-full w-60 flex items-center gap-4">
              <button 
                className="text-white hover:text-primary" 
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
              >
                <span className="text-xl font-bold">-</span>
              </button>
              
              <Slider 
                value={[zoomLevel]} 
                min={1} 
                max={3} 
                step={0.1} 
                onValueChange={handleZoomSlider}
                className="w-40" 
              />
              
              <button 
                className="text-white hover:text-primary" 
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          </div>

          {/* Product Info Panel */}
          <div className="hidden md:block bg-white h-full p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{product.name}</h2>
            
            {product.description && (
              <div className="text-gray-600 whitespace-pre-wrap mb-6">
                {product.description}
              </div>
            )}

            {/* Size chart or additional details */}
            {selectedIndex === 0 && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Product Details:</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-2"></span>Upper material: Denim</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-2"></span>Insole material: Cowhide</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-2"></span>Rubber antiskid sole</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-2"></span>Size: 34-41</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-2"></span>Code number: 103257</li>
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {product.dhgate_url && (
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600 shadow-md" 
                  size="lg"
                  onClick={() => window.open(product.dhgate_url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buy on DHgate
                </Button>
              )}
              
              {product.alibaba_url && (
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 shadow-md" 
                  size="lg"
                  onClick={() => window.open(product.alibaba_url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buy on Alibaba
                </Button>
              )}
              
              {product.flylink_url && (
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 shadow-md" 
                  size="lg"
                  onClick={() => window.open(product.flylink_url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buy on Flylink
                </Button>
              )}
            </div>

            {/* Image pagination */}
            <div className="mt-10">
              <p className="text-sm text-gray-500 mb-2">
                Image {selectedIndex + 1} of {allMedia.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {allMedia.slice(0, 12).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedIndex === idx ? 'bg-primary scale-150' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
                {allMedia.length > 12 && <span className="text-xs text-gray-400">+{allMedia.length - 12} more</span>}
              </div>
            </div>
          </div>

          {/* Right Navigation Button */}
          <button
            onClick={() => navigateGallery('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10 hover:scale-110 transition-transform duration-200"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto pb-2 no-scrollbar">
          {allMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`min-w-3 h-3 rounded-full transition-all ${
                selectedIndex === index 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 w-3 hover:bg-white/70'
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
