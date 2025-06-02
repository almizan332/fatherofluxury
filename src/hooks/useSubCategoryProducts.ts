import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useSubCategoryProducts = (category: string | undefined) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // If category is "all", fetch all products
      if (category === 'all') {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('display_id', { ascending: true });

        if (productsError) throw productsError;
        setProducts(productsData || []);
        return;
      }

      // Otherwise, fetch products by category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', decodeURIComponent(category || ''))
        .single();

      if (categoryError) throw categoryError;

      if (categoryData) {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryData.id)
          .order('display_id', { ascending: true });

        if (productsError) throw productsError;
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [category]);

  return { products, loading };
};
