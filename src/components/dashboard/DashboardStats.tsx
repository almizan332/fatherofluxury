
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";

const DashboardStats = () => {
  const { totalProducts, totalCountries, totalPages, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Active products in catalog</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCountries.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Visitors from countries</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPages.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Total pages viewed</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
