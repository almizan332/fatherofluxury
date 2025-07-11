
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useSubCategoryProducts = (category: string | undefined) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const fetchInitialProducts = async () => {
    try {
      setLoading(true);
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', decodeURIComponent(category || ''))
        .single();

      if (categoryError) throw categoryError;

      if (categoryData) {
        // Get total count
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', categoryData.id);
        
        setTotalCount(count || 0);

        // Fetch initial products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryData.id)
          .order('display_id', { ascending: true })
          .range(0, 119); // Load first 120 products

        if (productsError) throw productsError;
        setProducts(productsData || []);
        setHasMore((productsData?.length || 0) >= 120 && (productsData?.length || 0) < (count || 0));
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

  const loadMoreProducts = async () => {
    if (loading || !hasMore || !category) return;
    
    try {
      setLoading(true);
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', decodeURIComponent(category))
        .single();

      if (categoryError) throw categoryError;

      if (categoryData) {
        const { data: moreProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryData.id)
          .order('display_id', { ascending: true })
          .range(products.length, products.length + 119);

        if (productsError) throw productsError;

        if (moreProducts) {
          setProducts(prev => [...prev, ...moreProducts]);
          setHasMore(moreProducts.length >= 120 && products.length + moreProducts.length < totalCount);
        }
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      toast({
        title: "Error",
        description: "Failed to load more products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      setProducts([]);
      setHasMore(true);
      setTotalCount(0);
      fetchInitialProducts();
    }
  }, [category]);

  return { products, loading, hasMore, totalCount, loadMoreProducts };
};
