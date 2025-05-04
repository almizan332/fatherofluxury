
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { MediaType } from "@/types/product";
import { GalleryNavigation } from "./GalleryNavigation";
import { GalleryMediaDisplay } from "./GalleryMediaDisplay";
import { GalleryInfoPanel } from "./GalleryInfoPanel";
import { GalleryPagination } from "./GalleryPagination";
import { GalleryCloseButton } from "./GalleryCloseButton";
import { GalleryZoomControls } from "./GalleryZoomControls";

interface GalleryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allMedia: MediaType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  product: Product;
}

export const GalleryDialog = ({
  isOpen,
  onOpenChange,
  allMedia,
  selectedIndex,
  setSelectedIndex,
  product,
}: GalleryDialogProps) => {
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
        {/* Custom close button with improved visibility */}
        <GalleryCloseButton onOpenChange={onOpenChange} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 h-full relative">
          {/* Media Display */}
          <div className="col-span-2 w-full h-full flex items-center justify-center p-8 overflow-hidden relative">
            {/* Left Navigation Button - Always visible */}
            <GalleryNavigation 
              direction="prev" 
              onClick={() => navigateGallery('prev')} 
            />

            <GalleryMediaDisplay 
              media={allMedia[selectedIndex]} 
              productName={product.name} 
              selectedIndex={selectedIndex}
              isZoomed={isZoomed}
              zoomLevel={zoomLevel}
              handleZoom={handleZoom}
            />

            {/* Right Navigation Button - Always visible */}
            <GalleryNavigation 
              direction="next" 
              onClick={() => navigateGallery('next')} 
            />

            {/* Zoom controls */}
            <GalleryZoomControls 
              zoomLevel={zoomLevel} 
              setZoomLevel={setZoomLevel} 
              handleZoomSlider={handleZoomSlider} 
            />
          </div>

          {/* Product Info Panel */}
          <GalleryInfoPanel 
            product={product} 
            selectedIndex={selectedIndex}
            totalCount={allMedia.length}
            setSelectedIndex={setSelectedIndex}
          />
        </div>

        {/* Thumbnail Navigation */}
        <GalleryPagination 
          allMedia={allMedia}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      </DialogContent>
    </Dialog>
  );
};
