
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
import { parseCSVFile, validateProducts } from "@/utils/csvHelper";
import { uploadFileToVPS } from "@/utils/vpsFileUpload";
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
  const [isImporting, setIsImporting] = useState(false);
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
    if (selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select products to delete",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Deleting products:', selectedProducts);
      
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

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImporting(true);
      console.log('Starting CSV import process...');
      
      toast({
        title: "Processing CSV file",
        description: "Your file is being processed...",
      });

      // Parse the CSV file
      const parsedProducts = await parseCSVFile(file);
      console.log('Parsed products count:', parsedProducts.length);
      
      if (parsedProducts.length === 0) {
        toast({
          title: "No products found",
          description: "The CSV file doesn't contain any valid product data",
          variant: "destructive",
        });
        return;
      }
      
      // Validate the products
      const validationErrors = validateProducts(parsedProducts);
      
      if (validationErrors.length > 0) {
        toast({
          title: "Validation errors",
          description: `${validationErrors.length} errors found: ${validationErrors.slice(0, 3).join(', ')}${validationErrors.length > 3 ? '...' : ''}`,
          variant: "destructive",
        });
        console.error("Validation errors:", validationErrors);
        return;
      }

      // Process each product
      let successCount = 0;
      let errorCount = 0;
      
      for (const [index, product] of parsedProducts.entries()) {
        try {
          console.log(`Processing product ${index + 1}/${parsedProducts.length}:`, product.name);
          
          // Skip products without a name
          if (!product.name) {
            console.log('Skipping product without name');
            continue;
          }

          // Handle image uploads
          let uploadedPreviewImage = product.preview_image || '';
          let uploadedGalleryImages = product.gallery_images || [];

          // Upload preview image if it's a URL
          if (product.preview_image && product.preview_image.startsWith('http')) {
            try {
              console.log('Uploading preview image:', product.preview_image);
              uploadedPreviewImage = await uploadFileToVPS({
                url: product.preview_image,
                type: 'image/jpeg'
              } as any);
              console.log('Preview image uploaded:', uploadedPreviewImage);
            } catch (error) {
              console.error("Error uploading preview image:", error);
              uploadedPreviewImage = product.preview_image; // Keep original URL as fallback
            }
          }

          // Upload gallery images if they are URLs
          if (product.gallery_images && product.gallery_images.length > 0) {
            console.log('Uploading gallery images:', product.gallery_images.length);
            const uploadPromises = product.gallery_images.map(async (imageUrl) => {
              if (imageUrl && imageUrl.startsWith('http')) {
                try {
                  const uploaded = await uploadFileToVPS({
                    url: imageUrl,
                    type: 'image/jpeg'
                  } as any);
                  console.log('Gallery image uploaded:', uploaded);
                  return uploaded;
                } catch (error) {
                  console.error("Error uploading gallery image:", error);
                  return imageUrl; // Keep original URL as fallback
                }
              }
              return imageUrl;
            });
            
            uploadedGalleryImages = await Promise.all(uploadPromises);
          }

          // Find category ID if the category is provided
          let categoryId = product.category_id;
          if (!categoryId && (product as any).category) {
            const categoryName = (product as any).category;
            const matchingCategory = categories.find(c => 
              c.name.toLowerCase() === categoryName.toLowerCase()
            );
            
            if (matchingCategory) {
              categoryId = matchingCategory.id;
              console.log('Found matching category:', categoryName, '->', categoryId);
            } else {
              console.log('No matching category found for:', categoryName);
            }
          }

          // Prepare product data for insertion
          const productData = {
            name: product.name,
            description: product.description || '',
            preview_image: uploadedPreviewImage,
            gallery_images: uploadedGalleryImages,
            category_id: categoryId,
            // Only include non-empty URL fields
            ...(product.flylink_url ? { flylink_url: product.flylink_url } : {}),
            ...(product.alibaba_url ? { alibaba_url: product.alibaba_url } : {}),
            ...(product.dhgate_url ? { dhgate_url: product.dhgate_url } : {}),
          };

          console.log('Inserting product data:', productData);

          // Insert product into the database
          const { error } = await supabase
            .from('products')
            .insert([productData]);

          if (error) {
            console.error("Error inserting product:", error);
            errorCount++;
          } else {
            console.log('Product inserted successfully:', product.name);
            successCount++;
          }
        } catch (productError) {
          console.error(`Error processing product ${product.name}:`, productError);
          errorCount++;
        }
      }

      // Clean up input value to allow re-uploading the same file
      event.target.value = '';
      
      // Show final result
      if (successCount > 0) {
        toast({
          title: "Import completed",
          description: `${successCount} products imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
        
        // Refresh the product list
        await fetchProducts();
      } else {
        toast({
          title: "Import failed",
          description: "No products were imported successfully",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('CSV import error:', error);
      toast({
        title: "Error importing CSV",
        description: error.message || "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Create CSV content with proper escaping
    const escapeCSVField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };
    
    // Create CSV rows
    const csvRows = [
      productExcelHeaders.map(escapeCSVField).join(','),
      ...sampleExcelData.map(row => [
        escapeCSVField(row['Product Name']),
        escapeCSVField(row['Flylink URL'] || ''),
        escapeCSVField(row['Alibaba URL'] || ''),
        escapeCSVField(row['DHgate URL'] || ''),
        escapeCSVField(row['Category']),
        escapeCSVField(row['Description']),
        escapeCSVField(row['Preview Image URL']),
        escapeCSVField(row['Gallery Image URLs (semicolon separated)'])
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
      description: "Fill in the template and import it back. Note: URLs can be left empty if not needed. Use semicolons (;) to separate multiple gallery image URLs.",
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
        isImporting={isImporting}
      />

      <Card className="p-6">
        {allProducts.length > 0 ? (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1} to {Math.min(currentPage * PRODUCTS_PER_PAGE, allProducts.length)} of {allProducts.length} products
              </p>
              {selectedProducts.length > 0 && (
                <p className="text-sm font-medium text-primary">
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
