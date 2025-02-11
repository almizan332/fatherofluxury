
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/product";

interface ProductLinksProps {
  product: Partial<Product>;
  onProductChange: (updates: Partial<Product>) => void;
}

const ProductLinks = ({ product, onProductChange }: ProductLinksProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="flylink">Flylink URL</Label>
        <Input
          id="flylink"
          placeholder="Enter Flylink URL"
          value={product.flylink_url || ''}
          onChange={(e) => onProductChange({ flylink_url: e.target.value || null })}
        />
      </div>
      
      <div>
        <Label htmlFor="alibaba">Alibaba URL</Label>
        <Input
          id="alibaba"
          placeholder="Enter Alibaba URL"
          value={product.alibaba_url || ''}
          onChange={(e) => onProductChange({ alibaba_url: e.target.value || null })}
        />
      </div>
      
      <div>
        <Label htmlFor="dhgate">DHgate URL</Label>
        <Input
          id="dhgate"
          placeholder="Enter DHgate URL"
          value={product.dhgate_url || ''}
          onChange={(e) => onProductChange({ dhgate_url: e.target.value || null })}
        />
      </div>
    </div>
  );
};

export default ProductLinks;
