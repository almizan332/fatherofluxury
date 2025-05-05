
import { useState } from "react";
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Checkbox
              checked={selectedProducts.length === products.length && products.length > 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Preview Image</TableHead>
          <TableHead>Gallery Images</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <Checkbox
                checked={selectedProducts.includes(product.id)}
                onCheckedChange={(checked) => onSelectProduct(product.id, checked as boolean)}
              />
            </TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{(product as any).categories?.name}</TableCell>
            <TableCell>{product.description}</TableCell>
            <TableCell>
              {product.preview_image && (
                <img 
                  src={product.preview_image} 
                  alt={product.name} 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {product.gallery_images?.map((img, idx) => (
                  img && (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`${product.name} gallery ${idx + 1}`} 
                      className="w-12 h-12 object-cover rounded"
                    />
                  )
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditProduct(product)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductListTable;
