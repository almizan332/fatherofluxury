
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export function useProductDetail(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      console.log('Fetching product with ID:', id);
      fetchProduct();
    }
    
    async function fetchProduct() {
      try {
        setIsLoading(true);
        setError(null);
        let productData = null;

        // First try UUID lookup
        if (isUUID(id!)) {
          console.log('Attempting UUID lookup for:', id);
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          
          if (error) throw error;
          productData = data;
          console.log('UUID lookup result:', productData);
        }

        // If UUID lookup fails or id is not UUID, try name-based lookup
        if (!productData) {
          console.log('Attempting name-based lookup for:', id);
          // Replace URL-encoded characters and hyphens with spaces
          const decodedName = decodeURIComponent(id!).replace(/-/g, ' ');
          console.log('Decoded name:', decodedName);
          
          // Skip numeric lookup if the string contains a decimal point (likely a price)
          if (!decodedName.includes('.')) {
            // Try display_id based lookup only for small numbers
            const match = decodedName.match(/\d+/);
            if (match) {
              const numericId = parseInt(match[0]);
              if (!isNaN(numericId) && numericId <= 2147483647) { // Max PostgreSQL integer value
                console.log('Attempting display_id lookup with:', numericId);
                const { data: displayIdData, error: displayIdError } = await supabase
                  .from('products')
                  .select('*')
                  .eq('id', numericId.toString())
                  .maybeSingle();
                
                if (!displayIdError && displayIdData) {
                  productData = displayIdData;
                }
              }
            }
          }

          // If display_id lookup fails or isn't attempted, try name-based lookup
          if (!productData) {
            // Remove special characters and extra spaces
            const cleanName = decodedName.replace(/[^\w\s-]/g, '').trim();
            console.log('Trying match with cleaned name:', cleanName);
            
            const { data: nameData, error: nameError } = await supabase
              .from('products')
              .select('*')
              .ilike('title', `%${cleanName}%`)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (nameError) throw nameError;
            productData = nameData;
          }
        }

        if (productData) {
          console.log('Found product:', productData);
          setProduct(productData);
          
          // Fetch related products from the same category
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .neq('id', productData.id)
            .limit(6);

          if (relatedError) throw relatedError;
          const typedRelated = (relatedData || []).map(product => ({
            ...product,
            status: product.status as 'draft' | 'published'
          }));
          setRelatedProducts(typedRelated);
        } else {
          console.log('Product not found after all lookups');
          setProduct(null);
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  return {
    product,
    relatedProducts,
    isLoading,
    error
  };
}
