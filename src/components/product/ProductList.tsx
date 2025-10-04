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
import SellerFilter from "./SellerFilter";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>("all");
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
      // Fetch ALL products without any limit for admin view
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const typedProducts = (data || []).map(product => ({
        ...product,
        status: product.status as 'draft' | 'published'
      }));
      setProducts(typedProducts);
      console.log(`Admin panel loaded ${data?.length || 0} products`);
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
      setSelectedProducts(filteredProducts.map(p => p.id));
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

  const handleDeleteBySeller = async () => {
    if (selectedSeller === "all") return;
    
    const productsToDelete = filteredProducts.map(p => p.id);
    
    if (productsToDelete.length === 0) {
      toast({
        title: "No products to delete",
        description: `No products found for seller: ${selectedSeller}`,
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productsToDelete);

      if (error) throw error;

      setSelectedProducts([]);
      toast({
        title: "Products deleted",
        description: `All ${productsToDelete.length} products from ${selectedSeller} have been deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting products",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Get unique sellers
  const sellers = Array.from(new Set(products.map(p => (p as any).seller).filter(Boolean)));
  
  // Filter products by seller
  const filteredProducts = selectedSeller === "all" 
    ? products 
    : products.filter(p => (p as any).seller === selectedSeller);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">Product Management</h1>
        <p className="text-muted-foreground">
          Manage all {products.length} products in your catalog
          {selectedSeller !== "all" && ` (Showing ${filteredProducts.length} products from ${selectedSeller})`}
        </p>
      </div>

      <div className="mb-4">
        <SellerFilter 
          sellers={sellers}
          selectedSeller={selectedSeller}
          onSellerChange={setSelectedSeller}
          onDeleteAllBySeller={handleDeleteBySeller}
        />
      </div>

      <ProductListHeader
        selectedProducts={selectedProducts}
        onDownloadTemplate={downloadExcelTemplate}
        onDeleteSelected={handleDeleteSelected}
        onOpenAddDialog={handleOpenAddDialog}
        isDialogOpen={isDialogOpen}
        onFileUploadChange={handleFileUpload}
      />

      <Card className="p-6">
        {filteredProducts.length > 0 ? (
          <ProductListTable 
            products={filteredProducts}
            selectedProducts={selectedProducts}
            onSelectAll={handleSelectAll}
            onSelectProduct={handleSelectProduct}
            onEditProduct={handleEditProduct}
          />
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
