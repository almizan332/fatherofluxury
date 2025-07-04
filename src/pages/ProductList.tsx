
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ProductActionsToolbar } from "@/components/product/ProductActionsToolbar";
import { ProductFilters } from "@/components/product/ProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/types/product";
import ProductGrid from "@/components/product/ProductGrid";
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
import { Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProductList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { products, deleteProducts, fetchProducts } = useProducts();
  const { categories } = useCategories();
  const { toast } = useToast();

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

  const handleDeleteSelected = async (productIds: string[]) => {
    const success = await deleteProducts(productIds);
    if (success) {
      setSelectedProducts([]);
    }
  };

  const handleDeleteAllProducts = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products

      if (error) throw error;

      toast({
        title: "All products deleted",
        description: "All products have been successfully deleted from the database",
      });
      
      fetchProducts(); // Refresh the product list
      setSelectedProducts([]);
    } catch (error: any) {
      toast({
        title: "Error deleting products",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 bg-black/5 min-h-screen">
      <div className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              Product Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your products, categories, and inventory
            </p>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Products
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Products</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete ALL products? This action cannot be undone and will permanently remove all {products.length} products from your database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAllProducts}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete All Products
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <ProductActionsToolbar
              selectedProducts={selectedProducts}
              onDeleteSelected={handleDeleteSelected}
              categories={categories}
              onProductSave={fetchProducts}
              setIsDialogOpen={setIsDialogOpen}
              isDialogOpen={isDialogOpen}
            />
          </div>
        </div>
      </div>

      <Card className="p-4 bg-white/50 backdrop-blur-sm shadow-xl">
        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No products found.</p>
            <p className="text-sm text-muted-foreground mt-2">Add some products to get started.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Preview Image</TableHead>
                      <TableHead>Gallery Images</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product: Product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{(product as any).categories?.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{product.description}</TableCell>
                        <TableCell>
                          {product.preview_image && (
                            <img 
                              src={product.preview_image} 
                              alt={product.name} 
                              className="w-16 h-16 object-cover rounded-lg border border-muted"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {product.gallery_images?.slice(0, 3).map((img, idx) => (
                              img && (
                                <img 
                                  key={idx} 
                                  src={img} 
                                  alt={`${product.name} gallery ${idx + 1}`} 
                                  className="w-12 h-12 object-cover rounded-lg border border-muted"
                                />
                              )
                            ))}
                            {(product.gallery_images?.length || 0) > 3 && (
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                                +{(product.gallery_images?.length || 0) - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setIsDialogOpen(true);
                              }}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSelected([product.id])}
                              className="h-8 w-8 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                <ProductGrid products={filteredProducts} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Card>
    </div>
  );
};

export default ProductList;
