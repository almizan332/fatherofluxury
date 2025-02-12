
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
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);

      if (error) throw error;

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
