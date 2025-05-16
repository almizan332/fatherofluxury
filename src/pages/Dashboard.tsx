
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Globe, Users, Clock, FileText, Boxes, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import CategoriesOverview from "@/components/dashboard/CategoriesOverview";
import TopCountries from "@/components/dashboard/TopCountries";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | '1y'>('1w');
  const navigate = useNavigate();
  
  const { 
    categories, 
    totalProducts, 
    totalCountries, 
    totalPages,
    topCountries,
    isLoading 
  } = useDashboardData();

  const stats = [
    { 
      title: 'Total Categories', 
      value: categories.length.toString(), 
      icon: Boxes, 
      change: '+12.5%' 
    },
    { 
      title: 'Total Products', 
      value: totalProducts.toString(), 
      icon: ShoppingBag, 
      change: '+8.2%' 
    },
    { 
      title: 'Countries', 
      value: totalCountries.toString(), 
      icon: Globe, 
      change: '+3.1%' 
    },
    { 
      title: 'Total Pages', 
      value: totalPages.toString(), 
      icon: FileText, 
      change: '+5.4%' 
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />

        <div className="flex-1 p-6">
          <DashboardHeader timeRange={timeRange} setTimeRange={setTimeRange} />
          
          {isLoading ? (
            <div>Loading dashboard data...</div>
          ) : (
            <>
              <DashboardStats stats={stats} />
              <CategoriesOverview categories={categories} />
              <TopCountries countries={topCountries} />
            </>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
