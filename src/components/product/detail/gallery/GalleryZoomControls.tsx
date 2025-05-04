
import { Slider } from "@/components/ui/slider";

interface GalleryZoomControlsProps {
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  handleZoomSlider: (value: number[]) => void;
}

export const GalleryZoomControls = ({
  zoomLevel,
  setZoomLevel,
  handleZoomSlider
}: GalleryZoomControlsProps) => {
  return (
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
  );
};
