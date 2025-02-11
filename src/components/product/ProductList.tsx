
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileSpreadsheet, Download, Trash2, Edit } from "lucide-react";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/components/category/types";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import ProductFormDialog from "./ProductFormDialog";
import { getAllMedia } from "./detail/ProductGallery";
import { Dialog as PreviewDialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    const productsSubscription = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsSubscription);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, id]);
    } else {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    }
  };

  const handleDeleteSelected = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts);

      if (error) throw error;

      setSelectedProducts([]);
      toast({
        title: "Products deleted",
        description: `${selectedProducts.length} products have been deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting products",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast({
        title: "CSV upload not implemented",
        description: "This feature will be implemented soon",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const csvRows = [
      productExcelHeaders.join(','),
      ...sampleExcelData.map(row => [
        row['Product Name'],
        row['Category'],
        row['Description'],
        row['Preview Image URL'],
        row['Gallery Image URLs (comma separated)']
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "You can now fill in the template and import it back",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <div className="flex gap-2">
          <Button onClick={downloadExcelTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          {selectedProducts.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedProducts.length})
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={(e) => {
              e.preventDefault();
              setEditingProduct(null);
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <ProductFormDialog
              product={editingProduct || undefined}
              categories={categories}
              onSuccess={fetchProducts}
              onClose={() => {
                setIsDialogOpen(false);
                setEditingProduct(null);
              }}
            />
          </Dialog>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
            <Button variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6">
        {products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedProducts.length === products.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="p-0 h-16 w-16 overflow-hidden rounded-lg hover:opacity-80"
                      onClick={() => setPreviewProduct(product)}
                    >
                      <img 
                        src={product.preview_image || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/placeholder.svg';
                        }}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{(product as any).categories?.name}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate">{product.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {getAllMedia(product).length} items
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewProduct(product)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No products imported yet. Add your first product or import from CSV.
          </div>
        )}
      </Card>

      {/* Product Preview Dialog */}
      <PreviewDialog 
        open={!!previewProduct} 
        onOpenChange={() => setPreviewProduct(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {previewProduct && (
            <ScrollArea className="h-[90vh]">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <img
                      src={previewProduct.preview_image || '/placeholder.svg'}
                      alt={previewProduct.name}
                      className="w-full aspect-square object-cover rounded-lg"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/placeholder.svg';
                      }}
                    />
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {getAllMedia(previewProduct).slice(0, 4).map((media, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                          {media.type === 'video' ? (
                            <video
                              src={media.url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={media.url}
                              alt={`${previewProduct.name} preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = '/placeholder.svg';
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{previewProduct.name}</h2>
                      <p className="text-muted-foreground">
                        Category: {(previewProduct as any).categories?.name}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {previewProduct.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Affiliate Links</h3>
                      <div className="space-y-2">
                        {previewProduct.flylink_url && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Flylink:</span>
                            <a 
                              href={previewProduct.flylink_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline truncate"
                            >
                              {previewProduct.flylink_url}
                            </a>
                          </div>
                        )}
                        {previewProduct.alibaba_url && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Alibaba:</span>
                            <a 
                              href={previewProduct.alibaba_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline truncate"
                            >
                              {previewProduct.alibaba_url}
                            </a>
                          </div>
                        )}
                        {previewProduct.dhgate_url && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">DHgate:</span>
                            <a 
                              href={previewProduct.dhgate_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline truncate"
                            >
                              {previewProduct.dhgate_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPreviewProduct(null)}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingProduct(previewProduct);
                          setIsDialogOpen(true);
                          setPreviewProduct(null);
                        }}
                      >
                        Edit Product
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </PreviewDialog>
    </div>
  );
};

export default ProductList;
