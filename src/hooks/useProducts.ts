
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Map to include legacy compatibility fields
      const typedProducts = (data || []).map(product => ({
        ...product,
        // Legacy compatibility
        title: product.product_name,
        slug: product.product_name?.toLowerCase().replace(/\s+/g, '-'),
        status: 'published' as const,
        thumbnail: product.first_image,
        updated_at: product.created_at,
        name: product.product_name,
        preview_image: product.first_image,
        gallery_images: product.media_links || [],
        flylink_url: product.flylink,
        product_images: []
      }));
      setProducts(typedProducts);
      
      console.log(`Loaded ${data?.length || 0} products`);
    } catch (error: any) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();

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

  const deleteProducts = async (productIds: string[]) => {
    try {
      // Batch delete in chunks of 100 to avoid URL length limits
      const BATCH_SIZE = 100;
      const batches = [];
      
      for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
        batches.push(productIds.slice(i, i + BATCH_SIZE));
      }

      for (const batch of batches) {
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', batch);

        if (error) throw error;
      }

      toast({
        title: "Products deleted",
        description: `${productIds.length} products have been deleted`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting products",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    products,
    deleteProducts,
    fetchProducts
  };
}
