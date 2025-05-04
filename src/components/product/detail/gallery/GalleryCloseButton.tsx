
import { X } from "lucide-react";

interface GalleryCloseButtonProps {
  onOpenChange: (open: boolean) => void;
}

export const GalleryCloseButton = ({ onOpenChange }: GalleryCloseButtonProps) => {
  return (
    <button 
      onClick={() => onOpenChange(false)}
      className="absolute right-4 top-4 rounded-full bg-white/10 hover:bg-white/20 p-2 z-50 transition-all"
    >
      <X className="h-6 w-6 text-white" />
      <span className="sr-only">Close</span>
    </button>
  );
};
