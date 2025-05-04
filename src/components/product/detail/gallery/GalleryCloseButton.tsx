
import { X } from "lucide-react";

interface GalleryCloseButtonProps {
  onOpenChange: (open: boolean) => void;
}

export const GalleryCloseButton = ({ onOpenChange }: GalleryCloseButtonProps) => {
  return (
    <button 
      onClick={() => onOpenChange(false)}
      className="absolute right-4 top-4 rounded-full bg-black/60 hover:bg-black/80 p-2 z-50 transition-all"
      aria-label="Close gallery"
    >
      <X className="h-6 w-6 text-white" strokeWidth={2.5} />
      <span className="sr-only">Close</span>
    </button>
  );
};
