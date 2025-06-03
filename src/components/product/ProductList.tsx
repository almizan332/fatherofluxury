import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/components/category/types";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import ProductFormDialog from "./ProductFormDialog";
import ProductListHeader from "./list/ProductListHeader";
import ProductListTable from "./list/ProductListTable";
import EmptyProductState from "./list/EmptyProductState";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRODUCTS_PER_PAGE = 200;

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
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

  useEffect(() => {
    // Update paginated products when page changes or all products change
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    setProducts(allProducts.slice(startIndex, endIndex));
  }, [currentPage, allProducts]);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Products fetched successfully:', data?.length || 0);
      setAllProducts(data || []);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      toast({
        title: "Error fetching products",
        description: error.message || "Failed to load products",
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

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return;

    try {
      console.log('Deleting products:', selectedProducts);
      
      // Check if supabase client is properly initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      console.log('Products deleted successfully');
      setSelectedProducts([]);
      
      toast({
        title: "Products deleted",
        description: `${selectedProducts.length} products have been deleted successfully`,
      });
      
      // Refresh the products list
      await fetchProducts();
      
    } catch (error: any) {
      console.error('Delete operation failed:', error);
      toast({
        title: "Error deleting products",
        description: error.message || "Failed to delete products. Please try again.",
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
        row['Flylink URL'] || '',
        row['Alibaba URL'] || '',
        row['DHgate URL'] || '',
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

  const handleOpenAddDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedProducts([]); // Clear selection when changing pages
  };

  return (
    <div className="p-6">
      <ProductListHeader 
        selectedProducts={selectedProducts}
        onDownloadTemplate={downloadExcelTemplate}
        onDeleteSelected={handleDeleteSelected}
        onOpenAddDialog={handleOpenAddDialog}
        isDialogOpen={isDialogOpen}
        onFileUploadChange={handleFileUpload}
      />

      <Card className="p-6">
        {allProducts.length > 0 ? (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1} to {Math.min(currentPage * PRODUCTS_PER_PAGE, allProducts.length)} of {allProducts.length} products
              </p>
              {selectedProducts.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedProducts.length} products selected
                </p>
              )}
            </div>
            
            <ProductListTable 
              products={products}
              selectedProducts={selectedProducts}
              onSelectAll={handleSelectAll}
              onSelectProduct={handleSelectProduct}
              onEditProduct={handleEditProduct}
            />

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground mx-4">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyProductState />
        )}
      </Card>

      {isDialogOpen && (
        <ProductFormDialog
          product={editingProduct || undefined}
          categories={categories}
          onSuccess={fetchProducts}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductList;
