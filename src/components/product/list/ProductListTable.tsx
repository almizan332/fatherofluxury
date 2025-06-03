
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Product } from "@/types/product";

interface ProductListTableProps {
  products: Product[];
  selectedProducts: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectProduct: (id: string, checked: boolean) => void;
  onEditProduct: (product: Product) => void;
}

const ProductListTable = ({
  products,
  selectedProducts,
  onSelectAll,
  onSelectProduct,
  onEditProduct,
}: ProductListTableProps) => {
  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={onSelectAll}
                aria-label="Select all products"
              />
            </TableHead>
            <TableHead className="min-w-[200px]">Product Name</TableHead>
            <TableHead className="min-w-[120px]">Category</TableHead>
            <TableHead className="min-w-[250px]">Description</TableHead>
            <TableHead className="min-w-[120px]">Preview Image</TableHead>
            <TableHead className="min-w-[150px]">Gallery Images</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id} 
              className={`hover:bg-muted/50 ${selectedProducts.includes(product.id) ? 'bg-muted/30' : ''}`}
            >
              <TableCell>
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked) => onSelectProduct(product.id, checked as boolean)}
                  aria-label={`Select ${product.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="max-w-[200px] truncate" title={product.name}>
                  {product.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[120px] truncate">
                  {(product as any).categories?.name || 'No Category'}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[250px] truncate" title={product.description || ''}>
                  {product.description || 'No description'}
                </div>
              </TableCell>
              <TableCell>
                {product.preview_image ? (
                  <img 
                    src={product.preview_image} 
                    alt={product.name} 
                    className="w-16 h-16 object-cover rounded-lg border border-muted"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap max-w-[150px]">
                  {product.gallery_images?.slice(0, 3).map((img, idx) => (
                    img && (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`${product.name} gallery ${idx + 1}`} 
                        className="w-10 h-10 object-cover rounded border border-muted"
                      />
                    )
                  ))}
                  {(product.gallery_images?.length || 0) > 3 && (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                      +{(product.gallery_images?.length || 0) - 3}
                    </div>
                  )}
                  {(!product.gallery_images || product.gallery_images.length === 0) && (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                      None
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditProduct(product)}
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductListTable;
