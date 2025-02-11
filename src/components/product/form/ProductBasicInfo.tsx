
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/components/category/types";
import { Product } from "@/types/product";

interface ProductBasicInfoProps {
  product: Partial<Product>;
  categories: Category[];
  onProductChange: (updates: Partial<Product>) => void;
}

const ProductBasicInfo = ({ product, categories, onProductChange }: ProductBasicInfoProps) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={product.name || ''}
          onChange={(e) => onProductChange({ name: e.target.value })}
          placeholder="Enter product name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={product.category_id}
          onValueChange={(value) => onProductChange({ category_id: value })}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={product.description || ''}
          onChange={(e) => onProductChange({ description: e.target.value })}
          placeholder="Enter product description"
        />
      </div>
    </>
  );
};

export default ProductBasicInfo;
