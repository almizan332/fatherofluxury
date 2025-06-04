
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
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b">
            <TableHead className="w-[50px] bg-white">
              <div className="flex items-center justify-center p-1">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all products"
                  className="border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
            </TableHead>
            <TableHead className="min-w-[200px] font-semibold text-gray-900">Product Name</TableHead>
            <TableHead className="min-w-[120px] font-semibold text-gray-900">Category</TableHead>
            <TableHead className="min-w-[250px] font-semibold text-gray-900">Description</TableHead>
            <TableHead className="min-w-[120px] font-semibold text-gray-900">Preview Image</TableHead>
            <TableHead className="min-w-[150px] font-semibold text-gray-900">Gallery Images</TableHead>
            <TableHead className="w-[80px] font-semibold text-gray-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id} 
              className={`hover:bg-gray-50 transition-colors ${selectedProducts.includes(product.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
            >
              <TableCell className="bg-white">
                <div className="flex items-center justify-center p-1">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => onSelectProduct(product.id, checked as boolean)}
                    aria-label={`Select ${product.name}`}
                    className="border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
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
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 border border-gray-200">
                    No Image
                  </div>
                )}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 border border-gray-200 hidden">
                  Failed to Load
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap max-w-[150px]">
                  {product.gallery_images?.slice(0, 3).map((img, idx) => (
                    img && (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`${product.name} gallery ${idx + 1}`} 
                        className="w-10 h-10 object-cover rounded border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )
                  ))}
                  {(product.gallery_images?.length || 0) > 3 && (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 border border-gray-200">
                      +{(product.gallery_images?.length || 0) - 3}
                    </div>
                  )}
                  {(!product.gallery_images || product.gallery_images.length === 0) && (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 border border-gray-200">
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
