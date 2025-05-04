
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface GalleryInfoPanelProps {
  product: Product;
  selectedIndex: number;
  totalCount: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const GalleryInfoPanel = ({
  product,
  selectedIndex,
  totalCount,
  setSelectedIndex
}: GalleryInfoPanelProps) => {
  return (
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
          Image {selectedIndex + 1} of {totalCount}
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Math.min(totalCount, 12) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                selectedIndex === idx ? 'bg-primary scale-150' : 'bg-gray-300'
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
          {totalCount > 12 && <span className="text-xs text-gray-400">+{totalCount - 12} more</span>}
        </div>
      </div>
    </div>
  );
};
