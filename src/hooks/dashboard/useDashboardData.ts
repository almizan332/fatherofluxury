
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  categories: any[];
  totalProducts: number;
  totalCountries: number;
  totalPages: number;
  topCountries: { country: string; visits: number; }[];
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    categories: [],
    totalProducts: 0,
    totalCountries: 0,
    totalPages: 0,
    topCountries: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        
        const totalProductCount = (categoriesData || []).reduce(
          (acc, cat) => acc + (cat.product_count || 0), 
          0
        );

        setData({
          categories: categoriesData || [],
          totalProducts: totalProductCount,
          totalCountries: 92, // Placeholder
          totalPages: 845, // Placeholder
          topCountries: [
            { country: 'United States', visits: 12500 },
            { country: 'United Kingdom', visits: 8300 },
            { country: 'Germany', visits: 6200 },
            { country: 'France', visits: 5100 },
            { country: 'India', visits: 4800 },
          ]
        });
        
        setIsLoading(false);
      } catch (error: any) {
        toast({
          title: "Error fetching dashboard data",
          description: error.message,
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes
          schema: 'public',
          table: 'categories'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchDashboardData(); // Refetch all dashboard data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return { ...data, isLoading };
};
