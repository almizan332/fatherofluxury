
import { MediaType } from "@/types/product";

interface GalleryPaginationProps {
  allMedia: MediaType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const GalleryPagination = ({
  allMedia,
  selectedIndex,
  setSelectedIndex
}: GalleryPaginationProps) => {
  return (
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
  );
};
