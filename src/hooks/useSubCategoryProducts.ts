
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useSubCategoryProducts = (category: string | undefined) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  
  const ITEMS_PER_PAGE = 120;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const categoryName = decodeURIComponent(category || '');
      
      // Build query based on category
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      // If category is not "all", filter by category
      if (categoryName !== 'all') {
        countQuery = countQuery.eq('category', categoryName);
      }
      
      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Calculate pagination range
      const startRange = (page - 1) * ITEMS_PER_PAGE;
      const endRange = startRange + ITEMS_PER_PAGE - 1;

      // Build products query
      let productsQuery = supabase
        .from('products')
        .select('*');
      
      // If category is not "all", filter by category
      if (categoryName !== 'all') {
        productsQuery = productsQuery.eq('category', categoryName);
      }
      
      const { data: productsData, error: productsError } = await productsQuery
        .order('created_at', { ascending: true })
        .range(startRange, endRange);

      if (productsError) throw productsError;
      
      const typedProducts = (productsData || []).map(product => ({
        ...product,
        // Legacy compatibility fields
        name: product.product_name || product.title,
        preview_image: product.first_image || product.thumbnail,
        status: product.status as 'draft' | 'published'
      }));
      
      setProducts(typedProducts);
      console.log(`Category ${categoryName} loaded page ${page}: ${productsData?.length} products of ${count} total`);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (category) {
      setProducts([]);
      setCurrentPage(1);
      setTotalCount(0);
    }
  }, [category]);

  useEffect(() => {
    if (category) {
      fetchProducts(currentPage);
    }
  }, [category, currentPage]);

  return { products, loading, currentPage, totalPages, totalCount, handlePageChange };
};
